import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

const googleApiKey =
  process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  "";


export function getGoogleProvider() {
  const key =
    process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";
  return createGoogleGenerativeAI({ apiKey: key });
}

export function getGroqProvider() {
  return createGroq({
    apiKey: process.env.GROQ_API_KEY || "",
  });
}

/**
 * Flagship Reasoning & Creative Director Model (Gemini 2.5 Flash primary, Groq 70B fallback)
 * Used for: Creative Director, Prompt Engineering, Research Synthesis
 */
export function getReasoningModel() {
  const key =
    process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

export function getReasoningFallbackModel() {
  const key =
    process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

/**
 * Ultra-Fast Light Task Model (Gemini 2.5 Flash primary, Groq fallback)
 * Used for: High-Speed Intent Parsing, Fast Concept Refinements
 */
export function getLightModel() {
  const key =
    process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

export function getLightFallbackModel() {
  const key =
    process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

/**
 * Multimodal Vision Model (Gemini 2.5 Flash)
 * Used for: Reference image stylistic breakdown & visual palette extraction
 */
export function getVisionModel() {
  return getGoogleProvider()("gemini-2.5-flash");
}

/**
 * Critic & Brand Guard Model (Gemini 2.5 Flash primary, Groq fallback)
 * Used for: Fast structured compliance auditing & brand scorecards
 */
export function getCriticModel() {
  const key =
    process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    "";
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}


/**
 * Compatibility aliases
 */
export const getPrimaryModel = getReasoningModel;
export const getFallbackModel = getReasoningFallbackModel;
