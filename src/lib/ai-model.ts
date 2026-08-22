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

export function getGroqModel(modelName: string = "openai/gpt-oss-120b") {
  return getGroqProvider()(modelName);
}

export function getEmbeddingModel() {
  const provider = getGoogleProvider();
  return provider.textEmbeddingModel("text-embedding-004");
}

/**
 * Flagship Reasoning & Creative Director Model (Gemini 2.5 Flash primary, Groq GPT-OSS 120B fallback)
 * Used for: Creative Director, Prompt Engineering, Research Synthesis
 */
export function getReasoningModel() {
  const key = getGoogleApiKey();
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return getGroqModel("openai/gpt-oss-120b");
  }
  return getGoogleProvider()("gemini-2.5-flash");
}

export function getReasoningFallbackModel() {
  const secondaryKey = getGoogleApiKey(true);
  if (secondaryKey) {
    return getGoogleProvider(true)("gemini-2.5-pro");
  }
  return getGroqProvider()("openai/gpt-oss-120b");
}

/**
 * Ultra-Fast Light Task Model (Gemini 2.5 Flash primary, Groq GPT-OSS 20B fallback)
 * Used for: High-Speed Intent Parsing, Fast Concept Refinements
 */
export function getLightModel() {
  const key = getGoogleApiKey();
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqProvider()("openai/gpt-oss-20b");
}

export function getLightFallbackModel() {
  const secondaryKey = getGoogleApiKey(true);
  if (secondaryKey) {
    return getGoogleProvider(true)("gemini-2.5-flash");
  }
  return getGroqProvider()("openai/gpt-oss-20b");
}

/**
 * Multimodal Vision Model (Gemini 2.5 Flash primary, Gemini 2.5 Pro fallback)
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
    return getGoogleProvider(true)("gemini-2.5-pro");
  }
  return getGroqProvider()("llama-3.3-70b-versatile");
}

/**
 * Critic & Brand Guard Model (Gemini 2.5 Flash primary, Gemini 2.5 Pro fallback)
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
