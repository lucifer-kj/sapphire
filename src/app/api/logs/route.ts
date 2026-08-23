import { NextRequest, NextResponse } from "next/server";
import { ExecutionLogger } from "@/services/telemetry";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const agent = searchParams.get("agent") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const logs = ExecutionLogger.getRecentLogs({
      status,
      agent,
      limit,
    });

    const stats = {
      total: logs.length,
      errors: logs.filter((l) => l.status === "error").length,
      fallbacks: logs.filter((l) => l.status === "fallback").length,
      successes: logs.filter((l) => l.status === "success").length,
      avgLatencyMs:
        logs.length > 0
          ? Math.round(logs.reduce((acc, l) => acc + l.durationMs, 0) / logs.length)
          : 0,
    };

    return NextResponse.json({
      stats,
      logs,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
