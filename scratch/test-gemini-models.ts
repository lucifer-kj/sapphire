import fs from "fs";
import path from "path";

function loadEnv() {
  try {
    const envContent = fs.readFileSync(path.resolve(process.cwd(), ".env.local"), "utf8");
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
        process.env[key] = val;
      }
    }
  } catch (e) {
    console.error("Could not load .env.local", e);
  }
}

loadEnv();

async function checkGeminiModels() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    console.error("No GOOGLE_GENERATIVE_AI_API_KEY found in .env.local");
    return;
  }

  console.log("Testing API Key:", apiKey.slice(0, 8) + "..." + apiKey.slice(-4));
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    console.log("HTTP Status:", res.status, res.statusText);
    
    if (!res.ok) {
      const errText = await res.text();
      console.error("Error Response:", errText);
      return;
    }

    const data = await res.json();
    console.log(`Found ${data.models?.length || 0} models available for this API key:`);
    
    const relevantModels: any[] = [];
    for (const m of data.models || []) {
      const name = m.name; // e.g. models/gemini-1.5-flash
      const supportedMethods = m.supportedGenerationMethods || [];
      relevantModels.push({
        name: name.replace("models/", ""),
        displayName: m.displayName,
        supportedMethods: supportedMethods.join(", "),
      });
    }

    console.table(relevantModels);
  } catch (err: any) {
    console.error("Network or execution error:", err);
  }
}

checkGeminiModels();
