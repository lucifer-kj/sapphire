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

async function testCloudflareAI() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  console.log("Account ID:", accountId ? `${accountId.slice(0, 6)}...` : "missing");
  console.log("API Token:", apiToken ? `${apiToken.slice(0, 6)}...` : "missing");

  if (!accountId || !apiToken) {
    console.error("Missing Cloudflare credentials");
    return;
  }

  const prompt = "Editorial photography, vertical 4:5 portrait composition, candid Indian family celebrating in a historic Jaipur courtyard, warm golden hour side-lighting, rich earth tones, shot on 35mm lens, photorealistic 8k";

  const models = [
    "@cf/black-forest-labs/flux-1-schnell",
    "@cf/bytedance/stable-diffusion-xl-lightning",
    "@cf/stabilityai/stable-diffusion-xl-base-1.0",
  ];

  for (const model of models) {
    console.log(`\n========================================`);
    console.log(`Testing Cloudflare model: ${model}`);
    console.log(`========================================`);
    const start = Date.now();

    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          num_steps: model.includes("lightning") || model.includes("schnell") ? 4 : 20,
        }),
        signal: AbortSignal.timeout(30000),
      });

      const elapsed = Date.now() - start;
      console.log(`HTTP Status: ${res.status} ${res.statusText} (${elapsed}ms)`);
      console.log(`Content-Type: ${res.headers.get("content-type")}`);

      const contentType = res.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        if (data.result && data.result.image) {
          const buf = Buffer.from(data.result.image, "base64");
          console.log(`✅ SUCCESS! Base64 decoded: ${buf.length} bytes`);
          const filename = `cf-${model.split("/").pop()}.jpg`;
          fs.writeFileSync(path.resolve(process.cwd(), "scratch", filename), buf);
          console.log(`Saved to scratch/${filename}`);
        } else {
          console.log("JSON response without image:", JSON.stringify(data).slice(0, 300));
        }
      } else if (contentType.includes("image/")) {
        const buf = Buffer.from(await res.arrayBuffer());
        console.log(`✅ SUCCESS! Binary image: ${buf.length} bytes`);
        const filename = `cf-${model.split("/").pop()}.jpg`;
        fs.writeFileSync(path.resolve(process.cwd(), "scratch", filename), buf);
        console.log(`Saved to scratch/${filename}`);
      } else {
        const text = await res.text();
        console.log("Unexpected response:", text.slice(0, 300));
      }
    } catch (err: any) {
      console.error(`❌ Error with ${model}:`, err.message);
    }
  }
}

testCloudflareAI();
