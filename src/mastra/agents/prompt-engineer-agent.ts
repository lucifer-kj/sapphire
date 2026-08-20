import { generateObject } from "ai";
import { VisualLayerDecompositionSchema, VisualLayerDecomposition } from "@/lib/schema/visual-layers";
import { ConceptItem, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";

export class PromptEngineerAgent {
  /**
   * Decomposes creative concepts into 4 discrete visual layers with strict
   * Negative Space Budgeting and pure photographic sanitization to ensure
   * AI photography leaves room for Satori typography overlays with zero text hallucinations.
   */
  static async decomposeAndEngineerPrompt(
    concept: ConceptItem,
    brand: BrandProfile,
    intent: UserIntent,
    research?: ResearchContext | null,
    referenceAnalysis?: ReferenceImageAnalysis | null,
    remediationDirective?: string | null
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

    const remediationContext = remediationDirective
      ? `\nCRITIC AUDIT REMEDIATION DIRECTIVE (MANDATORY FIXES):
${remediationDirective}\n`
      : "";

    const systemPrompt = `You are Sapphire's Principal Prompt Engineer for Hybrid Multi-Layer AI Photography & Canva-Grade Compositing.
Your task is to deconstruct the creative concept into pure photographic aspect layers and synthesize a master prompt for FLUX Realism.

STRICT DIFFUSION SANITIZATION & CRISP OPTICS RULES (CRITICAL):
1. NEVER include words, headlines, slogans, letters, brand names, or typography demands in the image prompt. All text is overlaid separately via vector typography.
2. HERO PROPS & CONCRETE SUBJECTS: Always explicitly include the tangible physical hero props, food/beverage items, cultural objects, or product assets required by the campaign topic (e.g. if coffee culture: traditional Vietnamese stainless steel phin filter, glass of condensed milk coffee, roasted dark coffee beans on a rustic wooden table).
3. ZERO-BLUR CRISP FOCUS: Mandate tack-sharp foreground focus: "Shot on 50mm f/4 lens, tack-sharp crisp focus across hero subject and props, ultra-detailed micro-textures, clean lighting, 8k commercial photography". Avoid wide apertures like f/1.8 that create excessive bokeh blur over props.
4. Explicit Spatial Directive: "${spatialDirective}"
5. Mandatory negative constraints: "blurry, soft focus, out of focus, motion blur, bokeh over subject, text, typography, letters, words, font, watermark, logo, label, badge, distorted fingers, extra fingers, cartoon, 3d render, low quality, oversaturated".

BRAND VISUAL DNA:
- Brand: ${brand.name} (${brand.industry})
- Positioning: ${brand.positioning}
- Photography Style: ${brandVisuals.photography_style}
- Color Palette: ${colorList}

${refContext}
${remediationContext}

LAYER DECOMPOSITION GUIDELINES:
1. environment_background_layer: Architectural or natural scenic backdrop with clear sky in the upper 45% negative space zone.
2. subject_asset_layer: Primary hero subject AND tangible props in sharp focus. If archetype is 'polaroid_pov_overlay', describe a realistic first-person POV hand holding a crisp white Polaroid instant photograph in sharp focus in the lower-center foreground, perfectly framing the scenic landmark inside the Polaroid.
3. atmospheric_grading_layer: Lighting direction (e.g. golden hour sunlight, warm directional side-lighting), color temperature, clean natural depth.
4. blended_composite_prompt: Master hyper-realistic prompt starting with "Commercial photography, vertical 4:5 portrait composition for social media," integrating lens ("Shot on 50mm f/4 lens, tack-sharp in-focus subject and props"), crisp micro-contrast, and clean negative space sky void.
5. negative_constraints: "blurry, soft focus, out of focus, motion blur, bokeh over subject, text, typography, letters, words, font, watermark, logo, label, badge, distorted fingers, extra fingers, cartoon, 3d render, low quality".`;

    const promptText = `Campaign Topic & Requirements: ${intent.event} (${intent.objective})
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
          environment_background_layer: `Historic authentic architectural setting in ${topic} with sandstone textures and scenic atmosphere.`,
          subject_asset_layer: `Central hero subject and tangible props for ${topic} in tack-sharp focus, framed according to spatial rules.`,
          atmospheric_grading_layer: `Golden hour side-lighting with soft ambient shadows, harmonious warm color palette (${colorList}), clean natural depth.`,
          blended_composite_prompt: `Commercial photography, vertical 4:5 portrait composition for social media, ${topic}, ${style}, ${mood} atmosphere, warm golden hour side-lighting, harmonious palette of ${colorList}, ${spatialDirective}, shot on 50mm f/4 lens, tack-sharp focus on subject and hero props, crisp micro-contrast, photorealistic 8k`,
          negative_constraints: "blurry, soft focus, out of focus, motion blur, bokeh over subject, busy background, center clutter, text, typography, watermark, logo, crowded frame, oversaturated, generic stock photo, distorted hands, cartoon",
          technical_camera_specs: "Shot on 50mm f/4 lens, tack-sharp focus, golden hour lighting, 4:5 aspect ratio, 8k",
        };
      }
    }
  }

  /**
   * Backward-compatible alias for existing call sites with remediation support.
   */
  static async engineerPrompt(
    concept: ConceptItem,
    brand: BrandProfile,
    intent: UserIntent,
    research?: ResearchContext | null,
    referenceAnalysis?: ReferenceImageAnalysis | null,
    remediationDirective?: string | null
  ) {
    const layers = await this.decomposeAndEngineerPrompt(
      concept,
      brand,
      intent,
      research,
      referenceAnalysis,
      remediationDirective
    );
    return {
      optimized_image_prompt: layers.blended_composite_prompt,
      negative_prompt: layers.negative_constraints,
      camera_specs: layers.technical_camera_specs,
      style_tags: ["editorial", "multi-layer", "photorealistic"],
      layers,
    };
  }
}

