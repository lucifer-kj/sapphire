import { z } from "zod";

export const WorkflowLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  agent: z.string(),
  provider: z.enum([
    "Groq",
    "Google Gemini",
    "Google Gemini Vision",
    "Cloudflare Workers AI (Flux)",
    "Pollinations AI",
    "Pollinations AI (Flux)",
    "System",
    "Nano Banana",
    "Nano Banana 2",
    "Puter.js",
  ]),
  model: z.string(),
  status: z.enum(["success", "fallback", "error", "info"]),
  durationMs: z.number(),
  summary: z.string(),
  details: z.any().optional(),
});

export type WorkflowLogEntry = z.infer<typeof WorkflowLogEntrySchema>;
