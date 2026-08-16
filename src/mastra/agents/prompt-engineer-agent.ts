import { generateObject } from "ai";
import { PromptEngineerResultSchema, PromptEngineerResult } from "@/lib/schema/prompt-engineer";
import { ConceptItem, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";

export class PromptEngineerAgent {
  /**
   * Translates high-level creative direction and brand visual DNA into
   * a model-optimized 6-stage image generation prompt tailored for Gemini Nano Banana & Flux.
   */
  static async engineerPrompt(
    concept: ConceptItem,
    brand: BrandProfile,
    intent: UserIntent,
    research?: ResearchContext | null,
    referenceAnalysis?: ReferenceImageAnalysis | null
  ): Promise<PromptEngineerResult> {
    const brandVisuals = brand.visual_identity;
    const colorList = concept.color_palette.length
      ? concept.color_palette.join(", ")
      : brandVisuals.secondary_colors.join(", ");

    const refContext = referenceAnalysis
      ? `REFERENCE IMAGE VISUAL TRAITS:
- Reference Style: ${referenceAnalysis.photography_style}
- Reference Mood: ${referenceAnalysis.mood}
- Reference Lighting: ${referenceAnalysis.lighting}
- Reference Palette: ${referenceAnalysis.color_palette.join(", ")}
- Reference Subject: ${referenceAnalysis.visual_subject}`
      : "No reference image attached.";

    const systemPrompt = `You are Sapphire's Principal Prompt Engineer for AI Image Generation (Gemini Nano Banana & Flux models).
Your job is to transform a creative marketing brief into a photorealistic, award-winning 6-stage image generation prompt.

BRAND VISUAL IDENTITY:
- Brand Name: ${brand.name}
- Photography Style: ${brandVisuals.photography_style}
- Graphic Style: ${brandVisuals.graphic_style}
- Visual Preferences: ${brandVisuals.image_preferences.join(", ")}

${refContext}

PROMPT STRUCTURE RULES (6-Stage Anatomy):
1. Medium & Aspect Ratio: Must start with "Editorial photography, vertical 4:5 portrait composition for social media,".
2. Subject & Authentic Action: Describe specific people/subjects engaged in candid, human, culturally authentic moments (no stiff poses).
3. Environment & Cultural Atmosphere: Rich architectural textures, landmark atmosphere, natural scenic elements relevant to "${intent.event}".
4. Lighting & Color Grading: Specific cinematic lighting (e.g. golden hour side-lighting, soft ambient shadows) + color harmony (${colorList}).
5. Photographic Camera Specs: Shot on professional prime lens (35mm or 50mm f/1.8), shallow depth of field, gentle background bokeh, crisp micro-contrast, 8k resolution.
6. Guardrails: Absolutely zero text overlay, zero typography, zero logos, zero watermarks.

Synthesize a single comprehensive "optimized_image_prompt" (250-450 characters) combining all 6 stages, plus a strong "negative_prompt".`;

    const promptText = `Campaign Event: ${intent.event}
Concept Label: ${concept.label}
Creative Direction: ${concept.creative_direction}
Visual Style: ${concept.visual_style}
Composition: ${concept.composition}
Lighting: ${concept.lighting}
Key Research Motifs: ${research?.visual_motifs.join(", ") || "Authentic cultural immersion"}`;

    try {
      const result = await generateObject({
        model: getReasoningModel(),
        schema: PromptEngineerResultSchema,
        system: systemPrompt,
        prompt: promptText,
      });
      return result.object;
    } catch (err) {
      console.warn("PromptEngineer primary failed, falling back:", err);
      try {
        const result = await generateObject({
          model: getReasoningFallbackModel(),
          schema: PromptEngineerResultSchema,
          system: systemPrompt,
          prompt: promptText,
        });
        return result.object;
      } catch (err2) {
        // Dynamic fallback following strict 6-stage anatomy
        const topic = intent.event.replace(/^(make a post for|create a post for|promote|a post about)/gi, "").trim() || "Destination Journey";
        const style = referenceAnalysis ? referenceAnalysis.photography_style : brandVisuals.photography_style;
        const mood = referenceAnalysis ? referenceAnalysis.mood : "Warm and aspirational";

        return {
          optimized_image_prompt: `Editorial photography, vertical 4:5 portrait composition for Instagram, candid human moment in ${topic}, authentic travelers experiencing cultural landmarks, ${style}, ${mood} atmosphere, warm golden hour side-lighting, harmonious palette of ${colorList}, shot on 35mm f/1.8 lens, natural depth of field, crisp micro-contrast, photorealistic 8k`,
          negative_prompt: "text, typography, watermark, logo, blurry, oversaturated, generic stock photo, distorted hands, cartoon",
          camera_specs: "35mm f/1.8 lens, golden hour lighting, 4:5 aspect ratio",
          style_tags: ["editorial", "travel", "photorealistic", "candid"],
        };
      }
    }
  }
}
