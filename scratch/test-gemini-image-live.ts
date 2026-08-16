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

async function testGeminiImage(modelName: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log(`\n========================================`);
  console.log(`Testing Image Generation with model: ${modelName}`);
  console.log(`========================================`);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const prompt = "Generate a high-quality vertical 4:5 editorial travel photograph of a family enjoying an authentic vacation in Japan during cherry blossom season, warm golden hour lighting, 35mm lens, photorealistic 8k.";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    });

    console.log(`HTTP Status:`, res.status, res.statusText);
    const bodyText = await res.text();

    if (!res.ok) {
      console.log(`Error Response (${res.status}):`, bodyText.slice(0, 300));
      return false;
    }

    const data = JSON.parse(bodyText);
    const parts = data?.candidates?.[0]?.content?.parts || [];
    console.log(`Received ${parts.length} part(s) from candidate.`);

    let hasImage = false;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.inlineData) {
        console.log(`✅ [PART ${i}] Found inlineData image! MimeType: ${part.inlineData.mimeType}, Data Length: ${part.inlineData.data?.length} chars`);
        hasImage = true;
        // Save sample image to verify
        const buffer = Buffer.from(part.inlineData.data, "base64");
        fs.writeFileSync(path.resolve(process.cwd(), "scratch", `output-${modelName.replace(/[^a-zA-Z0-9]/g, "_")}.jpg`), buffer);
        console.log(`Saved sample image to scratch/output-${modelName.replace(/[^a-zA-Z0-9]/g, "_")}.jpg!`);
      } else if (part.text) {
        console.log(`[PART ${i}] Text: ${part.text.slice(0, 150)}...`);
      }
    }

    return hasImage;
  } catch (err: any) {
    console.error(`Exception on ${modelName}:`, err.message);
    return false;
  }
}

async function run() {
  const models = [
    "gemini-2.5-flash-image",
    "gemini-3-pro-image-preview",
    "gemini-3-pro-image",
    "gemini-3.1-flash-image",
    "gemini-3.1-flash-image-preview",
    "nano-banana-pro-preview",
  ];

  for (const m of models) {
    await testGeminiImage(m);
  }
}

run();
