import { z } from "zod";

export const GenerationModeSchema = z.enum(["campaign", "prompt_only"]);
export type GenerationMode = z.infer<typeof GenerationModeSchema>;

export const PlatformSchema = z.enum(["instagram", "linkedin"]);
export type Platform = z.infer<typeof PlatformSchema>;

export const InstagramPostTypeSchema = z.enum([
  "product_promotion",
  "lifestyle_editorial",
  "educational_infographic",
  "announcement",
  "brand_awareness",
  "inspirational_quote",
  "offer_promotion",
  "story_led_visual",
]);
export type InstagramPostType = z.infer<typeof InstagramPostTypeSchema>;

export const LinkedInPostTypeSchema = z.enum([
  "thought_leadership",
  "educational_framework",
  "data_insight",
  "industry_commentary",
  "case_study_highlight",
  "company_culture",
  "product_announcement",
  "personal_story",
]);
export type LinkedInPostType = z.infer<typeof LinkedInPostTypeSchema>;

export const PostTypeSchema = z.union([InstagramPostTypeSchema, LinkedInPostTypeSchema]);
export type PostType = z.infer<typeof PostTypeSchema>;

export const PromptIntentSchema = z.object({
  topic: z.string().describe("Core topic or theme of the post"),
  event: z.string().optional().describe("Associated holiday, milestone, or cultural event"),
  platform: PlatformSchema.describe("Target social media platform"),
  post_type: PostTypeSchema.describe("Classified post type for platform psychology"),
  content_objective: z.string().describe("Primary marketing or communication objective"),
  target_audience: z.string().describe("Audience profile and demographics"),
  visual_opportunity: z.string().describe("Strategic visual angle to capture scroll-stop attention"),
  explicit_constraints: z.array(z.string()).default([]).describe("User-specified constraints or requests"),
});

export type PromptIntent = z.infer<typeof PromptIntentSchema>;
