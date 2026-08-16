import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("campaigns")
      .select("*, concepts(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetch error in /api/campaigns:", error);
      return NextResponse.json({ campaigns: [] });
    }

    return NextResponse.json({ campaigns: data || [] });
  } catch (err: any) {
    return NextResponse.json({ campaigns: [] });
  }
}
