import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Returns the primary active AI model (Google Gemini 2.5 Flash), or Groq as secondary.
 */
export function getPrimaryModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google("gemini-2.5-flash");
  }
  return groq("llama-3.3-70b-versatile");
}

export function getFallbackModel() {
  if (process.env.GROQ_API_KEY) {
    return groq("llama-3.3-70b-versatile");
  }
  return google("gemini-2.5-flash");
}
