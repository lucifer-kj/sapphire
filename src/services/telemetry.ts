import { WorkflowLogEntry } from "@/lib/schema/telemetry";
import { createAdminClient } from "@/lib/supabase/admin";

// Global in-memory ring buffer for live log monitoring across serverless invocations
const MAX_BUFFERED_LOGS = 200;
const globalLogBuffer: WorkflowLogEntry[] = [];

export class ExecutionLogger {
  private logs: WorkflowLogEntry[] = [];
  private runId: string;

  constructor(runId?: string) {
    this.runId = runId || `run_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  }

  log(entry: Omit<WorkflowLogEntry, "id" | "timestamp">): WorkflowLogEntry {
    const fullEntry: WorkflowLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    
    this.logs.push(fullEntry);
    
    // Add to global monitor buffer
    globalLogBuffer.unshift(fullEntry);
    if (globalLogBuffer.length > MAX_BUFFERED_LOGS) {
      globalLogBuffer.pop();
    }

    const icon = fullEntry.status === "error" ? "❌" : fullEntry.status === "fallback" ? "⚠️" : "✓";
    console.log(
      `[${fullEntry.timestamp}] ${icon} [${fullEntry.provider}][${fullEntry.agent}] (${fullEntry.durationMs}ms) [${fullEntry.status.toUpperCase()}]: ${fullEntry.summary}`
    );

    // Asynchronously record error logs to Supabase if available
    if (fullEntry.status === "error") {
      this.persistErrorLog(fullEntry).catch(() => {});
    }

    return fullEntry;
  }

  private async persistErrorLog(entry: WorkflowLogEntry) {
    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from("telemetry_logs").insert({
          run_id: this.runId,
          agent: entry.agent,
          provider: entry.provider,
          model: entry.model,
          status: entry.status,
          duration_ms: entry.durationMs,
          summary: entry.summary,
          details: entry.details,
          created_at: entry.timestamp,
        });
      }
    } catch {
      // ignore in serverless environments where table might not exist yet
    }
  }

  async track<T>(
    agent: string,
    provider: WorkflowLogEntry["provider"],
    model: string,
    action: () => Promise<T>,
    summaryExtractor?: (result: T) => string
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await action();
      const durationMs = Math.round(performance.now() - start);
      const summary = summaryExtractor
        ? summaryExtractor(result)
        : `Completed ${agent} successfully.`;

      this.log({
        agent,
        provider,
        model,
        status: "success",
        durationMs,
        summary,
        details: result,
      });

      return result;
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - start);
      this.log({
        agent,
        provider,
        model,
        status: "error",
        durationMs,
        summary: `Error in ${agent}: ${err.message || String(err)}`,
        details: {
          error: String(err),
          stack: err.stack,
        },
      });
      throw err;
    }
  }

  getLogs(): WorkflowLogEntry[] {
    return [...this.logs];
  }

  /**
   * Retrieves globally buffered system logs across all recent agent and workflow runs.
   */
  static getRecentLogs(filter?: { status?: string; agent?: string; limit?: number }): WorkflowLogEntry[] {
    let filtered = [...globalLogBuffer];
    if (filter?.status) {
      filtered = filtered.filter((l) => l.status === filter.status);
    }
    if (filter?.agent) {
      filtered = filtered.filter((l) => l.agent.toLowerCase().includes(filter.agent!.toLowerCase()));
    }
    const limit = filter?.limit || 50;
    return filtered.slice(0, limit);
  }
}
