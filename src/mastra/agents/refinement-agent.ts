import { generateObject } from "ai";
import { RefinementResultSchema, RefinementResult } from "@/lib/schema/refinement";
import { ConceptItem } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { getPrimaryModel, getFallbackModel } from "@/lib/ai-model";

export class RefinementAgent {
  /**
   * Processes natural-language user feedback against a concept and produces updated creative direction, image prompt, and captions.
   */
  static async refineConcept(
    userInstruction: string,
    currentConcept: ConceptItem,
    brand: BrandProfile
  ): Promise<RefinementResult> {
    const systemPrompt = `You are Sapphire's Refinement Agent. Your role is to interpret natural-language modification instructions from the user and apply them to an existing social media concept for ${brand.name}.

Current Concept Direction: "${currentConcept.creative_direction}"
Current Image Prompt: "${currentConcept.image_prompt}"
Current Instagram Caption: "${currentConcept.caption_instagram}"

USER INSTRUCTION: "${userInstruction}"

RULES:
1. Apply the user's requested changes while preserving brand voice and overall quality.
2. Produce an updated, detailed image_prompt for photo generation.
3. Produce updated Instagram & LinkedIn captions matching the requested changes.
4. List the modified aspects (e.g. ["lighting", "caption_length", "color_palette"]).`;

    try {
      const result = await generateObject({
        model: getPrimaryModel(),
        schema: RefinementResultSchema,
        system: systemPrompt,
        prompt: `Apply instruction: "${userInstruction}"`,
      });
      return result.object;
    } catch (err) {
      console.warn("Primary Refinement Agent fallback to secondary:", err);
      try {
        const result = await generateObject({
          model: getFallbackModel(),
          schema: RefinementResultSchema,
          system: systemPrompt,
          prompt: `Apply instruction: "${userInstruction}"`,
        });
        return result.object;
      } catch (err2) {
        console.warn("Dynamic Refinement fallback:", err2);
        return {
          modified_aspects: ["visual_atmosphere", "caption"],
          updated_creative_direction: `${currentConcept.creative_direction} (Refined: ${userInstruction})`,
          updated_image_prompt: `${currentConcept.image_prompt}, ${userInstruction}, photorealistic 8k`,
          updated_caption_instagram: `${currentConcept.caption_instagram}\n\n[Refined update: ${userInstruction}]`,
          updated_caption_linkedin: currentConcept.caption_linkedin,
          summary_of_changes: `Applied instruction: "${userInstruction}"`,
        };
      }
    }
  }
}
