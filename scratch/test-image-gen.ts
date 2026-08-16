import fs from "fs";
import { ImageGenerationService } from "../src/services/image-generation";

if (fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valParts] = trimmed.split("=");
      if (key && valParts.length > 0) {
        process.env[key.trim()] = valParts.join("=").trim();
      }
    }
  }
}

async function testImageGen() {
  const url = ImageGenerationService.generateImageUrl("Family vacation in Kyoto Japan with cherry blossoms, golden hour, 8k", 12345);
  console.log("Generated Image URL:", url);

  try {
    const res = await fetch(url, { method: "HEAD" });
    console.log("Image URL HTTP Status:", res.status, res.headers.get("content-type"));
  } catch (err: any) {
    console.error("Image Fetch Error:", err.message);
  }
}

testImageGen();
