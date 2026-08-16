import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { UserIntentSchema, UserIntent } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export class IntentAgent {
  /**
   * Analyzes raw user prompt and brand context using Groq LLM to extract structured User Intent.
   */
  static async parseIntent(
    prompt: string,
    brand: BrandProfile
  ): Promise<UserIntent> {
    try {
      const systemPrompt = `You are Sapphire's Intent Agent. Your role is to interpret a user's raw marketing/creative request for the brand "${brand.name}" in the "${brand.industry}" industry.
Brand positioning: "${brand.positioning || brand.description || "Premium Brand"}".

Analyze the request and return structured JSON matching the requested schema.`;

      const result = await generateObject({
        model: groq("llama-3.3-70b-versatile"),
        schema: UserIntentSchema,
        system: systemPrompt,
        prompt: `User Request: "${prompt}"`,
      });

      return result.object;
    } catch (err) {
      console.warn("Groq Intent Agent fallback:", err);
      return {
        event: prompt.toLowerCase().includes("independence")
          ? "Independence Day"
          : "Brand Campaign",
        industry: brand.industry || "Travel",
        objective: "Brand Awareness & Engagement",
        target_platforms: ["instagram", "linkedin"],
        cultural_elements: ["Authentic cultural storytelling"],
        creative_opportunity: `${brand.name} + Freedom + Immersive Journey`,
      };
    }
  }
}
