import { KnowledgeBaseService } from "@/services/kb-loader";
import { DesignKnowledgeService } from "@/services/design-knowledge";

async function testLocalRAG() {
  console.log("====================================================");
  console.log("      VERIFYING ZERO-LATENCY LOCAL RAG INGESTION    ");
  console.log("====================================================");

  const modules = KnowledgeBaseService.getAllModules();
  console.log(`✅ Total Local RAG Modules Active: ${modules.length}`);

  const queries = [
    "artisanal coffee morning ritual",
    "b2b enterprise saas retention strategy",
    "minimalist luxury product drop",
    "viral algorithm hook mechanics",
  ];

  for (const q of queries) {
    const start = Date.now();
    const results = await DesignKnowledgeService.searchKnowledge(q, 2);
    console.log(`\n🔎 Query: "${q}" (${Date.now() - start}ms)`);
    results.forEach((r, i) => {
      console.log(`   [Result ${i + 1}] Theme: "${r.theme_name}" | Category: ${r.category}`);
      console.log(`      Typography: ${r.composition_rules.typography_rules.slice(0, 60)}...`);
      console.log(`      Visual: ${r.composition_rules.visual_hierarchy.slice(0, 60)}...`);
    });
  }

  console.log("\n====================================================");
}

testLocalRAG().catch(console.error);
