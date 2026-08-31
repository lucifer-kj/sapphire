import { generateObject } from "ai";
import { z } from "zod";
import { BrandBrainService } from "@/services/brand-brain";
import { DesignKnowledgeService } from "@/services/design-knowledge";
import { ExecutionLogger } from "@/services/telemetry";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";
import { createAdminClient } from "@/lib/supabase/admin";
import { BrandProfile } from "@/lib/schema/brand";
import { DesignArchetype } from "@/lib/design-system/archetypes";
import { Platform, PostType } from "../domain/prompt-intent";
import { PromptSpecification } from "../domain/prompt-spec";
import { PromptResult } from "../domain/prompt-result";
import { ModelRouterService } from "../services/model-router";
import { PromptFormattersService } from "../services/prompt-formatters";
import { PromptValidatorService } from "../services/prompt-validator";
import { PLATFORM_VISUAL_RULES, POST_TYPE_GUIDANCE } from "../knowledge/platform-rules";

const IntentSynthesisSchema = z.object({
  topic: z.string().describe("Core topic or hook"),
  event: z.string().optional().describe("Associated holiday, milestone, or cultural event"),
  post_type: z.string().describe("Classified post type for platform"),
  content_objective: z.string().describe("Primary marketing or value objective"),
  target_audience: z.string().describe("Target demographic and psychographic audience"),
  visual_opportunity: z.string().describe("Strategic visual hook angle"),
  explicit_constraints: z.array(z.string()).default([]),
});

const CreativeDirectionSynthesisSchema = z.object({
  creative_concept: z.string().describe("Core visual metaphor and conceptual hook"),
  interpreted_direction: z.string().describe("1-2 sentence high-level creative brief"),
  archetype: z.enum([
    "editorial_magazine",
    "conceptual_split",
    "comparison_split",
    "vintage_poster",
    "saas_dotgrid",
  ]).describe("Selected canonical design archetype"),
  subject: z.string().describe("Detailed photographic subject, pose, authentic materials, and hero focus"),
  environment: z.string().describe("Setting, background depth, atmospheric conditions, and architectural context"),
  lighting: z.string().describe("Lighting architecture: direction (e.g. 45-degree key light, rim backlight), quality (diffused softbox, golden hour ambient), and color temperature"),
  camera_and_optics: z.string().describe("Camera angle, framing, focal length (e.g. 85mm f/1.4, 50mm f/1.2), depth of field falloff"),
  color_and_materials: z.string().describe("Curated 3-4 color palette anchors and tactile material textures (e.g. matte ceramic, rough linen, brushed steel)"),
  negative_constraints: z.array(z.string()).describe("Visual clichés, plastic smoothing, and unwanted elements explicitly forbidden"),
  reference_strategy_type: z.enum([
    "none",
    "style_reference",
    "subject_reference",
    "product_reference",
    "composition_reference",
  ]),
  reference_guidance: z.string().describe("Guidance on what a reference image should control"),
  rationale_creative: z.string().describe("Why this visual concept was selected"),
  rationale_platform: z.string().describe("Why this framing works on the target platform"),
  anti_cliche_guardrails: z.array(z.string()).describe("3-4 generic clichés avoided"),
});

export class PromptIntelligenceWorkflow {
  /**
   * Executes the 6-stage asynchronous Prompt Intelligence DAG with real-time SSE progress streaming.
   */
  static async execute(
    prompt: string,
    brandId?: string,
    platform: Platform = "instagram",
    onProgress?: (step: number, totalSteps: number, summary: string, status: "active" | "success" | "error", data?: any) => Promise<void>
  ): Promise<PromptResult> {
    const logger = new ExecutionLogger();
    const resultId = `prompt_${Date.now()}`;

    // -------------------------------------------------------------
    // Stage 0: Brand DNA Loading & Intent Analysis (Parallel)
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(0, 6, "Loading Brand DNA & Analyzing Creative Intent (Gemini 2.5 Flash)...", "active");
    }
    const brand = await BrandBrainService.getBrandById(brandId);
    const intentStart = Date.now();

