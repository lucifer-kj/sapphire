import fs from "fs";
import path from "path";

async function testPollinations() {
  const prompt = "Editorial photography, vertical 4:5 portrait composition for social media, a candid Indian family celebrating Independence Day in a historic Jaipur courtyard, warm golden hour side-lighting, rich earth tones, shot on 35mm lens, photorealistic 8k";

  const cleanPrompt = prompt
    .replace(/["'#]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);

  const encodedPrompt = encodeURIComponent(cleanPrompt);

  const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1350&nologo=true&seed=42&model=flux`;

  console.log("Testing Pollinations Flux with URL:");
  console.log(url.slice(0, 200) + "...");
  console.log(`\nFetching image...`);

  const start = Date.now();
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(30000),
    });

    const elapsed = Date.now() - start;
    console.log(`\nHTTP Status: ${res.status} ${res.statusText}`);
    console.log(`Content-Type: ${res.headers.get("content-type")}`);
    console.log(`Content-Length: ${res.headers.get("content-length")}`);
    console.log(`Duration: ${elapsed}ms`);

    if (res.ok) {
      const buffer = Buffer.from(await res.arrayBuffer());
      console.log(`Image buffer size: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(1)} KB)`);

      if (buffer.length > 1000) {
        fs.writeFileSync(path.resolve(process.cwd(), "scratch", "pollinations-test.jpg"), buffer);
        console.log(`\n✅ SUCCESS! Saved to scratch/pollinations-test.jpg`);
      } else {
        console.log(`\n⚠️ Image too small (${buffer.length} bytes) — may be a placeholder or error`);
        console.log("Body text:", buffer.toString("utf8").slice(0, 200));
      }
    } else {
      const body = await res.text();
      console.log(`Error body:`, body.slice(0, 300));
    }
  } catch (err: any) {
    const elapsed = Date.now() - start;
    console.error(`\n❌ FAILED after ${elapsed}ms:`, err.message);
  }
}

testPollinations();
