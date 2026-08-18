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
  camera_optics: z.string().default("Shot on 35mm f/1.8 lens, natural depth-of-field, 8k"),
  lighting_vector: z.string().default("Golden hour side-lighting at 45° with soft ambient bounce"),
  spatial_negative_space_plan: z.string().default("Upper 40% open area reserved for headline typography"),
  material_textures: z.string().default("Natural authentic textures, soft film grain"),
  color_palette_anchors: z.array(z.string()).default(["#181816", "#D97757", "#FAF9F5"]),
});

export type ReferenceImageAnalysis = z.infer<typeof ReferenceImageAnalysisSchema>;

