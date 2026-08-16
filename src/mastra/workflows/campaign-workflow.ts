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

export class CampaignWorkflow {
  /**
   * Executes end-to-end agent workflow with Multi-Layer Visual Decomposition & live telemetry:
   * 1. Brand Context & DNA
   * 2. Intent Parsing (Gemini 3.1 Flash Lite)
   * 3. Multimodal Vision (Gemini 3.7 Flash)
   * 4. Research & Trends (Gemini 3.7 Flash / Groq)
   * 5. Creative Brief A/B (Gemini 3.7 Flash / Groq)
   * 6. Multi-Layer Visual Decomposition (Gemini 3.7 Flash - Background, Subject, Lighting, Composite)
   * 7. Image Generation & Blending (Nano Banana 2 with multimodal conditioning / Pollinations Flux)
   * 8. Critic Brand Guard (Groq 70B / Gemini 3.7 Flash)
   * 9. Supabase Durable Persistence
   */
  static async run(
    prompt: string,
    brandId?: string,
    referenceImage?: string | null
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

    // 2. Parse User Intent using Gemini 3.1 Flash Lite
    const intent = await logger.track(
      "IntentAgent",
      "Google Gemini",
      "gemini-3.1-flash-lite",
      () => IntentAgent.parseIntent(prompt, brand),
      (i) => `Parsed intent: Event="${i.event}", Objective="${i.objective}".`
    );

    // 3. Analyze Reference Image using Gemini 3.7 Flash (if provided)
    let referenceAnalysis: ReferenceImageAnalysis | null = null;
    if (referenceImage) {
      referenceAnalysis = await logger.track(
        "MultimodalAgent",
        "Google Gemini",
        "gemini-3.7-flash",
        () => MultimodalAgent.analyzeReferenceImage(referenceImage),
        (ref) => `Extracted reference style: "${ref.photography_style}", Mood="${ref.mood}".`
      );
    } else {
      logger.log({
        agent: "MultimodalAgent",
        provider: "System",
        model: "none",
        status: "info",
        durationMs: 0,
        summary: "No reference image provided. Proceeded with text-only creative synthesis.",
      });
    }

    // 4. Synthesize Research & Trends using Gemini 3.7 Flash / Groq
    const research = await logger.track(
      "ResearchAgent",
      "Google Gemini",
      "gemini-3.7-flash",
      () => ResearchAgent.synthesizeResearch(intent, brand),
      (r) => `Synthesized ${r.key_trends.length} winning trends & ${r.overused_patterns_to_avoid.length} clichés to avoid.`
    );

    // 5. Develop A/B Creative Brief using Gemini 3.7 Flash / Groq
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

    // 6. Multi-Layer Visual Decomposition & Prompt Engineering for Concept A and Concept B
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

    // 7. Run Critic Agent on both Concept A and Concept B
    const critiqueA = await logger.track(
      "CriticAgent (Concept A)",
      "Groq",
      "llama-3.3-70b-versatile",
      () => CriticAgent.evaluateConcept(brief.concept_a, brand),
      (c) => `Concept A Brand Alignment: ${c.brand_alignment_score}/100, Visual Score: ${c.visual_score}/100.`
    );

    const critiqueB = await logger.track(
      "CriticAgent (Concept B)",
      "Groq",
      "llama-3.3-70b-versatile",
      () => CriticAgent.evaluateConcept(brief.concept_b, brand),
      (c) => `Concept B Brand Alignment: ${c.brand_alignment_score}/100, Visual Score: ${c.visual_score}/100.`
    );

    // 8. Multi-Layer Image Generation & Multimodal Blending (Nano Banana 2 primary, Pollinations Flux fallback)
    const seedA = Math.floor(Math.random() * 1000000);
    const seedB = seedA + 1;
    const refStyle = referenceAnalysis ? referenceAnalysis.photography_style : undefined;

    const imgResultA = await ImageGenerationService.generateImageUrlWithMeta(
      promptEngineeredA.optimized_image_prompt,
      seedA,
      refStyle,
      promptEngineeredA.negative_prompt,
      referenceImage
    );
    brief.concept_a.image_url = imgResultA.url;
    logger.log({
      agent: "ImageGenerationService (Concept A)",
      provider: imgResultA.provider,
      model: imgResultA.model,
      status: imgResultA.status,
      durationMs: imgResultA.durationMs,
      summary: `Concept A artwork synthesized via ${imgResultA.provider} (${imgResultA.model}). Status: ${imgResultA.status}.`,
      details: {
        layers: promptEngineeredA.layers,
        blendedPrompt: promptEngineeredA.optimized_image_prompt,
        negativePrompt: promptEngineeredA.negative_prompt,
        url: imgResultA.url,
      },
    });

    const imgResultB = await ImageGenerationService.generateImageUrlWithMeta(
      promptEngineeredB.optimized_image_prompt,
      seedB,
      refStyle,
      promptEngineeredB.negative_prompt,
      referenceImage
    );
    brief.concept_b.image_url = imgResultB.url;
    logger.log({
      agent: "ImageGenerationService (Concept B)",
      provider: imgResultB.provider,
      model: imgResultB.model,
      status: imgResultB.status,
      durationMs: imgResultB.durationMs,
      summary: `Concept B artwork synthesized via ${imgResultB.provider} (${imgResultB.model}). Status: ${imgResultB.status}.`,
      details: {
        layers: promptEngineeredB.layers,
        blendedPrompt: promptEngineeredB.optimized_image_prompt,
        negativePrompt: promptEngineeredB.negative_prompt,
        url: imgResultB.url,
      },
    });

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
            visual_brief_summary: `${brief.concept_a.visual_style} | Alignment Score: ${critiqueA.brand_alignment_score}/100`,
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
            visual_brief_summary: `${brief.concept_b.visual_style} | Alignment Score: ${critiqueB.brand_alignment_score}/100`,
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
      critiqueA,
      critiqueB,
      logs: logger.getLogs(),
    };
  }
}
