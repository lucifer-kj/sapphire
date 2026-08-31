import { PromptIntelligenceWorkflow } from "../src/modules/prompt-intelligence/workflow/prompt-intelligence-workflow";

async function main() {
  console.log("=== Testing Prompt Intelligence Workflow (Instagram Brief) ===");
  const testBrief = "Create an editorial travel post for Vagabond Travel showcasing luxury train journeys in the Swiss Alps";
  
  const result = await PromptIntelligenceWorkflow.execute(
    testBrief,
    "vagabond-travel",
    "instagram",
    async (step, total, summary, status) => {
      console.log(`[Stage ${step}/${total}] ${status.toUpperCase()}: ${summary}`);
    }
  );

  console.log("\n=== Workflow Execution Output ===");
  console.log("Result ID:", result.id);
  console.log("Post Type:", result.post_type);
  console.log("Archetype:", result.archetype);
  console.log("Recommended Model:", result.model_recommendation.displayName, `(${result.aspect_ratio})`);
  console.log("Model Selection Rationale:", result.model_recommendation.selectionReason);
  console.log("Critic Score:", `${result.critic_evaluation.score}/100 (Pass: ${result.critic_evaluation.pass})`);
  console.log("\n=== Final Production Prompt ===");
  console.log(result.final_prompt);
  console.log("\n=== Strategic Rationale ===");
  console.log("Creative:", result.rationale.creative_direction_reason);
  console.log("Platform:", result.rationale.platform_psychology_reason);
}

main().catch(console.error);
