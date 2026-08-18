import { generateObject } from "ai";
import { CreativeBriefSchema, CreativeBrief, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";
import {
  DEFAULT_ARCHETYPE_CONFIGS,
  DesignArchetype,
  DESIGN_KNOWLEDGE_GRAPH,
} from "@/lib/design-system/archetypes";

export class CreativeDirectorAgent {
  /**
   * Generates two genuinely distinct A/B creative concepts with complete Canva-quality
   * Design Blueprints (typography, copy, layout archetypes, and negative space conditioning).
   * Programmatically assigns two DIFFERENT archetypes to guarantee structural diversity.
   */
  static async developCreativeBrief(
    intent: UserIntent,
    research: ResearchContext,
    brand: BrandProfile,
    referenceAnalysis?: ReferenceImageAnalysis | null
  ): Promise<CreativeBrief> {
    const allArchetypes: DesignArchetype[] = [
      "polaroid_pov_overlay",
      "feature_badges_editorial",
      "editorial_magazine",
      "conceptual_split",
      "comparison_split",
      "vintage_poster",
      "saas_dotgrid",
      "minimal_shader_text",
    ];

    // 1. Determine Archetype A based on reference image or brand affinity
    const detectedArchetype = referenceAnalysis?.detected_archetype;
    const affinities = brand.learned_preferences?.archetype_affinity || {};

    let archA: DesignArchetype = detectedArchetype || "polaroid_pov_overlay";
    if (!detectedArchetype && Object.keys(affinities).length > 0) {
      const sorted = [...allArchetypes].sort(
        (a, b) => (affinities[b] ?? 0.5) - (affinities[a] ?? 0.5)
      );
      archA = sorted[0];
    }

    // 2. Programmatically select a contrasting Archetype B
    const remaining = allArchetypes.filter((a) => a !== archA);
    const archB: DesignArchetype =
      archA === "polaroid_pov_overlay"
        ? "feature_badges_editorial"
        : archA === "editorial_magazine"
        ? "conceptual_split"
        : remaining[0];


    const refPalette = referenceAnalysis?.color_palette?.length
      ? referenceAnalysis.color_palette
      : [brand.voice.tone, "#D97757", "#FAF9F5", "#141413"];

    const pairingA = DESIGN_KNOWLEDGE_GRAPH.typography_pairings[archA];
    const pairingB = DESIGN_KNOWLEDGE_GRAPH.typography_pairings[archB];
    const spatialA = DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting[archA];
    const spatialB = DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting[archB];

    const referencePrompt = referenceAnalysis
      ? `VISUAL REFERENCE ATTACHED BY USER:
- Detected Design Archetype: ${detectedArchetype}
- Photography Style: ${referenceAnalysis.photography_style}
- Mood: ${referenceAnalysis.mood}
- Color Palette: ${refPalette.join(", ")}
- Composition: ${referenceAnalysis.composition}
- Negative Space Zone: ${referenceAnalysis.negative_space_zone || "Upper 40% open area"}`
      : "No reference image attached.";

    const systemPrompt = `You are Sapphire's Elite AI Creative Director & Art Director.
Your task is to build a comprehensive Creative Brief containing TWO structurally distinct A/B concepts for ${brand.name} (${brand.industry}) based on the user's request: "${intent.event}".

BRAND LEARNED TASTE VECTORS:
- Preferred Typography Density: ${brand.learned_preferences?.typography_density_preference || "balanced"}
- Preferred Visual Temperature: ${brand.learned_preferences?.visual_temperature_preference || "warm_golden"}
- Top Archetype Affinities: ${JSON.stringify(affinities)}

PROGRAMMATIC ARCHETYPE ASSIGNMENT:
- Concept A MUST use Archetype: "${archA}" (${pairingA.style})
  - Recommended Hook Font: "${pairingA.hookFont}", Body Font: "${pairingA.bodyFont}"
  - Spatial Negative Space Requirement: "${spatialA.cameraDirective}"
- Concept B MUST use Archetype: "${archB}" (${pairingB.style})
  - Recommended Hook Font: "${pairingB.hookFont}", Body Font: "${pairingB.bodyFont}"
  - Spatial Negative Space Requirement: "${spatialB.cameraDirective}"

CRITICAL RULES FOR CANVA-QUALITY POST DESIGN:
1. For each concept, you MUST populate the "design_blueprint" object:
   - "archetype": Strictly use the assigned archetype ("${archA}" for Concept A, "${archB}" for Concept B).
   - "headline": Ultra-punchy 2-5 word hook (e.g. "Tasty Morning Joy", "Building A Brand Without Strategy?", "Fresh Daily Choice"). Max 60 chars.
   - "subheadline": 1-2 sentence supporting value proposition or descriptive nuance. Max 180 chars.
   - "category_pill": Uppercase tag (e.g. "SPECIAL EDITION", "MARKETING STRATEGY", "ORGANIC HARVEST"). Max 30 chars.
   - "brand_tagline": Short memorable slogan (e.g. "Brewed for you . served on ice."). Max 60 chars.
   - "value_props": 3 quick bullet items (e.g. ["Step in.", "Sip slow.", "Stay awhile."]).
   - "cta_text": Action button text (e.g. "Order Online ➔", "Swipe Left ➔", "Explore Itineraries ➔"). Max 30 chars.
   - "social_handle": Brand handle (e.g. "@${brand.name.toLowerCase().replace(/\s+/g, "")}").
   - "font_family_hook": Use "${pairingA.hookFont}" for Concept A, "${pairingB.hookFont}" for Concept B.
   - "font_family_body": Use "${pairingA.bodyFont}" for Concept A, "${pairingB.bodyFont}" for Concept B.
   - "highlighted_keywords": 1-2 important words from the headline to highlight in brand accent color.
   - "feature_badges": If archetype is "polaroid_pov_overlay" or "feature_badges_editorial", provide 3 concise badges (e.g. [{ label: "Flights", icon: "flight" }, { label: "Hotels", icon: "hotel" }, { label: "Experiences", icon: "experience" }]).
   - "logo_badge": If archetype has a top logo lockup, provide { prefix: "make", highlight: "my", suffix: "trip" } or appropriate brand segments.
   - "negative_space_directive": Explicit spatial instruction matching the assigned archetype.
2. The "image_prompt" MUST describe the photographic/visual scene, explicitly instructing the AI model to respect the negative space.
3. Captions for Instagram and LinkedIn must be polished and platform-tailored.


${referencePrompt}`;

    const promptText = `Event/Request: ${intent.event}
Objective: ${intent.objective}
Key Trends: ${research.key_trends.join(", ")}
Avoid: ${research.overused_patterns_to_avoid.join(", ")}
Brand Voice Tone: ${brand.voice.tone}`;

    try {
      const result = await generateObject({
        model: getReasoningModel(),
        schema: CreativeBriefSchema,
        system: systemPrompt,
        prompt: promptText,
      });
      return result.object;
    } catch (err) {
      try {
        const result = await generateObject({
          model: getReasoningFallbackModel(),
          schema: CreativeBriefSchema,
          system: systemPrompt,
          prompt: promptText,
        });
        return result.object;
      } catch (err2) {
        const topic =
          intent.event
            .replace(/^(make a post for|create a post for|promote|a post about)/gi, "")
            .trim() || "Signature Expedition";
        const hashtagTopic = topic.replace(/[^\w]/g, "");

        return {
          campaign_title: `${topic} Campaign — ${brand.name}`,
          concept_a: {
            label: `Concept A — ${DEFAULT_ARCHETYPE_CONFIGS[archA].name}`,
            creative_direction: `High-end editorial composition focusing on atmosphere, authenticity, and visual depth for ${topic}.`,
            visual_style: `Editorial photography with warm ambient lighting and crisp negative space`,
            composition: spatialA.cameraDirective,
            lighting: "Soft directional golden hour side-lighting.",
            color_palette: ["#D97757", "#FAF9F5", "#141413"],
            image_prompt: `Studio commercial photography, vertical 4:5 portrait of ${topic}, warm natural ambient lighting, rich color tones, ${spatialA.cameraDirective}, photorealistic 8k`,
            caption_instagram: `Discover the art of intentional storytelling. Experience ${topic} with ${brand.name}. ✨ #${hashtagTopic} #SapphireCreative`,
            caption_linkedin: `Strategic creative positioning drives meaningful brand connection. Introducing our campaign for ${topic}.`,
            design_blueprint: {
              archetype: archA,
              headline: `${topic} Reimagined`,
              subheadline: `Crafted for those who appreciate pure distinction and effortless elegance.`,
              category_pill: "SPECIAL FEATURE",
              brand_tagline: "Designed for impact . made to last.",
              value_props: ["Crafted in detail.", "Pure ingredients.", "Uncompromising quality."],
              cta_text: "Explore Collection ➔",
              social_handle: `@${brand.name.toLowerCase().replace(/\s+/g, "")}`,
              brand_name: brand.name,
              font_family_hook: pairingA.hookFont,
              font_family_body: pairingA.bodyFont,
              highlighted_keywords: [topic.split(" ")[0] || "Reimagined"],
              font_scale: "regular",
              scrim_intensity: "medium",
              shader_style: "sky_vignette",
              negative_space_directive: spatialA.cameraDirective,
            },
          },
          concept_b: {
            label: `Concept B — ${DEFAULT_ARCHETYPE_CONFIGS[archB].name}`,
            creative_direction: `Bold asymmetric visual metaphor with high-contrast typography and dynamic brand punchline for ${topic}.`,
            visual_style: `Modern asymmetric studio photography with crisp contrast`,
            composition: spatialB.cameraDirective,
            lighting: "Clean high-key studio light with soft fill.",
            color_palette: ["#D97757", "#FAF9F5", "#141413"],
            image_prompt: `High-concept studio photography, vertical 4:5 shot of ${topic}, ${spatialB.cameraDirective}, photorealistic 8k`,
            caption_instagram: `Redefining what is possible. Meet the next evolution of ${topic}. 🚀 #${hashtagTopic} #Innovation`,
            caption_linkedin: `Transforming perspective through world-class execution. Explore ${brand.name}'s latest strategic release for ${topic}.`,
            design_blueprint: {
              archetype: archB,
              headline: `The Power of ${topic}`,
              subheadline: `Why settling for average limits your potential — and how to elevate everything.`,
              category_pill: "STRATEGY & INSIGHTS",
              brand_tagline: "Precision execution . proven results.",
              value_props: ["Step forward.", "Build faster.", "Lead the category."],
              cta_text: "Read Case Study ➔",
              social_handle: `@${brand.name.toLowerCase().replace(/\s+/g, "")}`,
              brand_name: brand.name,
              font_family_hook: pairingB.hookFont,
              font_family_body: pairingB.bodyFont,
              highlighted_keywords: [topic.split(" ")[0] || "Power"],
              font_scale: "regular",
              scrim_intensity: "heavy",
              shader_style: "sky_vignette",
              negative_space_directive: spatialB.cameraDirective,
            },
          },
        };
      }
    }
  }
}
