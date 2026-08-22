import fs from "fs";
import path from "path";

// Load .env.local manually
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

async function testFullPipeline() {
  console.log("====================================================");
  console.log("      SAPPHIRE END-TO-END WORKFLOW & RAG TEST       ");
  console.log("====================================================");

  const { KnowledgeBaseService } = await import("@/services/kb-loader");
  const { DesignKnowledgeService } = await import("@/services/design-knowledge");
  const { CampaignWorkflow } = await import("@/mastra/workflows/campaign-workflow");

  // 1. Test Knowledge Base Loading
  const allModules = KnowledgeBaseService.getAllModules();
  console.log(`📚 Knowledge Base Modules Loaded: ${allModules.length} files`);
  const trendMod = allModules.find((m) => m.theme_name === "trend-signals-and-viral-mechanics");
  const geoMod = allModules.find((m) => m.theme_name === "executive-geometry-and-spatial-math");
  console.log(`   - Viral Mechanics Module: ${trendMod ? "✅ Detected" : "❌ Missing"}`);
  console.log(`   - Spatial Geometry Module: ${geoMod ? "✅ Detected" : "❌ Missing"}`);

  // 2. Test RAG Search Query
  const ragResults = await DesignKnowledgeService.searchKnowledge("artisanal coffee morning ritual travel", 2);
  console.log(`🔍 RAG Search Returned: ${ragResults.length} relevant themes`);
  ragResults.forEach((r, idx) => {
    console.log(`   [Theme ${idx + 1}] "${r.theme_name}" (Category: ${r.category})`);
  });

  // 3. Test Full Multi-Agent DAG Execution
  console.log("\n🚀 Executing 6-Step Autonomous Campaign Workflow...");
  const start = Date.now();

  const output = await CampaignWorkflow.execute(
    "Create an artisanal coffee morning ritual post for Vagabond Travel",
    "vagabond",
    "instagram",
    async (step, total, summary, status) => {
      console.log(`   [Step ${step + 1}/${total}] [${status.toUpperCase()}] ${summary}`);
    }
  );

  const durationSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n🎉 WORKFLOW COMPLETED IN ${durationSec}s!`);
  console.log("====================================================");
  console.log(`Campaign ID: ${output.campaignId}`);
  console.log(`Intent Event: ${output.intent.event}`);
  console.log(`Creative Concept A: "${output.conceptA.creative_direction}"`);
  console.log(`Concept A Image URL: ${output.conceptA.image_url?.slice(0, 50)}... (Base64 PNG ~${Math.round((output.conceptA.image_url?.length || 0) / 1024)} KB)`);
  console.log(`Critic A Score: ${output.critiqueA.brand_alignment_score}/100 (Voice: ${output.critiqueA.voice_compliance ? "Passed" : "Failed"})`);
  console.log(`Creative Concept B: "${output.conceptB.creative_direction}"`);
  console.log(`Critic B Score: ${output.critiqueB.brand_alignment_score}/100`);
  console.log("====================================================");
}

testFullPipeline().catch((err) => {
  console.error("Pipeline test failed:", err);
});
