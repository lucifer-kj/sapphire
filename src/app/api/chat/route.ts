import { NextRequest } from "next/server";
import { CampaignWorkflow } from "@/mastra/workflows/campaign-workflow";
import { PromptIntelligenceWorkflow } from "@/modules/prompt-intelligence/workflow/prompt-intelligence-workflow";
import { GenerationMode } from "@/modules/prompt-intelligence/domain/prompt-intent";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, brandId, platform, mode = "prompt_only" } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt string is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const selectedMode: GenerationMode = mode === "campaign" ? "campaign" : "prompt_only";
    const selectedPlatform = platform === "linkedin" ? "linkedin" : "instagram";

    // Asynchronously execute appropriate workflow and stream progress events via SSE
    (async () => {
      try {
        if (selectedMode === "prompt_only") {
          const promptResult = await PromptIntelligenceWorkflow.execute(
            prompt,
            brandId,
            selectedPlatform,
            async (step, totalSteps, summary, status, data) => {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "progress",
                    mode: "prompt_only",
                    step,
                    totalSteps,
                    status,
                    summary,
                    ...(data || {}),
                  })}\n\n`
                )
              );
            }
          );

          // Final payload for Prompt Intelligence UI ingestion
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "prompt_complete",
                mode: "prompt_only",
                promptResult,
              })}\n\n`
            )
          );
        } else {
          // Check server-side image generation feature gate
          const imageGenEnabled = process.env.IMAGE_GENERATION_ENABLED === "true";
          if (!imageGenEnabled) {
            throw new Error("Full campaign image generation is currently disabled. Please switch to Prompt Intelligence mode.");
          }

          const result = await CampaignWorkflow.execute(
            prompt,
            brandId,
            selectedPlatform,
            async (step, totalSteps, summary, status, data) => {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "progress",
                    mode: "campaign",
                    step,
                    totalSteps,
                    status,
                    summary,
                    ...(data || {}),
                  })}\n\n`
                )
              );
            }
          );

          // Final payload for Campaign UI ingestion
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "complete",
                mode: "campaign",
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
        }
      } catch (err: any) {
        console.error("Workflow execution error:", err);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: err?.message || "An unexpected error occurred during workflow execution.",
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
