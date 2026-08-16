import fs from "fs";
import path from "path";

function checkEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (!fs.existsSync(envPath)) {
      console.log("No .env.local found");
      return;
    }

    const envContent = fs.readFileSync(envPath, "utf8");
    const keys: string[] = [];
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        keys.push(`${key}: length=${val.length}, prefix=${val.slice(0, 7)}...`);
      }
    }

    console.log("Found environment keys in .env.local:");
    console.log(keys.join("\n"));
  } catch (err: any) {
    console.error("Error reading .env.local:", err.message);
  }
}

checkEnv();
