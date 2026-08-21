import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getQStashClient } from "@/lib/qstash";
import { PromptEngineerAgent } from "@/mastra/agents/prompt-engineer-agent";
import { ImageGenerationService } from "@/services/image-generation";
import { BrandBrainService } from "@/services/brand-brain";
import { DesignKnowledgeService } from "@/services/design-knowledge";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { moodboard, brandId, userPrompt = "Custom Instagram Post" } = body;

    if (!moodboard) {
      return NextResponse.json({ error: "Moodboard data is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const brand = await BrandBrainService.getBrandById(brandId);

    // 1. Create or ensure durable records in Supabase
    let campaignId = "local-campaign-" + Date.now();
    let conceptId = "local-concept-" + Date.now();

    try {
      const { data: campaignData } = await supabase
        .from("campaigns")
        .insert({
          brand_id: brand.id || undefined,
          title: `${moodboard.theme_name} — ${moodboard.headline || "Instagram Post"}`,
          user_prompt: userPrompt,
          objective: "Instagram Post Generation",
          status: "generating",
          creative_brief: moodboard as any,
        })
        .select()
        .single();

      if (campaignData) {
        campaignId = campaignData.id;

        const { data: conceptData } = await supabase
          .from("concepts")
          .insert({
            campaign_id: campaignId,
            concept_label: "Post Design",
            title: moodboard.headline,
            creative_direction: moodboard.reasoning || moodboard.theme_name,
            status: "generating",
          })
          .select()
          .single();

        if (conceptData) {
          conceptId = conceptData.id;
        }
      }
    } catch (dbErr) {
      console.warn("Supabase initial insertion skipped:", dbErr);
    }

    const qstash = getQStashClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

    // 2. If QStash is configured and we have a public URL, dispatch asynchronously
    if (qstash && appUrl) {
      const destinationUrl = `${appUrl}/api/webhooks/generate`;
      await qstash.publishJSON({
        url: destinationUrl,
        body: {
          campaignId,
          conceptId,
          moodboard,
          brandId,
        },
        retries: 2,
      });

      return NextResponse.json({
        success: true,
        isAsync: true,
        campaignId,
        conceptId,
        status: "generating",
        message: "Post generation job dispatched to QStash.",
      });
    }

    // 3. Fallback: Direct execution (for local dev or if QStash is not set up)
    const designKnowledge = await DesignKnowledgeService.searchKnowledge(moodboard.theme_name || "modern", 2);
    const engineered = await PromptEngineerAgent.engineerPrompt(moodboard, brand, designKnowledge);
    const imageResult = await ImageGenerationService.generatePostImage(engineered.optimized_image_prompt);

    try {
      await supabase
        .from("concepts")
        .update({
          image_url: imageResult.url,
          image_prompt: engineered.optimized_image_prompt,
          caption_instagram: engineered.caption_instagram,
          visual_brief_summary: `[${engineered.theme_applied}] ${engineered.headline}`,
          status: "completed",
        })
        .eq("id", conceptId);

      await supabase
        .from("campaigns")
        .update({ status: "completed" })
        .eq("id", campaignId);
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      isAsync: false,
      campaignId,
      conceptId,
      status: "completed",
      imageUrl: imageResult.url,
      caption: engineered.caption_instagram,
      engineeredPrompt: engineered.optimized_image_prompt,
      themeApplied: engineered.theme_applied,
      durationMs: imageResult.durationMs,
    });
  } catch (error: any) {
    console.error("Error in /api/generate-post:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process post generation request." },
      { status: 500 }
    );
  }
}
