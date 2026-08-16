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

async function testKey(keyName: string, apiKey: string) {
  console.log(`\n========================================`);
  console.log(`Testing Key: ${keyName} (${apiKey.slice(0, 8)}...${apiKey.slice(-4)})`);
  console.log(`========================================`);

  const models = [
    "gemini-2.5-flash-image",
    "gemini-3.1-flash-image",
    "gemini-3-pro-image-preview",
    "gemini-3.7-flash",
    "gemini-3.1-flash-lite",
  ];

  for (const model of models) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const isImageModel = model.includes("image");

    const payload: any = {
      contents: [{ parts: [{ text: isImageModel ? "A high quality vertical 4:5 editorial travel photograph of Japan during cherry blossom season, 8k" : "Say 'OK'" }] }],
    };

    if (isImageModel) {
      payload.generationConfig = {
        responseModalities: ["TEXT", "IMAGE"],
      };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log(`[${model}] -> Status ${res.status} ${res.statusText}`);
      const bodyText = await res.text();

      if (res.ok) {
        const data = JSON.parse(bodyText);
        const parts = data?.candidates?.[0]?.content?.parts || [];
        let hasImage = false;
        for (const p of parts) {
          if (p.inlineData) {
            hasImage = true;
            console.log(`  🎉 SUCCESS: Image generated! MimeType=${p.inlineData.mimeType}, Size=${p.inlineData.data?.length} chars`);
            const buffer = Buffer.from(p.inlineData.data, "base64");
            fs.writeFileSync(path.resolve(process.cwd(), "scratch", `generated-${model}.jpg`), buffer);
            console.log(`  Saved to scratch/generated-${model}.jpg!`);
          } else if (p.text) {
            console.log(`  Text output: ${p.text.slice(0, 100)}`);
          }
        }
      } else {
        const errObj = JSON.parse(bodyText);
        console.log(`  Error: ${errObj?.error?.message?.slice(0, 200)}`);
      }
    } catch (e: any) {
      console.log(`  Exception on ${model}: ${e.message}`);
    }
  }
}

async function run() {
  const secondaryKey = process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY;
  if (secondaryKey) {
    await testKey("SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY", secondaryKey);
  } else {
    console.log("No SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY found!");
  }
}

run();
