import { generateObject } from "ai";
import { z } from "zod";
import { BrandProfile, BrandProfileSchema } from "@/lib/schema/brand";
import { getReasoningModel, getReasoningFallbackModel } from "@/lib/ai-model";

export interface ExtractedBrandData {
  name: string;
  websiteUrl: string;
  logoUrl?: string;
  logoVariants: string[];
  primaryColors: string[];
  secondaryColors: string[];
  fonts: {
    heading: string;
    body: string;
    serif: string;
  };
  typographyRules: string[];
  tagline?: string;
  description?: string;
  positioning?: string;
  industry?: string;
  targetAudience?: string;
  tone: string;
  forbiddenPhrases: string[];
  preferredPhrases: string[];
  photographyStyle: string;
}

const AISynthesisSchema = z.object({
  brand_name: z.string().describe("Clean official brand name"),
  industry: z.string().describe("Industry category e.g. Travel & Hospitality, Specialty Coffee, SaaS"),
  positioning: z.string().describe("1-2 sentence high-level brand positioning statement"),
  target_audience: z.string().describe("Target demographic and psychographic audience"),
  photography_style: z.string().describe("Visual aesthetic and lighting guidelines for image generation"),
  tone_adjectives: z.array(z.string()).describe("3-5 brand voice tone adjectives"),
  tagline: z.string().describe("Primary brand slogan or tagline"),
  forbidden_phrases: z.array(z.string()).describe("3-4 forbidden words that clash with brand image"),
  preferred_phrases: z.array(z.string()).describe("2-4 preferred slogans or value hooks"),
  suggested_primary_colors: z.array(z.string()).describe("2 primary hex colors e.g. ['#181816', '#FAF9F5']"),
  suggested_secondary_colors: z.array(z.string()).describe("2-3 accent hex colors e.g. ['#D97757', '#7BA7D7']"),
  suggested_heading_font: z.string().describe("Best fitting font from Playfair Display, Outfit, Plus Jakarta Sans, Inter, Cinzel"),
  suggested_serif_font: z.string().describe("Best fitting serif font from Playfair Display, Georgia, Cinzel"),
});

