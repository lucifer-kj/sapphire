import { NextRequest } from "next/server";
import { BrandExtractorService } from "@/services/brand-extractor";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, brandName } = body;

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "Website URL string is required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    (async () => {
      try {
        const extracted = await BrandExtractorService.extractBrandFromUrl(
          url,
          brandName,
          async (stage, step, total) => {
            try {
              await writer.write(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "progress",
                    stage,
                    step,
                    total,
                  })}\n\n`
                )
              );
            } catch (err) {
              console.warn("Client disconnected from brand-extract stream:", err);
            }
          }
        );

        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              success: true,
              data: extracted,
            })}\n\n`
          )
        );
      } catch (err: any) {
        console.error("Brand extraction failed in stream:", err);
        try {
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                error: err.message || "Failed to extract brand assets from website.",
              })}\n\n`
            )
          );
        } catch {}
      } finally {
        try {
          await writer.close();
        } catch {}
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    console.error("Error in /api/brand-extract endpoint:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
