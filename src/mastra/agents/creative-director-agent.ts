import { generateObject } from "ai";
import { getReasoningModel, getGroqModel } from "@/lib/ai-model";
import { CreativeBrief, CreativeBriefGenerationSchema, UserIntent } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";

export class CreativeDirectorAgent {
  /**
   * Generates two genuinely differentiated A/B creative directions.
   * Concept A: Emotional / Visceral Visual Metaphor
   * Concept B: Editorial / Framework Authority
   */
  static async formulateConcepts(
    prompt: string,
    intent: UserIntent,
    brand: BrandProfile,
    platform: "instagram" | "linkedin" = "instagram"
  ): Promise<CreativeBrief> {
    const brandColors = brand.visual_identity?.primary_colors?.join(", ") || "#09090b, #FAF7F2";
    const accentColors = brand.visual_identity?.secondary_colors?.join(", ") || "#D97757";

    const systemPrompt = `You are Sapphire's Executive Creative Director.
Your task is to develop two distinct, high-impact creative directions for "${brand.name}" on ${platform.toUpperCase()}.

RULES:
1. DIFFERENTIATION: Concept A (Visceral Metaphor) vs Concept B (Editorial Authority).
2. CONCISE HEADLINES: Keep headlines under 8 words.
3. NEGATIVE SPACE: Direct background photo to leave clean space for text overlay.
4. BRAND COLORS: Primary [${brandColors}], Accent [${accentColors}].`;

    const userPrompt = `Topic: "${prompt}"
Objective: ${intent.objective}
Opportunity: ${intent.creative_opportunity}
Platform: ${platform}`;

    try {
      const model = getReasoningModel();
      const result = await generateObject({
        model,
        schema: CreativeBriefGenerationSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return result.object as CreativeBrief;
    } catch (err) {
      console.warn("Creative Director primary model failed, falling back to Groq:", err);
      const fallbackModel = getGroqModel("openai/gpt-oss-120b");
      const result = await generateObject({
        model: fallbackModel,
        schema: CreativeBriefGenerationSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return result.object as CreativeBrief;
    }
  }
}
