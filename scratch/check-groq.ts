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

async function checkGroqDetail() {
  const groqKey = process.env.GROQ_API_KEY;
  console.log("Groq Key prefix:", groqKey ? groqKey.slice(0, 8) + "..." : "none");
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${groqKey}` },
    });
    console.log("Groq API response status:", res.status);
    const data = await res.json();
    if (res.ok) {
      console.log("Available models count:", data.data?.length);
    } else {
      console.log("Groq Error details:", data);
    }
  } catch (err: any) {
    console.log("Fetch error:", err.message);
  }
}

checkGroqDetail();
