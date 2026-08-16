import { createAdminClient } from "@/lib/supabase/admin";
import { BrandProfile, BrandProfileSchema } from "@/lib/schema/brand";
import { ConceptItem } from "@/lib/schema/campaign";

export class PreferenceEngine {
  /**
   * Records a user's choice of Concept A over B (or vice versa), decomposes the selection traits, and logs evidence to Supabase.
   */
  static async recordConceptSelection(
    brandId: string | undefined,
    selectedConcept: ConceptItem,
    unselectedConcept?: ConceptItem
  ): Promise<void> {
    try {
      const supabase = createAdminClient();

      // Decompose traits from selected concept
      const preferenceEvidence = [
        {
          preference_key: "visual_style",
          preference_value: selectedConcept.visual_style.slice(0, 100),
          confidence: 0.75,
          source: "selection_pattern",
          evidence_notes: `User selected concept "${selectedConcept.label}"`,
        },
        {
          preference_key: "composition",
          preference_value: selectedConcept.composition.slice(0, 100),
          confidence: 0.75,
          source: "selection_pattern",
          evidence_notes: `User preferred composition: ${selectedConcept.composition}`,
        },
      ];

      // 1. Insert evidence rows if brandId exists
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

        // 2. Fetch current brand profile & update learned_preferences JSON
        const { data: brandData } = await supabase
          .from("brands")
          .select("*")
          .eq("id", brandId)
          .single();

        if (brandData) {
          const brand = BrandProfileSchema.parse(brandData);

          const updatedPreferences = {
            ...brand.learned_preferences,
            preferred_visual_styles: [
              ...brand.learned_preferences.preferred_visual_styles,
              {
                value: selectedConcept.visual_style,
                confidence: 0.8,
                evidence_count: (brand.learned_preferences.preferred_visual_styles.length || 0) + 1,
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
}
