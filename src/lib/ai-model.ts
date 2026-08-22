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
 * Flagship Reasoning & Creative Director Model (Groq GPT-OSS 120B / Gemini 2.5 Flash)
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
  const key = getGoogleApiKey();
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqModel("openai/gpt-oss-120b");
}

/**
 * Ultra-Fast Light Task Model (Groq GPT-OSS 20B ~400ms)
 */
export function getLightModel() {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return getGroqModel("openai/gpt-oss-20b");
  }
  const key = getGoogleApiKey();
  if (key) {
    return getGoogleProvider()("gemini-2.5-flash");
  }
  return getGroqModel("openai/gpt-oss-20b");
}

export function getLightFallbackModel() {
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    return getGroqModel("openai/gpt-oss-20b");
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
  return getGroqModel("openai/gpt-oss-120b");
}
