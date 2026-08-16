import { NextRequest, NextResponse } from "next/server";
import { PreferenceEngine } from "@/services/preference-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { brandId, selectedConcept, unselectedConcept } = body;

    if (!selectedConcept) {
      return NextResponse.json(
        { error: "selectedConcept object is required." },
        { status: 400 }
      );
    }

    await PreferenceEngine.recordConceptSelection(
      brandId,
      selectedConcept,
      unselectedConcept
    );

    return NextResponse.json({
      success: true,
      message: "Learned brand preference recorded successfully.",
    });
  } catch (error: any) {
    console.error("Error in /api/preference route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record preference." },
      { status: 500 }
    );
  }
}
