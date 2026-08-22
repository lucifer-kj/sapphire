import fs from "fs";
import path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {}

async function testGroqModel(modelId: string) {
  try {
    const { createGroq } = await import("@ai-sdk/groq");
    const { generateText } = await import("ai");
    const groq = createGroq({ apiKey: process.env.GROQ_API_KEY });
    const start = Date.now();
    const res = await generateText({
      model: groq(modelId),
      prompt: "Say 'OK' in 1 word.",
    });
    console.log(`✅ Groq model [${modelId}]: SUCCESS (${Date.now() - start}ms) -> "${res.text.trim()}"`);
  } catch (err: any) {
    console.log(`❌ Groq model [${modelId}]: FAILED -> ${err?.message || err}`);
  }
}

async function run() {
  await testGroqModel("openai/gpt-oss-120b");
  await testGroqModel("openai/gpt-oss-20b");
  await testGroqModel("qwen/qwen3.6-27b");
}

run();
