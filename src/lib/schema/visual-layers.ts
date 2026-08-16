import { z } from "zod";

export const VisualLayerDecompositionSchema = z.object({
  environment_background_layer: z.string().describe("Detailed architectural, landscape, and spatial environment description"),
  subject_asset_layer: z.string().describe("Foreground human subjects, authentic interactions, clothing fabrics, and cultural elements"),
  atmospheric_grading_layer: z.string().describe("Cinematic lighting direction, brand color grading, depth of field, and camera optics"),
  blended_composite_prompt: z.string().describe("Master unified prompt synthesizing all layers into a cohesive 4:5 vertical editorial composition"),
  negative_constraints: z.string().default("text, typography, watermark, logo, blurry, oversaturated, generic stock photo, distorted hands, cartoon"),
  technical_camera_specs: z.string().default("Shot on 35mm f/1.8 lens, shallow depth of field, 8k resolution"),
});

export type VisualLayerDecomposition = z.infer<typeof VisualLayerDecompositionSchema>;
