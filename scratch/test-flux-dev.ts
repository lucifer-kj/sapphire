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

async function testFluxDev() {
  const prompt = "An artisanal morning coffee ritual in a luxury mountain cabin, cinematic warm lighting, high resolution";
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1350&nologo=true&seed=42&model=flux-dev`;
  console.log("Testing Pollinations FLUX Dev URL:", url);
  const start = Date.now();
  const res = await fetch(url);
  console.log(`Pollinations FLUX Dev status: ${res.status} (${Date.now() - start}ms, content-type: ${res.headers.get("content-type")})`);
}

testFluxDev();
