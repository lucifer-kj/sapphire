import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Heavy Reasoning Model (Groq Llama 3.3 70B primary, Gemini Flash fallback)
 * Used for: Creative Director, Research Synthesis, Critic Brand Guard
 */
export function getReasoningModel() {
  if (process.env.GROQ_API_KEY) {
    return groq("llama-3.3-70b-versatile");
  }
  return google("gemini-2.5-flash");
}

export function getReasoningFallbackModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google("gemini-2.5-flash");
  }
  return groq("llama-3.3-70b-versatile");
}

/**
 * Light Task Model (Gemini Flash primary, Groq fallback)
 * Used for: Intent Parsing, Fast Refinements
 */
export function getLightModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google("gemini-2.5-flash");
  }
  return groq("llama-3.3-70b-versatile");
}

export function getLightFallbackModel() {
  if (process.env.GROQ_API_KEY) {
    return groq("llama-3.3-70b-versatile");
  }
  return google("gemini-2.5-flash");
}

/**
 * Multimodal Vision Model (Gemini 2.5 Flash)
 * Used for: Reference image breakdown & visual palette extraction
 */
export function getVisionModel() {
  return google("gemini-2.5-flash");
}

/**
 * Legacy compatibility aliases
 */
export const getPrimaryModel = getReasoningModel;
export const getFallbackModel = getReasoningFallbackModel;
