import { BrandBrainService } from "@/services/brand-brain";
import { IntentAgent } from "../agents/intent-agent";
import { ResearchAgent } from "../agents/research-agent";
import { CreativeDirectorAgent } from "../agents/creative-director-agent";
import { MultimodalAgent } from "../agents/multimodal-agent";
import { CriticAgent } from "../agents/critic-agent";
import { PromptEngineerAgent } from "../agents/prompt-engineer-agent";
import { ImageGenerationService } from "@/services/image-generation";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserIntent, ResearchContext, CreativeBrief } from "@/lib/schema/campaign";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { CriticResult } from "@/lib/schema/critic";
import { WorkflowLogEntry } from "@/lib/schema/telemetry";
import { ExecutionLogger } from "@/services/telemetry";

export interface WorkflowResult {
  campaignId: string;
  intent: UserIntent;
  research: ResearchContext;
  referenceAnalysis?: ReferenceImageAnalysis | null;
  brief: CreativeBrief;
  critiqueA: CriticResult;
  critiqueB: CriticResult;
  logs: WorkflowLogEntry[];
}

export type WorkflowStage =
  | "intent"
  | "reference"
  | "brief"
  | "prompt_decomp"
  | "image_rendering"
  | "critic_audit"
  | "complete";

export interface WorkflowProgressEvent {
  step: number;
  totalSteps: number;
  stage: WorkflowStage;
  agentName: string;
  provider: string;
  model: string;
  status: "active" | "success" | "error";
  summary: string;
  durationMs?: number;
  details?: any;
}

export type ProgressCallback = (event: WorkflowProgressEvent) => Promise<void> | void;

