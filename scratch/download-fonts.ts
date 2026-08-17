import fs from "fs";
import path from "path";

async function downloadFonts() {
  const fontsDir = path.resolve(process.cwd(), "src", "assets", "fonts");
  if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
  }

  const fontFiles = [
    {
      name: "PlusJakartaSans-Bold.ttf",
      url: "https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-700-normal.ttf",
    },
    {
      name: "PlusJakartaSans-Regular.ttf",
      url: "https://cdn.jsdelivr.net/fontsource/fonts/plus-jakarta-sans@latest/latin-400-normal.ttf",
    },
    {
      name: "Inter-Bold.ttf",
      url: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf",
    },
    {
      name: "Inter-Regular.ttf",
      url: "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf",
    },
  ];

  for (const font of fontFiles) {
    const filePath = path.join(fontsDir, font.name);
    console.log(`Downloading ${font.name}...`);
    const res = await fetch(font.url);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buf);
      console.log(`✅ Saved ${font.name} (${buf.length} bytes) to src/assets/fonts/`);
    } else {
      console.error(`❌ Failed to download ${font.name}`);
    }
  }
}

downloadFonts();
