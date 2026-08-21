import { generateObject } from "ai";
import { getReasoningModel, getGroqModel } from "@/lib/ai-model";
import { CreativeBrief, CreativeBriefSchema, UserIntent } from "@/lib/schema/campaign";
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

RULES FOR CONCEPT GENERATION:
1. DIFFERENTIATION: Concept A and Concept B MUST represent distinct visual strategies.
   - Concept A: Emotional / Visceral Visual Metaphor (focus on storytelling, striking contrast, pattern interrupt).
   - Concept B: Editorial / Framework Authority (focus on structure, clean hierarchy, intellectual value).
2. NEVER GENERATE GENERIC AI SLOP: No meaningless floating spheres, rainbow gradients, or cliché AI robots.
3. PLATFORM ADAPTATION:
   - Instagram: Visual shock, 2-7 word punchy headline (legible at thumbnail size), high save/share potential.
   - LinkedIn: Authority framework, clear mental model, professional depth, discussion trigger.
4. BRAND COLORS: Primary [${brandColors}], Accent [${accentColors}].
5. NEGATIVE SPACE BUDGETING: Explicitly instruct the background prompt to leave the upper or lower 40% clean and uncluttered for typography overlay.`;

    const userPrompt = `Topic: "${prompt}"
Objective: ${intent.objective}
Opportunity: ${intent.creative_opportunity}
Platform: ${platform}`;

    try {
      const model = getReasoningModel();
      const result = await generateObject({
        model,
        schema: CreativeBriefSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return result.object;
    } catch (err) {
      console.warn("Creative Director primary model failed, falling back to Groq Llama 3.3:", err);
      const fallbackModel = getGroqModel("llama-3.3-70b-versatile");
      const result = await generateObject({
        model: fallbackModel,
        schema: CreativeBriefSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      return result.object;
    }
  }
}
