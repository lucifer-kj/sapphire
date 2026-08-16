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

async function testTextModel(modelName: string) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello! Respond with: 'OK'" }] }],
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      console.log(`[PASS] ${modelName} -> ${text}`);
      return true;
    } else {
      const err = await res.json();
      console.log(`[FAIL] ${modelName} -> ${res.status}: ${err?.error?.message?.slice(0, 100)}`);
      return false;
    }
  } catch (e: any) {
    console.log(`[ERR] ${modelName} -> ${e.message}`);
    return false;
  }
}

async function testAll() {
  console.log("=== Testing Active Models on Google API Key ===");
  const models = [
    "gemini-2.5-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
  ];

  for (const m of models) {
    await testTextModel(m);
  }
}

testAll();
