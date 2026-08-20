import { z } from "zod";

export const LockedShotListSchema = z.object({
  hero_subject: z.string().describe("Main focal subject, action, or hero persona"),
  required_props: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("Explicit list of 2 to 5 non-negotiable physical props and tangible objects that must appear"),
  setting: z.string().describe("Tangible architectural or environmental setting"),
  lighting_and_atmosphere: z.string().describe("Lighting direction, color temperature, and atmospheric mood"),
  compositional_framing: z.string().describe("Spatial placement rule and camera angle"),
  negative_constraints: z.array(z.string()).describe("Forbidden visual artifacts and clutter to exclude"),
});

export type LockedShotList = z.infer<typeof LockedShotListSchema>;
