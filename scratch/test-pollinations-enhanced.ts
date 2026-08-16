import fs from "fs";
import path from "path";

async function testPollinationsEnhanced() {
  const prompt = "Editorial photography, vertical 4:5 portrait composition for social media, a candid Indian family celebrating Independence Day in a historic Jaipur courtyard, warm golden hour side-lighting, rich earth tones, shot on 35mm lens, photorealistic 8k";

  const cleanPrompt = prompt
    .replace(/["'#]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);

  const encodedPrompt = encodeURIComponent(cleanPrompt);

  // Test 1: Without enhance
  console.log("=== Test 1: Pollinations Flux (standard) ===");
  const url1 = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1350&nologo=true&seed=100&model=flux`;
  const r1 = await fetchImage(url1, "pollinations-standard.jpg");

  // Test 2: With enhance=true
  console.log("\n=== Test 2: Pollinations Flux (enhanced=true) ===");
  const url2 = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1350&nologo=true&seed=100&model=flux&enhance=true`;
  const r2 = await fetchImage(url2, "pollinations-enhanced.jpg");

  // Test 3: Server-side fetch returning data URL (what we'd do in API route)
  console.log("\n=== Test 3: Server-side fetch → base64 data URL ===");
  const url3 = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1350&nologo=true&seed=200&model=flux`;
  const start = Date.now();
  const res = await fetch(url3, { signal: AbortSignal.timeout(30000) });
  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    const dataUrl = `data:image/jpeg;base64,${buf.toString("base64")}`;
    console.log(`Server-side fetch: ${Date.now() - start}ms, dataUrl length: ${dataUrl.length} chars`);
    console.log(`✅ Server-side base64 data URL generation works! Can be returned from API route.`);
  }

  console.log("\n=== Summary ===");
  console.log("Standard:  ", r1 ? `✅ ${r1.size} bytes, ${r1.ms}ms` : "❌ FAILED");
  console.log("Enhanced:  ", r2 ? `✅ ${r2.size} bytes, ${r2.ms}ms` : "❌ FAILED");
}

async function fetchImage(url: string, filename: string) {
  const start = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
    const ms = Date.now() - start;
    console.log(`Status: ${res.status}, Duration: ${ms}ms`);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      console.log(`Image size: ${buf.length} bytes`);
      fs.writeFileSync(path.resolve(process.cwd(), "scratch", filename), buf);
      console.log(`Saved: scratch/${filename}`);
      return { size: buf.length, ms };
    }
  } catch (e: any) {
    console.log(`Error: ${e.message}`);
  }
  return null;
}

testPollinationsEnhanced();
