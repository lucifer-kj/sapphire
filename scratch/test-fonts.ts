import fs from "fs";
import path from "path";
import { ImageCompositor } from "../src/services/image-compositor";
import { DesignBlueprint } from "../src/lib/design-system/archetypes";

// Create a simple base64 PNG dummy background (1080x1350)
const sampleBgBase64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

async function runDesignIntelligenceTests() {
  console.log("🎨 Starting Sapphire Design Intelligence & Satori Compositor Verification...\n");

  const testCases: Array<{ name: string; blueprint: DesignBlueprint }> = [
    {
      name: "1. Editorial Magazine (Playfair Display + Keywords + Emojis ☕✨)",
      blueprint: {
        archetype: "editorial_magazine",
        headline: "Tasty Morning Joy ☕✨",
        subheadline: "Crafted for discerning palates that appreciate artisanal roasting and quiet luxury.",
        category_pill: "SPECIAL ROAST",
        brand_tagline: "Brewed for you . served on ice.",
        value_props: ["Single-origin beans.", "Velvety oat micro-foam.", "Zero artificial syrups."],
        cta_text: "Order Ahead ➔",
        social_handle: "@sapphirecoffee",
        brand_name: "Café Vagabond",
        font_family_hook: "Playfair Display",
        font_family_body: "Plus Jakarta Sans",
        highlighted_keywords: ["Morning", "Joy"],
        font_scale: "regular",
        scrim_intensity: "medium",
        color_tokens: {
          primary_text: "#FAF7F2",
          accent: "#D97757",
          canvas_background: "#141413",
          scrim_color: "rgba(20,10,5,0.75)",
        },
        negative_space_directive: "Leave upper 40% clean and uncluttered for headline typography overlay",
      },
    },
    {
      name: "2. Conceptual Split (Plus Jakarta Sans + ALL CAPS + Asymmetric 50/50)",
      blueprint: {
        archetype: "conceptual_split",
        headline: "BRAND STRATEGY WITHOUT EXECUTION IS NOISE",
        subheadline: "Why 84% of high-growth SaaS startups fail at positioning before hitting product-market fit.",
        category_pill: "B2B STRATEGY",
        brand_tagline: "Precision positioning . category leadership.",
        cta_text: "Read Breakdown ➔",
        social_handle: "@sapphiregrowth",
        brand_name: "Sapphire Advisory",
        font_family_hook: "Plus Jakarta Sans",
        font_family_body: "Inter",
        highlighted_keywords: ["EXECUTION", "NOISE"],
        font_scale: "compact",
        scrim_intensity: "heavy",
        color_tokens: {
          primary_text: "#FAF7F2",
          accent: "#D97757",
          canvas_background: "#141413",
          scrim_color: "rgba(20,20,19,0.85)",
        },
        negative_space_directive: "Subject on left 50%, right 50% empty for text",
      },
    },
    {
      name: "3. Comparison Split (Inter + Long Unbroken Words: UNCOMPROMISING HYPER-PERSONALIZATION)",
      blueprint: {
        archetype: "comparison_split",
        headline: "UNCOMPROMISING HYPER-PERSONALIZATION",
        subheadline: "Manual campaign workflows vs Autonomous multi-agent creative orchestration.",
        brand_tagline: "Sapphire Multi-Agent System",
        cta_text: "Compare Benchmarks ➔",
        social_handle: "@sapphireengine",
        brand_name: "Sapphire Studio",
        font_family_hook: "Inter",
        font_family_body: "Inter",
        highlighted_keywords: ["HYPER-PERSONALIZATION"],
        font_scale: "regular",
        scrim_intensity: "medium",
        color_tokens: {
          primary_text: "#141413",
          accent: "#D97757",
          canvas_background: "#FAF9F5",
          scrim_color: "rgba(250,249,245,0.9)",
        },
        negative_space_directive: "50/50 vertical division with clean backdrop",
      },
    },
    {
      name: "4. Vintage Poster (Outfit + Neo-Vintage Stamps + Heritage Badge)",
      blueprint: {
        archetype: "vintage_poster",
        headline: "FRESH BOTANICAL HARVEST",
        subheadline: "COLD-PRESSED DAILY IN SMALL BATCHES",
        category_pill: "PURE ORGANIC",
        cta_text: "Shop Provisions ➔",
        social_handle: "@vintageprovisions",
        brand_name: "Heritage Club",
        font_family_hook: "Outfit",
        font_family_body: "Plus Jakarta Sans",
        highlighted_keywords: ["BOTANICAL"],
        font_scale: "regular",
        scrim_intensity: "subtle",
        color_tokens: {
          primary_text: "#1E4D2B",
          accent: "#D97757",
          canvas_background: "#FAF7EE",
          scrim_color: "rgba(250,247,238,0.9)",
        },
        negative_space_directive: "Top-down studio shot with generous clean margins",
      },
    },
    {
      name: "5. SaaS Dot-Grid (Plus Jakarta Sans + Dark Slate B2B UI Micro-Chrome)",
      blueprint: {
        archetype: "saas_dotgrid",
        headline: "Automate High-Converting Social Campaigns",
        subheadline: "From user intent to Canva-grade visual assets in 2.5 seconds with autonomous agents.",
        category_pill: "DEVELOPER TOOLS",
        brand_tagline: "Autonomous Agent Cloud",
        cta_text: "Explore APIs ➔",
        social_handle: "@sapphireapi",
        brand_name: "SAPPHIRE CLOUD",
        font_family_hook: "Plus Jakarta Sans",
        font_family_body: "Inter",
        highlighted_keywords: ["High-Converting"],
        font_scale: "regular",
        scrim_intensity: "heavy",
        color_tokens: {
          primary_text: "#F8FAFC",
          accent: "#D97757",
          canvas_background: "#0F172A",
          scrim_color: "rgba(15,23,42,0.9)",
        },
        negative_space_directive: "Cards angled in bottom-right, clean void top-left",
      },
    },
  ];

  let passed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const { name, blueprint } = testCases[i];
    console.log(`Testing Archetype [${i + 1}/5]: ${name}...`);

    try {
      const start = performance.now();
      const outputDataUrl = await ImageCompositor.composite(sampleBgBase64, blueprint);
      const durationMs = Math.round(performance.now() - start);

      if (!outputDataUrl.startsWith("data:image/png;base64,")) {
        throw new Error("Output is not a valid PNG base64 data URL");
      }

      const base64Data = outputDataUrl.replace(/^data:image\/png;base64,/, "");
      const pngBuffer = Buffer.from(base64Data, "base64");

      if (pngBuffer.length < 5000) {
        throw new Error(`Generated PNG buffer too small (${pngBuffer.length} bytes)`);
      }

      const outPath = path.resolve(process.cwd(), "scratch", `verified-archetype-${i + 1}.png`);
      fs.writeFileSync(outPath, pngBuffer);

      console.log(`  ✅ PASSED (${durationMs}ms) — Output: ${pngBuffer.length} bytes -> ${path.basename(outPath)}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAILED:`, err.message || err);
    }
  }

  console.log(`\n========================================`);
  console.log(`Test Results: ${passed}/${testCases.length} Archetypes Passed Satori Render Cleanly`);
  console.log(`========================================\n`);

  if (passed === testCases.length) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runDesignIntelligenceTests();

