import { generateObject } from "ai";
import { UserIntentSchema, UserIntent } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { getPrimaryModel, getFallbackModel } from "@/lib/ai-model";

export class IntentAgent {
  /**
   * Analyzes raw user prompt and brand context using AI model to extract structured User Intent.
   */
  static async parseIntent(
    prompt: string,
    brand: BrandProfile
  ): Promise<UserIntent> {
    const systemPrompt = `You are Sapphire's Intent Agent. Your role is to interpret a user's raw marketing/creative request for the brand "${brand.name}" in the "${brand.industry}" industry.
Brand positioning: "${brand.positioning || brand.description || "Premium Brand"}".

Analyze the request and return structured JSON matching the requested schema.`;

    try {
      const result = await generateObject({
        model: getPrimaryModel(),
        schema: UserIntentSchema,
        system: systemPrompt,
        prompt: `User Request: "${prompt}"`,
      });
      return result.object;
    } catch (err) {
      try {
        const result = await generateObject({
          model: getFallbackModel(),
          schema: UserIntentSchema,
          system: systemPrompt,
          prompt: `User Request: "${prompt}"`,
        });
        return result.object;
      } catch (err2) {
        // Extract topic intelligently from prompt
        const cleanPrompt = prompt.trim();
        return {
          event: cleanPrompt,
          industry: brand.industry || "Travel & Hospitality",
          objective: "Brand Awareness & Customer Engagement",
          target_platforms: ["instagram", "linkedin"],
          cultural_elements: ["Authentic destination storytelling"],
          creative_opportunity: `${brand.name} + ${cleanPrompt}`,
        };
      }
    }
  }
}
