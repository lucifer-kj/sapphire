import { z } from "zod";
import { DesignArchetypeSchema } from "@/lib/design-system/archetypes";

export const ReferenceStrategyTypeSchema = z.enum([
  "none",
  "style_reference",
  "subject_reference",
  "product_reference",
  "composition_reference",
  "multi_reference",
]);
export type ReferenceStrategyType = z.infer<typeof ReferenceStrategyTypeSchema>;

export const ReferenceStrategySchema = z.object({
  type: ReferenceStrategyTypeSchema,
  guidance: z.string().describe("Clear instructions on what the reference image should control"),
  importance: z.enum(["optional", "recommended", "essential"]).default("optional"),
});
export type ReferenceStrategy = z.infer<typeof ReferenceStrategySchema>;

export const VisualStrategySchema = z.object({
  creative_concept: z.string().describe("Core creative concept and visual metaphor"),
  visual_style: z.string().describe("Art direction and aesthetic tone (e.g. Editorial, Brutalist, Minimal)"),
  archetype: DesignArchetypeSchema.describe("Selected canonical design archetype"),
  dominant_focal_point: z.string().describe("The primary subject catching attention in the first 0.8s"),
  spatial_composition: z.string().describe("Framing, negative space, and rule-of-thirds composition"),
  color_palette: z.array(z.string()).describe("Curated 2-4 color tones or hex values"),
  lighting_mood: z.string().describe("Lighting setup (e.g. Golden hour, Moody chiaroscuro, High-key studio)"),
  camera_and_lens: z.string().describe("Optics and perspective (e.g. 85mm f/1.4, Overhead flat lay)"),
  reference_strategy: ReferenceStrategySchema,
});

export type VisualStrategy = z.infer<typeof VisualStrategySchema>;
