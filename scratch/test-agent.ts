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

import { IntentAgent } from "../src/mastra/agents/intent-agent";
import { BrandBrainService } from "../src/services/brand-brain";

async function test() {
  console.log("Testing Groq API key loaded:", Boolean(process.env.GROQ_API_KEY));
  try {
    const brand = await BrandBrainService.getBrandById();
    console.log("Brand loaded:", brand.name);
    const intent = await IntentAgent.parseIntent("Make a post for Japan to promote family vacation.", brand);
    console.log("Intent Result:", JSON.stringify(intent, null, 2));
  } catch (err: any) {
    console.error("Test Error Stack:", err);
  }
}

test();