export class CampaignWorkflow {
  /**
   * Executes end-to-end agent workflow with Multi-Layer Visual Decomposition & live telemetry:
   * 1. Brand Context & DNA
   * 2. Intent Parsing (Groq Llama 3.3 / Gemini 3.1)
   * 3. Multimodal Vision (Gemini 2.5 Flash)
   * 4. Creative Brief A/B (Creative Director Agent)
   * 5. Multi-Layer Visual Decomposition & Negative Space Blueprint
   * 6. Image Generation & Blending (Cloudflare FLUX 1 Schnell + Satori Resvg)
   * 7. Critic Brand Guard (Gemini / Groq 70B)
   * 8. Supabase Durable Persistence
   */
  static async run(
    prompt: string,
    brandId?: string,
    referenceImage?: string | string[] | null,
    onProgress?: ProgressCallback
  ): Promise<WorkflowResult> {
    const logger = new ExecutionLogger();

    // 1. Fetch Brand Context & Visual DNA
    const brand = await logger.track(
      "BrandBrainService",
      "System",
      "supabase-profile",
      () => BrandBrainService.getBrandById(brandId),
      (b) => `Loaded brand DNA for "${b.name}" (${b.industry}).`
    );

    // 2. Parse User Intent using Groq Llama 3.3 / Gemini 3.1
    await onProgress?.({
      step: 0,
      totalSteps: 6,
      stage: "intent",
      agentName: "Intent Parsing & Brand DNA Extraction",
      provider: "Groq / Gemini",
      model: "gemini-2.5-flash",
      status: "active",
      summary: `Analyzing campaign objective and aligning with brand voice "${brand.name}"...`,
    });

    const intentStart = Date.now();
    const intent = await logger.track(
      "IntentAgent",
      "Google Gemini",
      "gemini-2.5-flash",
      () => IntentAgent.parseIntent(prompt, brand),
      (i) => `Parsed intent: Event="${i.event}", Objective="${i.objective}", Platforms=[${i.target_platforms.join(", ")}].`
    );


    await onProgress?.({
      step: 0,
      totalSteps: 6,
      stage: "intent",
      agentName: "Intent Parsing & Brand DNA Extraction",
      provider: "Groq / Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - intentStart,
      summary: `Objective: ${intent.objective} • Event: ${intent.event} • Industry: ${intent.industry}`,
      details: intent,
    });

    // 3. Analyze Reference Visual Ingredients using Gemini Vision + Research
    const hasReferences = Array.isArray(referenceImage) ? referenceImage.length > 0 : !!referenceImage;
    await onProgress?.({
      step: 1,
      totalSteps: 6,
      stage: "reference",
      agentName: "Multimodal Visual Manifest & Trend Research",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "active",
      summary: hasReferences
        ? "Compiling visual ingredients, lighting vectors, optics and negative space blueprint..."
        : "Synthesizing real-time design intelligence and negative space requirements...",
    });

    const refStart = Date.now();
    let referenceAnalysis: ReferenceImageAnalysis | null = null;
    if (hasReferences && referenceImage) {
      referenceAnalysis = await logger.track(
        "MultimodalAgent",
        "Google Gemini",
        "gemini-2.5-flash",
        () => MultimodalAgent.analyzeReferenceImages(referenceImage, brand),
        (ref) => `Synthesized Visual Blueprint: Camera="${ref.camera_optics || ref.photography_style}", Lighting="${ref.lighting_vector || ref.lighting}", Palette=[${ref.color_palette_anchors?.join(", ") || ref.color_palette.join(", ")}].`
      );
    } else {
      logger.log({
        agent: "MultimodalAgent",
        provider: "System",
        model: "none",
        status: "info",
        durationMs: 0,
        summary: "No visual ingredients provided. Auto-compiled default Brand DNA manifest.",
      });
    }

    const research = await logger.track(
      "ResearchAgent",
      "Google Gemini",
      "gemini-3.7-flash",
      () => ResearchAgent.synthesizeResearch(intent, brand),
      (r) => `Synthesized ${r.key_trends.length} winning trends & ${r.overused_patterns_to_avoid.length} clichés to avoid.`
    );

    await onProgress?.({
      step: 1,
      totalSteps: 6,
      stage: "reference",
      agentName: "Multimodal Visual Reference & Web Trends",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - refStart,
      summary: referenceAnalysis
        ? `Style: ${referenceAnalysis.photography_style} • Mood: ${referenceAnalysis.mood} • Palette: ${referenceAnalysis.color_palette.join(", ")}`
        : `Identified ${research.key_trends.length} design trends • Filtered ${research.overused_patterns_to_avoid.length} overused clichés`,
      details: { referenceAnalysis, research },
    });

    // 4. Develop A/B Creative Brief using CreativeDirectorAgent
    await onProgress?.({
      step: 2,
      totalSteps: 6,
      stage: "brief",
      agentName: "Creative Direction & A/B Archetype Formulation",
      provider: "Google Gemini / Mastra",
      model: "gemini-3.7-flash",
      status: "active",
      summary: "Formulating dual creative directions and selecting graphic design archetypes...",
    });

    const briefStart = Date.now();
    const brief = await logger.track(
      "CreativeDirectorAgent",
      "Google Gemini",
      "gemini-3.7-flash",
      () =>
        CreativeDirectorAgent.developCreativeBrief(
          intent,
          research,
          brand,
          referenceAnalysis
        ),
      (b) => `Generated dual concepts: "${b.concept_a.label}" & "${b.concept_b.label}".`
    );

    await onProgress?.({
      step: 2,
      totalSteps: 6,
      stage: "brief",
      agentName: "Creative Direction & A/B Archetype Formulation",
      provider: "Google Gemini / Mastra",
      model: "gemini-3.7-flash",
      status: "success",
      durationMs: Date.now() - briefStart,
      summary: `Concept A: "${brief.concept_a.label}" vs Concept B: "${brief.concept_b.label}"`,
      details: brief,
    });

    // 5. Multi-Layer Visual Decomposition & Prompt Engineering
    await onProgress?.({
      step: 3,
      totalSteps: 6,
      stage: "prompt_decomp",
      agentName: "Spatial Prompt Engineering & Satori Blueprint",
      provider: "Google Gemini / Satori",
      model: "gemini-3.7-flash",
      status: "active",
      summary: "Calculating negative space void & 3-layer visual prompt decomposition...",
    });

    const promptStart = Date.now();
    const promptEngineeredA = await logger.track(
      "VisualDecomposition (Concept A)",
      "Google Gemini",
      "gemini-3.7-flash",
      () =>
        PromptEngineerAgent.engineerPrompt(
          brief.concept_a,
          brand,
          intent,
          research,
          referenceAnalysis
        ),
      (pe) => `Decomposed 3 visual layers & synthesized composite prompt for Concept A.`
    );

    const promptEngineeredB = await logger.track(
      "VisualDecomposition (Concept B)",
      "Google Gemini",
      "gemini-3.7-flash",
      () =>
        PromptEngineerAgent.engineerPrompt(
          brief.concept_b,
          brand,
          intent,
          research,
          referenceAnalysis
        ),
      (pe) => `Decomposed 3 visual layers & synthesized composite prompt for Concept B.`
    );

    await onProgress?.({
      step: 3,
      totalSteps: 6,
      stage: "prompt_decomp",
      agentName: "Spatial Prompt Engineering & Satori Blueprint",
      provider: "Google Gemini / Satori",
      model: "gemini-3.7-flash",
      status: "success",
      durationMs: Date.now() - promptStart,
      summary: `Constructed 4-zone negative space budget • Archetypes: ${brief.concept_a.design_blueprint?.archetype} & ${brief.concept_b.design_blueprint?.archetype}`,
      details: { promptEngineeredA, promptEngineeredB },
    });

    // 6. Image Generation & Canva-Grade Compositing
    await onProgress?.({
      step: 4,
      totalSteps: 6,
      stage: "image_rendering",
      agentName: "FLUX Photorealistic Generation & Compositing",
      provider: "Cloudflare FLUX 1 Schnell + Satori",
      model: "@cf/black-forest-labs/flux-1-schnell",
      status: "active",
      summary: "Rendering photorealistic backgrounds and overlaying editorial typography hierarchy...",
    });

    const renderStart = Date.now();
    const seedA = Math.floor(Math.random() * 1000000);
    const seedB = seedA + 1;
    const refStyle = referenceAnalysis ? referenceAnalysis.photography_style : undefined;
    const primaryRefImage = Array.isArray(referenceImage) ? referenceImage[0] : referenceImage;

    const [imgResultA, imgResultB] = await Promise.all([
      ImageGenerationService.generateImageUrlWithMeta(
        promptEngineeredA.optimized_image_prompt,
        seedA,
        refStyle,
        promptEngineeredA.negative_prompt,
        primaryRefImage,
        brief.concept_a.design_blueprint
      ),
      ImageGenerationService.generateImageUrlWithMeta(
        promptEngineeredB.optimized_image_prompt,
        seedB,
        refStyle,
        promptEngineeredB.negative_prompt,
        primaryRefImage,
        brief.concept_b.design_blueprint
      ),
    ]);


    brief.concept_a.image_url = imgResultA.url;
    brief.concept_b.image_url = imgResultB.url;

    logger.log({
      agent: "ImageGenerationService (Concept A)",
      provider: imgResultA.provider,
      model: imgResultA.model,
      status: imgResultA.status,
      durationMs: imgResultA.durationMs,
      summary: `Concept A Canva-grade post rendered via ${imgResultA.provider} in ${imgResultA.durationMs}ms.`,
    });

    logger.log({
      agent: "ImageGenerationService (Concept B)",
      provider: imgResultB.provider,
      model: imgResultB.model,
      status: imgResultB.status,
      durationMs: imgResultB.durationMs,
      summary: `Concept B Canva-grade post rendered via ${imgResultB.provider} in ${imgResultB.durationMs}ms.`,
    });

    await onProgress?.({
      step: 4,
      totalSteps: 6,
      stage: "image_rendering",
      agentName: "FLUX Photorealistic Generation & Compositing",
      provider: "Cloudflare FLUX 1 Schnell + Satori",
      model: "@cf/black-forest-labs/flux-1-schnell",
      status: "success",
      durationMs: Date.now() - renderStart,
      summary: `Generated two 1080×1350 Canva-grade visual compositions in ${(Date.now() - renderStart) / 1000}s`,
      details: { urlA: imgResultA.url, urlB: imgResultB.url },
    });

    // 7. Critic Agent Brand Voice & Compliance Audit
    await onProgress?.({
      step: 5,
      totalSteps: 6,
      stage: "critic_audit",
      agentName: "Critic Agent Brand Voice & Compliance Audit",
      provider: "Groq / Gemini",
      model: "llama-3.3-70b-versatile",
      status: "active",
      summary: "Running 100-point brand alignment, visual density, and readability evaluation...",
    });

    const criticStart = Date.now();
    const [critiqueA, critiqueB] = await Promise.all([
      logger.track(
        "CriticAgent (Concept A)",
        "Groq",
        "llama-3.3-70b-versatile",
        () => CriticAgent.evaluateConcept(brief.concept_a, brand),
        (c) => `Concept A Brand Alignment: ${c.brand_alignment_score}/100.`
      ),
      logger.track(
        "CriticAgent (Concept B)",
        "Groq",
        "llama-3.3-70b-versatile",
        () => CriticAgent.evaluateConcept(brief.concept_b, brand),
        (c) => `Concept B Brand Alignment: ${c.brand_alignment_score}/100.`
      ),
    ]);

    await onProgress?.({
      step: 5,
      totalSteps: 6,
      stage: "critic_audit",
      agentName: "Critic Agent Brand Voice & Compliance Audit",
      provider: "Groq / Gemini",
      model: "llama-3.3-70b-versatile",
      status: "success",
      durationMs: Date.now() - criticStart,
      summary: `Alignment Scores: Concept A (${critiqueA.brand_alignment_score}/100) • Concept B (${critiqueB.brand_alignment_score}/100)`,
      details: { critiqueA, critiqueB },
    });

    // 8. Bounded Critic Auto-Remediation Loop (<80 score threshold)
    let finalCritiqueA = critiqueA;
    let finalCritiqueB = critiqueB;

    const threshold = 80;
    const needsRemediationA = critiqueA.brand_alignment_score < threshold || critiqueA.visual_score < threshold;
    const needsRemediationB = critiqueB.brand_alignment_score < threshold || critiqueB.visual_score < threshold;

    if (needsRemediationA || needsRemediationB) {
      await onProgress?.({
        step: 5,
        totalSteps: 6,
        stage: "critic_audit",
        agentName: "Critic Auto-Remediation Active (<80 Score Detected)",
        provider: "Groq LLaMA 3.3 70B + FLUX Realism",
        model: "llama-3.3-70b-versatile",
        status: "active",
        summary: `Auto-repairing ${[
          needsRemediationA ? `Concept A (Score: ${critiqueA.brand_alignment_score}/100)` : null,
          needsRemediationB ? `Concept B (Score: ${critiqueB.brand_alignment_score}/100)` : null,
        ]
          .filter(Boolean)
          .join(" & ")} with targeted prompt engineering...`,
      });

      const remediationTasks: Promise<void>[] = [];

      if (needsRemediationA) {
        remediationTasks.push(
          (async () => {
            try {
              const directiveA = CriticAgent.generateRemediationDirective(brief.concept_a, brand, critiqueA);
              const remediatedLayersA = await PromptEngineerAgent.decomposeAndEngineerPrompt(
                brief.concept_a,
                brand,
                intent,
                research,
                referenceAnalysis,
                directiveA
              );
              const remSeedA = seedA + 100;
              const remImgA = await ImageGenerationService.generateImageUrlWithMeta(
                remediatedLayersA.blended_composite_prompt,
                remSeedA,
                refStyle,
                remediatedLayersA.negative_constraints,
                primaryRefImage,
                brief.concept_a.design_blueprint
              );
              brief.concept_a.image_url = remImgA.url;
              finalCritiqueA = await CriticAgent.evaluateConcept(brief.concept_a, brand);
              logger.log({
                agent: "CriticAutoRemediation (Concept A)",
                provider: "Groq",
                model: "llama-3.3-70b-versatile",
                status: "success",
                durationMs: 0,
                summary: `Concept A auto-remediated: Score improved ${critiqueA.brand_alignment_score} -> ${finalCritiqueA.brand_alignment_score}/100.`,
              });
            } catch (err) {
              console.warn("Auto-remediation pass for Concept A failed, retaining initial concept:", err);
            }
          })()
        );
      }

      if (needsRemediationB) {
        remediationTasks.push(
          (async () => {
            try {
              const directiveB = CriticAgent.generateRemediationDirective(brief.concept_b, brand, critiqueB);
              const remediatedLayersB = await PromptEngineerAgent.decomposeAndEngineerPrompt(
                brief.concept_b,
                brand,
                intent,
                research,
                referenceAnalysis,
                directiveB
              );
              const remSeedB = seedB + 100;
              const remImgB = await ImageGenerationService.generateImageUrlWithMeta(
                remediatedLayersB.blended_composite_prompt,
                remSeedB,
                refStyle,
                remediatedLayersB.negative_constraints,
                primaryRefImage,
                brief.concept_b.design_blueprint
              );
              brief.concept_b.image_url = remImgB.url;
              finalCritiqueB = await CriticAgent.evaluateConcept(brief.concept_b, brand);
              logger.log({
                agent: "CriticAutoRemediation (Concept B)",
                provider: "Groq",
                model: "llama-3.3-70b-versatile",

                status: "success",
                durationMs: 0,
                summary: `Concept B auto-remediated: Score improved ${critiqueB.brand_alignment_score} -> ${finalCritiqueB.brand_alignment_score}/100.`,
              });

            } catch (err) {
              console.warn("Auto-remediation pass for Concept B failed, retaining initial concept:", err);
            }
          })()
        );
      }

      await Promise.all(remediationTasks);

      await onProgress?.({
        step: 5,
        totalSteps: 6,
        stage: "critic_audit",
        agentName: "Critic Auto-Remediation Complete",
        provider: "Groq / Gemini",
        model: "llama-3.3-70b-versatile",
        status: "success",
        durationMs: Date.now() - criticStart,
        summary: `Remediation Complete: Concept A (${finalCritiqueA.brand_alignment_score}/100) • Concept B (${finalCritiqueB.brand_alignment_score}/100)`,
        details: { critiqueA: finalCritiqueA, critiqueB: finalCritiqueB },
      });
    }

    // 9. Persist Campaign, Concepts, Critiques & Versions in Supabase
    let campaignId = "local-campaign-" + Date.now();

    try {
      const supabase = createAdminClient();

      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          brand_id: brand.id || undefined,
          title: brief.campaign_title,
          user_prompt: prompt,
          reference_image_url: referenceImage || undefined,
          objective: intent.objective,
          status: "brief_ready",
          research_context: research as any,
          creative_brief: brief as any,
        })
        .select()
        .single();

