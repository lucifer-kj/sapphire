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

async function checkEmbedding() {
  const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
  const { embed } = await import("ai");
  const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY,
  });

  const candidates = ["text-embedding-004", "embedding-001"];
  for (const m of candidates) {
    try {
      const { embedding } = await embed({
        model: google.textEmbeddingModel(m),
        value: "Test design knowledge",
      });
      console.log(`✅ Embedding model [${m}] works! Dimensions: ${embedding.length}`);
      return;
    } catch (e: any) {
      console.log(`❌ Embedding model [${m}] failed: ${e?.message}`);
    }
  }
}

checkEmbedding();
