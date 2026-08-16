import { createAdminClient } from "@/lib/supabase/admin";
import { BrandProfile, BrandProfileSchema } from "@/lib/schema/brand";

export const DEFAULT_BRAND_SEED: Omit<BrandProfile, "id" | "created_at" | "updated_at"> = {
  name: "Vagabond Travel Agency",
  industry: "Travel & Hospitality",
  description: "Bespoke experiential travel agency specializing in immersive, culturally rich journeys across India and Asia.",
  positioning: "Premium editorial travel with human storytelling.",
  target_audience: "Aspirational millennial travelers, luxury experience seekers, cultural enthusiasts.",
  visual_identity: {
    logo_variants: ["full-logo-dark", "icon-mark-terracotta"],
    primary_colors: ["#141413", "#FAF9F5"],
    secondary_colors: ["#D97757", "#6A9BCC", "#788C5D"],
    fonts: {
      heading: "Inter",
      body: "Inter",
      serif: "Georgia",
    },
    typography_rules: ["Subtle, clean text overlay", "High contrast on images"],
    photography_style: "Cinematic editorial travel photography, golden hour lighting, authentic human moments.",
    graphic_style: "Restrained, minimal, high-end editorial composition.",
    image_preferences: ["Warm earth tones", "Subtle landscape compositions", "Human element in frame"],
  },
  voice: {
    tone: "Inspiring, sophisticated, authentic, adventurous",
    vocabulary: ["Journey", "Freedom", "Immersive", "Discovery", "Horizon"],
    sentence_style: "Poetic yet concise opening hooks followed by clear trip details.",
    cta_style: "Subtle invitation to explore",
    forbidden_phrases: ["Cheap deals", "Discount blowout", "Hurry before it's gone!"],
    preferred_phrases: ["Craft your journey", "Discover the unseen"],
  },
  learned_preferences: {
    preferred_visual_styles: [
      {
        value: "editorial_travel",
        confidence: 0.85,
        evidence_count: 5,
        source: "selection_pattern",
      },
    ],
    preferred_compositions: [
      {
        value: "rule_of_thirds_landscape",
        confidence: 0.8,
        evidence_count: 3,
        source: "selection_pattern",
      },
    ],
    preferred_hooks: [],
    preferred_caption_styles: [
      {
        value: "storytelling_first",
        confidence: 0.9,
        evidence_count: 4,
        source: "explicit_feedback",
      },
    ],
    logo_prominence: {
      value: "subtle_bottom_corner",
      confidence: 0.95,
      evidence_count: 6,
      source: "explicit_feedback",
    },
    color_preferences: [],
  },
};

/**
 * Service class for Brand Brain storage, context retrieval, and preference tracking.
 */
export class BrandBrainService {
  /**
   * Retrieves all registered brand profiles.
   */
  static async getAllBrands(): Promise<BrandProfile[]> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching brands from Supabase:", error);
        return [DEFAULT_BRAND_SEED];
      }

      if (!data || data.length === 0) {
        return [DEFAULT_BRAND_SEED];
      }

      return data.map((item) => BrandProfileSchema.parse(item));
    } catch (err) {
      console.warn("Falling back to in-memory brand seed:", err);
      return [DEFAULT_BRAND_SEED];
    }
  }

  /**
   * Retrieves a specific Brand Profile by ID or returns the default brand seed.
   */
  static async getBrandById(brandId?: string): Promise<BrandProfile> {
    if (!brandId) {
      return DEFAULT_BRAND_SEED;
    }

    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("id", brandId)
        .single();

      if (error || !data) {
        return DEFAULT_BRAND_SEED;
      }

      return BrandProfileSchema.parse(data);
    } catch (err) {
      console.warn(`Fallback to default brand for ID ${brandId}:`, err);
      return DEFAULT_BRAND_SEED;
    }
  }

  /**
   * Creates or updates a Brand Profile in the durable database.
   */
  static async saveBrand(profile: BrandProfile): Promise<BrandProfile> {
    const validated = BrandProfileSchema.parse(profile);
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("brands")
      .upsert(validated)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save Brand Profile: ${error.message}`);
    }

    return BrandProfileSchema.parse(data);
  }
}
