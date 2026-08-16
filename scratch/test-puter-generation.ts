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

async function testPuter() {
  const token = process.env.PUTER_AUTH_TOKEN || process.env.PURT_AUTH_TOKEN;
  console.log("Token length:", token?.length || 0, "Prefix:", token?.slice(0, 10));

  if (!token) {
    console.error("No Puter token found!");
    return;
  }

  try {
    // Dynamic import of puter
    const { init } = await import("@heyputer/puter.js/src/init.cjs" as any);
    const puter = init(token);

    console.log("Initialized Puter. Testing txt2img...");
    const start = Date.now();
    const prompt = "Editorial photography, vertical 4:5 portrait composition, a candid Indian family celebrating in a sunlit Jaipur courtyard, golden hour lighting, 35mm lens, photorealistic 8k";

    const imageResult = await puter.ai.txt2img(prompt);
    console.log(`Generated in ${Date.now() - start}ms! Result type:`, typeof imageResult);

    if (imageResult) {
      if (typeof imageResult === "string") {
        console.log("Image result string length:", imageResult.length, imageResult.slice(0, 50));
      } else if (imageResult.src) {
        console.log("Image src length:", imageResult.src.length, imageResult.src.slice(0, 50));
      } else {
        console.log("Image object keys:", Object.keys(imageResult));
      }
    }
  } catch (err: any) {
    console.error("Error in Puter txt2img:", err);
  }
}

testPuter();