export class BrandExtractorService {
  /**
   * Orchestrates complete brand extraction from website URL using OpenBrand + Gemini AI synthesis.
   */
  static async extractBrandFromUrl(
    url: string,
    providedBrandName?: string,
    onProgress?: (stage: string, step: number, total: number) => Promise<void>
  ): Promise<ExtractedBrandData> {
    const cleanUrl = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`;
    const domain = cleanUrl.replace(/^https?:\/\/(www\.)?/, "").split("/")[0];

    await onProgress?.(`Connecting to ${domain}...`, 1, 4);

    let rawHtml = "";
    let openBrandData: any = null;

    // 1. Fetch from OpenBrand API / Public Extraction
    try {
      await onProgress?.("Extracting OpenBrand logos, color tokens & typography...", 2, 4);
      const openBrandRes = await fetch(`https://openbrand.sh/api/extract?url=${encodeURIComponent(cleanUrl)}`, {
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(6000),
      });
      if (openBrandRes.ok) {
        openBrandData = await openBrandRes.json();
      }
    } catch (obErr) {
      console.warn("OpenBrand API fetch fallback:", obErr);
    }

    // 2. Direct DOM & Stylesheet Extraction
    try {
      const pageRes = await fetch(cleanUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(7000),
      });
      if (pageRes.ok) {
        rawHtml = await pageRes.text();
      }
    } catch (pageErr) {
      console.warn("Direct HTML fetch fallback:", pageErr);
    }

    await onProgress?.("Synthesizing Brand DNA, voice tone & visual guidelines...", 3, 4);

    // Extract meta properties from HTML
    const titleMatch = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = rawHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                      rawHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    const ogTitleMatch = rawHtml.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    const ogDescMatch = rawHtml.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
    const ogImageMatch = rawHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    const themeColorMatch = rawHtml.match(/<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i);
    const faviconMatch = rawHtml.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);

    // Extract Google Fonts links
    const googleFontMatch = rawHtml.match(/fonts\.googleapis\.com\/css2\?family=([^&"']+)/i);
    const detectedFonts: string[] = [];
    if (googleFontMatch) {
      const fontList = decodeURIComponent(googleFontMatch[1]).split("&family=");
      for (const f of fontList) {
        const name = f.split(":")[0].replace(/\+/g, " ").trim();
        if (name) detectedFonts.push(name);
      }
    }

    // Extract HEX colors from inline styles or CSS variables
    const hexColorMatches = rawHtml.match(/#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g) || [];
    const colorFrequency: Record<string, number> = {};
    for (const hex of hexColorMatches) {
      const normalized = hex.toUpperCase();
      if (normalized !== "#FFFFFF" && normalized !== "#000000" && normalized !== "#FFF" && normalized !== "#000") {
        colorFrequency[normalized] = (colorFrequency[normalized] || 0) + 1;
      }
    }
    const topHexColors = Object.entries(colorFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([c]) => c);

    const title = ogTitleMatch?.[1] || titleMatch?.[1] || providedBrandName || domain;
    const description = ogDescMatch?.[1] || descMatch?.[1] || "";
    let logoUrl = openBrandData?.logo || openBrandData?.icon || ogImageMatch?.[1] || faviconMatch?.[1];
    if (logoUrl && !logoUrl.startsWith("http") && !logoUrl.startsWith("data:")) {
      logoUrl = new URL(logoUrl, cleanUrl).toString();
    }

    // 3. AI Model Brand DNA Synthesis
    const promptText = `Analyze this extracted brand metadata for "${providedBrandName || title}" (${domain}):
Website URL: ${cleanUrl}
Page Title: ${title}
Meta Description: ${description}
Detected Theme Color: ${themeColorMatch?.[1] || "None"}
Detected Top CSS Hex Colors: ${topHexColors.join(", ") || "None"}
Detected Fonts: ${detectedFonts.join(", ") || "None"}
OpenBrand Extracted Details: ${JSON.stringify(openBrandData || {})}

Synthesize a complete, sophisticated Brand DNA profile for Sapphire creative generation.`;

    let synthesis: z.infer<typeof AISynthesisSchema>;

    try {
      const aiResult = await generateObject({
        model: getReasoningModel(),
        schema: AISynthesisSchema,
        system: "You are Sapphire's Principal Brand Identity & Visual Director. Synthesize precise brand visual identity tokens, tone guidelines, and creative rules from website extraction.",
        prompt: promptText,
      });
      synthesis = aiResult.object;
    } catch (err) {
      console.warn("AI synthesis fallback, using fallback model:", err);
      try {
        const aiResult = await generateObject({
          model: getReasoningFallbackModel(),
          schema: AISynthesisSchema,
          system: "You are Sapphire's Principal Brand Identity & Visual Director.",
          prompt: promptText,
        });
        synthesis = aiResult.object;
      } catch {
        synthesis = {
          brand_name: providedBrandName || title.split(/[-|–]/)[0].trim(),
          industry: "Lifestyle & Specialty Services",
          positioning: description || `${providedBrandName || title} — premium storytelling and modern excellence.`,
          target_audience: "Discerning customers, design-conscious professionals, digital audiences.",
          photography_style: "Editorial commercial photography, natural warm lighting, authentic textures.",
          tone_adjectives: ["Sophisticated", "Authentic", "Inspiring", "Clear"],
          tagline: title.split(/[-|–]/)[1]?.trim() || "Crafting Distinctive Experiences",
          forbidden_phrases: ["Cheap deals", "Act fast", "Hurry before it's gone!"],
          preferred_phrases: ["Experience excellence", "Crafted with intention"],
          suggested_primary_colors: topHexColors.slice(0, 2).length >= 2 ? topHexColors.slice(0, 2) : ["#181816", "#FAF9F5"],
          suggested_secondary_colors: topHexColors.slice(2, 4).length > 0 ? topHexColors.slice(2, 4) : ["#D97757", "#7BA7D7"],
          suggested_heading_font: detectedFonts[0] || "Playfair Display",
          suggested_serif_font: detectedFonts.find(f => /serif|playfair|georgia|cinzel/i.test(f)) || "Playfair Display",
        };
      }
    }

    await onProgress?.("Brand DNA Profile ready for review!", 4, 4);

    return {
      name: synthesis.brand_name || providedBrandName || title,
      websiteUrl: cleanUrl,
      logoUrl: logoUrl || undefined,
      logoVariants: logoUrl ? [logoUrl] : [],
      primaryColors: synthesis.suggested_primary_colors.length ? synthesis.suggested_primary_colors : ["#181816", "#FAF9F5"],
      secondaryColors: synthesis.suggested_secondary_colors.length ? synthesis.suggested_secondary_colors : ["#D97757", "#7BA7D7"],
      fonts: {
        heading: synthesis.suggested_heading_font || "Playfair Display",
        body: "Plus Jakarta Sans",
        serif: synthesis.suggested_serif_font || "Playfair Display",
      },
      typographyRules: ["Subtle, clean text overlay", "High contrast on images"],
      tagline: synthesis.tagline,
      description: description || synthesis.positioning,
      positioning: synthesis.positioning,
      industry: synthesis.industry,
      targetAudience: synthesis.target_audience,
      tone: synthesis.tone_adjectives.join(", "),
      forbiddenPhrases: synthesis.forbidden_phrases,
      preferredPhrases: synthesis.preferred_phrases,
      photographyStyle: synthesis.photography_style,
    };
  }

  /**
   * Converts ExtractedBrandData into standard BrandProfile for database storage.
   */
  static toBrandProfile(data: ExtractedBrandData): BrandProfile {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return {
      id: slug,
      name: data.name,
      industry: data.industry || "General",
      description: data.description,
      positioning: data.positioning,
      target_audience: data.targetAudience,
      social_handle: `@${slug.replace(/-/g, "")}`,
      visual_identity: {
        logo: data.logoUrl,
        logo_variants: data.logoVariants,
        primary_colors: data.primaryColors,
        secondary_colors: data.secondaryColors,
        fonts: data.fonts,
        typography_rules: data.typographyRules,
        photography_style: data.photographyStyle,
        graphic_style: "Clean minimal editorial composition",
        image_preferences: ["Warm earth tones", "Subtle landscape compositions"],
      },
      voice: {
        tone: data.tone,
        vocabulary: data.preferredPhrases,
        sentence_style: "Direct, poetic hooks with clear value propositions",
        cta_style: "Subtle invitation to explore",
        forbidden_phrases: data.forbiddenPhrases,
        preferred_phrases: data.preferredPhrases,
      },
      learned_preferences: {
        preferred_visual_styles: [],
        preferred_compositions: [],
        preferred_hooks: [],
        preferred_caption_styles: [],
        color_preferences: [],
        archetype_affinity: {
          editorial_magazine: 0.85,
          conceptual_split: 0.5,
          comparison_split: 0.5,
          vintage_poster: 0.7,
          saas_dotgrid: 0.3,
        },
        typography_density_preference: "minimalist_punchy",
        visual_temperature_preference: "warm_golden",
      },
    };
  }
}
