import fs from "fs";
import path from "path";

function checkEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    const content = fs.readFileSync(envPath, "utf8");
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (key.toLowerCase().includes("put") || key.toLowerCase().includes("purt") || key.toLowerCase().includes("token")) {
          console.log(`Found matching key: "${key}", length=${val.length}, prefix=${val.slice(0, 8)}...`);
        }
      }
    }
  } catch (err: any) {
    console.error("Error reading .env.local:", err.message);
  }
}

checkEnv();
