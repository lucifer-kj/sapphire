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

async function testCloudflareFlux() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  console.log("Testing Cloudflare FLUX 1 Schnell with correct schema...");
  const start = Date.now();

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;

  const prompt = "Studio commercial product photography, vertical 4:5 portrait, a clear plastic cup filled with iced latte coffee and ice cubes with condensation droplets, floating dark roasted coffee beans scattered around, warm beige background studio lighting, 8k resolution";

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(30000),
    });

    const elapsed = Date.now() - start;
    console.log(`Status: ${res.status} ${res.statusText} (${elapsed}ms)`);
    console.log(`Content-Type: ${res.headers.get("content-type")}`);

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("image/")) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log(`✅ SUCCESS! Binary FLUX image: ${buf.length} bytes`);
      fs.writeFileSync(path.resolve(process.cwd(), "scratch", "cf-flux-schnell.jpg"), buf);
    } else {
      const text = await res.text();
      console.log("Response:", text.slice(0, 300));
    }
  } catch (e: any) {
    console.error("Error:", e.message);
  }
}

testCloudflareFlux();
