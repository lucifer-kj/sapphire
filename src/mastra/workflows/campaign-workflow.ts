import { BrandBrainService } from "@/services/brand-brain";
import { IntentAgent } from "../agents/intent-agent";
import { ResearchAgent } from "../agents/research-agent";
import { CreativeDirectorAgent } from "../agents/creative-director-agent";
import { MultimodalAgent } from "../agents/multimodal-agent";
import { CriticAgent } from "../agents/critic-agent";
import { ImageGenerationService } from "@/services/image-generation";
import { createAdminClient } from "@/lib/supabase/admin";
import { UserIntent, ResearchContext, CreativeBrief } from "@/lib/schema/campaign";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { CriticResult } from "@/lib/schema/critic";

export interface WorkflowResult {
  campaignId: string;
  intent: UserIntent;
  research: ResearchContext;
  referenceAnalysis?: ReferenceImageAnalysis | null;
  brief: CreativeBrief;
  critiqueA: CriticResult;
  critiqueB: CriticResult;
}

export class CampaignWorkflow {
  /**
   * Executes end-to-end agent workflow:
   * Intent Parsing -> Multimodal Analysis -> Brand Context -> Research -> Creative Brief -> Image Gen -> Critic Evaluation -> Supabase Persistence.
   */
  static async run(
    prompt: string,
    brandId?: string,
    referenceImage?: string | null
  ): Promise<WorkflowResult> {
    // 1. Fetch Brand Context
    const brand = await BrandBrainService.getBrandById(brandId);

    // 2. Parse User Intent using Groq
    const intent = await IntentAgent.parseIntent(prompt, brand);

    // 3. Analyze Reference Image using Gemini Multimodal (if provided)
    let referenceAnalysis: ReferenceImageAnalysis | null = null;
    if (referenceImage) {
      referenceAnalysis = await MultimodalAgent.analyzeReferenceImage(referenceImage);
    }

    // 4. Synthesize Research & Trends using Groq
    const research = await ResearchAgent.synthesizeResearch(intent, brand);

    // 5. Develop A/B Creative Brief using Groq
    const brief = await CreativeDirectorAgent.developCreativeBrief(
      intent,
      research,
      brand,
      referenceAnalysis
    );

    // 6. Run Critic Agent (Brand Guard Audit) on both Concept A and Concept B
    const critiqueA = await CriticAgent.evaluateConcept(brief.concept_a, brand);
    const critiqueB = await CriticAgent.evaluateConcept(brief.concept_b, brand);

    // 7. Generate AI Images for Concept A and Concept B
    const seedA = Math.floor(Math.random() * 1000000);
    const seedB = seedA + 1;

    brief.concept_a.image_url = ImageGenerationService.generateImageUrl(
      brief.concept_a.image_prompt,
      seedA
    );

    brief.concept_b.image_url = ImageGenerationService.generateImageUrl(
      brief.concept_b.image_prompt,
      seedB
    );

    // 8. Persist Campaign, Concepts, Critiques & Versions in Supabase
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
            image_prompt: brief.concept_a.image_prompt,
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
            image_prompt: brief.concept_b.image_prompt,
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
      }
    } catch (err) {
      console.warn("Supabase persistence fallback in campaign workflow:", err);
    }

    return {
      campaignId,
      intent,
      research,
      referenceAnalysis,
      brief,
      critiqueA,
      critiqueB,
    };
  }
}
