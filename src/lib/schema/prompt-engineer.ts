import { z } from "zod";

export const PromptEngineerResultSchema = z.object({
  optimized_image_prompt: z.string(),
  negative_prompt: z.string().default("text, typography, watermark, logo, blurry, oversaturated, generic stock photo, distorted hands"),
  camera_specs: z.string().default("35mm f/1.8 lens, shallow depth of field, 8k resolution"),
  style_tags: z.array(z.string()).default([]),
});

export type PromptEngineerResult = z.infer<typeof PromptEngineerResultSchema>;
