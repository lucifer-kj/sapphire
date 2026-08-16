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

async function testImagen(modelName: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log(`\nTesting Imagen 4 model: ${modelName}...`);
  
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:predict?key=${apiKey}`;
  
  const prompt = "Editorial travel photography of an Indian family celebrating Independence Day in a historic courtyard in Jaipur, golden hour lighting, 35mm lens, 4:5 aspect ratio";

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [
          {
            prompt: prompt,
          },
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: "4:5", // 4:5 social media aspect ratio
          outputOptions: {
            mimeType: "image/jpeg",
          },
        },
      }),
    });

    console.log(`Status for ${modelName}:`, res.status, res.statusText);
    if (!res.ok) {
      const errText = await res.text();
      console.error("Error payload:", errText.slice(0, 300));
      return false;
    }

    const data = await res.json();
    const bytesBase64 = data?.predictions?.[0]?.bytesBase64Encoded;
    if (bytesBase64) {
      console.log(`[PASS] ${modelName} returned image with ${bytesBase64.length} base64 chars!`);
      return true;
    } else {
      console.log("Response structure:", JSON.stringify(data).slice(0, 200));
      return false;
    }
  } catch (e: any) {
    console.error("Exception:", e.message);
    return false;
  }
}

async function run() {
  await testImagen("imagen-4.0-fast-generate-001");
  await testImagen("imagen-4.0-generate-001");
  await testImagen("imagen-4.0-ultra-generate-001");
}

run();
