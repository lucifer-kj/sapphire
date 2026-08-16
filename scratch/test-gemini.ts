import fs from "fs";

if (fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valParts] = trimmed.split("=");
      if (key && valParts.length > 0) {
        process.env[key.trim()] = valParts.join("=").trim();
      }
    }
  }
}

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const candidates = [
  "gemini-2.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro-latest",
  "gemini-2.0-flash-exp",
  "gemini-2.5-pro",
  "gemini-pro"
];

async function findWorkingGemini() {
  for (const modelName of candidates) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const result = await generateText({
        model: google(modelName),
        prompt: "Say hello in 3 words.",
      });
      console.log(`✅ SUCCESS [${modelName}]:`, result.text);
      return modelName;
    } catch (err: any) {
      console.log(`❌ FAILED [${modelName}]:`, err.message);
    }
  }
}

findWorkingGemini();
