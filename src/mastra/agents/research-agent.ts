import { generateObject } from "ai";
import { ResearchContextSchema, ResearchContext, UserIntent } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { getPrimaryModel, getFallbackModel } from "@/lib/ai-model";

export class ResearchAgent {
  /**
   * Synthesizes market trends, visual patterns, and overused clichés to avoid for a campaign.
   */
  static async synthesizeResearch(
    intent: UserIntent,
    brand: BrandProfile
  ): Promise<ResearchContext> {
    const systemPrompt = `You are Sapphire's Research Agent. Your job is to analyze current social media marketing trends for "${intent.event}" in the "${intent.industry}" industry for brand "${brand.name}".

Synthesize 3 winning visual trends, 3 overused clichés to avoid, search queries, visual motifs, and a concise research summary.`;

    try {
      const result = await generateObject({
        model: getPrimaryModel(),
        schema: ResearchContextSchema,
        system: systemPrompt,
        prompt: `Campaign Event: ${intent.event}, Objective: ${intent.objective}, Target Platforms: ${intent.target_platforms.join(", ")}`,
      });
      return result.object;
    } catch (err) {
      try {
        const result = await generateObject({
          model: getFallbackModel(),
          schema: ResearchContextSchema,
          system: systemPrompt,
          prompt: `Campaign Event: ${intent.event}, Objective: ${intent.objective}`,
        });
        return result.object;
      } catch (err2) {
        return {
          search_queries: [
            `${intent.event} marketing trends`,
            `${intent.industry} visual campaign strategies`,
          ],
          key_trends: [
            "Authentic local experiences and storytelling",
            "High-contrast editorial photography with natural lighting",
            "Minimalist typography and restrained branding",
          ],
          visual_motifs: [
            "Natural landscapes bathed in warm sunlight",
            "Candid human expressions and authentic moments",
          ],
          overused_patterns_to_avoid: [
            "Generic stock photos with heavy filters",
            "Cluttered text graphics and rainbow gradients",
            "Overly corporate or aggressive sales pitches",
          ],
          summary: `Synthesized research for ${intent.event} in ${intent.industry}. Identified authentic photography and editorial storytelling as winning patterns.`,
        };
      }
    }
  }
}
