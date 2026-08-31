import { PromptIntelligenceWorkflow } from "../src/modules/prompt-intelligence/workflow/prompt-intelligence-workflow";
import { Platform } from "../src/modules/prompt-intelligence/domain/prompt-intent";

interface BenchmarkScenario {
  name: string;
  brief: string;
  brandId: string;
  platform: Platform;
  expectedPostType: string;
  expectedArchetype: string;
}

const BENCHMARK_SUITE: BenchmarkScenario[] = [
  {
    name: "Instagram Luxury Hospitality",
    brief: "Boutique eco-resort in Bali with open bamboo pavilions and serene infinity pool surrounded by rainforest morning mist",
    brandId: "vagabond-travel",
    platform: "instagram",
    expectedPostType: "lifestyle_editorial",
    expectedArchetype: "editorial_magazine",
  },
  {
    name: "LinkedIn B2B AI Thought Leadership",
    brief: "Why developer velocity slows down after series B: breaking down the microservice complexity trap into a 3-step refactoring framework",
    brandId: "vagabond-travel",
    platform: "linkedin",
    expectedPostType: "thought_leadership",
    expectedArchetype: "conceptual_split",
  },
  {
    name: "Instagram Artisanal Coffee Craft",
    brief: "Single-origin Ethiopian pour-over ritual with macro coffee blooming and golden warm morning light",
    brandId: "vagabond-travel",
    platform: "instagram",
    expectedPostType: "product_promotion",
    expectedArchetype: "editorial_magazine",
  },
];

async function runBenchmark() {
  console.log("===============================================================");
  console.log("   SAPPHIRE V2 PROMPT INTELLIGENCE BENCHMARK EVALUATION SUITE  ");
  console.log("===============================================================\n");

  const results: any[] = [];

  for (const [idx, scenario] of BENCHMARK_SUITE.entries()) {
    console.log(`[${idx + 1}/${BENCHMARK_SUITE.length}] Evaluating: ${scenario.name}...`);
    const start = Date.now();

    try {
      const output = await PromptIntelligenceWorkflow.execute(
        scenario.brief,
        scenario.brandId,
        scenario.platform
      );
      const elapsed = Date.now() - start;

      console.log(`  ✓ Passed in ${elapsed}ms`);
      console.log(`    - Post Type: ${output.post_type}`);
      console.log(`    - Model: ${output.model_recommendation.displayName} (${output.aspect_ratio})`);
      console.log(`    - Quality Score: ${output.critic_evaluation.score}/100`);
      console.log(`    - Prompt Preview: ${output.final_prompt.slice(0, 100)}...\n`);

      results.push({
        name: scenario.name,
        platform: scenario.platform,
        postType: output.post_type,
        model: output.model_recommendation.displayName,
        score: output.critic_evaluation.score,
        pass: output.critic_evaluation.pass,
        elapsedMs: elapsed,
      });
    } catch (err: any) {
      console.error(`  ✕ Scenario failed:`, err.message);
    }
  }

  console.log("===============================================================");
  console.log("                      BENCHMARK SUMMARY                        ");
  console.log("===============================================================");
  console.table(results);
}

runBenchmark().catch(console.error);
