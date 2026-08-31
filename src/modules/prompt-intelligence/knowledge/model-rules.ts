import { ModelCapability, SupportedModelFamily } from "../domain/model-strategy";

export const MODEL_REGISTRY: Record<SupportedModelFamily, ModelCapability> = {
  flux_1_schnell: {
    modelId: "flux_1_schnell",
    displayName: "FLUX.1 [schnell]",
    provider: "Black Forest Labs / Cloudflare",
    strengths: [
      "Sub-2s inference latency",
      "Excellent photorealism and natural human anatomy",
      "High prompt adherence to natural descriptive prose",
      "Superior tactile materials and lighting textures",
    ],
    weaknesses: [
      "No embedded text typography layout",
      "Requires explicit negative instruction in main prompt",
    ],
    recommendedFor: [
      "Fast social content generation",
      "Editorial magazine backgrounds",
      "High-contrast lifestyle and travel photography",
      "Conceptual metaphor scenes",
    ],
    aspectRatioSupport: ["1:1", "4:5", "16:9", "9:16"],
    negativePromptSupport: false,
    referenceImageSupport: false,
    typographyCapability: "low",
    promptSyntaxGuide:
      "Use descriptive, sensory-rich prose. Specify exact lighting, camera lens (e.g. 85mm f/1.4), film stock/sensor characteristics, and spatial depth. Avoid tag salads.",
  },
  flux_1_dev: {
    modelId: "flux_1_dev",
    displayName: "FLUX.1 [dev]",
    provider: "Black Forest Labs",
    strengths: [
      "Highest visual fidelity and micro-contrast",
      "Flawless handling of complex spatial arrangements",
      "Nuanced skin tones, fabric textures, and architectural lines",
    ],
    weaknesses: [
      "Higher inference time (4-8s)",
      "Requires high GPU memory",
    ],
    recommendedFor: [
      "Hero brand campaigns",
      "Studio product commercial photography",
      "Luxury editorial spreads",
    ],
    aspectRatioSupport: ["1:1", "4:5", "16:9", "9:16", "3:2", "2:3"],
    negativePromptSupport: false,
    referenceImageSupport: true,
    typographyCapability: "medium",
    promptSyntaxGuide:
      "Natural language with precise architectural and lighting vocabulary. Emphasize mood, depth of field, and tactile surface finishes.",
  },
  midjourney_v6: {
    modelId: "midjourney_v6",
    displayName: "Midjourney v6.1",
    provider: "Midjourney",
    strengths: [
      "Exceptional cinematic artistic flair and color grading",
      "Incredible aesthetic coherence and stylistic range",
      "Strong support for parameter flags (--ar, --style, --s, --no)",
    ],
    weaknesses: [
      "Requires specific parameter syntax",
      "Can over-stylize realistic subjects into fantasy without strict constraints",
    ],
    recommendedFor: [
      "Cinematic storytelling posts",
      "Vintage posters and retro editorial",
      "High-concept brand imagery with dramatic color palettes",
    ],
    aspectRatioSupport: ["--ar 4:5", "--ar 1:1", "--ar 16:9", "--ar 9:16"],
    negativePromptSupport: true,
    referenceImageSupport: true,
    typographyCapability: "medium",
    promptSyntaxGuide:
      "Structured sentence prompt + stylistic details + Midjourney parameters (`--ar 4:5 --style raw --v 6.1 --s 250`).",
  },
  ideogram_v2: {
    modelId: "ideogram_v2",
    displayName: "Ideogram v2",
    provider: "Ideogram",
    strengths: [
      "World-class typography and in-image text layout",
      "Clean graphic design and poster compilation",
      "Strong layout archetype compliance",
    ],
    weaknesses: [
      "Slightly lower photorealism on organic human portraits compared to FLUX dev",
    ],
    recommendedFor: [
      "Graphic posters with integrated typography hooks",
      "Comparison splits and infographic frames",
      "SaaS metric callout cards and badge layouts",
    ],
    aspectRatioSupport: ["4:5", "1:1", "16:9", "9:16"],
    negativePromptSupport: true,
    referenceImageSupport: true,
    typographyCapability: "high",
    promptSyntaxGuide:
      'Put exact in-image text in quotes (e.g. A vintage travel poster with bold typography text "EXPLORE THE UNKNOWN" at top). Specify font styles and colors explicitly.',
  },
  dalle_3: {
    modelId: "dalle_3",
    displayName: "DALL-E 3",
    provider: "OpenAI",
    strengths: [
      "Exceptional semantic comprehension of complex multi-part logic",
      "Handles surreal and diagrammatic metaphors cleanly",
    ],
    weaknesses: [
      "Tendency toward smooth plastic textures if not constrained",
      "Fixed aspect ratios (1024x1024, 1024x1792)",
    ],
    recommendedFor: [
      "Conceptual thought leadership metaphors",
      "Abstract architectural and business model illustrations",
    ],
    aspectRatioSupport: ["1:1", "1024x1792"],
    negativePromptSupport: false,
    referenceImageSupport: false,
    typographyCapability: "medium",
    promptSyntaxGuide:
      "Detailed descriptive paragraph. Explicitly mandate 'candid authentic commercial photography, natural grain, no 3D render feel'.",
  },
  stable_diffusion_xl: {
    modelId: "stable_diffusion_xl",
    displayName: "SDXL Turbo / Refiner",
    provider: "Stability AI",
    strengths: [
      "Extensive negative prompt customization",
      "ControlNet and LoRA ecosystem flexibility",
    ],
    weaknesses: [
      "Prone to artifacts without carefully tuned negative prompts",
    ],
    recommendedFor: [
      "Custom LoRA style pipelines",
      "High-throughput localized generation",
    ],
    aspectRatioSupport: ["1024x1024", "896x1152"],
    negativePromptSupport: true,
    referenceImageSupport: true,
    typographyCapability: "low",
    promptSyntaxGuide:
      "Weight-based prompt keywords with explicit separated negative prompt block.",
  },
};
