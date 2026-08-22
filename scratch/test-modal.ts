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

async function testModalEndpoint() {
  const endpoint = process.env.MODAL_QWEN_ENDPOINT_URL;
  const apiKey = process.env.MODAL_QWEN_API_KEY;

  console.log("Calling Modal Serverless GPU endpoint (warm run)...");
  const prompt = "A cinematic 35mm photograph of an artisanal pour-over coffee ritual in a sunlit Milanese café, Leica 50mm f/1.4, warm morning light, authentic grain, clean negative space upper 40%";

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const start = Date.now();
  try {
    const res = await fetch(endpoint!, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        width: 1080,
        height: 1350,
        steps: 4,
        seed: 42,
      }),
      signal: AbortSignal.timeout(120000), // 120s max
    });

    console.log(`Response Status: ${res.status} (${Date.now() - start}ms)`);

    if (!res.ok) {
      const text = await res.text();
      console.log("Error response from Modal:", text);
      return;
    }

    const data = await res.json();
    if (data.image) {
      console.log(`✅ Modal returned image! Base64 length: ~${Math.round(data.image.length / 1024)} KB`);
      const base64Data = data.image.replace(/^data:image\/[a-z]+;base64,/, "");

      const publicSamplesDir = path.resolve(process.cwd(), "public", "samples");
      if (!fs.existsSync(publicSamplesDir)) {
        fs.mkdirSync(publicSamplesDir, { recursive: true });
      }

      const modalOutputPath = path.join(publicSamplesDir, "modal-qwen-sample.png");
      fs.writeFileSync(modalOutputPath, Buffer.from(base64Data, "base64"));
      console.log(`✅ Saved image to: ${modalOutputPath}`);

      const artifactDir = "C:\\Users\\USER\\.gemini\\antigravity\\brain\\dd44f7d0-40d6-4dcb-8c8e-81c705385efe";
      if (fs.existsSync(artifactDir)) {
        const artifactPath = path.join(artifactDir, "modal-qwen-sample.png");
        fs.writeFileSync(artifactPath, Buffer.from(base64Data, "base64"));
        console.log(`✅ Copied to artifact directory: ${artifactPath}`);
      }
    }
  } catch (err: any) {
    console.log(`❌ Modal error:`, err?.message || err);
  }
}

testModalEndpoint().catch(console.error);
