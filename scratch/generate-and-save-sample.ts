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

async function generateAndSavePost() {
  console.log("====================================================");
  console.log("   GENERATING HIGH-END EDITORIAL BRAND POST (SAMPLE) ");
  console.log("====================================================");

  const { PRECONFIGURED_BRANDS } = await import("@/lib/constants/brands");
  const { CampaignWorkflow } = await import("@/mastra/workflows/campaign-workflow");

  const brand = PRECONFIGURED_BRANDS[0]; // Vagabond Travel Agency
  const topic = "Hidden Espresso Bars of Milan: The Art of Slow Morning Coffee";

  console.log(`Brand: "${brand.name}" (${brand.industry})`);
  console.log(`Topic: "${topic}"\n`);

  const start = Date.now();

  const campaign = await CampaignWorkflow.execute(
    topic,
    brand.id,
    "instagram",
    async (step, total, msg, state) => {
      console.log(`   [Step ${step}/${total}] [${state.toUpperCase()}] ${msg}`);
    }
  );

  const durationSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n🎉 Campaign Generated in ${durationSec}s!`);

  // Ensure public/samples directory exists
  const publicSamplesDir = path.resolve(process.cwd(), "public", "samples");
  if (!fs.existsSync(publicSamplesDir)) {
    fs.mkdirSync(publicSamplesDir, { recursive: true });
  }

  // Save Concept A image
  const imgDataA = campaign.brief.concept_a.image_url;
  if (imgDataA && imgDataA.startsWith("data:image/png;base64,")) {
    const base64Data = imgDataA.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(publicSamplesDir, "sample-concept-a.png");
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
    console.log(`✅ Saved Concept A image to: ${filePath}`);

    // Also copy to artifact directory for presentation
    const artifactDir = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\dd44f7d0-40d6-4dcb-8c8e-81c705385efe";
    if (fs.existsSync(artifactDir)) {
      const artifactPath = path.join(artifactDir, "sample-concept-a.png");
      fs.writeFileSync(artifactPath, Buffer.from(base64Data, "base64"));
      console.log(`✅ Copied to artifact directory: ${artifactPath}`);
    }
  }

  // Save Concept B image
  const imgDataB = campaign.brief.concept_b.image_url;
  if (imgDataB && imgDataB.startsWith("data:image/png;base64,")) {
    const base64Data = imgDataB.replace(/^data:image\/png;base64,/, "");
    const filePath = path.join(publicSamplesDir, "sample-concept-b.png");
    fs.writeFileSync(filePath, Buffer.from(base64Data, "base64"));
    console.log(`✅ Saved Concept B image to: ${filePath}`);

    const artifactDir = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\dd44f7d0-40d6-4dcb-8c8e-81c705385efe";
    if (fs.existsSync(artifactDir)) {
      const artifactPath = path.join(artifactDir, "sample-concept-b.png");
      fs.writeFileSync(artifactPath, Buffer.from(base64Data, "base64"));
      console.log(`✅ Copied to artifact directory: ${artifactPath}`);
    }
  }

  console.log("\n====================================================");
  console.log("Concept A Creative Direction:");
  console.log(campaign.brief.concept_a.creative_direction);
  console.log("\nConcept A Prompt (Photorealistic):");
  console.log(campaign.brief.concept_a.image_prompt);
  console.log(`\nConcept A Critic Score: ${campaign.critiqueA.brand_alignment_score}/100`);
  console.log("====================================================");
}

generateAndSavePost().catch(console.error);
