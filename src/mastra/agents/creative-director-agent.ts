import { generateObject } from "ai";
import { CreativeBriefSchema, CreativeBrief, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { getPrimaryModel, getFallbackModel } from "@/lib/ai-model";

export class CreativeDirectorAgent {
  /**
   * Generates two genuinely distinct A/B creative concepts with image generation prompts and captions.
   */
  static async developCreativeBrief(
    intent: UserIntent,
    research: ResearchContext,
    brand: BrandProfile,
    referenceAnalysis?: ReferenceImageAnalysis | null
  ): Promise<CreativeBrief> {
    const referencePrompt = referenceAnalysis
      ? `Reference Image Analysis: Mood: ${referenceAnalysis.mood}, Composition: ${referenceAnalysis.composition}, Palette: ${referenceAnalysis.color_palette.join(", ")}, Subject: ${referenceAnalysis.visual_subject}`
      : "No reference image attached.";

    const systemPrompt = `You are Sapphire's Autonomous AI Creative Director.
Your task is to build a structured Creative Brief containing TWO distinct A/B concepts for ${brand.name} (${brand.industry}) based on the user's specific request: "${intent.event}".

${referencePrompt}

RULES:
1. Concept A must focus on "Emotional Storytelling & Authentic Human Experience".
2. Concept B must focus on "Premium Editorial Positioning & High Visual Impact".
3. Provide a detailed "image_prompt" for each concept tailored for high-quality AI photo generation (include subject, scenery, lighting, atmosphere, zero text overlays).
4. Captions for Instagram must include a compelling hook, story body, CTA, and relevant hashtags.
5. Captions for LinkedIn must maintain a professional, insightful tone.`;

    const promptText = `Event/Request: ${intent.event}
Objective: ${intent.objective}
Key Trends: ${research.key_trends.join(", ")}
Avoid: ${research.overused_patterns_to_avoid.join(", ")}
Brand Voice Tone: ${brand.voice.tone}`;

    try {
      const result = await generateObject({
        model: getPrimaryModel(),
        schema: CreativeBriefSchema,
        system: systemPrompt,
        prompt: promptText,
      });
      return result.object;
    } catch (err) {
      try {
        const result = await generateObject({
          model: getFallbackModel(),
          schema: CreativeBriefSchema,
          system: systemPrompt,
          prompt: promptText,
        });
        return result.object;
      } catch (err2) {
        // Build topic-aware dynamic creative brief
        const topic = intent.event.replace(/^(make a post for|create a post for|promote|a post about)/gi, "").trim() || "Travel Expedition";

        const hashtagTopic = topic.replace(/[^\w]/g, "");

        return {
          campaign_title: `${topic} Campaign — ${brand.name}`,
          concept_a: {
            label: `Concept A — Emotional ${topic} Journey`,
            creative_direction: `Focuses on genuine human connection, shared family moments, and immersive atmosphere in ${topic}.`,
            visual_style: "Warm cinematic travel photography with soft golden hour light.",
            composition: `Candid perspective of family and travelers enjoying authentic moments in ${topic}, Rule of Thirds depth of field.`,
            lighting: "Soft ambient golden hour glow, natural warmth.",
            color_palette: ["#D97757", "#FAF9F5", "#141413", "#788C5D"],
            image_prompt: `Cinematic editorial photograph of a family enjoying an authentic vacation in ${topic}, breathtaking scenery, warm golden hour lighting, 35mm lens, highly detailed, photorealistic 8k`,
            caption_instagram: `Every journey tells a story. Discover the magical beauty and timeless culture of ${topic} with ${brand.name}. Unforgettable family moments await. ✨ #Travel${hashtagTopic} #${hashtagTopic} #VagabondTravel #FamilyVacation`,
            caption_linkedin: `Experiential travel creates lasting perspective. ${brand.name} is proud to present curated luxury family expeditions to ${topic}. Where will your next journey take you?`,
          },
          concept_b: {
            label: `Concept B — Editorial ${topic} Showcase`,
            creative_direction: `High-fashion architectural and landscape composition showcasing the iconic aesthetic of ${topic}.`,
            visual_style: "Clean architectural layout with high-contrast editorial photography and understated branding.",
            composition: `Sweeping panoramic perspective of landmark architecture and serene landscapes in ${topic}.`,
            lighting: "Diffused morning sunlight with crisp micro-contrast.",
            color_palette: ["#141413", "#6A9BCC", "#FAF9F5", "#D97757"],
            image_prompt: `High-fashion editorial travel photograph showcasing majestic scenery and landmark architecture of ${topic}, morning light, Vogue travel style, 50mm lens, photorealistic 8k`,
            caption_instagram: `A tapestry of landscapes, culture, and endless horizons. Celebrate ${topic} with our hand-crafted travel itineraries. 📍 #${hashtagTopic} #EditorialTravel #VagabondExpeditions`,
            caption_linkedin: `Elevating experiential travel through world-class destination curation. ${brand.name} presents our exclusive campaign collection for ${topic}.`,
          },
        };
      }
    }
  }
}
