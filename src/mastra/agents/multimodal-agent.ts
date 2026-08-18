import { generateObject } from "ai";
import { ReferenceImageAnalysisSchema, ReferenceImageAnalysis } from "@/lib/schema/reference";
import { BrandProfile } from "@/lib/schema/brand";
import { getVisionModel, getReasoningFallbackModel } from "@/lib/ai-model";

export class MultimodalAgent {
  /**
   * Analyzes one or multiple uploaded reference visual ingredients (e.g. Hero Subject + Mood/Lighting + Composition)
   * using Gemini Flash Vision to synthesize a unified Visual Blueprint Manifest.
   */
  static async analyzeReferenceImages(
    images: string | string[],
    brand?: BrandProfile | null
  ): Promise<ReferenceImageAnalysis> {
    const imageList = Array.isArray(images) ? images.filter(Boolean) : [images].filter(Boolean);
    if (imageList.length === 0) {
      return this.getDefaultManifest(brand);
    }

    const brandContext = brand
      ? `Brand Context: "${brand.name}" in "${brand.industry}".
Primary Colors: ${brand.visual_identity?.primary_colors?.join(", ") || "#181816, #FAF9F5"}.
Accent Colors: ${brand.visual_identity?.secondary_colors?.join(", ") || "#D97757"}.
Photography Rules: "${brand.visual_identity?.photography_style || "Editorial commercial photography"}".`
      : "No brand context provided.";

    const contentParts: any[] = [
      {
        type: "text",
        text: `You are Sapphire's Principal Multimodal Vision & Art Director Compiler.
Analyze the provided visual ingredient image(s) (${imageList.length} asset${imageList.length > 1 ? "s" : ""}) alongside the Brand DNA.
${brandContext}

Synthesize a cohesive, high-accuracy Visual Blueprint Manifest:
1. Deconstruct composition, lighting angle/Kelvin, depth of field, and camera optics (e.g. 35mm f/2.8 lens).
2. Identify the exact Design Archetype:
   - 'polaroid_pov_overlay': First-person POV hand holding an instant photo/polaroid/device framing a scenic landscape, with top brand logo, bold headline, and service badge row.
   - 'feature_badges_editorial': Top logo, bold headline, 3-icon feature badge row, scenic hero background.
   - 'minimal_shader_text': High-impact typography on subtle dark/light shader background.
   - 'editorial_magazine', 'conceptual_split', 'comparison_split', 'vintage_poster', 'saas_dotgrid'.
3. Calculate exact Spatial Negative Space void (where headline, logo, and badge row overlay cleanly in the sky/ambient void without colliding with the hand or subject).
4. Extract harmonized color palette anchors (hex codes) and material textures (e.g. Polaroid paper gloss, skin tone, limestone karsts, sea texture).`,

      },
    ];

    for (const img of imageList.slice(0, 3)) {
      contentParts.push({
        type: "image",
        image: img,
      });
    }

    try {
      const result = await generateObject({
        model: getVisionModel(),
        schema: ReferenceImageAnalysisSchema,
        messages: [
          {
            role: "user",
            content: contentParts,
          },
        ],
      });

      return result.object;
    } catch (err) {
      console.warn("Gemini Multimodal Agent fallback:", err);
      return this.getDefaultManifest(brand);
    }
  }

  /**
   * Backward-compatible alias for single reference image call sites.
   */
  static async analyzeReferenceImage(
    imageDataUrl: string,
    brand?: BrandProfile | null
  ): Promise<ReferenceImageAnalysis> {
    return this.analyzeReferenceImages([imageDataUrl], brand);
  }

  private static getDefaultManifest(brand?: BrandProfile | null): ReferenceImageAnalysis {
    const brandColors = brand?.visual_identity?.primary_colors?.length
      ? [...brand.visual_identity.primary_colors, ...(brand.visual_identity.secondary_colors || [])]
      : ["#181816", "#D97757", "#FAF9F5"];

    return {
      photography_style: brand?.visual_identity?.photography_style || "Editorial Commercial Photography",
      mood: "Aspirational, authentic & warm",
      color_palette: brandColors.slice(0, 4),
      lighting: "Warm Golden Hour with soft ambient shadows",
      composition: "Centered Rule-of-Thirds with wide negative space",
      visual_subject: `${brand?.name || "Brand"} signature scene framing`,
      key_elements: ["Golden hour light", "Authentic textures", "Cinematic depth"],
      detected_archetype: "editorial_magazine",
      negative_space_zone: "Upper 40% clean ambient open void for headline typography",
      suggested_font_pair: "Playfair Display + Plus Jakarta Sans",
      camera_optics: "Shot on 35mm f/1.8 lens, shallow depth-of-field, 8k",
      lighting_vector: "Golden hour side-lighting at 45° with soft ambient bounce",
      spatial_negative_space_plan: "Upper 40% open area reserved for headline typography overlays",
      material_textures: "Natural authentic textures, subtle film grain",
      color_palette_anchors: brandColors.slice(0, 3),
    };
  }
}

