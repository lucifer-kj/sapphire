import { NextRequest } from "next/server";
import { CampaignWorkflow } from "@/mastra/workflows/campaign-workflow";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, brandId, platform } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt string is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Asynchronously execute workflow and stream progress events via SSE
    (async () => {
      try {
        const result = await CampaignWorkflow.execute(
          prompt,
          brandId,
          platform === "linkedin" ? "linkedin" : "instagram",
          async (step, totalSteps, summary, status) => {
            await writer.write(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "progress",
                  step,
                  totalSteps,
                  status,
                  summary,
                })}\n\n`
              )
            );
          }
        );

        // Final payload for UI ingestion
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              campaignId: result.campaignId,
              intent: result.intent,
              research: result.research,
              brief: result.brief,
              conceptA: result.conceptA,
              conceptB: result.conceptB,
              critiqueA: result.critiqueA,
              critiqueB: result.critiqueB,
              logs: result.logs,
            })}\n\n`
          )
        );
      } catch (err: any) {
        console.error("Campaign workflow execution error:", err);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: err?.message || "An unexpected error occurred during campaign generation.",
            })}\n\n`
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error?.message || "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
