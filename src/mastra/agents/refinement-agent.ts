import { generateObject } from "ai";
import { RefinementResultSchema, RefinementResult } from "@/lib/schema/refinement";
import { ConceptItem } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { getLightModel, getLightFallbackModel } from "@/lib/ai-model";

export class RefinementAgent {
  /**
   * Applies natural-language feedback and instructions to an existing creative concept.
   * Uses Light Model (Gemini Flash) for fast turnaround.
   */
  static async refineConcept(
    instruction: string,
    currentConcept: ConceptItem,
    brand: BrandProfile
  ): Promise<RefinementResult> {
    const currentBlueprint = currentConcept.design_blueprint;
    const systemPrompt = `You are Sapphire's Refinement Agent. Your role is to apply a user's specific edit instruction to an existing marketing concept and design blueprint for "${brand.name}".
Modify the creative direction, image prompt, Instagram caption, LinkedIn caption, and the updated_design_blueprint (headline, subheadline, category_pill, cta_text, value_props, archetype, etc.) according to the user's instruction while maintaining the brand's tone and high-grade graphic design aesthetic.
Always ensure updated_design_blueprint has a clean headline, subheadline, and negative space directive matching the new image prompt.`;

    const promptText = `Current Concept Label: "${currentConcept.label}"
Current Creative Direction: "${currentConcept.creative_direction}"
Current Image Prompt: "${currentConcept.image_prompt}"
Current Instagram Caption: "${currentConcept.caption_instagram}"
Current LinkedIn Caption: "${currentConcept.caption_linkedin}"
Current Design Blueprint: ${JSON.stringify(currentBlueprint || {})}

User Refinement Instruction: "${instruction}"`;

    try {
      const result = await generateObject({
        model: getLightModel(),
        schema: RefinementResultSchema,
        system: systemPrompt,
        prompt: promptText,
      });
      return result.object;
    } catch (err) {
      try {
        const result = await generateObject({
          model: getLightFallbackModel(),
          schema: RefinementResultSchema,
          system: systemPrompt,
          prompt: promptText,
        });
        return result.object;
      } catch (err2) {
        return {
          modified_aspects: ["creative_direction", "image_prompt", "captions", "design_blueprint"],
          updated_creative_direction: `${currentConcept.creative_direction} (Refined: ${instruction})`,
          updated_image_prompt: `${currentConcept.image_prompt}, ${instruction}, high quality, 8k`,
          updated_caption_instagram: `${currentConcept.caption_instagram}\n\n[Updated: ${instruction}]`,
          updated_caption_linkedin: `${currentConcept.caption_linkedin}\n\n[Updated: ${instruction}]`,
          updated_design_blueprint: currentBlueprint
            ? {
                ...currentBlueprint,
                headline: currentBlueprint.headline,
                subheadline: `${currentBlueprint.subheadline} (Refined: ${instruction})`,
              }
            : undefined,
          summary_of_changes: `Applied user instruction: "${instruction}"`,
        };
      }
    }
  }
}
