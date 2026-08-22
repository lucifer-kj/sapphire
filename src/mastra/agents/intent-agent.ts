import { generateObject } from "ai";
import { getLightModel, getReasoningModel, getGroqModel } from "@/lib/ai-model";
import { UserIntent, UserIntentSchema } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";

export class IntentAgent {
  /**
   * Parses user input, extracting marketing intent, audience, and platform constraints.
   */
  static async parseIntent(
    prompt: string,
    brand: BrandProfile,
    targetPlatform: "instagram" | "linkedin" = "instagram"
  ): Promise<UserIntent> {
    const systemPrompt = `You are Sapphire's Intent Parsing Agent.
Analyze the user's prompt for "${brand.name}" in the "${brand.industry}" industry.
Extract the core event/topic, marketing objective, cultural context, and creative opportunities for ${targetPlatform}.`;

    try {
      const model = getReasoningModel();
      const result = await generateObject({
        model,
        schema: UserIntentSchema,
        system: systemPrompt,
        prompt: `User request: "${prompt}". Platform: ${targetPlatform}.`,
      });
      return result.object;
    } catch (err) {
      console.warn("Intent parsing via primary model failed, falling back to Groq:", err);
      const fallbackModel = getGroqModel("openai/gpt-oss-120b");
      const result = await generateObject({
        model: fallbackModel,
        schema: UserIntentSchema,
        system: systemPrompt,
        prompt: `User request: "${prompt}". Platform: ${targetPlatform}.`,
      });
      return result.object;
    }
  }
}
