import { z } from "zod";
import { DesignArchetypeEnum } from "../design-system/archetypes";

export const ReferenceImageAnalysisSchema = z.object({
  composition: z.string().default("Balanced composition with clear subject placement"),
  lighting: z.string().default("Natural lighting"),
  color_palette: z.array(z.string()).default([]),
  mood: z.string().default("Aspirational"),
  photography_style: z.string().default("Editorial photography"),
  visual_subject: z.string().default("Travel landscape / subject"),
  key_elements: z.array(z.string()).default([]),
  detected_archetype: DesignArchetypeEnum.optional(),
  negative_space_zone: z.string().optional(),
  suggested_font_pair: z.string().optional(),
});

export type ReferenceImageAnalysis = z.infer<typeof ReferenceImageAnalysisSchema>;
