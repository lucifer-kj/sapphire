import { z } from "zod";

export const ReferenceImageAnalysisSchema = z.object({
  composition: z.string().default("Balanced composition with clear subject placement"),
  lighting: z.string().default("Natural lighting"),
  color_palette: z.array(z.string()).default([]),
  mood: z.string().default("Aspirational"),
  photography_style: z.string().default("Editorial photography"),
  visual_subject: z.string().default("Travel landscape / subject"),
  key_elements: z.array(z.string()).default([]),
});

export type ReferenceImageAnalysis = z.infer<typeof ReferenceImageAnalysisSchema>;
