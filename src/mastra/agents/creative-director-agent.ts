import { generateObject } from "ai";
import { CreativeBriefSchema, CreativeBrief, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";
import { DEFAULT_ARCHETYPE_CONFIGS, DesignArchetype } from "@/lib/design-system/archetypes";

export class CreativeDirectorAgent {
  /**
   * Generates two genuinely distinct A/B creative concepts with complete Canva-quality
   * Design Blueprints (typography, copy, layout archetypes, and negative space conditioning).
   */
  static async developCreativeBrief(
    intent: UserIntent,
    research: ResearchContext,
    brand: BrandProfile,
    referenceAnalysis?: ReferenceImageAnalysis | null
  ): Promise<CreativeBrief> {
    const detectedArchetype = referenceAnalysis?.detected_archetype || "editorial_magazine";
    const refPalette = referenceAnalysis?.color_palette?.length
      ? referenceAnalysis.color_palette
      : [brand.voice.tone, "#D97757", "#FAF9F5", "#141413"];

    const referencePrompt = referenceAnalysis
      ? `VISUAL REFERENCE ATTACHED BY USER:
- Detected Design Archetype: ${detectedArchetype}
- Photography Style: ${referenceAnalysis.photography_style}
- Mood: ${referenceAnalysis.mood}
- Color Palette: ${refPalette.join(", ")}
- Composition: ${referenceAnalysis.composition}
- Negative Space Zone: ${referenceAnalysis.negative_space_zone || "Upper 40% open area"}`
      : `No reference image attached. Select 2 contrasting design archetypes from:
1. 'editorial_magazine' (Warm depth-of-field, elegant typography, lifestyle/food/hospitality)
2. 'conceptual_split' (Asymmetric 50/50, punchy 2-tone headline highlight, B2B/ideas)
3. 'comparison_split' (Side-by-side Before/After, duality, feature comparison)
4. 'vintage_poster' (Neo-vintage organic, clean cream studio canvas, badge stamps)
5. 'saas_dotgrid' (Modern dot-grid matrix, 3D cards, UI micro-chrome)`;

    const systemPrompt = `You are Sapphire's Elite AI Creative Director & Art Director.
Your task is to build a comprehensive Creative Brief containing TWO distinct A/B concepts for ${brand.name} (${brand.industry}) based on the user's request: "${intent.event}".

${referencePrompt}

CRITICAL RULES FOR CANVA-QUALITY POST DESIGN:
1. For each concept, you MUST populate the "design_blueprint" object:
   - "archetype": Choose the best matching archetype (one of 'editorial_magazine', 'conceptual_split', 'comparison_split', 'vintage_poster', 'saas_dotgrid'). Concept A and B must explore DIFFERENT archetypes.
   - "headline": Ultra-punchy 2-5 word hook (e.g. "Tasty Morning Joy", "Building A Brand Without Strategy?", "Fresh Daily Choice").
   - "subheadline": 1-2 sentence supporting value proposition or descriptive nuance.
   - "category_pill": Uppercase tag (e.g. "SPECIAL EDITION", "MARKETING STRATEGY", "ORGANIC HARVEST").
   - "brand_tagline": Short memorable slogan (e.g. "Brewed for you . served on ice.").
   - "value_props": 3 quick bullet items (e.g. ["Step in.", "Sip slow.", "Stay awhile."]).
   - "cta_text": Action button text (e.g. "Order Online ➔", "Swipe Left ➔", "Explore Itineraries ➔").
   - "social_handle": Brand handle (e.g. "@${brand.name.toLowerCase().replace(/\s+/g, "")}").
   - "negative_space_directive": Explicit spatial instruction to leave room for typography (e.g. "Leave upper 40% clean for headline").
2. The "image_prompt" MUST describe the photographic/visual scene, explicitly instructing the AI model to respect the negative space.
3. Captions for Instagram and LinkedIn must be polished and platform-tailored.`;

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

        const archA: DesignArchetype = detectedArchetype || "editorial_magazine";
        const archB: DesignArchetype =
          archA === "editorial_magazine" ? "conceptual_split" : "editorial_magazine";

        return {
          campaign_title: `${topic} Campaign — ${brand.name}`,
          concept_a: {
            label: `Concept A — Editorial ${topic} Story`,
            creative_direction: `High-end editorial composition focusing on atmosphere, authenticity, and visual depth for ${topic}.`,
            visual_style: `Editorial magazine photography with warm ambient lighting`,
            composition: `Subject framed in lower-center third, leaving upper 40% clean and uncluttered.`,
            lighting: "Soft directional golden hour side-lighting.",
            color_palette: ["#D97757", "#FAF9F5", "#141413"],
            image_prompt: `Studio editorial commercial photography, vertical 4:5 portrait of ${topic}, warm natural ambient lighting, rich color tones, leaving upper 40% clean for typography, 8k resolution`,
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
              negative_space_directive: DEFAULT_ARCHETYPE_CONFIGS[archA].negativeSpaceDirective,
            },
          },
          concept_b: {
            label: `Concept B — Conceptual ${topic} Showcase`,
            creative_direction: `Bold asymmetric visual metaphor with high-contrast typography and dynamic brand punchline for ${topic}.`,
            visual_style: `Modern asymmetric studio photography with crisp contrast`,
            composition: `Visual subject placed on left 50%, right 50% open for text hierarchy.`,
            lighting: "Clean high-key studio light with soft fill.",
            color_palette: ["#D97757", "#FAF9F5", "#141413"],
            image_prompt: `High-concept studio photography, vertical 4:5 shot of ${topic}, subject anchored to the left 50% on clean seamless backdrop, right 50% empty for text, 8k resolution`,
            caption_instagram: `Redefining what is possible. Meet the next evolution of ${topic}. 🚀 #${hashtagTopic} #Innovation`,
            caption_linkedin: `Transforming perspective through world-class execution. Explore ${brand.name}'s latest strategic release for ${topic}.`,
            design_blueprint: {
              archetype: archB,
              headline: `The Power of ${topic}`,
              subheadline: `Why settling for average limits your potential — and how to elevate everything.`,
              category_pill: "STRATEGY & INSIGHTS",
              brand_tagline: "Precision execution . proven results.",
              value_props: ["Step forward.", "Build faster.", "Lead the category."],
              cta_text: "Read Full Case Study ➔",
              social_handle: `@${brand.name.toLowerCase().replace(/\s+/g, "")}`,
              brand_name: brand.name,
              negative_space_directive: DEFAULT_ARCHETYPE_CONFIGS[archB].negativeSpaceDirective,
            },
          },
        };
      }
    }
  }
}
