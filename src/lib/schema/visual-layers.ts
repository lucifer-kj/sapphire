import { z } from "zod";

export const VisualLayerDecompositionSchema = z.object({
  environment_background_layer: z.string().describe("Detailed architectural, landscape, and spatial environment description"),
  subject_asset_layer: z.string().describe("Foreground human subjects, authentic interactions, clothing fabrics, and cultural elements"),
  atmospheric_grading_layer: z.string().describe("Cinematic lighting direction, brand color grading, depth of field, and camera optics"),
  blended_composite_prompt: z.string().describe("Master unified prompt synthesizing all layers into a cohesive 4:5 vertical editorial composition"),
  negative_constraints: z.string().default("text, typography, watermark, logo, blurry, oversaturated, generic stock photo, distorted hands, cartoon"),
  technical_camera_specs: z.string().default("Shot on 50mm f/4 lens, tack-sharp focus, 8k resolution"),
  required_prop_count: z.number().default(1).describe("Count of distinct mandatory physical elements in subject_asset_layer"),
  complexity_flag: z.enum(["low", "high"]).default("low").describe("High if 3+ mandatory props, routing to higher-adherence model"),
  focal_point_verified: z.boolean().default(true).describe("Self-check: does subject_asset_layer contain the literal focal point?"),
});

export type VisualLayerDecomposition = z.infer<typeof VisualLayerDecompositionSchema>;
