import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { z } from "zod";
import { RefinementAgent } from "@/mastra/agents/refinement-agent";
import { ImageGenerationService } from "@/services/image-generation";
import { BrandBrainService } from "@/services/brand-brain";
import { createAdminClient } from "@/lib/supabase/admin";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";
import { PromptResult } from "@/modules/prompt-intelligence/domain/prompt-result";
import { PromptSpecification } from "@/modules/prompt-intelligence/domain/prompt-spec";
import { PromptFormattersService } from "@/modules/prompt-intelligence/services/prompt-formatters";
import { PromptValidatorService } from "@/modules/prompt-intelligence/services/prompt-validator";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const PromptRefineUpdateSchema = z.object({
  creative_concept: z.string(),
  subject: z.string(),
  environment: z.string(),
  lighting: z.string(),
  camera_and_optics: z.string(),
  color_and_materials: z.string(),
  negative_constraints: z.array(z.string()),
  typography_layout: z.object({
    headline: z.string(),
    kicker_badge: z.string().optional(),
    subheadline: z.string().optional(),
    cta_text: z.string(),
    brand_watermark: z.string(),
    font_pairing_recommendation: z.string(),
    text_placement_zone: z.enum(["top_third", "bottom_third", "split_center", "sidebar_margin"]),
  }).optional(),
  caption_text: z.string().optional(),
  hashtags: z.array(z.string()).default([]),
  explanation_of_change: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conceptId,
      brandId,
      userInstruction,
      currentConcept,
      currentVersionNumber = 1,
      promptResult,
      mode,
    } = body;

    if (!userInstruction) {
      return NextResponse.json(
        { error: "userInstruction is required." },
        { status: 400 }
      );
    }

    const brand = await BrandBrainService.getBrandById(brandId);

    // -------------------------------------------------------------
    // Branch A: Prompt Intelligence Mode Refinement
    // -------------------------------------------------------------
    if (mode === "prompt_only" || promptResult) {
      const existingResult: PromptResult = promptResult;
      const currentSpec: PromptSpecification = existingResult.specification;

      const refinePrompt = `Refine this existing prompt specification and typography layout based on user instruction:
User Instruction: "${userInstruction}"

Current Prompt Specification:
- Platform: ${currentSpec.platform}
- Concept: ${currentSpec.creative_concept}
- Subject: ${currentSpec.subject}
- Setting: ${currentSpec.environment}
- Lighting: ${currentSpec.lighting}
- Camera & Optics: ${currentSpec.camera_and_optics}
- Color & Materials: ${currentSpec.color_and_materials}
- Headline: "${currentSpec.typography_layout?.headline || ""}"
- CTA: "${currentSpec.typography_layout?.cta_text || ""}"
- Negative Constraints: ${currentSpec.negative_constraints.join(", ")}

Brand: ${brand.name} (${brand.industry})

Apply the modifications with surgical precision while preserving concept continuity, headline punch, and anti-cliché guardrails.`;

      let updatedFields: z.infer<typeof PromptRefineUpdateSchema>;
      try {
        const res = await generateObject({
          model: getReasoningModel(),
          schema: PromptRefineUpdateSchema,
          system: "You are Sapphire's Principal Prompt Refinement Director. You surgically modify prompt specifications and post typography based on user instructions.",
          prompt: refinePrompt,
        });
        updatedFields = res.object;
      } catch {
        const fallbackRes = await generateObject({
          model: getReasoningFallbackModel(),
          schema: PromptRefineUpdateSchema,
          system: "You are Sapphire's Principal Prompt Refinement Director.",
          prompt: refinePrompt,
        });
        updatedFields = fallbackRes.object;
      }

      const updatedSpec: PromptSpecification = {
        ...currentSpec,
        creative_concept: updatedFields.creative_concept,
        subject: updatedFields.subject,
        environment: updatedFields.environment,
        lighting: updatedFields.lighting,
        camera_and_optics: updatedFields.camera_and_optics,
        color_and_materials: updatedFields.color_and_materials,
        negative_constraints: updatedFields.negative_constraints,
        typography_layout: updatedFields.typography_layout || currentSpec.typography_layout,
        caption_text: updatedFields.caption_text || currentSpec.caption_text,
        hashtags: updatedFields.hashtags.length > 0 ? updatedFields.hashtags : currentSpec.hashtags,
        version: existingResult.version + 1,
      };

      const formattedBundle = PromptFormattersService.formatPromptBundle(updatedSpec);
      const criticEvaluation = await PromptValidatorService.evaluatePrompt(
        updatedSpec,
        formattedBundle.primary.finalPrompt,
        brand
      );

      const updatedResult: PromptResult = {
        ...existingResult,
        version: existingResult.version + 1,
        parent_version_id: existingResult.id,
        specification: updatedSpec,
        final_prompt: formattedBundle.primary.finalPrompt,
        negative_prompt: formattedBundle.primary.negativePrompt,
        poster_prompt: formattedBundle.posterPrompt,
        photographic_prompt: formattedBundle.photographicPrompt,
        typography_layout: updatedSpec.typography_layout,
        caption_text: updatedSpec.caption_text,
        hashtags: updatedSpec.hashtags,
        all_model_formats: formattedBundle.allModelFormats,
        syntax_tokens: formattedBundle.syntaxTokens,
        critic_evaluation: criticEvaluation,
        rationale: {
          ...existingResult.rationale,
          creative_direction_reason: `${existingResult.rationale.creative_direction_reason} (Refinement: ${updatedFields.explanation_of_change})`,
        },
      };



      return NextResponse.json({
        success: true,
        mode: "prompt_only",
        promptResult: updatedResult,
      });
    }

    // -------------------------------------------------------------
    // Branch B: Full Creative Concept Refinement
    // -------------------------------------------------------------
    if (!currentConcept) {
      return NextResponse.json(
        { error: "currentConcept object is required for campaign mode." },
        { status: 400 }
      );
    }

    const refinement = await RefinementAgent.refineConcept(
      userInstruction,
      currentConcept,
      brand
    );

    const refinedBlueprint =
      refinement.updated_design_blueprint || currentConcept.design_blueprint;

    const seed = Math.floor(Math.random() * 1000000);
    const imageResult = await ImageGenerationService.generatePostImage(
      refinement.updated_image_prompt,
      seed
    );
    const newImageUrl = imageResult.url;
    const newVersionNumber = Number(currentVersionNumber) + 1;

    try {
      const supabase = createAdminClient();
      if (conceptId) {
        await supabase.from("concept_versions").insert({
          concept_id: conceptId,
          version_number: newVersionNumber,
          user_instruction: userInstruction,
          image_url: newImageUrl,
          caption_instagram: refinement.updated_caption_instagram,
          caption_linkedin: refinement.updated_caption_linkedin,
          modified_aspects: refinement.modified_aspects as any,
        });

        await supabase
          .from("concepts")
          .update({
            creative_direction: refinement.updated_creative_direction,
            image_url: newImageUrl,
            image_prompt: refinement.updated_image_prompt,
            caption_instagram: refinement.updated_caption_instagram,
            caption_linkedin: refinement.updated_caption_linkedin,
            status: "refined",
          })
          .eq("id", conceptId);
      }
    } catch (err) {
      console.warn("Supabase concept refinement versioning notice:", err);
    }

    return NextResponse.json({
      success: true,
      mode: "campaign",
      concept: {
        ...currentConcept,
        creative_direction: refinement.updated_creative_direction,
        visual_style: currentConcept.visual_style,
        image_prompt: refinement.updated_image_prompt,
        image_url: newImageUrl,
        caption_instagram: refinement.updated_caption_instagram,
        caption_linkedin: refinement.updated_caption_linkedin,
        design_blueprint: refinedBlueprint,
      },
      modifiedAspects: refinement.modified_aspects,
      versionNumber: newVersionNumber,
    });
  } catch (error: any) {
    console.error("Error in /api/refine route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refine concept." },
      { status: 500 }
    );
  }
}
