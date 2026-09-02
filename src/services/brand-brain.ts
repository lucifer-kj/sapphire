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
    archetype_affinity: {
      editorial_magazine: 0.85,
      conceptual_split: 0.6,
      comparison_split: 0.4,
      vintage_poster: 0.7,
      saas_dotgrid: 0.3,
    },
    typography_density_preference: "minimalist_punchy",
    visual_temperature_preference: "warm_golden",
  },
};

/**
 * Service class for Brand Brain storage, context retrieval, and preference tracking.
 */
import { PRECONFIGURED_BRANDS } from "@/lib/constants/brands";

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

      if (error || !data || data.length === 0) {
        return PRECONFIGURED_BRANDS;
      }

      const dbBrands = data.map((item) => BrandProfileSchema.parse(item));
      return [...PRECONFIGURED_BRANDS, ...dbBrands.filter(b => !PRECONFIGURED_BRANDS.some(p => p.id === b.id))];
    } catch (err) {
      console.warn("Falling back to in-memory brand seed:", err);
      return PRECONFIGURED_BRANDS;
    }
  }

  /**
   * Retrieves a specific Brand Profile by ID or slug or returns the default brand seed.
   */
  static async getBrandById(brandId?: string): Promise<BrandProfile> {
    if (!brandId) {
      return PRECONFIGURED_BRANDS[0];
    }

    // Check preconfigured brands by ID or name or slug
    const cleanId = brandId.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const preconfigured = PRECONFIGURED_BRANDS.find(
      (b) =>
        b.id === brandId ||
        b.id === cleanId ||
        b.name.toLowerCase() === brandId.toLowerCase() ||
        b.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === cleanId
    );
    if (preconfigured) {
      return preconfigured;
    }

    try {
      const supabase = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brandId);

      let query = supabase.from("brands").select("*");
      if (isUuid) {
        query = query.eq("id", brandId);
      } else {
        const searchTerms = brandId.replace(/-/g, " ");
        query = query.or(`name.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%`);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error || !data) {
        return PRECONFIGURED_BRANDS[0];
      }

      return BrandProfileSchema.parse(data);
    } catch (err) {
      console.warn(`Fallback to default brand for ID ${brandId}:`, err);
      return PRECONFIGURED_BRANDS[0];
    }

  }

  /**
   * Creates or updates a Brand Profile in the durable database.
   */
  static async saveBrand(profile: BrandProfile): Promise<BrandProfile> {
    const validated = BrandProfileSchema.parse(profile);

    try {
      const supabase = createAdminClient();
      const isUuid = validated.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validated.id);
      
      // Clean payload without invalid non-uuid id
      const payload: Record<string, any> = {
        name: validated.name,
        industry: validated.industry || "General",
        description: validated.description || null,
        positioning: validated.positioning || null,
        target_audience: validated.target_audience || null,
        social_handle: validated.social_handle || null,
        visual_identity: validated.visual_identity || {},
        voice: validated.voice || {},
        learned_preferences: validated.learned_preferences || {},
      };

      if (isUuid) {
        payload.id = validated.id;
      }

      // 1. Check if brand with same ID or name already exists in Supabase
      let existingId: string | null = null;
      if (isUuid) {
        const { data: byId } = await supabase.from("brands").select("id").eq("id", validated.id).maybeSingle();
        if (byId?.id) existingId = byId.id;
      }

      if (!existingId) {
        const { data: byName } = await supabase.from("brands").select("id").ilike("name", validated.name).maybeSingle();
        if (byName?.id) existingId = byName.id;
      }

      // 2. Update if exists, else Insert
      if (existingId) {
        const { data: updated, error: updateError } = await supabase
          .from("brands")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", existingId)
          .select()
          .single();

        if (updateError) {
          console.warn("Notice updating brand in Supabase:", updateError.message);
          return validated;
        }
        return BrandProfileSchema.parse(updated);
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("brands")
          .insert(payload)
          .select()
          .single();

        if (insertError) {
          console.warn("Notice inserting brand into Supabase:", insertError.message);
          return validated;
        }
        return BrandProfileSchema.parse(inserted);
      }
    } catch (err) {
      console.warn("Notice: Database operation fallback, returning validated brand profile:", err);
      return validated;
    }
  }

}

