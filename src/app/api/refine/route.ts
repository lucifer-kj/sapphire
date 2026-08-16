import { NextRequest, NextResponse } from "next/server";
import { RefinementAgent } from "@/mastra/agents/refinement-agent";
import { ImageGenerationService } from "@/services/image-generation";
import { BrandBrainService } from "@/services/brand-brain";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conceptId,
      campaignId,
      brandId,
      userInstruction,
      currentConcept,
      currentVersionNumber = 1,
    } = body;

    if (!userInstruction || !currentConcept) {
      return NextResponse.json(
        { error: "userInstruction and currentConcept object are required." },
        { status: 400 }
      );
    }

    // 1. Fetch Brand context
    const brand = await BrandBrainService.getBrandById(brandId);

    // 2. Run Refinement Agent
    const refinement = await RefinementAgent.refineConcept(
      userInstruction,
      currentConcept,
      brand
    );

    // 3. Generate updated AI artwork via Pollinations
    const seed = Math.floor(Math.random() * 1000000);
    const newImageUrl = ImageGenerationService.generateImageUrl(
      refinement.updated_image_prompt,
      seed
    );

    const newVersionNumber = Number(currentVersionNumber) + 1;

    // 4. Save non-destructive version to Supabase concept_versions & update concept
    try {
      const supabase = createAdminClient();

      if (conceptId) {
        // Insert new version record
        await supabase.from("concept_versions").insert({
          concept_id: conceptId,
          version_number: newVersionNumber,
          user_instruction: userInstruction,
          image_url: newImageUrl,
          caption_instagram: refinement.updated_caption_instagram,
          caption_linkedin: refinement.updated_caption_linkedin,
          modified_aspects: refinement.modified_aspects as any,
        });

        // Update main concepts active record
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
      console.warn("Supabase persistence fallback in /api/refine:", err);
    }

    return NextResponse.json({
      success: true,
      versionNumber: newVersionNumber,
      userInstruction,
      refinement,
      updatedConcept: {
        ...currentConcept,
        creative_direction: refinement.updated_creative_direction,
        image_prompt: refinement.updated_image_prompt,
        image_url: newImageUrl,
        caption_instagram: refinement.updated_caption_instagram,
        caption_linkedin: refinement.updated_caption_linkedin,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/refine route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to refine concept." },
      { status: 500 }
    );
  }
}
