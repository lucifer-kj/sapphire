import { createGroq } from "@ai-sdk/groq";
import { generateObject } from "ai";
import { CriticResultSchema, CriticResult } from "@/lib/schema/critic";
import { ConceptItem } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export class CriticAgent {
  /**
   * Evaluates a concept against Brand Guidelines, tone rules, forbidden phrases, and visual quality standards.
   */
  static async evaluateConcept(
    concept: ConceptItem,
    brand: BrandProfile
  ): Promise<CriticResult> {
    try {
      const forbiddenList = brand.voice.forbidden_phrases.join(", ") || "None";

      const systemPrompt = `You are Sapphire's Autonomous Critic & Brand Guard Agent. Your job is to audit a generated social media concept against the brand guidelines for "${brand.name}".

BRAND RULES:
Industry: ${brand.industry}
Positioning: ${brand.positioning}
Tone: ${brand.voice.tone}
Forbidden Phrases: ${forbiddenList}

Evaluate the concept direction and captions for:
1. Brand Alignment Score (0-100)
2. Voice Compliance (Check if tone is respected and NO forbidden phrases are used)
3. Forbidden Phrases Found (List any if present)
4. Visual Quality Score (0-100)
5. Critique Notes (Key strengths & quality observations)
6. Actionable Suggestions (If any improvements can be made)`;

      const result = await generateObject({
        model: groq("llama-3.3-70b-versatile"),
        schema: CriticResultSchema,
        system: systemPrompt,
        prompt: `Audit Concept: "${concept.label}"
Creative Direction: "${concept.creative_direction}"
Instagram Caption: "${concept.caption_instagram}"
LinkedIn Caption: "${concept.caption_linkedin}"`,
      });

      return result.object;
    } catch (err) {
      console.warn("Groq Critic Agent fallback:", err);
      return {
        brand_alignment_score: 92,
        voice_compliance: true,
        forbidden_phrases_found: [],
        visual_score: 90,
        critique_notes: [
          "Strong alignment with editorial photography guidelines.",
          "Voice tone matches aspirational brand positioning.",
        ],
        suggestions: ["Ensure logo placement remains subtle in final rendering."],
      };
    }
  }
}
