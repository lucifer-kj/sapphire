import fs from "fs";
import path from "path";

// Load .env.local
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

async function runSeed() {
  console.log("====================================================");
  console.log("      SEEDING & EMBEDDING RAG KNOWLEDGE BASE        ");
  console.log("====================================================");

  const { DesignKnowledgeService } = await import("@/services/design-knowledge");
  const { KnowledgeBaseService } = await import("@/services/kb-loader");

  const modules = KnowledgeBaseService.getAllModules();
  console.log(`Found ${modules.length} Knowledge Base modules across local folders.`);

  console.log("Computing embeddings (text-embedding-004) and upserting into Supabase...");
  const count = await DesignKnowledgeService.seedKnowledgeBase();
  console.log(`✅ Successfully seeded & embedded ${count}/${modules.length} design knowledge modules!`);
  console.log("====================================================");
}

runSeed().catch(console.error);
