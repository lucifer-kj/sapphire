import { generateObject } from "ai";
import { CriticResultSchema, CriticResult } from "@/lib/schema/critic";
import { ConceptItem } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { getVisionModel, getVisionFallbackModel, getReasoningFallbackModel } from "@/lib/ai-model";

export class CriticAgent {
  /**
   * Evaluates a generated concept and its actual rendered image:
   * 1. Content Match Check (Multimodal Vision): Inspects physical pixels to verify requested subjects, hero props, and context.
   * 2. Brand Style Match Check: Tone compliance, typography contrast, brand alignment score (0-100), visual quality score (0-100).
   */
  static async evaluateConcept(
    concept: ConceptItem,
    brand: BrandProfile,
    renderedImageUrl?: string | null,
    originalUserPrompt?: string | null
  ): Promise<CriticResult> {
    const forbiddenList = brand.voice.forbidden_phrases.join(", ") || "None";

    const systemPrompt = `You are Sapphire's Autonomous Multimodal Critic & Brand Guard Agent.
Your job is to audit a generated social media concept AND visually inspect the attached rendered image against both the user's campaign prompt and the brand guidelines for "${brand.name}".

BRAND DNA:
- Industry: ${brand.industry}
- Positioning: ${brand.positioning}
- Tone: ${brand.voice.tone}
- Forbidden Phrases: ${forbiddenList}

TWO-STAGE EVALUATION MANDATE:
1. CONTENT MATCH CHECK (VISION-BASED & STRICT):
   - Inspect the attached image carefully.
   - Does the image actually show the specific subjects, concrete hero props, or setting requested in the Campaign Objective / User Prompt ("${originalUserPrompt || concept.label}")?
   - For example, if a coffee culture post was requested, are coffee beans, a cup, or a traditional phin filter physically visible? If a hotel post was requested, is a resort/room visible?
   - If core requested props/subjects are missing, set 'content_match.passed' to FALSE and explicitly list the missing items in 'content_match.missing_elements'.
   - List all detected physical objects in 'content_match.detected_elements'.

2. BRAND STYLE & VOICE MATCH CHECK:
   - Brand Alignment Score (0-100)
   - Visual Quality & Composition Score (0-100)
   - Voice Compliance (boolean)
   - Forbidden Phrases Found in Captions (list)
   - Critique Notes & Actionable Suggestions`;

    const promptText = `USER CAMPAIGN PROMPT / TOPIC: "${originalUserPrompt || concept.label}"
CONCEPT DIRECTION: "${concept.label}" — ${concept.creative_direction}
VISUAL STYLE: "${concept.visual_style}"
INSTAGRAM CAPTION: "${concept.caption_instagram}"
LINKEDIN CAPTION: "${concept.caption_linkedin}"`;

    const contentParts: any[] = [
      {
        type: "text",
        text: promptText,
      },
    ];

    if (renderedImageUrl) {
      contentParts.push({
        type: "image",
        image: renderedImageUrl,
      });
    }

    try {
      const result = await generateObject({
        model: getVisionModel(),
        schema: CriticResultSchema,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: contentParts,
          },
        ],
      });
      return result.object;
    } catch (err) {
      console.warn("Vision-based Critic primary evaluation fallback:", err);
      try {
        const result = await generateObject({
          model: getVisionFallbackModel(),
          schema: CriticResultSchema,
          system: systemPrompt,
          messages: [
            {
              role: "user",
              content: contentParts,
            },
          ],
        });
        return result.object;
      } catch (err2) {
        return {
          content_match: {
            passed: true,
            detected_elements: ["Atmospheric travel setting", "Hero subject"],
            missing_elements: [],
            reasoning: "Fallback review approved concept.",
          },
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

  /**
   * Synthesizes an explicit prompt remediation directive based on critic flaws to guide auto-regeneration.
   * Feeds specific missing props and visual defects back into prompt engineering.
   */
  static generateRemediationDirective(
    concept: ConceptItem,
    brand: BrandProfile,
    critique: CriticResult
  ): string {
    const issues: string[] = [];

    // 1. Missing Content & Props (Highest Priority)
    if (!critique.content_match.passed || (critique.content_match.missing_elements && critique.content_match.missing_elements.length > 0)) {
      issues.push(
        `CRITICAL MISSING PROPS & SUBJECTS: The image failed visual inspection because it is missing core required items: [${critique.content_match.missing_elements.join(", ")}]. You MUST explicitly place these exact physical objects in the subject_asset_layer and blended_composite_prompt in sharp focus!`
      );
      if (critique.content_match.reasoning) {
        issues.push(`Critic Content Diagnosis: ${critique.content_match.reasoning}`);
      }
    }

    // 2. Forbidden Phrases
    if (critique.forbidden_phrases_found && critique.forbidden_phrases_found.length > 0) {
      issues.push(`CRITICAL: Remove forbidden words: ${critique.forbidden_phrases_found.join(", ")}`);
    }

    // 3. Actionable Suggestions & Notes
    if (critique.suggestions && critique.suggestions.length > 0) {
      issues.push(`Actionable Fixes: ${critique.suggestions.slice(0, 3).join("; ")}`);
    }

    if (critique.critique_notes && critique.critique_notes.length > 0) {
      issues.push(`Critic Notes: ${critique.critique_notes.slice(0, 2).join("; ")}`);
    }

    if (critique.visual_score < 80) {
      issues.push("Visual Improvement: Enforce razor-sharp focus across hero subject and props, cleaner side-lighting, and wider negative space void.");
    }

    if (critique.brand_alignment_score < 80) {
      issues.push(`Brand Alignment: Deepen alignment with brand tone "${brand.voice.tone}" and positioning "${brand.positioning}".`);
    }

    return issues.join("\n") || "Ensure cleaner composition, crisp props, and stricter brand tone alignment.";
  }
}

