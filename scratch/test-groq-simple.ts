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

import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

async function testSimple() {
  console.log("Testing simple generateText on Groq...");
  try {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt: "Say hello in 3 words.",
    });
    console.log("SUCCESS generateText:", result.text);
  } catch (err: any) {
    console.error("Simple test error:", err.message, err.responseBody);
  }
}

testSimple();
