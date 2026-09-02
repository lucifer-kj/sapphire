import { PromptSpecification } from "../domain/prompt-spec";
import { SupportedModelFamily } from "../domain/model-strategy";
import { FormattedModelOutput, PromptSyntaxToken } from "../domain/prompt-result";

export interface FormattedPromptBundle {
  primary: FormattedModelOutput;
  allModelFormats: Record<SupportedModelFamily, FormattedModelOutput>;
  syntaxTokens: PromptSyntaxToken[];
  posterPrompt: string;
  photographicPrompt: string;
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

    const primary = allModelFormats[spec.target_model] || allModelFormats.ideogram_v2;
    const syntaxTokens = this.extractSyntaxTokens(spec);
    const posterPrompt = this.buildUniversalPosterPrompt(spec);
    const photographicPrompt = this.buildUniversalPhotographicPrompt(spec);

    return {
      primary,
      allModelFormats,
      syntaxTokens,
      posterPrompt,
      photographicPrompt,
    };
  }

  /**
   * Single-model formatter.
   */
  static formatPrompt(spec: PromptSpecification): FormattedModelOutput {
    const bundle = this.formatPromptBundle(spec);
    return bundle.primary;
  }

  // --------------------------------------------------------------------------
  // Universal Post Modes
  // --------------------------------------------------------------------------

  public static buildUniversalPosterPrompt(spec: PromptSpecification): string {
    const {
      subject,
      environment,
      lighting,
      camera_and_optics,
      color_and_materials,
      typography_layout,
      brand_tokens,
      aspect_ratio,
    } = spec;

    const isTopZone = typography_layout.text_placement_zone === "top_third";
    const spatialGuide = isTopZone
      ? `Spatial Hierarchy: The upper 38% of the vertical frame is composed as pristine, calm negative space with zero visual clutter, specifically reserved for typography. The hero subject is anchored strictly in the lower two-thirds.`
      : `Spatial Hierarchy: The hero subject is positioned in the upper two-thirds. The lower 38% of the frame is composed as pristine, calm negative space reserved for typography.`;

    const parts = [
      `A high-end editorial social media poster design in ${aspect_ratio} ratio for "${brand_tokens.brand_name || "Brand"}"`,
      spatialGuide,
      `Hero Subject: ${subject} situated in ${environment}`,
      `Lighting Architecture: ${lighting}`,
      `Cinematography: ${camera_and_optics}, ${color_and_materials}`,
      `Typography & Safe-Zone Layout (Rendered strictly in the ${isTopZone ? "upper 38%" : "lower 38%"} clean zone):`,
      typography_layout.kicker_badge ? `- Eyebrow Pill Badge: "${typography_layout.kicker_badge}" in small elegant uppercase lettering` : "",
      `- Main Bold Headline: "${typography_layout.headline}" displayed prominently in ${typography_layout.font_pairing_recommendation}`,
      typography_layout.subheadline ? `- Subheadline: "${typography_layout.subheadline}" in clean complementary typography` : "",
      `- Footer Margin CTA: "${typography_layout.cta_text}" with brand watermark "${typography_layout.brand_watermark}" at the bottom perimeter`,
      `Quality: crisp high-contrast graphic layout, award-winning social poster art, 8k resolution, zero plastic CGI sheen`,
    ].filter(Boolean);

    return parts.join(". ");
  }

  public static buildUniversalPhotographicPrompt(spec: PromptSpecification): string {
    const {
      subject,
      environment,
      lighting,
      camera_and_optics,
      color_and_materials,
      typography_layout,
      negative_constraints,
    } = spec;

    const isTopZone = typography_layout.text_placement_zone === "top_third";
    const negativeSpaceRule = isTopZone
      ? `Spatial Framing: Camera frames looking level or down with the upper 40% composed as clean, moody negative space (soft shadowed architectural wall or dark atmosphere) strictly free of subject clutter. Hero subject is anchored in the lower 60%.`
      : `Spatial Framing: Hero subject is framed in the upper 60%, with the lower 40% composed as calm, uncluttered negative space.`;

    const parts = [
      `A masterwork commercial editorial photograph: ${subject}`,
      `Environment & Setting: ${environment}`,
      negativeSpaceRule,
      `Lighting Architecture: ${lighting}`,
      `Cinematography & Optics: ${camera_and_optics}`,
      `Textures & Color Grade: ${color_and_materials}`,
      `Photographic Quality: natural authentic textures, micro-contrast, organic film grain, 8k resolution, zero plastic CGI sheen`,
    ];

    return parts.join(". ");
  }

  // --------------------------------------------------------------------------
  // Model-Specific Formatters
  // --------------------------------------------------------------------------

  private static formatForIdeogram(spec: PromptSpecification): FormattedModelOutput {
    const {
      subject,
      environment,
      lighting,
      camera_and_optics,
      color_and_materials,
      typography_layout,
      brand_tokens,
      aspect_ratio,
      negative_constraints,
    } = spec;

    const isTopZone = typography_layout.text_placement_zone === "top_third";
    const posterPrompt = [
      `Commercial editorial social media poster design in ${aspect_ratio} ratio`,
      `Spatial Framing: ${isTopZone ? "Upper 38% is clean dark negative space for typography; hero subject is anchored strictly in lower two-thirds" : "Lower 38% is clean negative space for typography; hero subject in upper two-thirds"}`,
      `Hero Subject: ${subject} in ${environment}`,
      `Lighting & Mood: ${lighting}, ${color_and_materials}`,
      `Cinematography: ${camera_and_optics}`,
      `In-Image Typography Layout (strictly in the ${isTopZone ? "top third" : "bottom third"} clean zone):`,
      typography_layout.kicker_badge ? `Eyebrow text badge reads "${typography_layout.kicker_badge}"` : "",
      `Main bold headline text reads "${typography_layout.headline}" in elegant ${typography_layout.font_pairing_recommendation}`,
      typography_layout.subheadline ? `Subheadline text reads "${typography_layout.subheadline}"` : "",
      `Bottom margin footer reads "${typography_layout.cta_text} | ${typography_layout.brand_watermark}"`,
      `Layout: 8% perimeter safe zone margins, perfect sharp typography, balanced graphic composition, zero text-subject overlap`,
    ].filter(Boolean).join(". ");

    return {
      finalPrompt: posterPrompt,
      negativePrompt: negative_constraints.length > 0 ? negative_constraints.join(", ") : undefined,
      copyablePrompt: posterPrompt,
      posterPrompt,
      photographicPrompt: this.buildUniversalPhotographicPrompt(spec),
    };
  }


  private static formatForMidjourney(spec: PromptSpecification): FormattedModelOutput {
    const {
      subject,
      environment,
      lighting,
      camera_and_optics,
      color_and_materials,
      typography_layout,
      negative_constraints,
      aspect_ratio,
    } = spec;

    const arFlag = aspect_ratio === "4:5" ? "--ar 4:5" : aspect_ratio === "1:1" ? "--ar 1:1" : `--ar ${aspect_ratio}`;
    
    // Poster with typography version
    const posterParts = [
      `commercial editorial magazine poster layout`,
      `"${typography_layout.headline}" typography in top third`,
      subject,
      environment,
      lighting,
      camera_and_optics,
      color_and_materials,
      `footer text "${typography_layout.brand_watermark}"`,
      `award-winning layout, balanced typography, authentic grain`,
      `${arFlag} --style raw --v 6.1 --s 250`,
    ].filter(Boolean);

    let posterPrompt = posterParts.join(", ");
    if (negative_constraints.length > 0) {
      posterPrompt += ` --no ${negative_constraints.join(", ")}`;
    }

    const photoPrompt = `${this.buildUniversalPhotographicPrompt(spec)}, ${arFlag} --style raw --v 6.1 --s 250`;

    return {
      finalPrompt: posterPrompt,
      negativePrompt: negative_constraints.length > 0 ? negative_constraints.join(", ") : undefined,
      copyablePrompt: posterPrompt,
      posterPrompt,
      photographicPrompt: photoPrompt,
    };
  }

  private static formatForFluxDev(spec: PromptSpecification): FormattedModelOutput {
    const {
      subject,
      environment,
      lighting,
      camera_and_optics,
      color_and_materials,
      typography_layout,
      negative_constraints,
      brand_tokens,
    } = spec;

    const photoPrompt = this.buildUniversalPhotographicPrompt(spec);
    const posterPrompt = this.buildUniversalPosterPrompt(spec);

    return {
      finalPrompt: photoPrompt,
      negativePrompt: negative_constraints.length > 0 ? negative_constraints.join(", ") : undefined,
      copyablePrompt: photoPrompt,
      posterPrompt,
      photographicPrompt: photoPrompt,
    };
  }

  private static formatForFluxSchnell(spec: PromptSpecification): FormattedModelOutput {
    const { subject, environment, lighting, camera_and_optics, color_and_materials, negative_constraints } = spec;

    const photoPrompt = [
      `High-end commercial photograph of ${subject}`,
      `in ${environment}`,
      `illuminated by ${lighting}`,
      `${camera_and_optics}`,
      `${color_and_materials}`,
      `hyper-detailed tactile textures, authentic editorial quality`,
    ].join(", ");

    return {
      finalPrompt: photoPrompt,
      negativePrompt: negative_constraints.length > 0 ? negative_constraints.join(", ") : undefined,
      copyablePrompt: photoPrompt,
      posterPrompt: this.buildUniversalPosterPrompt(spec),
      photographicPrompt: photoPrompt,
    };
  }

  private static formatForDalle3(spec: PromptSpecification): FormattedModelOutput {
    const { subject, environment, lighting, camera_and_optics, color_and_materials, typography_layout, aspect_ratio } = spec;

    const posterPrompt = `A commercial editorial social media poster design in ${aspect_ratio} aspect ratio. The scene depicts ${subject} in ${environment}, captured with ${camera_and_optics} under ${lighting}. Across the top of the poster, the headline "${typography_layout.headline}" is clearly rendered in bold, sophisticated editorial typography. At the bottom, clean subtitle text reads "${typography_layout.subheadline || typography_layout.cta_text}" with brand signature "${typography_layout.brand_watermark}". The color palette highlights ${color_and_materials}. High aesthetic quality, sharp text rendering, zero plastic CGI artifacts.`;

    return {
      finalPrompt: posterPrompt,
      copyablePrompt: posterPrompt,
      posterPrompt,
      photographicPrompt: this.buildUniversalPhotographicPrompt(spec),
    };
  }

  private static formatForSDXL(spec: PromptSpecification): FormattedModelOutput {
    const { subject, environment, lighting, camera_and_optics, color_and_materials, negative_constraints } = spec;

    const photoPrompt = `${subject}, ${environment}, ${lighting}, ${camera_and_optics}, ${color_and_materials}, 8k uhd, dslr, high quality, authentic film grain, photorealistic`;
    const defaultSDXLNegatives = "bad quality, blurry, 3d render, plastic skin, distorted anatomy, oversaturated, watermark, signature";
    const negativePrompt = negative_constraints.length > 0
      ? `${negative_constraints.join(", ")}, ${defaultSDXLNegatives}`
      : defaultSDXLNegatives;

    return {
      finalPrompt: photoPrompt,
      negativePrompt,
      copyablePrompt: `${photoPrompt}\n\nNegative Prompt:\n${negativePrompt}`,
      posterPrompt: this.buildUniversalPosterPrompt(spec),
      photographicPrompt: photoPrompt,
    };
  }

  private static extractSyntaxTokens(spec: PromptSpecification): PromptSyntaxToken[] {
    const tokens: PromptSyntaxToken[] = [
      { category: "typography_headline", label: "Headline Text", value: `"${spec.typography_layout.headline}"` },
    ];

    if (spec.typography_layout.kicker_badge) {
      tokens.push({
        category: "typography_headline",
        label: "Kicker Badge",
        value: `[${spec.typography_layout.kicker_badge}]`,
      });
    }

    if (spec.typography_layout.cta_text) {
      tokens.push({
        category: "typography_cta",
        label: "Call to Action",
        value: spec.typography_layout.cta_text,
      });
    }

    tokens.push(
      { category: "subject", label: "Subject", value: spec.subject },
      { category: "environment", label: "Environment", value: spec.environment },
      { category: "lighting", label: "Lighting & Mood", value: spec.lighting },
      { category: "camera_optics", label: "Camera & Lens", value: spec.camera_and_optics },
      { category: "materials_texture", label: "Colors & Materials", value: spec.color_and_materials },
      { category: "archetype", label: "Archetype", value: spec.archetype.replace(/_/g, " ") }
    );

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
