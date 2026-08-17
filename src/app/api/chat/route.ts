import { NextRequest } from "next/server";
import { CampaignWorkflow } from "@/mastra/workflows/campaign-workflow";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const { prompt, brandId, referenceImage } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt string is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        const result = await CampaignWorkflow.run(
          prompt,
          brandId,
          referenceImage,
          async (event) => {
            try {
              await writer.write(
                encoder.encode(`data: ${JSON.stringify({ type: "progress", ...event })}\n\n`)
              );
            } catch (streamErr) {
              console.warn("Client disconnected during progress streaming:", streamErr);
            }
          }
        );

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              success: true,
              campaignId: result.campaignId,
              intent: result.intent,
              research: result.research,
              referenceAnalysis: result.referenceAnalysis,
              brief: result.brief,
              critiqueA: result.critiqueA,
              critiqueB: result.critiqueB,
              logs: result.logs,
            })}\n\n`
          )
        );
      } catch (workflowError: any) {
        console.error("Workflow execution error in /api/chat stream:", workflowError);
        try {
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: workflowError.message || "Failed to process campaign workflow request.",
              })}\n\n`
            )
          );
        } catch {
          // ignore closed stream
        }
      } finally {
        try {
          await writer.close();
        } catch {
          // ignore already closed
        }
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Error initializing /api/chat route:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to process campaign workflow request.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

