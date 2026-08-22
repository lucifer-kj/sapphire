import fs from "fs";
import path from "path";

// Load .env.local manually
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
} catch (e) {
  console.warn("Could not read .env.local:", e);
}

async function testKeys() {
  console.log("==========================================");
  console.log("       SAPPHIRE API KEY CONNECTIVITY TEST ");
  console.log("==========================================");

  // 1. Test Google Gemini API Key
  const geminiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!geminiKey) {
    console.log("❌ Google Gemini API: Key NOT found in .env.local");
  } else {
    try {
      const { createGoogleGenerativeAI } = await import("@ai-sdk/google");
      const { generateText } = await import("ai");
      const google = createGoogleGenerativeAI({ apiKey: geminiKey });
      const start = Date.now();
      const res = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: "Say 'Gemini OK' in 2 words.",
      });
      console.log(`✅ Google Gemini API: ACTIVE (${Date.now() - start}ms) -> "${res.text.trim()}"`);
    } catch (err: any) {
      console.log(`❌ Google Gemini API: FAILED -> ${err?.message || err}`);
    }
  }

  // 2. Test Groq API Key
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    console.log("❌ Groq API: Key NOT found in .env.local");
  } else {
    try {
      const { createGroq } = await import("@ai-sdk/groq");
      const { generateText } = await import("ai");
      const groq = createGroq({ apiKey: groqKey });
      const start = Date.now();
      const res = await generateText({
        model: groq("llama-3.3-70b-versatile"),
        prompt: "Say 'Groq OK' in 2 words.",
      });
      console.log(`✅ Groq API: ACTIVE (${Date.now() - start}ms) -> "${res.text.trim()}"`);
    } catch (err: any) {
      console.log(`❌ Groq API: FAILED -> ${err?.message || err}`);
    }
  }

  // 3. Test Cloudflare Workers AI
  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!cfAccountId || !cfApiToken) {
    console.log("⚠️ Cloudflare Workers AI: Account ID or Token missing in .env.local (Pollinations Flux fallback active)");
  } else {
    try {
      const start = Date.now();
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${cfApiToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: "Minimalist black coffee cup on dark wood table",
            steps: 4,
          }),
        }
      );
      if (response.ok) {
        console.log(`✅ Cloudflare Workers AI (Flux 1 Schnell): ACTIVE (${Date.now() - start}ms)`);
      } else {
        const errorText = await response.text();
        console.log(`⚠️ Cloudflare Workers AI: Status ${response.status} (${errorText.slice(0, 80)}...) -> Fallback active`);
      }
    } catch (err: any) {
      console.log(`⚠️ Cloudflare Workers AI: Network error -> Fallback active: ${err?.message}`);
    }
  }

  // 4. Test Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.log("⚠️ Supabase: Credentials not provided in .env.local");
  } else {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);
      const start = Date.now();
      const { error } = await supabase.from("campaigns").select("id").limit(1);
      if (!error) {
        console.log(`✅ Supabase Database: CONNECTED (${Date.now() - start}ms)`);
      } else {
        console.log(`⚠️ Supabase: Response -> ${error.message}`);
      }
    } catch (err: any) {
      console.log(`⚠️ Supabase: Error -> ${err?.message}`);
    }
  }

  // 5. Test Resend Email
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    console.log("⚠️ Resend API: Key not configured in .env.local");
  } else {
    console.log("✅ Resend API: Key detected in .env.local");
  }

  console.log("==========================================");
}

testKeys().catch(console.error);