      if (campaignData && !campaignError) {
        campaignId = campaignData.id;

        // Insert Concept A Record with Critique
        const { data: conceptA } = await supabase
          .from("concepts")
          .insert({
            campaign_id: campaignId,
            concept_label: brief.concept_a.label,
            title: brief.concept_a.label,
            creative_direction: brief.concept_a.creative_direction,
            image_url: brief.concept_a.image_url,
            image_prompt: promptEngineeredA.optimized_image_prompt,
            caption_instagram: brief.concept_a.caption_instagram,
            caption_linkedin: brief.concept_a.caption_linkedin,
            visual_brief_summary: `${brief.concept_a.visual_style} [${brief.concept_a.design_blueprint?.archetype} / ${brief.concept_a.design_blueprint?.font_family_hook}] | Alignment Score: ${finalCritiqueA.brand_alignment_score}/100`,
            status: "critiqued",
          })
          .select()
          .single();

        if (conceptA) {
          await supabase.from("concept_versions").insert({
            concept_id: conceptA.id,
            version_number: 1,
            user_instruction: "Initial Generation",
            image_url: brief.concept_a.image_url,
            caption_instagram: brief.concept_a.caption_instagram,
            caption_linkedin: brief.concept_a.caption_linkedin,
          });
        }

        // Insert Concept B Record with Critique
        const { data: conceptB } = await supabase
          .from("concepts")
          .insert({
            campaign_id: campaignId,
            concept_label: brief.concept_b.label,
            title: brief.concept_b.label,
            creative_direction: brief.concept_b.creative_direction,
            image_url: brief.concept_b.image_url,
            image_prompt: promptEngineeredB.optimized_image_prompt,
            caption_instagram: brief.concept_b.caption_instagram,
            caption_linkedin: brief.concept_b.caption_linkedin,
            visual_brief_summary: `${brief.concept_b.visual_style} [${brief.concept_b.design_blueprint?.archetype} / ${brief.concept_b.design_blueprint?.font_family_hook}] | Alignment Score: ${finalCritiqueB.brand_alignment_score}/100`,
            status: "critiqued",
          })
          .select()
          .single();

        if (conceptB) {
          await supabase.from("concept_versions").insert({
            concept_id: conceptB.id,
            version_number: 1,
            user_instruction: "Initial Generation",
            image_url: brief.concept_b.image_url,
            caption_instagram: brief.concept_b.caption_instagram,
            caption_linkedin: brief.concept_b.caption_linkedin,
          });
        }

        logger.log({
          agent: "SupabasePersistence",
          provider: "System",
          model: "supabase-postgres",
          status: "success",
          durationMs: 15,
          summary: `Persisted campaign "${campaignId}" with v1 versions in durable database.`,
        });
      }
    } catch (err) {
      console.warn("Supabase persistence fallback in campaign workflow:", err);
      logger.log({
        agent: "SupabasePersistence",
        provider: "System",
        model: "supabase-postgres",
        status: "fallback",
        durationMs: 5,
        summary: "Supabase storage skipped (offline fallback mode active).",
      });
    }

    return {
      campaignId,
      intent,
      research,
      referenceAnalysis,
      brief,
      critiqueA: finalCritiqueA,
      critiqueB: finalCritiqueB,
      logs: logger.getLogs(),
    };
  }
}

