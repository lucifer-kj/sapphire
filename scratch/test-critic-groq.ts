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

async function testCritic() {
  const { CriticAgent } = await import("@/mastra/agents/critic-agent");
  const { PRECONFIGURED_BRANDS } = await import("@/lib/constants/brands");

  console.log("Testing CriticAgent directly on Groq (openai/gpt-oss-120b)...");
  const start = Date.now();
  const result = await CriticAgent.evaluateConcept(
    {
      label: "Concept A",
      creative_direction: "Intimate morning coffee ritual in remote mountain cabin",
      visual_style: "Editorial photography",
      composition: "Subject bottom-right, clean negative space upper 40%",
      lighting: "Warm morning golden hour",
      color_palette: ["#09090b", "#FAF7F2", "#D97757"],
      image_prompt: "A steaming cup of pour-over coffee on a weathered wooden ledge overlooking misty alpine peaks",
      caption_instagram: "The world begins after the first sip. ☕️ Discover slow mornings with Vagabond.",
      caption_linkedin: "Why the best travel experiences aren't rushed itineraries, but intentional rituals.",
    },
    PRECONFIGURED_BRANDS[0],
    "instagram"
  );

  console.log(`✅ CriticAgent on Groq executed in ${Date.now() - start}ms:`);
  console.log(`   Brand Alignment Score: ${result.brand_alignment_score}/100`);
  console.log(`   Visual Score: ${result.visual_score}/100`);
  console.log(`   Voice Compliance: ${result.voice_compliance}`);
  console.log(`   Suggestions:`, result.suggestions);
}

testCritic().catch(console.error);
