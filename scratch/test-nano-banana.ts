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

async function testNanoBanana(modelName: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log(`\nTesting ${modelName}...`);
  
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const prompt = "Cinematic vertical 4:5 editorial photography of an Indian family celebrating Independence Day at an authentic historic courtyard in Rajasthan, soft golden hour sunlight, marigold garlands, rich warm earth tones, shot on 35mm lens, photorealistic 8k";

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    }),
  });

  console.log(`Status for ${modelName}:`, res.status, res.statusText);
  if (!res.ok) {
    console.error("Error payload:", await res.text());
    return;
  }

  const data = await res.json();
  const candidatePart = data?.candidates?.[0]?.content?.parts?.[0];
  const inlineData = candidatePart?.inlineData;

  if (inlineData?.data && inlineData?.mimeType) {
    console.log(`SUCCESS! Generated ${inlineData.mimeType} base64 string with length ${inlineData.data.length} bytes!`);
  } else {
    console.log("Response JSON structure:", JSON.stringify(data).slice(0, 300));
  }
}

async function run() {
  await testNanoBanana("gemini-3.1-flash-image");
  await testNanoBanana("gemini-3-pro-image");
  await testNanoBanana("gemini-3.1-flash-lite-image");
}

run();
