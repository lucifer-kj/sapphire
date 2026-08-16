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

import { CampaignWorkflow } from "../src/mastra/workflows/campaign-workflow";

async function testFullWorkflow() {
  console.log("🚀 Testing Full Campaign Workflow with Gemini 2.5 Flash...");
  const prompt = "Make a post for Japan to promote family vacation.";
  console.log(`Prompt: "${prompt}"`);

  const result = await CampaignWorkflow.run(prompt);

  console.log("\n✅ WORKFLOW EXECUTED SUCCESSFULLY!");
  console.log("-----------------------------------------");
  console.log("Event:", result.intent.event);
  console.log("Industry:", result.intent.industry);
  console.log("Research Summary:", result.research.summary);
  console.log("Campaign Title:", result.brief.campaign_title);
  console.log("\nConcept A Label:", result.brief.concept_a.label);
  console.log("Concept A Image Prompt:", result.brief.concept_a.image_prompt);
  console.log("Concept A Image URL:", result.brief.concept_a.image_url);
  console.log("Concept A Instagram Caption:\n", result.brief.concept_a.caption_instagram);
  console.log("\nConcept B Label:", result.brief.concept_b.label);
  console.log("Concept B Image Prompt:", result.brief.concept_b.image_prompt);
  console.log("Concept B Image URL:", result.brief.concept_b.image_url);
  console.log("Concept B Instagram Caption:\n", result.brief.concept_b.caption_instagram);
}

testFullWorkflow();
