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

async function testPuterRest() {
  const token = process.env.PUTER_AUTH_TOKEN || process.env.PURT_AUTH_TOKEN;
  console.log("Testing Puter REST API with token prefix:", token?.slice(0, 15));

  const prompt = "A candid Indian family celebrating in a sunlit Jaipur courtyard, golden hour lighting, 35mm lens, photorealistic 8k";

  // Test standard Puter endpoints
  const endpoints = [
    {
      url: "https://api.puter.com/drivers/call",
      body: {
        interface: "puter-image-generation",
        driver: "flux-schnell",
        method: "txt2img",
        args: { prompt },
      },
    },
    {
      url: "https://api.puter.com/ai/txt2img",
      body: {
        prompt,
        model: "flux-schnell",
      },
    },
    {
      url: "https://api.puter.com/ai/txt2img",
      body: {
        prompt,
        model: "gpt-image-1-mini",
      },
    },
  ];

  for (const ep of endpoints) {
    console.log(`\nTesting ${ep.url} with body:`, JSON.stringify(ep.body).slice(0, 80));
    try {
      const res = await fetch(ep.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(ep.body),
        signal: AbortSignal.timeout(15000),
      });

      console.log(`Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log(`Response:`, text.slice(0, 200));
    } catch (e: any) {
      console.log(`Error:`, e.message);
    }
  }
}

testPuterRest();
