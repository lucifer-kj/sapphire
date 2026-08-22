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

async function testImg() {
  const { ImageGenerationService } = await import("@/services/image-generation");
  const prompt = "A 35mm photo of a Milanese barista pouring espresso into a ceramic cup on a wooden table, warm morning light";
  console.log("Calling ImageGenerationService.generatePostImage...");
  const start = Date.now();
  const res = await ImageGenerationService.generatePostImage(prompt);
  console.log(`Provider: ${res.provider}`);
  console.log(`Status: ${res.status}`);
  console.log(`URL prefix: ${res.url.slice(0, 40)}... (length: ${res.url.length}) in ${Date.now() - start}ms`);
}

testImg().catch(console.error);
