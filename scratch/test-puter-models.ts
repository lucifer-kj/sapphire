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

async function testPuterModels() {
  const token = process.env.PUTER_AUTH_TOKEN || process.env.PURT_AUTH_TOKEN;
  const { init } = await import("@heyputer/puter.js/src/init.cjs" as any);
  const puter = init(token);

  const models = [
    "flux-schnell",
    "flux",
    "flux-dev",
    "gpt-image-1-mini",
    "dall-e-3",
    "sdxl",
    "stable-diffusion-xl",
  ];

  const prompt = "A candid Indian family celebrating in a sunlit Jaipur courtyard, golden hour lighting, 35mm lens, photorealistic 8k";

  for (const model of models) {
    console.log(`\nTesting Puter with model: "${model}"...`);
    const start = Date.now();
    try {
      const res = await puter.ai.txt2img(prompt, { model });
      const elapsed = Date.now() - start;
      console.log(`✅ SUCCESS on model "${model}" (${elapsed}ms)! Result type:`, typeof res);
      
      let src = "";
      if (typeof res === "string") {
        src = res;
      } else if (res?.src) {
        src = res.src;
      } else if (res?.url) {
        src = res.url;
      }

      if (src) {
        console.log(`  Image SRC prefix: ${src.slice(0, 60)}... (length: ${src.length})`);
        if (src.startsWith("data:")) {
          const match = src.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
          if (match) {
            fs.writeFileSync(path.resolve(process.cwd(), "scratch", `puter-${model}.jpg`), Buffer.from(match[1], "base64"));
            console.log(`  Saved to scratch/puter-${model}.jpg!`);
          }
        }
      } else {
        console.log("  Result object:", res);
      }
    } catch (err: any) {
      console.log(`❌ Error on "${model}":`, err?.message || err?.error || err);
    }
  }
}

testPuterModels();
