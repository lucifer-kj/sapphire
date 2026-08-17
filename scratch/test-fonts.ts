import fs from "fs";
import path from "path";

async function testFonts() {
  const urls = [
    "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf",
    "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf",
    "https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-700-normal.ttf",
    "https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-400-normal.ttf",
    "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf",
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      console.log(`Status for ${url.slice(0, 60)}...: ${res.status}`);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        console.log(`  Length: ${buf.length} bytes`);
      }
    } catch (e: any) {
      console.log(`  Error: ${e.message}`);
    }
  }
}

testFonts();
