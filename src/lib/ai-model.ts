import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";

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

export function getGroqModel(modelName: string = "llama-3.3-70b-versatile") {
  return getGroqProvider()(modelName);
}

export function getEmbeddingModel() {
  const provider = getGoogleProvider();
  return provider.textEmbeddingModel("text-embedding-004");
}

/**
 * Flagship Reasoning & Creative Director Model (Gemini 2.5 Flash primary, Groq Llama 3.3 fallback)
 */
export function getReasoningModel() {
  const key = getGoogleApiKey();
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return getGroqModel("llama-3.3-70b-versatile");
  }
  return getGoogleProvider()("gemini-2.5-flash");
}

export function getReasoningFallbackModel() {
  const key = getGoogleApiKey(true);
  if (key) {
    return getGoogleProvider(true)("gemini-2.5-flash");
  }
  return getGroqModel("llama-3.3-70b-versatile");
}

/**
 * Ultra-Fast Light Task Model (Gemini 2.5 Flash ~500ms, Groq Llama 3.1 8B fallback)
 */
export function getLightModel() {
  const key = getGoogleApiKey();
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return getGroqModel("llama-3.1-8b-instant");
  }
  return getGoogleProvider()("gemini-2.5-flash");
}

export function getLightFallbackModel() {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return getGroqModel("llama-3.1-8b-instant");
  }
  return getGoogleProvider()("gemini-2.5-flash");
}

/**
 * Multimodal Vision Model (Gemini 2.5 Flash)
 */
export function getVisionModel() {
  const key = getGoogleApiKey();
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqModel("llama-3.3-70b-versatile");
}
