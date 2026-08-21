import { NextRequest, NextResponse } from "next/server";
import { PromptEngineerAgent } from "@/mastra/agents/prompt-engineer-agent";
import { ImageGenerationService } from "@/services/image-generation";
import { BrandBrainService } from "@/services/brand-brain";
import { DesignKnowledgeService } from "@/services/design-knowledge";
import { createAdminClient } from "@/lib/supabase/admin";
import { getQStashReceiver } from "@/lib/qstash";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    // Verify QStash Signature if keys exist
    const receiver = getQStashReceiver();
    const signature = req.headers.get("upstash-signature");
    if (receiver && signature) {
      const isValid = await receiver.verify({
        signature,
        body: rawBody,
      });
      if (!isValid) {
        return NextResponse.json({ error: "Invalid QStash signature" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { campaignId, conceptId, moodboard, brandId } = payload;

    if (!moodboard) {
      return NextResponse.json({ error: "Moodboard data is required" }, { status: 400 });
    }

    // 1. Fetch Brand DNA & Design Knowledge
    const brand = await BrandBrainService.getBrandById(brandId);
    const designKnowledge = await DesignKnowledgeService.searchKnowledge(moodboard.theme_name || "modern", 2);

    // 2. Engineer Master Prompt for Leonardo Phoenix
    const engineered = await PromptEngineerAgent.engineerPrompt(moodboard, brand, designKnowledge);

    // 3. Generate 4:5 Instagram Image via Cloudflare Leonardo Phoenix
    const imageResult = await ImageGenerationService.generatePostImage(engineered.optimized_image_prompt);

    // 4. Update Supabase with Final Rendered Post
    const supabase = createAdminClient();

    if (conceptId) {
      await supabase
        .from("concepts")
        .update({
          image_url: imageResult.url,
          image_prompt: engineered.optimized_image_prompt,
          caption_instagram: engineered.caption_instagram,
          visual_brief_summary: `[${engineered.theme_applied}] ${engineered.headline}`,
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", conceptId);

      // Insert version history
      await supabase.from("concept_versions").insert({
        concept_id: conceptId,
        version_number: 1,
        user_instruction: "Leonardo Phoenix AI Generation",
        image_url: imageResult.url,
        caption_instagram: engineered.caption_instagram,
      });
    }

    if (campaignId) {
      await supabase
        .from("campaigns")
        .update({
          status: "completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId);
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageResult.url,
      caption: engineered.caption_instagram,
      provider: imageResult.provider,
      durationMs: imageResult.durationMs,
    });
  } catch (error: any) {
    console.error("Error in /api/webhooks/generate execution:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate post image in webhook" },
      { status: 500 }
    );
  }
}
