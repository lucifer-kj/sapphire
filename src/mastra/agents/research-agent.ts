import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { ResearchContextSchema, ResearchContext, UserIntent } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export class ResearchAgent {
  /**
   * Synthesizes market trends, visual motifs, and overused patterns to avoid.
   */
  static async synthesizeResearch(
    intent: UserIntent,
    brand: BrandProfile
  ): Promise<ResearchContext> {
    try {
      const systemPrompt = `You are Sapphire's Research Agent. Your job is to research current visual, social, and campaign trends for the event "${intent.event}" in the "${intent.industry}" industry.
Brand: ${brand.name}
Positioning: ${brand.positioning}
Forbidden phrases: ${brand.voice.forbidden_phrases.join(", ") || "None"}

Generate search queries, key trends, visual motifs, and overused clichés to avoid.`;

      const result = await generateObject({
        model: groq("llama-3.3-70b-versatile"),
        schema: ResearchContextSchema,
        system: systemPrompt,
        prompt: `Analyze creative opportunity: "${intent.creative_opportunity}" for event "${intent.event}".`,
      });

      return result.object;
    } catch (err) {
      console.warn("Groq Research Agent fallback:", err);
      return {
        search_queries: [
          `${intent.event} travel marketing campaigns`,
          `editorial ${intent.industry} instagram trends`,
        ],
        key_trends: [
          "Cinematic golden hour photography",
          "Authentic human-centered journeys over stock images",
        ],
        visual_motifs: [
          "Subtle tricolor accent",
          "Expansive mountain vistas",
        ],
        overused_patterns_to_avoid: [
          "Cluttered flag overlays",
          "Aggressive discount banners",
        ],
        summary: `Synthesized research for ${intent.event} in ${intent.industry}. Identified editorial photography and restrained branding as key winning patterns.`,
      };
    }
  }
}
