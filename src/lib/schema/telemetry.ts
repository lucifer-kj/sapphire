import { z } from "zod";

export const WorkflowLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  agent: z.string(),
  provider: z.enum(["Groq", "Google Gemini", "Pollinations AI", "System", "Nano Banana"]),
  model: z.string(),
  status: z.enum(["success", "fallback", "error", "info"]),
  durationMs: z.number(),
  summary: z.string(),
  details: z.any().optional(),
});

export type WorkflowLogEntry = z.infer<typeof WorkflowLogEntrySchema>;
