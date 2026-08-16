import { NextRequest, NextResponse } from "next/server";
import { CampaignWorkflow } from "@/mastra/workflows/campaign-workflow";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, brandId, referenceImage } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt string is required." },
        { status: 400 }
      );
    }

    const result = await CampaignWorkflow.run(prompt, brandId, referenceImage);

    return NextResponse.json({
      success: true,
      campaignId: result.campaignId,
      intent: result.intent,
      research: result.research,
      referenceAnalysis: result.referenceAnalysis,
      brief: result.brief,
      critiqueA: result.critiqueA,
      critiqueB: result.critiqueB,
      logs: result.logs,
    });
  } catch (error: any) {
    console.error("Error in /api/chat route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process campaign workflow request." },
      { status: 500 }
    );
  }
}
