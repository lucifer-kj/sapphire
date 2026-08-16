import { z } from "zod";

export const RefinementResultSchema = z.object({
  modified_aspects: z.array(z.string()).default([]),
  updated_creative_direction: z.string(),
  updated_image_prompt: z.string(),
  updated_caption_instagram: z.string(),
  updated_caption_linkedin: z.string(),
  summary_of_changes: z.string(),
});

export type RefinementResult = z.infer<typeof RefinementResultSchema>;
