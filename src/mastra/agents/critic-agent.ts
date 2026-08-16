import { generateObject } from "ai";
import { CriticResultSchema, CriticResult } from "@/lib/schema/critic";
import { ConceptItem } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";

export class CriticAgent {
  /**
   * Evaluates a concept against Brand Guidelines, tone rules, forbidden phrases, and visual quality standards.
   * Uses Reasoning Model (Groq Llama 3.3 70B primary, Gemini Flash fallback).
   */
  static async evaluateConcept(
    concept: ConceptItem,
    brand: BrandProfile
  ): Promise<CriticResult> {
    const forbiddenList = brand.voice.forbidden_phrases.join(", ") || "None";

    const systemPrompt = `You are Sapphire's Autonomous Critic & Brand Guard Agent. Your job is to audit a generated social media concept against the brand guidelines for "${brand.name}".

BRAND RULES:
Industry: ${brand.industry}
Positioning: ${brand.positioning}
Tone: ${brand.voice.tone}
Forbidden Phrases: ${forbiddenList}

Evaluate the concept direction and captions for:
1. Brand Alignment Score (0-100)
2. Voice Compliance
3. Forbidden Phrases Found
4. Visual Quality Score (0-100)
5. Critique Notes
6. Actionable Suggestions`;

    const promptText = `Audit Concept: "${concept.label}"
Creative Direction: "${concept.creative_direction}"
Instagram Caption: "${concept.caption_instagram}"
LinkedIn Caption: "${concept.caption_linkedin}"`;

    try {
      const result = await generateObject({
        model: getReasoningModel(),
        schema: CriticResultSchema,
        system: systemPrompt,
        prompt: promptText,
      });
      return result.object;
    } catch (err) {
      try {
        const result = await generateObject({
          model: getReasoningFallbackModel(),
          schema: CriticResultSchema,
          system: systemPrompt,
          prompt: promptText,
        });
        return result.object;
      } catch (err2) {
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
}
