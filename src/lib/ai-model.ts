import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Flagship Reasoning & Creative Director Model (Gemini 3.7 Flash primary, Groq 70B fallback)
 * Used for: Creative Director, Prompt Engineering, Research Synthesis
 */
export function getReasoningModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google("gemini-3.7-flash");
  }
  return groq("llama-3.3-70b-versatile");
}

export function getReasoningFallbackModel() {
  if (process.env.GROQ_API_KEY) {
    return groq("llama-3.3-70b-versatile");
  }
  return google("gemini-3.7-flash");
}

/**
 * Ultra-Fast Light Task Model (Gemini 3.1 Flash Lite primary, Groq fallback)
 * Used for: High-Speed Intent Parsing, Fast Concept Refinements
 */
export function getLightModel() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google("gemini-3.1-flash-lite");
  }
  return groq("llama-3.3-70b-versatile");
}

export function getLightFallbackModel() {
  if (process.env.GROQ_API_KEY) {
    return groq("llama-3.3-70b-versatile");
  }
  return google("gemini-3.1-flash-lite");
}

/**
 * Multimodal Vision Model (Gemini 3.7 Flash)
 * Used for: Reference image stylistic breakdown & visual palette extraction
 */
export function getVisionModel() {
  return google("gemini-3.7-flash");
}

/**
 * Critic & Brand Guard Model (Groq Llama 3.3 70B primary, Gemini 3.7 Flash fallback)
 * Used for: Fast structured compliance auditing & brand scorecards
 */
export function getCriticModel() {
  if (process.env.GROQ_API_KEY) {
    return groq("llama-3.3-70b-versatile");
  }
  return google("gemini-3.7-flash");
}

/**
 * Compatibility aliases
 */
export const getPrimaryModel = getReasoningModel;
export const getFallbackModel = getReasoningFallbackModel;
