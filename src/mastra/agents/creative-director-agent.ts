import { generateObject } from "ai";
import { getReasoningModel, getGroqModel } from "@/lib/ai-model";
import { CreativeBrief, CreativeBriefGenerationSchema, UserIntent } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";

export class CreativeDirectorAgent {
  /**
   * Generates two genuinely differentiated A/B creative directions with studio-grade realism.
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

RULES FOR CREATIVE DIRECTIONS:
1. DIFFERENTIATION:
   - Concept A: Narrative / Atmospheric Editorial (intimate real-world moment, tactile textures, human presence or tangible setting).
   - Concept B: Clean Minimalist / Architectural Authority (structured composition, striking geometry, quiet luxury aesthetic).

RULES FOR IMAGE PROMPTS (CRITICAL - PHOTO REALISM ONLY):
1. PURE PHOTOGRAPHY: Every image_prompt MUST describe a real-world, cinematic 35mm photograph (Kodak Portra 400, natural soft lighting, Leica 50mm f/1.4 lens, authentic grain).
2. STRICTLY FORBID: No surreal floating elements, no fantasy metaphors, no glowing neon lines, no AI robots, no cheesy stock collages.
3. CONCRETE SUBJECTS: Tangible real-world scenes (e.g. architectural interiors, real hands interacting with products, authentic urban streets, natural landscape horizons).
4. NEGATIVE SPACE BUDGETING: Explicitly instruct: "The upper 45% of the frame features smooth, softly blurred negative space (bokeh, clean wall, open sky, or shadow) to provide high-contrast legibility for typography overlay. Subject is grounded in the lower half."
5. ZERO TEXT IN IMAGE: Satori will render all typography. Do not ask for text inside the image.

TYPOGRAPHY & HOOK RULES:
1. Punchy headlines under 7 words that stop the scroll.
2. Instagram: Visual shock & lifestyle aspiration.
3. LinkedIn: Executive insight & strategic takeaway.`;

    const userPrompt = `Topic: "${prompt}"
Objective: ${intent.objective}
Opportunity: ${intent.creative_opportunity}
Brand: ${brand.name} (${brand.industry})
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