    const intentPrompt = `Analyze this content brief for Brand "${brand.name}" on social platform ${platform.toUpperCase()}:
User Brief: "${prompt}"
Industry: ${brand.industry}
Brand Tone: ${brand.voice?.tone || "Elevated"}
Brand Positioning: ${brand.positioning || "Modern excellence"}

Classify the post type and extract the strategic intent.`;

    let intent: z.infer<typeof IntentSynthesisSchema>;
    try {
      const intentRes = await generateObject({
        model: getReasoningModel(),
        schema: IntentSynthesisSchema,
        system: "You are Sapphire's Principal Social Content Strategist. Analyze user briefs and classify them into platform-native post types.",
        prompt: intentPrompt,
      });
      intent = intentRes.object;
    } catch {
      const fallbackRes = await generateObject({
        model: getReasoningFallbackModel(),
        schema: IntentSynthesisSchema,
        system: "You are Sapphire's Principal Social Content Strategist.",
        prompt: intentPrompt,
      });
      intent = fallbackRes.object;
    }

    logger.log({
      agent: "IntentAgent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - intentStart,
      summary: `Parsed intent: Post Type "${intent.post_type}", Topic: "${intent.topic}"`,
    });

    if (onProgress) {
      await onProgress(0, 6, `Brand DNA Loaded: "${brand.name}". Post type identified: ${intent.post_type}`, "success");
    }

