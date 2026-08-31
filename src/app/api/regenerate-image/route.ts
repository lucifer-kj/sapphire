import { NextRequest, NextResponse } from "next/server";
import { ImageGenerationService } from "@/services/image-generation";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const isImageGenEnabled = process.env.IMAGE_GENERATION_ENABLED === "true";
    if (!isImageGenEnabled) {
      return NextResponse.json(
        {
          error: "Image generation is currently quarantined and disabled in production. Use Prompt Intelligence mode.",
          status: "disabled",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt string is required." },
        { status: 400 }
      );
    }

    const seed = Math.floor(Math.random() * 1000000);
    const result = await ImageGenerationService.generatePostImage(prompt, seed);

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
