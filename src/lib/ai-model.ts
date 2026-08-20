import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

const googleApiKey =
  process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
  "";


export function getGoogleApiKey(useSecondary: boolean = false) {
  if (useSecondary) {
    return (
      process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY ||
      ""
    );
  }
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    ""
  );
}

export function getGoogleProvider(useSecondary: boolean = false) {
  const key = getGoogleApiKey(useSecondary);
  return createGoogleGenerativeAI({ apiKey: key });
}

export function getGroqProvider() {
  return createGroq({
    apiKey: process.env.GROQ_API_KEY || "",
  });
}

/**
 * Flagship Reasoning & Creative Director Model (Gemini 2.5 Flash primary, Gemini 1.5/Groq fallback)
 * Used for: Creative Director, Prompt Engineering, Research Synthesis
 */
export function getReasoningModel() {
  const key = getGoogleApiKey();
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

export function getReasoningFallbackModel() {
  const secondaryKey = getGoogleApiKey(true);
  if (secondaryKey) {
    return getGoogleProvider(true)("gemini-1.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

/**
 * Ultra-Fast Light Task Model (Gemini 2.5 Flash primary, Groq fallback)
 * Used for: High-Speed Intent Parsing, Fast Concept Refinements
 */
export function getLightModel() {
  const key = getGoogleApiKey();
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

export function getLightFallbackModel() {
  const secondaryKey = getGoogleApiKey(true);
  if (secondaryKey) {
    return getGoogleProvider(true)("gemini-1.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

/**
 * Multimodal Vision Model (Gemini 2.5 Flash primary, Gemini 1.5 fallback)
 * Used for: Reference image stylistic breakdown & visual palette extraction
 */
export function getVisionModel() {
  const key = getGoogleApiKey();
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

export function getVisionFallbackModel() {
  const secondaryKey = getGoogleApiKey(true);
  if (secondaryKey) {
    return getGoogleProvider(true)("gemini-1.5-flash");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

/**
 * Critic & Brand Guard Model (Gemini 2.5 Flash primary, Gemini 1.5 fallback)
 * Used for: Fast structured compliance auditing & brand scorecards
 */
export function getCriticModel() {
  const key = getGoogleApiKey();
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
