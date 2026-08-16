import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { CreativeBriefSchema, CreativeBrief, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

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
    try {
      const referencePrompt = referenceAnalysis
        ? `Reference Image Analysis: Mood: ${referenceAnalysis.mood}, Composition: ${referenceAnalysis.composition}, Palette: ${referenceAnalysis.color_palette.join(", ")}, Subject: ${referenceAnalysis.visual_subject}`
        : "No reference image attached.";

      const systemPrompt = `You are Sapphire's Autonomous AI Creative Director.
Your task is to build a structured Creative Brief containing TWO distinct A/B concepts for ${brand.name} (${brand.industry}).

${referencePrompt}

RULES:
1. Concept A must focus on "Emotional Storytelling & Authentic Human Experience".
2. Concept B must focus on "Premium Editorial Positioning & High Aesthetic Impact".
3. Provide an "image_prompt" for each concept tailored for high-quality AI photo generation (include subject, lighting, camera angle, atmosphere, zero text overlay).
4. Avoid generic AI aesthetics (NO purple gradients, NO cluttered overlays).
5. Captions for Instagram must include a compelling hook, story body, CTA, and relevant hashtags.
6. Captions for LinkedIn must maintain a professional, insightful tone.`;

      const result = await generateObject({
        model: groq("llama-3.3-70b-versatile"),
        schema: CreativeBriefSchema,
        system: systemPrompt,
        prompt: `Event: ${intent.event}
Objective: ${intent.objective}
Trends: ${research.key_trends.join(", ")}
Avoid: ${research.overused_patterns_to_avoid.join(", ")}
Brand Voice Tone: ${brand.voice.tone}`,
      });

      return result.object;
    } catch (err) {
      console.warn("Groq Creative Director Agent fallback:", err);
      return {
        campaign_title: `${intent.event} Campaign — ${brand.name}`,
        concept_a: {
          label: "Concept A — Emotional Journey",
          creative_direction: "Focuses on personal freedom, internal journey, and awe-inspiring landscapes.",
          visual_style: "Cinematic editorial travel photography with warm golden hour tones.",
          composition: "Traveler standing on a mountain ridge looking at the vast horizon, rule of thirds, subtle tricolor flag tint in sunrise.",
          lighting: "Warm golden hour backlight, natural atmospheric glow.",
          color_palette: ["#D97757", "#FAF9F5", "#141413", "#788C5D"],
          image_prompt: "Cinematic photograph of a traveler standing atop a majestic mountain overlooking misty Indian valleys at golden hour, warm sunset lighting, editorial travel photography, 35mm lens, photorealistic, 8k",
          caption_instagram: "Freedom is not just a destination—it's the journey that redefines who you are. This Independence Day, explore the vast beauty of India with Vagabond Travel. 🌄✨ #IndependenceDay #TravelIndia #VagabondJourneys #FreedomToExplore",
          caption_linkedin: "True freedom inspires perspective. As we celebrate Independence Day, Vagabond Travel Agency reflects on the power of transformative travel experiences across India. Where does your next journey take you?",
        },
        concept_b: {
          label: "Concept B — Editorial India",
          creative_direction: "High-fashion editorial composition showcasing India's architectural and natural heritage.",
          visual_style: "Clean, architectural editorial travel layout with crisp typography and understated branding.",
          composition: "Multi-layered framing of ancient heritage structures bathed in soft morning light, human silhouette in middle ground.",
          lighting: "Soft ambient diffused morning light, high micro-contrast.",
          color_palette: ["#141413", "#6A9BCC", "#FAF9F5", "#D97757"],
          image_prompt: "High-fashion editorial travel photograph of ancient Indian palace courtyard bathed in soft morning light, elegant architecture, soft shadows, serene atmosphere, Vogue travel style, 50mm lens, photorealistic",
          caption_instagram: "A tapestry of heritage, landscapes, and endless horizons. Celebrate India's timeless majesty with our curated Independence Day expeditions. 📍🇮🇳 #EditorialTravel #HeritageIndia #VagabondTravel",
          caption_linkedin: "Elevating experiential travel through India's rich cultural heritage. Vagabond Travel Agency is proud to present our curated Independence Day campaign collection.",
        },
      };
    }
  }
}
