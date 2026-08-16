import { generateObject } from "ai";
import { CreativeBriefSchema, CreativeBrief, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";

export class CreativeDirectorAgent {
  /**
   * Generates two genuinely distinct A/B creative concepts with image generation prompts and captions.
   * Uses Reasoning Model (Groq Llama 3.3 70B primary, Gemini Flash fallback) for superior creative depth.
   */
  static async developCreativeBrief(
    intent: UserIntent,
    research: ResearchContext,
    brand: BrandProfile,
    referenceAnalysis?: ReferenceImageAnalysis | null
  ): Promise<CreativeBrief> {
    const referencePrompt = referenceAnalysis
      ? `VISUAL REFERENCE ATTACHED BY USER:
- Style: ${referenceAnalysis.photography_style}
- Mood: ${referenceAnalysis.mood}
- Color Palette: ${referenceAnalysis.color_palette.join(", ")}
- Composition: ${referenceAnalysis.composition}
- Subject: ${referenceAnalysis.visual_subject}
- Key Elements: ${referenceAnalysis.key_elements.join(", ")}

CRITICAL MANDATE: You MUST mirror and incorporate the reference image's visual style (${referenceAnalysis.photography_style}), mood (${referenceAnalysis.mood}), and color palette directly into the "image_prompt" fields for BOTH Concept A and Concept B!`
      : "No reference image attached by user.";

    const systemPrompt = `You are Sapphire's Autonomous AI Creative Director.
Your task is to build a structured Creative Brief containing TWO distinct A/B concepts for ${brand.name} (${brand.industry}) based on the user's specific request: "${intent.event}".

${referencePrompt}

RULES:
1. Concept A must focus on "Emotional Storytelling & Authentic Human Experience".
2. Concept B must focus on "Premium Editorial Positioning & High Visual Impact".
3. Provide a highly specific "image_prompt" for each concept. The image prompt MUST explicitly describe:
   - The user's requested subject/destination: "${intent.event}".
   - Visual style (e.g. ${referenceAnalysis ? referenceAnalysis.photography_style : "cinematic editorial photography"}).
   - Atmosphere, scenery, lighting, and color palette.
   - Zero text overlay, zero logos.
4. Captions for Instagram must include a compelling hook, story body, CTA, and relevant hashtags.
5. Captions for LinkedIn must maintain a professional, insightful tone.`;

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
        const topic = intent.event.replace(/^(make a post for|create a post for|promote|a post about)/gi, "").trim() || "Travel Expedition";
        const hashtagTopic = topic.replace(/[^\w]/g, "");

        const refStyle = referenceAnalysis ? referenceAnalysis.photography_style : "Cinematic editorial travel photography";
        const refMood = referenceAnalysis ? referenceAnalysis.mood : "Warm and aspirational";
        const refPalette = referenceAnalysis && referenceAnalysis.color_palette.length ? referenceAnalysis.color_palette : ["#D97757", "#FAF9F5", "#141413"];

        return {
          campaign_title: `${topic} Campaign — ${brand.name}`,
          concept_a: {
            label: `Concept A — Emotional ${topic} Journey`,
            creative_direction: `Focuses on genuine human connection, shared family moments, and immersive atmosphere in ${topic}. Mood: ${refMood}.`,
            visual_style: `${refStyle} with ${refMood} atmosphere`,
            composition: `Candid perspective of family and travelers enjoying authentic moments in ${topic}, Rule of Thirds depth of field.`,
            lighting: "Soft ambient golden hour glow, natural warmth.",
            color_palette: refPalette,
            image_prompt: `${refStyle}, ${topic}, family enjoying vacation in ${topic}, ${refMood} lighting, scenic landscape background, highly detailed, 8k`,
            caption_instagram: `Every journey tells a story. Discover the magical beauty and timeless culture of ${topic} with ${brand.name}. Unforgettable family moments await. ✨ #Travel${hashtagTopic} #${hashtagTopic} #VagabondTravel #FamilyVacation`,
            caption_linkedin: `Experiential travel creates lasting perspective. ${brand.name} is proud to present curated luxury family expeditions to ${topic}. Where will your next journey take you?`,
          },
          concept_b: {
            label: `Concept B — Editorial ${topic} Showcase`,
            creative_direction: `High-fashion architectural and landscape composition showcasing the iconic aesthetic of ${topic}. Style: ${refStyle}.`,
            visual_style: `${refStyle} layout with high-contrast editorial composition`,
            composition: `Sweeping panoramic perspective of landmark architecture and serene landscapes in ${topic}.`,
            lighting: "Diffused morning sunlight with crisp micro-contrast.",
            color_palette: refPalette,
            image_prompt: `${refStyle}, ${topic}, breathtaking scenery and landmark architecture of ${topic}, morning light, Vogue travel style, photorealistic 8k`,
            caption_instagram: `A tapestry of landscapes, culture, and endless horizons. Celebrate ${topic} with our hand-crafted travel itineraries. 📍 #${hashtagTopic} #EditorialTravel #VagabondExpeditions`,
            caption_linkedin: `Elevating experiential travel through world-class destination curation. ${brand.name} presents our exclusive campaign collection for ${topic}.`,
          },
        };
      }
    }
  }
}
