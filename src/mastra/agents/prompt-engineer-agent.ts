import { generateObject } from "ai";
import { VisualLayerDecompositionSchema, VisualLayerDecomposition } from "@/lib/schema/visual-layers";
import { ConceptItem, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";

export class PromptEngineerAgent {
  /**
   * Decomposes creative concepts into 4 discrete visual layers with strict
   * Negative Space Budgeting to ensure AI photography leaves room for Satori typography overlays.
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

    const blueprint = concept.design_blueprint;
    const spatialDirective =
      blueprint?.negative_space_directive ||
      "Leave upper 40% clean, uncluttered and darker for headline typography overlays.";

    const refContext = referenceAnalysis
      ? `USER REFERENCE IMAGE TRAITS:
- Reference Photography Style: ${referenceAnalysis.photography_style}
- Reference Mood & Emotion: ${referenceAnalysis.mood}
- Reference Lighting: ${referenceAnalysis.lighting}
- Reference Palette: ${referenceAnalysis.color_palette.join(", ")}
- Reference Visual Subject: ${referenceAnalysis.visual_subject}`
      : "No user reference image attached.";

    const systemPrompt = `You are Sapphire's Principal Prompt Engineer for Hybrid Multi-Layer AI Photography & Canva-Grade Compositing.
Your task is to deconstruct the creative concept into 3 isolated aspect layers and then synthesize a master composite prompt for Cloudflare FLUX 1 Schnell.

CRITICAL SPATIAL BUDGETING DIRECTIVE:
"${spatialDirective}"
The AI photography must leave dedicated clean/dark/open negative space so our Satori vector layout engine can overlay headlines, pills, and brand badges cleanly.

BRAND VISUAL DNA:
- Brand: ${brand.name} (${brand.industry})
- Positioning: ${brand.positioning}
- Photography Style: ${brandVisuals.photography_style}
- Color Palette: ${colorList}

${refContext}

LAYER DECOMPOSITION GUIDELINES:
1. environment_background_layer:
   - Specific architectural landmarks, textures, and ambient background details.
   - Must explicitly describe the background lighting and atmosphere in the negative space zone.
2. subject_asset_layer:
   - Primary subject/product/traveler with specific positioning matching the spatial directive.
3. atmospheric_grading_layer:
   - Precise lighting direction (e.g. golden hour side-light, soft studio key light), brand color harmony (${colorList}), and natural depth-of-field.
4. blended_composite_prompt:
   - Master prompt starting with "Studio commercial photography, vertical 4:5 portrait composition for social media," or "Editorial travel photography, vertical 4:5 portrait," integrating environment, subject placement, lighting, and negative space into an 8k photo.
5. negative_constraints:
   - Guardrails: "text, typography, watermark, logo, blurry, oversaturated, generic stock photo, distorted hands, cartoon".`;

    const promptText = `Campaign Event: ${intent.event}
Concept Label: ${concept.label}
Archetype: ${blueprint?.archetype || "editorial_magazine"}
Creative Direction: ${concept.creative_direction}
Visual Style: ${concept.visual_style}
Composition: ${concept.composition}
Lighting: ${concept.lighting}
Spatial Requirement: ${spatialDirective}`;

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
        const topic =
          intent.event
            .replace(/^(make a post for|create a post for|promote|a post about)/gi, "")
            .trim() || "Signature Campaign";
        const style = referenceAnalysis ? referenceAnalysis.photography_style : brandVisuals.photography_style;
        const mood = referenceAnalysis ? referenceAnalysis.mood : "Warm and aspirational";

        return {
          environment_background_layer: `Historic authentic architectural setting in ${topic} with sandstone textures and scenic landmark atmosphere.`,
          subject_asset_layer: `Central hero subject for ${topic} framed according to spatial rules.`,
          atmospheric_grading_layer: `Golden hour side-lighting with soft ambient shadows, harmonious warm color palette (${colorList}), and natural depth of field.`,
          blended_composite_prompt: `Editorial commercial photography, vertical 4:5 portrait composition for social media, ${topic}, ${style}, ${mood} atmosphere, warm golden hour side-lighting, harmonious palette of ${colorList}, ${spatialDirective}, shot on 35mm f/1.8 lens, natural depth of field, crisp micro-contrast, photorealistic 8k`,
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
