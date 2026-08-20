import { WorkflowLogEntry } from "@/lib/schema/telemetry";

export class ExecutionLogger {
  private logs: WorkflowLogEntry[] = [];

  log(entry: Omit<WorkflowLogEntry, "id" | "timestamp">): WorkflowLogEntry {
    const fullEntry: WorkflowLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };
    this.logs.push(fullEntry);
    console.log(
      `[${fullEntry.provider}][${fullEntry.agent}] (${fullEntry.durationMs}ms) [${fullEntry.status.toUpperCase()}]: ${fullEntry.summary}`
    );
    return fullEntry;
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
        details: { error: String(err) },
      });
      throw err;
    }
  }

  getLogs(): WorkflowLogEntry[] {
    return [...this.logs];
  }
}
