import fs from "fs";
import path from "path";

try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
} catch {}

async function testCF() {
  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

  const cfModel = "@cf/black-forest-labs/flux-1-schnell";
  const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/${cfModel}`;

  const prompt = "A 35mm photograph of a Milanese barista pouring espresso into a ceramic cup on a wooden table, warm morning light";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      steps: 4,
    }),
  });

  const data = await res.json();
  console.log("CF response:", JSON.stringify(data, null, 2));
}

testCF().catch(console.error);
