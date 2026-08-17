import { createAdminClient } from "@/lib/supabase/admin";
import { BrandProfile, BrandProfileSchema } from "@/lib/schema/brand";
import { ConceptItem } from "@/lib/schema/campaign";
import { DesignArchetype } from "@/lib/design-system/archetypes";

export class PreferenceEngine {
  /**
   * Records a user's choice of Concept A over B (or vice versa), decomposes the selection traits,
   * calculates weighted taste vectors (archetype win rates, typography density, visual temperature),
   * and persists updated learned_preferences to Supabase.
   */
  static async recordConceptSelection(
    brandId: string | undefined,
    selectedConcept: ConceptItem,
    unselectedConcept?: ConceptItem
  ): Promise<void> {
    try {
      const supabase = createAdminClient();

      const selectedArchetype =
        (selectedConcept.design_blueprint?.archetype as DesignArchetype) ||
        this.inferArchetype(selectedConcept);
      const unselectedArchetype = unselectedConcept
        ? (unselectedConcept.design_blueprint?.archetype as DesignArchetype) ||
          this.inferArchetype(unselectedConcept)
        : undefined;

      // 1. Infer typography density & visual temperature
      const inferredDensity = this.inferTypographyDensity(selectedConcept);
      const inferredTemperature = this.inferVisualTemperature(selectedConcept);

      // Decompose traits from selected concept
      const preferenceEvidence = [
        {
          preference_key: "archetype_affinity",
          preference_value: selectedArchetype,
          confidence: 0.85,
          source: "selection_pattern" as const,
          evidence_notes: `Selected archetype "${selectedArchetype}" over "${unselectedArchetype || "none"}"`,
        },
        {
          preference_key: "visual_style",
          preference_value: selectedConcept.visual_style.slice(0, 100),
          confidence: 0.8,
          source: "selection_pattern" as const,
          evidence_notes: `User selected concept "${selectedConcept.label}"`,
        },
        {
          preference_key: "typography_density",
          preference_value: inferredDensity,
          confidence: 0.75,
          source: "selection_pattern" as const,
          evidence_notes: `Inferred typography density preference: ${inferredDensity}`,
        },
        {
          preference_key: "visual_temperature",
          preference_value: inferredTemperature,
          confidence: 0.75,
          source: "selection_pattern" as const,
          evidence_notes: `Inferred visual temperature preference: ${inferredTemperature}`,
        },
      ];

      // 2. Insert evidence rows if brandId exists
      if (brandId) {
        for (const ev of preferenceEvidence) {
          await supabase.from("preference_evidence").insert({
            brand_id: brandId,
            preference_key: ev.preference_key,
            preference_value: ev.preference_value,
            confidence: ev.confidence,
            source: ev.source,
            evidence_notes: ev.evidence_notes,
          });
        }

        // 3. Fetch current brand profile & calculate updated taste vectors
        const { data: brandData } = await supabase
          .from("brands")
          .select("*")
          .eq("id", brandId)
          .single();

        if (brandData) {
          const brand = BrandProfileSchema.parse(brandData);
          const currentAffinities: Record<string, number> = {
            editorial_magazine: 0.5,
            conceptual_split: 0.5,
            comparison_split: 0.5,
            vintage_poster: 0.5,
            saas_dotgrid: 0.5,
            ...(brand.learned_preferences?.archetype_affinity || {}),
          };

          // Increase selected archetype affinity via weighted moving average
          const currentSelectedWeight = currentAffinities[selectedArchetype] ?? 0.5;
          currentAffinities[selectedArchetype] = Number(
            Math.min(1.0, currentSelectedWeight * 0.8 + 1.0 * 0.2).toFixed(2)
          );

          // Decay unselected archetype affinity
          if (unselectedArchetype && unselectedArchetype !== selectedArchetype) {
            const currentUnselectedWeight = currentAffinities[unselectedArchetype] ?? 0.5;
            currentAffinities[unselectedArchetype] = Number(
              Math.max(0.1, currentUnselectedWeight * 0.85 + 0.0 * 0.15).toFixed(2)
            );
          }

          const updatedPreferences = {
            ...brand.learned_preferences,
            archetype_affinity: currentAffinities,
            typography_density_preference: inferredDensity,
            visual_temperature_preference: inferredTemperature,
            preferred_visual_styles: [
              ...(brand.learned_preferences.preferred_visual_styles || []).slice(-9),
              {
                value: selectedConcept.visual_style,
                confidence: 0.8,
                evidence_count:
                  (brand.learned_preferences.preferred_visual_styles?.length || 0) + 1,
                source: "selection_pattern" as const,
              },
            ],
          };

          await supabase
            .from("brands")
            .update({ learned_preferences: updatedPreferences as any })
            .eq("id", brandId);
        }
      }
    } catch (err) {
      console.warn("Supabase preference recording fallback:", err);
    }
  }

  private static inferArchetype(concept: ConceptItem): DesignArchetype {
    const text = `${concept.label} ${concept.creative_direction} ${concept.visual_style}`.toLowerCase();
    if (text.includes("editorial") || text.includes("magazine") || text.includes("culinary")) {
      return "editorial_magazine";
    }
    if (text.includes("comparison") || text.includes("before") || text.includes("versus")) {
      return "comparison_split";
    }
    if (text.includes("vintage") || text.includes("retro") || text.includes("poster")) {
      return "vintage_poster";
    }
    if (text.includes("saas") || text.includes("dotgrid") || text.includes("tech")) {
      return "saas_dotgrid";
    }
    return "conceptual_split";
  }

  private static inferTypographyDensity(
    concept: ConceptItem
  ): "minimalist_punchy" | "detailed_value_props" | "balanced" {
    const bp = concept.design_blueprint;
    if (bp?.value_props && bp.value_props.length >= 3) {
      return "detailed_value_props";
    }
    if (bp?.subheadline && bp.subheadline.length > 70) {
      return "detailed_value_props";
    }
    if (bp?.subheadline && bp.subheadline.length <= 45 && (!bp.value_props || bp.value_props.length <= 1)) {
      return "minimalist_punchy";
    }
    return "balanced";
  }

  private static inferVisualTemperature(
    concept: ConceptItem
  ): "warm_golden" | "neutral_studio" | "cool_dark" | "vibrant_contrast" {
    const str = `${concept.lighting} ${concept.visual_style} ${concept.creative_direction}`.toLowerCase();
    if (str.includes("golden") || str.includes("warm") || str.includes("sunset") || str.includes("amber")) {
      return "warm_golden";
    }
    if (str.includes("dark") || str.includes("slate") || str.includes("blue") || str.includes("night") || str.includes("cyber")) {
      return "cool_dark";
    }
    if (str.includes("studio") || str.includes("white") || str.includes("minimal") || str.includes("cyclorama")) {
      return "neutral_studio";
    }
    return "vibrant_contrast";
  }
}

