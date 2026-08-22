import { BrandBrainService } from "@/services/brand-brain";
import { DesignKnowledgeService } from "@/services/design-knowledge";
import { ImageGenerationService } from "@/services/image-generation";
import { SatoriCompositorService } from "@/services/satori-compositor";
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
    onProgress?: (step: number, totalSteps: number, summary: string, status: "active" | "success" | "error") => Promise<void>
  ): Promise<CampaignWorkflowOutput> {
    const logger = new ExecutionLogger();
    const campaignId = `camp_${Date.now()}`;

    // Step 0: Brand DNA Loading & Intent Parsing
    if (onProgress) {
      await onProgress(0, 6, "Loading Brand DNA & Analyzing Intent (Groq Llama 3.3)...", "active");
    }
    const brand = await BrandBrainService.getBrandById(brandId);
    const intentStart = Date.now();
    const intent = await IntentAgent.parseIntent(prompt, brand, platform);
    logger.log({
      agent: "IntentAgent",
      provider: "Groq",
      model: "llama-3.3-70b-versatile",
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
    const ragStart = Date.now();
    const designThemes = await DesignKnowledgeService.searchKnowledge(prompt, 2);
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
      durationMs: Date.now() - ragStart,
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
      summary: `Formulated Concept A ("${brief.concept_a.creative_direction}") & Concept B ("${brief.concept_b.creative_direction}")`,
    });
    if (onProgress) {
      await onProgress(2, 6, "A/B creative directions formulated.", "success");
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
      provider: "Groq",
      model: "llama-3.3-70b-versatile",
      status: "success",
      durationMs: Date.now() - dslStart,
      summary: `Compiled layout trees: Concept A (${dslSpecA.archetype}) & Concept B (${dslSpecB.archetype})`,
    });
    if (onProgress) {
      await onProgress(3, 6, "Layout DSL compiled with brand design tokens.", "success");
    }

    // Step 4: FLUX Generation & Satori Compositing
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

    brief.concept_a.image_url = compositeA;
    brief.concept_b.image_url = compositeB;

    logger.log({
      agent: "SatoriCompositorService",
      provider: "Cloudflare FLUX + Satori / Resvg",
      model: "satori-resvg-canvas",
      status: "success",
      durationMs: Date.now() - renderStart,
      summary: "Composited Canva-grade 1080×1350 artwork with pixel-perfect typography.",
    });
    if (onProgress) {
      await onProgress(4, 6, "High-DPI 1080×1350 composite renders complete.", "success");
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
      provider: "Groq",
      model: "llama-3.3-70b-versatile",
      status: "success",
      durationMs: Date.now() - criticStart,
      summary: `Scores: Concept A (${critiqueA.brand_alignment_score}/100) | Concept B (${critiqueB.brand_alignment_score}/100)`,
    });
    if (onProgress) {
      await onProgress(5, 6, "Brand compliance and quality audit complete.", "success");
    }

    // Persist to Supabase asynchronously (if configured)
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
      }
    } catch (dbErr) {
      console.warn("Supabase campaign persistence skipped:", dbErr);
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
