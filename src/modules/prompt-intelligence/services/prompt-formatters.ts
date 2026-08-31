import { PromptSpecification } from "../domain/prompt-spec";
import { SupportedModelFamily } from "../domain/model-strategy";
import { FormattedModelOutput, PromptSyntaxToken } from "../domain/prompt-result";

export interface FormattedPromptBundle {
  primary: FormattedModelOutput;
  allModelFormats: Record<SupportedModelFamily, FormattedModelOutput>;
  syntaxTokens: PromptSyntaxToken[];
}

export class PromptFormattersService {
  /**
   * Transforms a structured PromptSpecification into model-tuned generation prose for all supported models.
   */
  static formatPromptBundle(spec: PromptSpecification): FormattedPromptBundle {
    const allModelFormats: Record<SupportedModelFamily, FormattedModelOutput> = {
      flux_1_dev: this.formatForFluxDev(spec),
      flux_1_schnell: this.formatForFluxSchnell(spec),
      midjourney_v6: this.formatForMidjourney(spec),
      ideogram_v2: this.formatForIdeogram(spec),
      dalle_3: this.formatForDalle3(spec),
      stable_diffusion_xl: this.formatForSDXL(spec),
    };

    const primary = allModelFormats[spec.target_model] || allModelFormats.flux_1_dev;
    const syntaxTokens = this.extractSyntaxTokens(spec);

    return {
      primary,
      allModelFormats,
      syntaxTokens,
    };
  }

  /**
   * Backwards compatible single-model formatter.
   */
  static formatPrompt(spec: PromptSpecification): FormattedModelOutput {
    const bundle = this.formatPromptBundle(spec);
    return bundle.primary;
  }

  // --------------------------------------------------------------------------
  // Model-Specific Formatters
  // --------------------------------------------------------------------------

  private static formatForFluxDev(spec: PromptSpecification): FormattedModelOutput {
    const {
      subject,
      environment,
      lighting,
      camera_and_optics,
      color_and_materials,
      negative_constraints,
      brand_tokens,
    } = spec;

    const parts = [
      `A masterwork commercial editorial photograph: ${subject}`,
      `Environment & Setting: ${environment}`,
      `Lighting Architecture: ${lighting}`,
      `Cinematography & Optics: ${camera_and_optics}`,
      `Textures & Color Grade: ${color_and_materials}${brand_tokens.primary_color ? `, accentuating ${brand_tokens.primary_color} tones` : ""}`,
      `Photographic Fidelity: authentic natural skin/material textures, micro-contrast, organic film grain, 8k resolution, crisp focal falloff, zero plastic CGI sheen`,
    ];

    const finalPrompt = parts.join(". ");
    return {
      finalPrompt,
      negativePrompt: negative_constraints.length > 0 ? negative_constraints.join(", ") : undefined,
      copyablePrompt: finalPrompt,
    };
  }

  private static formatForFluxSchnell(spec: PromptSpecification): FormattedModelOutput {
    const { subject, environment, lighting, camera_and_optics, color_and_materials, negative_constraints } = spec;

    const parts = [
      `High-end commercial photograph of ${subject}`,
      `in ${environment}`,
      `illuminated by ${lighting}`,
      `${camera_and_optics}`,
      `${color_and_materials}`,
      `hyper-detailed tactile textures, authentic editorial quality`,
    ];

    const finalPrompt = parts.join(", ");
    return {
      finalPrompt,
      negativePrompt: negative_constraints.length > 0 ? negative_constraints.join(", ") : undefined,
      copyablePrompt: finalPrompt,
    };
  }

  private static formatForMidjourney(spec: PromptSpecification): FormattedModelOutput {
    const {
      subject,
      environment,
      lighting,
      camera_and_optics,
      color_and_materials,
      negative_constraints,
      aspect_ratio,
    } = spec;

    const arFlag = aspect_ratio === "4:5" ? "--ar 4:5" : aspect_ratio === "1:1" ? "--ar 1:1" : `--ar ${aspect_ratio}`;
    const parts = [
      subject,
      environment,
      lighting,
      camera_and_optics,
      color_and_materials,
      "award-winning editorial composition, natural grain, cinematic lighting",
      `${arFlag} --style raw --v 6.1 --s 250`,
    ].filter(Boolean);

    let finalPrompt = parts.join(", ");
    if (negative_constraints.length > 0) {
      finalPrompt += ` --no ${negative_constraints.join(", ")}`;
    }

    return {
      finalPrompt,
      negativePrompt: negative_constraints.length > 0 ? negative_constraints.join(", ") : undefined,
      copyablePrompt: finalPrompt,
    };
  }

