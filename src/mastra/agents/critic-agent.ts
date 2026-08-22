import { generateObject } from "ai";
import { getGroqModel, getReasoningModel } from "@/lib/ai-model";
import { CriticResult, CriticResultSchema } from "@/lib/schema/critic";
import { ConceptItem } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";

export class CriticAgent {
  /**
   * Evaluates generated artwork and copy against brand rules and platform standards.
   * Emits a strict 100-point scorecard.
   */
  static async evaluateConcept(
    concept: ConceptItem,
    brand: BrandProfile,
    platform: "instagram" | "linkedin" = "instagram"
  ): Promise<CriticResult> {
    const forbiddenPhrases = brand.voice?.forbidden_phrases || [];

    const systemPrompt = `You are Sapphire's Brand Guard & Creative Quality Critic.
Perform an objective 100-point audit on the proposed concept for "${brand.name}".

EVALUATION CRITERIA:
1. Brand Alignment (0-100): Matches tone (${brand.voice?.tone || "Confident"}), positioning, and visual identity.
2. Visual Quality & Hook (0-100): Scroll-stop potential, clarity, lack of clutter.
3. Voice Compliance: Check that none of the forbidden phrases [${forbiddenPhrases.join(", ") || "None"}] are used.
4. Suggestions: 1-2 actionable tips to refine the creative.`;

    const userPrompt = `Concept Label: ${concept.label}
Creative Direction: "${concept.creative_direction}"
Instagram Caption: "${concept.caption_instagram}"
LinkedIn Caption: "${concept.caption_linkedin}"
Platform: ${platform}`;

    try {
      const model = getGroqModel("openai/gpt-oss-120b");
      const result = await generateObject({
        model,
        schema: CriticResultSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return result.object;
    } catch (err) {
      console.warn("Critic audit via Groq failed, falling back to Gemini:", err);
      const fallbackModel = getReasoningModel();
      const result = await generateObject({
        model: fallbackModel,
        schema: CriticResultSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return result.object;
    }
  }
}
