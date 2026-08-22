import { embed } from "ai";
import { getEmbeddingModel } from "@/lib/ai-model";
import { createAdminClient } from "@/lib/supabase/admin";
import { KnowledgeBaseService, KBModule } from "./kb-loader";

export interface DesignKnowledgeItem {
  id?: string;
  theme_name: string;
  category: "aesthetic" | "composition" | "color_harmony" | "typography";
  description: string;
  prompt_keywords: string;
  composition_rules: {
    visual_hierarchy: string;
    text_placement: string;
    lighting_and_materials: string;
    recommended_color_palette: string[];
    typography_rules: string;
  };
  kbModule?: KBModule;
}

export class DesignKnowledgeService {
  /**
   * Performs hybrid search across the Knowledge Base (documents/kb) and Supabase pgvector.
   * Returns rich, structured design knowledge for any topic or campaign intent.
   */
  static async searchKnowledge(
    query: string,
    limit = 3,
    filter?: { pillar?: string; theme?: string; placement?: string }
  ): Promise<DesignKnowledgeItem[]> {
    // 1. First, retrieve structured modules from the local documents/kb knowledge base
    const localModules = KnowledgeBaseService.retrieveContext({
      query,
      pillar: filter?.pillar,
      theme: filter?.theme,
      placement: filter?.placement || "feed-single",
      limit,
    });

    if (localModules.length > 0) {
      return localModules.map((mod) => ({
        theme_name: mod.theme_name || mod.title,
        category: (mod.tag === "theme-library" ? "aesthetic" : mod.tag === "layout-patterns" ? "composition" : "aesthetic") as any,
        description: mod.content.slice(0, 300) + "...",
        prompt_keywords: (mod.mood?.join(", ") || "") + ", " + mod.title,
        composition_rules: {
          visual_hierarchy: mod.content.includes("## Composition guidance")
            ? mod.content.split("## Composition guidance")[1]?.split("##")[0]?.trim() || "Single clear focal point"
            : "Single clear focal point, center-weighted or rule-of-thirds",
          text_placement: "Respect 8% safe zones, center or bottom-third hook",
          lighting_and_materials: mod.content.includes("## Visual DNA")
            ? mod.content.split("## Visual DNA")[1]?.split("##")[0]?.trim() || "Natural studio lighting"
            : "High-contrast editorial lighting",
          recommended_color_palette: ["#141413", "#FAF9F5", "#D97757"],
          typography_rules: mod.content.includes("## Typography direction")
            ? mod.content.split("## Typography direction")[1]?.split("##")[0]?.trim() || "Bold geometric sans"
            : "Bold display font with generous letter-spacing",
        },
        kbModule: mod,
      }));
    }

    // 2. Vector search on Supabase `design_knowledge` if needed
    try {
      const embeddingModel = getEmbeddingModel();
      const { embedding } = await embed({
        model: embeddingModel,
        value: query,
      });

      const supabase = createAdminClient();
      const { data, error } = await supabase.rpc("match_design_knowledge", {
        query_embedding: embedding,
        match_threshold: 0.25,
        match_count: limit,
      });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          theme_name: item.theme_name,
          category: item.category,
          description: item.description,
          prompt_keywords: item.prompt_keywords,
          composition_rules: item.composition_rules,
        }));
      }
    } catch {
      // ignore
    }

    return [];
  }

  /**
   * Seeds the Supabase database with all Knowledge Base modules and computes vector embeddings.
   */
  static async seedKnowledgeBase(): Promise<number> {
    try {
      const supabase = createAdminClient();
      const modules = KnowledgeBaseService.getAllModules();
      const embeddingModel = getEmbeddingModel();

      let insertedCount = 0;
      for (const mod of modules) {
        let embeddingVector: number[] | undefined = undefined;
        try {
          const textToEmbed = `${mod.theme_name || mod.title}: ${mod.content.slice(0, 800)}`;
          const { embedding } = await embed({
            model: embeddingModel,
            value: textToEmbed,
          });
          embeddingVector = embedding;
        } catch (embErr) {
          console.warn(`Could not compute embedding for module "${mod.title}":`, embErr);
        }

        const { error } = await supabase.from("design_knowledge").upsert(
          {
            theme_name: mod.theme_name || mod.title,
            category: mod.tag,
            description: mod.content,
            prompt_keywords: mod.mood?.join(", ") || mod.tag,
            composition_rules: {
              raw_markdown: mod.rawMarkdown,
              frontmatter: mod.frontmatter,
            } as any,
            ...(embeddingVector ? { embedding: embeddingVector } : {}),
          },
          { onConflict: "theme_name" }
        );

        if (!error) insertedCount++;
      }

      return insertedCount;
    } catch (err) {
      console.error("Failed to seed design knowledge:", err);
      return 0;
    }
  }
}
