import { NextRequest, NextResponse } from "next/server";
import { ImageGenerationService } from "@/services/image-generation";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {

  try {
    const body = await req.json();
    const { prompt, styleOverride, designBlueprint, referenceImage } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt string is required." },
        { status: 400 }
      );
    }

    const seed = Math.floor(Math.random() * 1000000);
    const result = await ImageGenerationService.generateImageUrlWithMeta(
      prompt,
      seed,
      styleOverride,
      undefined,
      referenceImage,
      designBlueprint
    );

    return NextResponse.json({
      success: true,
      imageUrl: result.url,
      meta: result,
    });
  } catch (error: any) {
    console.error("Error in /api/regenerate-image route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to regenerate image." },
      { status: 500 }
    );
  }
}
