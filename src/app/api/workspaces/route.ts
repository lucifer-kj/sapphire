import { NextRequest, NextResponse } from "next/server";
import { BrandBrainService } from "@/services/brand-brain";
import { BrandProfileSchema } from "@/lib/schema/brand";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRECONFIGURED_BRANDS } from "@/lib/constants/brands";

export const dynamic = "force-dynamic";

/**
 * GET /api/workspaces
 * Retrieves all registered brand workspaces from Supabase + seed presets.
 */
export async function GET() {
  try {
    const brands = await BrandBrainService.getAllBrands();
    return NextResponse.json({ success: true, workspaces: brands });
  } catch (err: any) {
    console.warn("Error in GET /api/workspaces, returning presets:", err);
    return NextResponse.json({ success: true, workspaces: PRECONFIGURED_BRANDS });
  }
}

/**
 * POST /api/workspaces
 * Upserts a new or edited brand workspace into the durable Supabase database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = BrandProfileSchema.parse(body);

    const saved = await BrandBrainService.saveBrand(validated);
    return NextResponse.json({ success: true, workspace: saved });
  } catch (err: any) {
    console.error("Error in POST /api/workspaces:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to save workspace profile." },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/workspaces?id=[brand_id]
 * Deletes a brand workspace by ID from Supabase.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Workspace ID is required." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("brands").delete().eq("id", id);

    if (error) {
      console.warn("Supabase delete warning in /api/workspaces:", error);
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error("Error in DELETE /api/workspaces:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete workspace profile." },
      { status: 500 }
    );
  }
}
