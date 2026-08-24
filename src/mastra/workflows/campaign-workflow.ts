import { BrandBrainService } from "@/services/brand-brain";
import { DesignKnowledgeService } from "@/services/design-knowledge";
import { ImageGenerationService } from "@/services/image-generation";
import { SatoriCompositorService } from "@/services/satori-compositor";
import { StorageService } from "@/services/storage";
import { ExecutionLogger } from "@/services/telemetry";
import { IntentAgent } from "../agents/intent-agent";
import { CreativeDirectorAgent } from "../agents/creative-director-agent";
import { LayoutPlannerAgent } from "../agents/layout-planner-agent";
import { CriticAgent } from "../agents/critic-agent";
import { CreativeBrief, ConceptItem, UserIntent, ResearchContext } from "@/lib/schema/campaign";
import { CriticResult } from "@/lib/schema/critic";
import { createAdminClient } from "@/lib/supabase/admin";

export interface CampaignWorkflowOutput {
  campaignId: string;
  intent: UserIntent;
  research: ResearchContext;
  brief: CreativeBrief;
  conceptA: ConceptItem;
  conceptB: ConceptItem;
  critiqueA: CriticResult;
  critiqueB: CriticResult;
  logs: any[];
}

export class CampaignWorkflow {
  /**
   * Executes the full 6-step DAG pipeline with real-time progress callbacks for SSE streaming.
   */
  static async execute(
    prompt: string,
    brandId?: string,
    platform: "instagram" | "linkedin" = "instagram",
    onProgress?: (step: number, totalSteps: number, summary: string, status: "active" | "success" | "error", data?: any) => Promise<void>
  ): Promise<CampaignWorkflowOutput> {
    const logger = new ExecutionLogger();
    const campaignId = `camp_${Date.now()}`;

    // Step 0: Brand DNA Loading & Intent Parsing (Parallel RAG initialization)
    if (onProgress) {
      await onProgress(0, 6, "Loading Brand DNA & Analyzing Intent (Gemini Flash)...", "active");
    }
    const brand = await BrandBrainService.getBrandById(brandId);
    
    const intentStart = Date.now();
    const [intent, designThemes] = await Promise.all([
      IntentAgent.parseIntent(prompt, brand, platform),
      DesignKnowledgeService.searchKnowledge(prompt, 2),
    ]);

    logger.log({
      agent: "IntentAgent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - intentStart,
      summary: `Parsed intent: Event "${intent.event}", Objective: "${intent.objective}"`,
    });

    if (onProgress) {
      await onProgress(0, 6, `Brand DNA Loaded: "${brand.name}". Intent parsed.`, "success");
    }

    // Step 1: Design Knowledge & Visual Trends
    if (onProgress) {
      await onProgress(1, 6, "Retrieving Visual Trends & Design Knowledge (pgvector)...", "active");
    }
    const research: ResearchContext = {
      search_queries: [prompt, `${brand.industry} ${platform} trend 2026`],
      key_trends: designThemes.map((t) => t.theme_name),
      visual_motifs: designThemes.map((t) => t.prompt_keywords),
      overused_patterns_to_avoid: ["Generic 3D spheres", "Stock handshake", "Cliché gradients"],
      summary: `Identified ${designThemes.length} design themes matching brand positioning.`,
    };
    logger.log({
      agent: "DesignKnowledgeService",
      provider: "Supabase Vector / RAG",
      model: "text-embedding-004",
      status: "success",
      durationMs: 50,
      summary: `Synthesized design themes: ${designThemes.map((t) => t.theme_name).join(", ")}`,
    });
    if (onProgress) {
      await onProgress(1, 6, "Design trends & visual motifs retrieved.", "success");
    }

    // Step 2: Creative Direction & A/B Concept Formulation
    if (onProgress) {
      await onProgress(2, 6, "Formulating Differentiated A/B Creative Directions (Gemini Flash)...", "active");
    }
    const cdStart = Date.now();
    const brief = await CreativeDirectorAgent.formulateConcepts(prompt, intent, brand, platform);
    logger.log({
      agent: "CreativeDirectorAgent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - cdStart,
      summary: `Formulated Concept A ("${brief.concept_a.creative_direction.slice(0, 60)}...") & Concept B ("${brief.concept_b.creative_direction.slice(0, 60)}...")`,
    });
    
    // Stream intermediate brief data so the UI can render the concept skeletons and start the animation immediately
    if (onProgress) {
      await onProgress(2, 6, "A/B creative directions formulated.", "success", { brief });
    }

    // Step 3: Semantic Layout DSL Compilation
    if (onProgress) {
      await onProgress(3, 6, "Compiling Semantic Layout DSL Specifications...", "active");
    }
    const dslStart = Date.now();
    const [dslSpecA, dslSpecB] = await Promise.all([
      LayoutPlannerAgent.compileLayout(brief.concept_a, brand, platform),
      LayoutPlannerAgent.compileLayout(brief.concept_b, brand, platform),
    ]);
    brief.concept_a.dsl_spec = dslSpecA;
    brief.concept_b.dsl_spec = dslSpecB;
    logger.log({
      agent: "LayoutPlannerAgent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - dslStart,
      summary: `Compiled layout trees: Concept A (${dslSpecA.archetype}) & Concept B (${dslSpecB.archetype})`,
    });
    if (onProgress) {
      await onProgress(3, 6, "Layout DSL compiled with brand design tokens.", "success");
    }

    // Step 4: FLUX Generation, Satori Compositing & Supabase Storage Persistence
    if (onProgress) {
      await onProgress(4, 6, "Generating Background Imagery (FLUX) & Compositing Typography (Satori)...", "active");
    }
    const renderStart = Date.now();
    const [bgImageA, bgImageB] = await Promise.all([
      ImageGenerationService.generatePostImage(dslSpecA.photoPrompt || brief.concept_a.image_prompt),
      ImageGenerationService.generatePostImage(dslSpecB.photoPrompt || brief.concept_b.image_prompt),
    ]);

    const [compositeA, compositeB] = await Promise.all([
      SatoriCompositorService.compositePost(dslSpecA, bgImageA.url),
      SatoriCompositorService.compositePost(dslSpecB, bgImageB.url),
    ]);

    // Persist generated artwork to Supabase Storage (clean CDN HTTPS URLs)
    const [uploadedUrlA, uploadedUrlB] = await Promise.all([
      StorageService.uploadImage(compositeA, `${campaignId}_concept_a.png`, "image/png"),
      StorageService.uploadImage(compositeB, `${campaignId}_concept_b.png`, "image/png"),
    ]);

    brief.concept_a.image_url = uploadedUrlA;
    brief.concept_b.image_url = uploadedUrlB;

    logger.log({
      agent: "SatoriCompositorService",
      provider: "Cloudflare FLUX + Satori / Resvg + Supabase Storage",
      model: "satori-resvg-canvas",
      status: "success",
      durationMs: Date.now() - renderStart,
      summary: "Composited Canva-grade 1080×1350 artwork and stored durably in Supabase Storage.",
    });
    if (onProgress) {
      await onProgress(4, 6, "High-DPI 1080×1350 composite renders saved to Supabase Storage.", "success", {
        imageUrlA: uploadedUrlA,
        imageUrlB: uploadedUrlB,
      });
    }

    // Step 5: Critic Agent 100-Point Audit
    if (onProgress) {
      await onProgress(5, 6, "Auditing Brand Guardrails & Quality (100-pt Rubric)...", "active");
    }
    const criticStart = Date.now();
    const [critiqueA, critiqueB] = await Promise.all([
      CriticAgent.evaluateConcept(brief.concept_a, brand, platform),
      CriticAgent.evaluateConcept(brief.concept_b, brand, platform),
    ]);
    logger.log({
      agent: "CriticAgent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - criticStart,
      summary: `Scores: Concept A (${critiqueA.brand_alignment_score}/100) | Concept B (${critiqueB.brand_alignment_score}/100)`,
    });
    if (onProgress) {
      await onProgress(5, 6, "Brand compliance and quality audit complete.", "success");
    }

    // Persist full campaign to Supabase DB asynchronously
    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from("campaigns").insert({
          id: campaignId,
          brand_id: brand.id,
          campaign_title: brief.campaign_title || prompt,
          topic: prompt,
          platform,
          intent,
          research,
          concept_a: brief.concept_a,
          concept_b: brief.concept_b,
          critique_a: critiqueA,
          critique_b: critiqueB,
        });

        // Insert individual post rows so users can query their gallery anytime
        await supabase.from("posts").insert([
          {
            brand_id: brand.id,
            campaign_id: campaignId,
            caption: brief.concept_a.caption_instagram,
            image_url: brief.concept_a.image_url,
            platform,
            status: "draft",
            metadata: {
              concept_label: brief.concept_a.label,
              score: critiqueA.brand_alignment_score,
            },
          },
          {
            brand_id: brand.id,
            campaign_id: campaignId,
            caption: brief.concept_b.caption_instagram,
            image_url: brief.concept_b.image_url,
            platform,
            status: "draft",
            metadata: {
              concept_label: brief.concept_b.label,
              score: critiqueB.brand_alignment_score,
            },
          },
        ]);
      }
    } catch (dbErr) {
      console.warn("Supabase campaign persistence notice:", dbErr);
    }

    return {
      campaignId,
      intent,
      research,
      brief,
      conceptA: brief.concept_a,
      conceptB: brief.concept_b,
      critiqueA,
      critiqueB,
      logs: logger.getLogs(),
    };
  }
}
