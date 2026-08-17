import fs from "fs";
import path from "path";

function loadEnv() {
  try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  } catch (e) {
    console.error("Could not load .env.local", e);
  }
}

loadEnv();

async function runE2EWorkflowTest() {
  const { CampaignWorkflow } = await import("../src/mastra/workflows/campaign-workflow");

  console.log("=================================================");
  console.log("Starting End-to-End Canva-Grade Campaign Test...");
  console.log("=================================================");

  const prompt = "Launch campaign for our artisanal iced cold brew coffee and bakery breakfast menu";
  const start = Date.now();

  try {
    const result = await CampaignWorkflow.run(prompt);
    const elapsed = Date.now() - start;

    console.log(`\n🎉 Campaign Workflow Completed in ${elapsed}ms!`);
    console.log(`Campaign ID: ${result.campaignId}`);
    console.log(`Campaign Title: ${result.brief.campaign_title}`);
    console.log(`\nConcept A: ${result.brief.concept_a.label}`);
    console.log(`  Archetype: ${result.brief.concept_a.design_blueprint?.archetype}`);
    console.log(`  Headline: ${result.brief.concept_a.design_blueprint?.headline}`);
    console.log(`  Image URL Length: ${result.brief.concept_a.image_url?.length || 0}`);

    console.log(`\nConcept B: ${result.brief.concept_b.label}`);
    console.log(`  Archetype: ${result.brief.concept_b.design_blueprint?.archetype}`);
    console.log(`  Headline: ${result.brief.concept_b.design_blueprint?.headline}`);
    console.log(`  Image URL Length: ${result.brief.concept_b.image_url?.length || 0}`);

    console.log(`\nCritique A Brand Alignment: ${result.critiqueA.brand_alignment_score}/100`);
    console.log(`Critique B Brand Alignment: ${result.critiqueB.brand_alignment_score}/100`);

    // Save generated image A if data url
    if (result.brief.concept_a.image_url?.startsWith("data:image/")) {
      const match = result.brief.concept_a.image_url.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
      if (match) {
        fs.writeFileSync(
          path.resolve(process.cwd(), "scratch", "e2e-concept-a.png"),
          Buffer.from(match[1], "base64")
        );
        console.log(`Saved Concept A image to scratch/e2e-concept-a.png`);
      }
    }

    if (result.brief.concept_b.image_url?.startsWith("data:image/")) {
      const match = result.brief.concept_b.image_url.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
      if (match) {
        fs.writeFileSync(
          path.resolve(process.cwd(), "scratch", "e2e-concept-b.png"),
          Buffer.from(match[1], "base64")
        );
        console.log(`Saved Concept B image to scratch/e2e-concept-b.png`);
      }
    }
  } catch (err: any) {
    console.error("❌ E2E Workflow Test Failed:", err);
  }
}

runE2EWorkflowTest();
