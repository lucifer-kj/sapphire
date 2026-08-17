import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

const googleApiKey =
  process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  "";


export const google = createGoogleGenerativeAI({
  apiKey: googleApiKey,
});

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

/**
 * Flagship Reasoning & Creative Director Model (Gemini 3.7 Flash primary, Groq 70B fallback)
 * Used for: Creative Director, Prompt Engineering, Research Synthesis
 */
export function getReasoningModel() {
  if (googleApiKey) {
    return google("gemini-2.5-flash");
  }
  return groq("llama-3.3-70b-versatile");
}


export function getReasoningFallbackModel() {
  if (googleApiKey) {
    return google("gemini-2.5-flash");
  }
  return groq("llama-3.3-70b-versatile");
}

/**
 * Ultra-Fast Light Task Model (Gemini 2.5 Flash primary, Groq fallback)
 * Used for: High-Speed Intent Parsing, Fast Concept Refinements
 */
export function getLightModel() {
  if (googleApiKey) {
    return google("gemini-2.5-flash");
  }
  return groq("llama-3.3-70b-versatile");
}

export function getLightFallbackModel() {
  if (googleApiKey) {
    return google("gemini-2.5-flash");
  }
  return groq("llama-3.3-70b-versatile");
}

/**
 * Multimodal Vision Model (Gemini 2.5 Flash)
 * Used for: Reference image stylistic breakdown & visual palette extraction
 */
export function getVisionModel() {
  return google("gemini-2.5-flash");
}

/**
 * Critic & Brand Guard Model (Gemini 2.5 Flash primary, Groq fallback)
 * Used for: Fast structured compliance auditing & brand scorecards
 */
export function getCriticModel() {
  if (googleApiKey) {
    return google("gemini-2.5-flash");
  }
  return groq("llama-3.3-70b-versatile");
}


/**
 * Compatibility aliases
 */
export const getPrimaryModel = getReasoningModel;
export const getFallbackModel = getReasoningFallbackModel;