  private static formatForIdeogram(spec: PromptSpecification): FormattedModelOutput {
    const {
      creative_concept,
      subject,
      environment,
      lighting,
      camera_and_optics,
      color_and_materials,
      brand_tokens,
      aspect_ratio,
      negative_constraints,
    } = spec;

    const parts = [
      `Graphic editorial layout for ${brand_tokens.brand_name || "brand"}: ${creative_concept}`,
      `Hero Subject: ${subject} situated in ${environment}`,
      `Lighting & Mood: ${lighting}, ${color_and_materials}`,
      `Layout Geometry: ${camera_and_optics}, 8% safe zone perimeter margins, ratio ${aspect_ratio}`,
    ].filter(Boolean);

    const finalPrompt = parts.join(". ");
    return {
      finalPrompt,
      negativePrompt: negative_constraints.length > 0 ? negative_constraints.join(", ") : undefined,
      copyablePrompt: finalPrompt,
    };
  }

  private static formatForDalle3(spec: PromptSpecification): FormattedModelOutput {
    const { subject, environment, lighting, camera_and_optics, color_and_materials, aspect_ratio } = spec;

    const finalPrompt = `${subject}. The scene takes place in ${environment}. The atmosphere is illuminated with ${lighting}, captured via ${camera_and_optics}. The visual palette features ${color_and_materials}. Authentic high-resolution commercial photography, natural realistic grain, distinct texture, clean composition adhering strictly to an aspect ratio of ${aspect_ratio}. Exclude 3D plastic renders or floaty isometric clichés.`;

    return {
      finalPrompt,
      copyablePrompt: finalPrompt,
    };
  }

  private static formatForSDXL(spec: PromptSpecification): FormattedModelOutput {
    const { subject, environment, lighting, camera_and_optics, color_and_materials, negative_constraints } = spec;

    const finalPrompt = `${subject}, ${environment}, ${lighting}, ${camera_and_optics}, ${color_and_materials}, 8k uhd, dslr, high quality, authentic film grain, photorealistic`;
    const defaultSDXLNegatives = "bad quality, blurry, 3d render, plastic skin, distorted anatomy, oversaturated, watermark, signature";
    const negativePrompt = negative_constraints.length > 0
      ? `${negative_constraints.join(", ")}, ${defaultSDXLNegatives}`
      : defaultSDXLNegatives;

    return {
      finalPrompt,
      negativePrompt,
      copyablePrompt: `${finalPrompt}\n\nNegative Prompt:\n${negativePrompt}`,
    };
  }

  private static extractSyntaxTokens(spec: PromptSpecification): PromptSyntaxToken[] {
    const tokens: PromptSyntaxToken[] = [
      { category: "subject", label: "Subject", value: spec.subject },
      { category: "environment", label: "Environment", value: spec.environment },
      { category: "lighting", label: "Lighting & Mood", value: spec.lighting },
      { category: "camera_optics", label: "Camera & Lens", value: spec.camera_and_optics },
      { category: "materials_texture", label: "Colors & Materials", value: spec.color_and_materials },
      { category: "archetype", label: "Archetype", value: spec.archetype.replace(/_/g, " ") },
    ];

    if (spec.brand_tokens.brand_name) {
      tokens.push({
        category: "brand_token",
        label: "Brand DNA",
        value: `${spec.brand_tokens.brand_name}${spec.brand_tokens.primary_color ? ` (${spec.brand_tokens.primary_color})` : ""}`,
      });
    }

    if (spec.negative_constraints && spec.negative_constraints.length > 0) {
      tokens.push({
        category: "negative_exclusion",
        label: "Anti-Cliché Blocklist",
        value: spec.negative_constraints.slice(0, 4).join(", "),
      });
    }

    return tokens;
  }
}