    // -------------------------------------------------------------
    // Stage 1: Targeted Design Knowledge & Platform Rules Retrieval
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(1, 6, "Retrieving Platform Rules & Curated Visual Knowledge...", "active");
    }

    const platformRules = PLATFORM_VISUAL_RULES[platform];
    const postTypeGuidance = POST_TYPE_GUIDANCE[intent.post_type] || {
      visualGoal: "High-contrast editorial composition with clear focal point.",
      recommendedArchetype: "editorial_magazine",
      hookFormula: "Immediate scroll-stop visual interest.",
    };

    const designKnowledge = await DesignKnowledgeService.searchKnowledge(
      `${intent.topic} ${brand.industry} ${platform}`,
      2
    );

    logger.log({
      agent: "DesignKnowledgeService",
      provider: "Hybrid KB RAG",
      model: "local-kb-markdown",
      status: "success",
      durationMs: 40,
      summary: `Loaded platform rules for ${platform} and ${designKnowledge.length} design themes.`,
    });

    if (onProgress) {
      await onProgress(1, 6, `Platform rules and visual themes synchronized for ${platform}.`, "success");
    }

    // -------------------------------------------------------------
    // Stage 2: Strategist & Creative Director Concept Formulation
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(2, 6, "Synthesizing High-Confidence Visual Direction (Creative Director Agent)...", "active");
    }
    const cdStart = Date.now();

    const cdPrompt = `Synthesize a distinctive, magazine-grade visual concept and photographic direction for this post:

Platform: ${platform.toUpperCase()}
Post Type: ${intent.post_type}
Topic: "${intent.topic}"
Objective: "${intent.content_objective}"
Target Audience: "${intent.target_audience}"
Visual Opportunity: "${intent.visual_opportunity}"

Brand Context:
- Name: ${brand.name}
- Industry: ${brand.industry}
- Visual Identity: ${brand.visual_identity?.photography_style || "Authentic editorial commercial"}
- Primary Colors: ${brand.visual_identity?.primary_colors?.join(", ") || "#181816, #FAF9F5"}
- Forbidden Clichés: ${brand.voice?.forbidden_phrases?.join(", ") || "None"}

Platform Constraints & Guidance:
- Composition Doctrine: ${platformRules.compositionDoctrine}
- Post Type Goal: ${postTypeGuidance.visualGoal}
- Anti-Patterns to Avoid: ${platformRules.antiPatternsToAvoid.join("; ")}

Directive: Detail photographic camera lenses (e.g. 85mm f/1.4, 50mm f/1.2), lighting architecture, tactile materials, and organic textures. Exclude plastic AI tropes and generic stock corporate motifs.`;

    let cdSynthesis: z.infer<typeof CreativeDirectionSynthesisSchema>;
    try {
      const cdRes = await generateObject({
        model: getReasoningModel(),
        schema: CreativeDirectionSynthesisSchema,
        system: "You are Sapphire's Executive Creative Director. You formulate unignorable, magazine-grade visual concepts tailored for social scroll-stopping impact with precise photographic vocabulary.",
        prompt: cdPrompt,
      });
      cdSynthesis = cdRes.object;
    } catch {
      const cdFallback = await generateObject({
        model: getReasoningFallbackModel(),
        schema: CreativeDirectionSynthesisSchema,
        system: "You are Sapphire's Executive Creative Director.",
        prompt: cdPrompt,
      });
      cdSynthesis = cdFallback.object;
    }

    logger.log({
      agent: "CreativeDirectorAgent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - cdStart,
      summary: `Formulated concept: "${cdSynthesis.creative_concept.slice(0, 60)}..." (Archetype: ${cdSynthesis.archetype})`,
    });

    if (onProgress) {
      await onProgress(2, 6, `Creative direction formulated: "${cdSynthesis.interpreted_direction}"`, "success", {
        direction: cdSynthesis.interpreted_direction,
        archetype: cdSynthesis.archetype,
      });
    }

    // -------------------------------------------------------------
    // Stage 3: Model Routing & Intermediate PromptSpecification Assembly
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(3, 6, "Routing Optimal Image Model & Assembling Prompt Specification...", "active");
    }

    const modelRecommendation = ModelRouterService.routeModel({
      platform,
      postType: intent.post_type as PostType,
      archetype: cdSynthesis.archetype as DesignArchetype,
      hasInImageTextNeeded: cdSynthesis.archetype === "vintage_poster" || cdSynthesis.archetype === "comparison_split",
      visualStyle: cdSynthesis.subject,
      hasReferenceImage: false,
    });

    const promptSpec: PromptSpecification = {
      id: `spec_${Date.now()}`,
      version: 1,
      platform,
      post_type: intent.post_type as PostType,
      archetype: cdSynthesis.archetype as DesignArchetype,
      creative_concept: cdSynthesis.creative_concept,
      subject: cdSynthesis.subject,
      environment: cdSynthesis.environment,
      lighting: cdSynthesis.lighting,
      camera_and_optics: cdSynthesis.camera_and_optics,
      color_and_materials: cdSynthesis.color_and_materials,
      negative_constraints: [
        ...cdSynthesis.negative_constraints,
        ...platformRules.antiPatternsToAvoid,
      ],
      brand_tokens: {
        brand_name: brand.name,
        primary_color: brand.visual_identity?.primary_colors?.[0],
        tone: brand.voice?.tone,
        forbidden_motifs: brand.voice?.forbidden_phrases || [],
      },
      target_model: modelRecommendation.recommendedModel,
      aspect_ratio: modelRecommendation.aspectRatio,
      reference_strategy: {
        type: cdSynthesis.reference_strategy_type,
        guidance: cdSynthesis.reference_guidance,
        importance: cdSynthesis.reference_strategy_type === "none" ? "optional" : "recommended",
      },
    };

    logger.log({
      agent: "ModelRouterService",
      provider: "Capability Heuristics",
      model: modelRecommendation.recommendedModel,
      status: "success",
      durationMs: 15,
      summary: `Routed to ${modelRecommendation.displayName} (${modelRecommendation.aspectRatio})`,
    });

    if (onProgress) {
      await onProgress(3, 6, `Model routed: ${modelRecommendation.displayName} (${modelRecommendation.aspectRatio})`, "success");
    }

    // -------------------------------------------------------------
    // Stage 4: Model-Aware Multi-Format Prompt Formatting
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(4, 6, "Engineering Production-Ready Prompt Syntax Across Models...", "active");
    }

    const formattedBundle = PromptFormattersService.formatPromptBundle(promptSpec);

    logger.log({
      agent: "PromptFormattersService",
      provider: "Syntax Compiler",
      model: modelRecommendation.recommendedModel,
      status: "success",
      durationMs: 10,
      summary: "Rendered multi-model optimized prompt strings and syntax tokens.",
    });

    if (onProgress) {
      await onProgress(4, 6, "Production prompt engineered and formatted.", "success");
    }

    // -------------------------------------------------------------
    // Stage 5: Prompt Critic 100-Point Quality & Compliance Audit
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(5, 6, "Auditing Prompt Quality & Brand Compliance (100-pt Rubric)...", "active");
    }

    const criticStart = Date.now();
    const criticEvaluation = await PromptValidatorService.evaluatePrompt(
      promptSpec,
      formattedBundle.primary.finalPrompt,
      brand
    );

    logger.log({
      agent: "PromptCriticAgent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - criticStart,
      summary: `Quality Score: ${criticEvaluation.score}/100 (Pass: ${criticEvaluation.pass})`,
    });

    if (onProgress) {
      await onProgress(5, 6, `Quality audit complete. Score: ${criticEvaluation.score}/100`, "success");
    }

    // Assemble final PromptResult
    const finalResult: PromptResult = {
      id: resultId,
      mode: "prompt_only",
      platform,
      post_type: intent.post_type as PostType,
      archetype: cdSynthesis.archetype as DesignArchetype,
      interpreted_direction: cdSynthesis.interpreted_direction,
      model_recommendation: modelRecommendation,
      aspect_ratio: modelRecommendation.aspectRatio,
      reference_strategy: promptSpec.reference_strategy,
      final_prompt: formattedBundle.primary.finalPrompt,
      negative_prompt: formattedBundle.primary.negativePrompt,
      all_model_formats: formattedBundle.allModelFormats,
      syntax_tokens: formattedBundle.syntaxTokens,
      specification: promptSpec,
      critic_evaluation: criticEvaluation,
      rationale: {
        creative_direction_reason: cdSynthesis.rationale_creative,
        platform_psychology_reason: cdSynthesis.rationale_platform,
        model_selection_reason: modelRecommendation.selectionReason,
        anti_cliche_guardrails: cdSynthesis.anti_cliche_guardrails,
      },
      version: 1,
      created_at: new Date().toISOString(),
    };

    // Asynchronously snapshot to Supabase campaigns table if available
    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from("campaigns").insert({
          id: resultId,
          brand_id: brand.id,
          campaign_title: `${brand.name} — ${intent.topic} (Prompt Specification)`,
          topic: prompt,
          platform,
          intent,
          research: {
            search_queries: [prompt],
            key_trends: designKnowledge.map((t) => t.theme_name),
            visual_motifs: designKnowledge.map((t) => t.prompt_keywords),
            overused_patterns_to_avoid: platformRules.antiPatternsToAvoid,
            summary: cdSynthesis.interpreted_direction,
          },
          concept_a: {
            label: "Prompt Specification",
            creative_direction: cdSynthesis.interpreted_direction,
            visual_style: cdSynthesis.subject,
            composition: cdSynthesis.camera_and_optics,
            lighting: cdSynthesis.lighting,
            color_palette: [cdSynthesis.color_and_materials],
            image_prompt: formattedBundle.primary.finalPrompt,
            caption_instagram: "",
            caption_linkedin: "",
            optimized_image_prompt: formattedBundle.primary.finalPrompt,
          },
          concept_b: {
            label: "Model Recommendation",
            creative_direction: modelRecommendation.selectionReason,
            visual_style: modelRecommendation.displayName,
            composition: modelRecommendation.aspectRatio,
            lighting: "",
            color_palette: [],
            image_prompt: formattedBundle.primary.finalPrompt,
            caption_instagram: "",
            caption_linkedin: "",
          },
        });
      }
    } catch (dbErr) {
      console.warn("Supabase prompt result persistence notice:", dbErr);
    }

    return finalResult;
  }
}
