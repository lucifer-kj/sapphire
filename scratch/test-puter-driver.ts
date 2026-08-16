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

async function testPuterDriver() {
  const token = process.env.PUTER_AUTH_TOKEN || process.env.PURT_AUTH_TOKEN;
  console.log("Puter token prefix:", token?.slice(0, 15));

  const prompt = "A candid Indian family celebrating in a sunlit Jaipur courtyard, golden hour lighting, 35mm lens, photorealistic 8k";

  const payload = {
    interface: "puter-image-generation",
    driver: "ai-image",
    method: "generate",
    args: {
      prompt,
      model: "flux-schnell",
    },
  };

  console.log("Calling https://api.puter.com/drivers/call with payload:", payload);
  const start = Date.now();

  try {
    const res = await fetch("https://api.puter.com/drivers/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    const elapsed = Date.now() - start;
    console.log(`HTTP Status: ${res.status} ${res.statusText} (${elapsed}ms)`);
    console.log(`Content-Type:`, res.headers.get("content-type"));

    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      console.log(`Received ${buffer.length} bytes!`);
      fs.writeFileSync(path.resolve(process.cwd(), "scratch", "puter-output.jpg"), buffer);
      console.log(`✅ SUCCESS! Saved to scratch/puter-output.jpg`);
    } else {
      const text = await res.text();
      console.log(`Error Response:`, text.slice(0, 300));
    }
  } catch (e: any) {
    console.log(`Error:`, e.message);
  }
}

testPuterDriver();
