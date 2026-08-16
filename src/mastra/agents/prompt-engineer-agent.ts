import { generateObject } from "ai";
import { VisualLayerDecompositionSchema, VisualLayerDecomposition } from "@/lib/schema/visual-layers";
import { ConceptItem, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";

export class PromptEngineerAgent {
  /**
   * Decomposes creative concepts into 4 discrete visual layers:
   * 1. Environment & Background Layer
   * 2. Subject & Cultural Asset Layer
   * 3. Atmospheric Lighting & Brand Color Grading Layer
   * 4. Unified Blended Composite Prompt (synthesizing all layers for Gemini Nano Banana & Flux)
   */
  static async decomposeAndEngineerPrompt(
    concept: ConceptItem,
    brand: BrandProfile,
    intent: UserIntent,
    research?: ResearchContext | null,
    referenceAnalysis?: ReferenceImageAnalysis | null
  ): Promise<VisualLayerDecomposition> {
    const brandVisuals = brand.visual_identity;
    const colorList = concept.color_palette.length
      ? concept.color_palette.join(", ")
      : brandVisuals.secondary_colors.join(", ");

    const refContext = referenceAnalysis
      ? `USER REFERENCE IMAGE TRAITS:
- Reference Photography Style: ${referenceAnalysis.photography_style}
- Reference Mood & Emotion: ${referenceAnalysis.mood}
- Reference Lighting: ${referenceAnalysis.lighting}
- Reference Palette: ${referenceAnalysis.color_palette.join(", ")}
- Reference Visual Subject: ${referenceAnalysis.visual_subject}`
      : "No user reference image attached.";

    const systemPrompt = `You are Sapphire's Principal Prompt Engineer for Multi-Layer AI Visual Generation (Gemini Nano Banana 2 & Flux).
Your task is to deconstruct the creative concept into 3 isolated aspect layers and then synthesize a cohesive master composite prompt.

BRAND VISUAL DNA:
- Brand: ${brand.name} (${brand.industry})
- Positioning: ${brand.positioning}
- Photography Style: ${brandVisuals.photography_style}
- Image Preferences: ${brandVisuals.image_preferences.join(", ")}

${refContext}

LAYER DECOMPOSITION GUIDELINES:
1. environment_background_layer:
   - Specific architectural landmarks, spatial geography, landscape textures, and ambient environmental details relevant to "${intent.event}".
2. subject_asset_layer:
   - Candid human subjects, natural non-stiff postures, authentic cultural interactions, and tactile clothing fabrics (linen, silk, heritage textures).
3. atmospheric_grading_layer:
   - Precise lighting direction (e.g. golden hour side-light, soft morning diffusion), brand color harmony (${colorList}), depth-of-field blur, and optical micro-contrast.
4. blended_composite_prompt:
   - Master prompt starting with "Editorial photography, vertical 4:5 portrait composition for social media," seamlessly integrating the environment, subjects, and atmospheric grading into a photorealistic, 8k award-winning scene.
5. negative_constraints:
   - Guardrails to prevent text overlays, logos, watermarks, distorted limbs, and artificial stock photo aesthetics.`;

    const promptText = `Campaign Event: ${intent.event}
Concept Label: ${concept.label}
Creative Direction: ${concept.creative_direction}
Visual Style: ${concept.visual_style}
Composition: ${concept.composition}
Lighting: ${concept.lighting}
Research Motifs: ${research?.visual_motifs.join(", ") || "Authentic cultural immersion"}`;

    try {
      const result = await generateObject({
        model: getReasoningModel(),
        schema: VisualLayerDecompositionSchema,
        system: systemPrompt,
        prompt: promptText,
      });
      return result.object;
    } catch (err) {
      console.warn("PromptEngineer primary failed, falling back:", err);
      try {
        const result = await generateObject({
          model: getReasoningFallbackModel(),
          schema: VisualLayerDecompositionSchema,
          system: systemPrompt,
          prompt: promptText,
        });
        return result.object;
      } catch (err2) {
        const topic = intent.event.replace(/^(make a post for|create a post for|promote|a post about)/gi, "").trim() || "Cultural Journey";
        const style = referenceAnalysis ? referenceAnalysis.photography_style : brandVisuals.photography_style;
        const mood = referenceAnalysis ? referenceAnalysis.mood : "Warm and aspirational";

        return {
          environment_background_layer: `Historic authentic architectural setting in ${topic} with sandstone textures and scenic landmark atmosphere.`,
          subject_asset_layer: `Candid travelers enjoying authentic cultural moments, wearing contemporary travel attire with natural expressions.`,
          atmospheric_grading_layer: `Golden hour side-lighting with soft ambient shadows, harmonious warm color palette (${colorList}), and natural depth of field.`,
          blended_composite_prompt: `Editorial photography, vertical 4:5 portrait composition for Instagram, candid human moment in ${topic}, authentic travelers experiencing cultural landmarks, ${style}, ${mood} atmosphere, warm golden hour side-lighting, harmonious palette of ${colorList}, shot on 35mm f/1.8 lens, natural depth of field, crisp micro-contrast, photorealistic 8k`,
          negative_constraints: "text, typography, watermark, logo, blurry, oversaturated, generic stock photo, distorted hands, cartoon",
          technical_camera_specs: "Shot on 35mm f/1.8 lens, golden hour lighting, 4:5 aspect ratio, 8k",
        };
      }
    }
  }

  /**
   * Backward-compatible alias for existing call sites.
   */
  static async engineerPrompt(
    concept: ConceptItem,
    brand: BrandProfile,
    intent: UserIntent,
    research?: ResearchContext | null,
    referenceAnalysis?: ReferenceImageAnalysis | null
  ) {
    const layers = await this.decomposeAndEngineerPrompt(concept, brand, intent, research, referenceAnalysis);
    return {
      optimized_image_prompt: layers.blended_composite_prompt,
      negative_prompt: layers.negative_constraints,
      camera_specs: layers.technical_camera_specs,
      style_tags: ["editorial", "multi-layer", "photorealistic"],
      layers,
    };
  }
}
