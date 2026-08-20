import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import {
  DesignBlueprint,
  DesignArchetype,
  DESIGN_KNOWLEDGE_GRAPH,
} from "@/lib/design-system/archetypes";

interface FontEntry {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal" | "italic";
}

let cachedFontRegistry: FontEntry[] | null = null;

function loadFontRegistry(): FontEntry[] {
  if (cachedFontRegistry && cachedFontRegistry.length > 0) {
    return cachedFontRegistry;
  }

  const fontsDir = path.resolve(process.cwd(), "src", "assets", "fonts");
  const fontDefinitions: Array<{
    fileName: string;
    name: string;
    weight: 400 | 700;
    style: "normal" | "italic";
  }> = [
    {
      fileName: "PlusJakartaSans-Regular.ttf",
      name: "Plus Jakarta Sans",
      weight: 400,
      style: "normal",
    },
    {
      fileName: "PlusJakartaSans-Bold.ttf",
      name: "Plus Jakarta Sans",
      weight: 700,
      style: "normal",
    },
    {
      fileName: "Inter-Regular.ttf",
      name: "Inter",
      weight: 400,
      style: "normal",
    },
    {
      fileName: "Inter-Bold.ttf",
      name: "Inter",
      weight: 700,
      style: "normal",
    },
    {
      fileName: "PlayfairDisplay-Bold.ttf",
      name: "Playfair Display",
      weight: 700,
      style: "normal",
    },
    {
      fileName: "PlayfairDisplay-Italic.ttf",
      name: "Playfair Display",
      weight: 700,
      style: "italic",
    },
    {
      fileName: "Outfit-Bold.ttf",
      name: "Outfit",
      weight: 700,
      style: "normal",
    },
  ];

  const loaded: FontEntry[] = [];

  for (const def of fontDefinitions) {
    const fullPath = path.join(fontsDir, def.fileName);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      if (buffer.length > 500) {
        loaded.push({
          name: def.name,
          data: buffer,
          weight: def.weight,
          style: def.style,
        });
      }
    }
  }

  cachedFontRegistry = loaded;
  return cachedFontRegistry;
}

/**
 * Sanitizes unicode glyphs to standard symbols to prevent missing character boxes.
 */
function cleanDisplayGlyphs(text: string): string {
  return (text || "")
    .replace(/[➔➜➝➞]/g, "→")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'");
}

/**
 * Calculates adaptive font size & line height for Satori to prevent canvas clipping/overflow.
 * Tests against long words, ALL CAPS strings, non-English text, and emojis.
 */
function calculateHeadlineSize(
  headline: string,
  scale: "compact" | "regular" | "large" = "regular",
  baseMaxPx = 60,
  minPx = 34
): { fontSize: string; lineHeight: string } {
  const text = (headline || "").trim();
  const len = text.length;
  const words = text.split(/\s+/);
  const maxWordLen = Math.max(...words.map((w) => w.length), 0);

  let targetPx = baseMaxPx;
  if (scale === "compact") targetPx = Math.round(baseMaxPx * 0.85);
  if (scale === "large") targetPx = Math.round(baseMaxPx * 1.15);

  const isAllCaps = text.length > 0 && text === text.toUpperCase() && /[A-Z]/.test(text);
  const effectiveLen = isAllCaps ? len * 1.25 : len;

  if (effectiveLen > 45 || maxWordLen > 12) {
    targetPx = Math.max(minPx, Math.round(targetPx * 0.65));
  } else if (effectiveLen > 30 || maxWordLen > 9) {
    targetPx = Math.max(minPx, Math.round(targetPx * 0.8));
  } else if (effectiveLen > 20) {
    targetPx = Math.max(minPx, Math.round(targetPx * 0.9));
  }

  return {
    fontSize: `${targetPx}px`,
    lineHeight: targetPx > 48 ? "1.1" : "1.2",
  };
}

/**
 * Renders headline elements with highlighted keywords wrapped in accent coloring.
 */
function renderHeadlineElements(
  headline: string,
  highlightedKeywords: string[] = [],
  accentColor: string,
  defaultColor: string,
  hookFont: string,
  fontSize: string,
  lineHeight: string
) {
  if (!highlightedKeywords || highlightedKeywords.length === 0) {
    return {
      type: "span",
      props: {
        style: {
          fontFamily: hookFont,
          fontSize,
          lineHeight,
          fontWeight: 700,
          color: defaultColor,
          letterSpacing: "-1px",
          display: "flex",
          flexWrap: "wrap",
        },
        children: headline,
      },
    };
  }

  const cleanKeywords = highlightedKeywords.map((k) => k.trim().toLowerCase());
  const words = headline.split(" ");

  const children = words.map((word) => {
    const cleanWord = word.replace(/[^\w]/g, "").toLowerCase();
    const isHighlighted = cleanKeywords.includes(cleanWord);

    return {
      type: "span",
      props: {
        style: {
          color: isHighlighted ? accentColor : defaultColor,
          marginRight: "10px",
          fontWeight: 700,
        },
        children: word,
      },
    };
  });

  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexWrap: "wrap",
        fontFamily: hookFont,
        fontSize,
        lineHeight,
        fontWeight: 700,
        letterSpacing: "-1px",
      },
      children,
    },
  };
}

export class ImageCompositor {
  /**
   * Composites a raw AI photography background with pixel-perfect Canva-quality
   * typography, brand pills, value proposition cards, and CTA buttons using Satori.
   * Returns a complete 1080×1350 PNG base64 data URL in ~150ms.
   */
  static async composite(
    bgImageDataUrl: string,
    blueprint: DesignBlueprint
  ): Promise<string> {
    const fontRegistry = loadFontRegistry();

    if (fontRegistry.length === 0) {
      console.warn("Fonts missing in src/assets/fonts/, returning raw background.");
      return bgImageDataUrl;
    }

    const templateElement = this.buildArchetypeJSX(bgImageDataUrl, blueprint);

    try {
      const svg = await satori(templateElement as any, {
        width: 1080,
        height: 1350,
        fonts: fontRegistry.map((f) => ({
          name: f.name,
          data: f.data,
          weight: f.weight,
          style: f.style,
        })),
      });

      const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1080 } });
      const pngBuffer = resvg.render().asPng();

      return `data:image/png;base64,${pngBuffer.toString("base64")}`;
    } catch (err) {
      console.error("Error compositing image with Satori:", err);
      return bgImageDataUrl;
    }
  }

  /**
   * Selects and builds the React JSX element tree for the given archetype.
   */
  private static buildArchetypeJSX(bgUrl: string, bp: DesignBlueprint) {
    const archetype: DesignArchetype = bp.archetype || "editorial_magazine";

    switch (archetype) {
      case "bento_grid":
        return this.buildBentoGridTemplate(bgUrl, bp);
      case "minimalism":
        return this.buildMinimalismTemplate(bgUrl, bp);
      case "dark_mode_ui":
        return this.buildDarkModeUITemplate(bgUrl, bp);
      case "glassmorphism":
        return this.buildGlassmorphismTemplate(bgUrl, bp);
      case "maximalism":
        return this.buildMaximalismTemplate(bgUrl, bp);
      case "cyberpunk":
        return this.buildCyberpunkTemplate(bgUrl, bp);
      case "y2k_aesthetic":
        return this.buildY2KAestheticTemplate(bgUrl, bp);
      case "scrapbook":
        return this.buildScrapbookTemplate(bgUrl, bp);
      case "mixed_media":
        return this.buildMixedMediaTemplate(bgUrl, bp);
      case "luxury_typography":
        return this.buildLuxuryTypographyTemplate(bgUrl, bp);
      case "polaroid_pov_overlay":
        return this.buildPolaroidPovOverlayTemplate(bgUrl, bp);
      case "feature_badges_editorial":
        return this.buildFeatureBadgesEditorialTemplate(bgUrl, bp);
      case "minimal_shader_text":
        return this.buildMinimalShaderTemplate(bgUrl, bp);
      case "conceptual_split":
        return this.buildConceptualSplitTemplate(bgUrl, bp);
      case "comparison_split":
        return this.buildComparisonSplitTemplate(bgUrl, bp);
      case "vintage_poster":
        return this.buildVintagePosterTemplate(bgUrl, bp);
      case "saas_dotgrid":
        return this.buildSaaSTemplate(bgUrl, bp);
      case "editorial_magazine":
      default:
        return this.buildEditorialTemplate(bgUrl, bp);
    }
  }

  // -------------------------------------------------------------
  // Archetype 1: Editorial Magazine (Luxury, Hospitality, Food, Boutique Travel)
  // -------------------------------------------------------------
  private static buildEditorialTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Playfair Display";
    const bodyFont = bp.font_family_body || "Plus Jakarta Sans";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 58, 36);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "70px 70px 60px 70px",
          backgroundColor: "#141413",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background:
                  "linear-gradient(180deg, rgba(14,10,8,0.7) 0%, rgba(14,10,8,0.3) 30%, rgba(14,10,8,0.15) 50%, rgba(14,10,8,0.5) 75%, rgba(14,10,8,0.88) 100%)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: hookFont,
                      fontSize: "26px",
                      fontWeight: 700,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "#FAF7F2",
                      textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                    },
                    children: bp.brand_name,
                  },
                },
                bp.brand_tagline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "20px",
                          fontWeight: 400,
                          color: "rgba(250, 247, 242, 0.8)",
                          letterSpacing: "1px",
                          textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                        },
                        children: bp.brand_tagline,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                width: "100%",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "24px",
                          lineHeight: "1.4",
                          fontWeight: 400,
                          color: "rgba(250, 247, 242, 0.9)",
                          maxWidth: "880px",
                          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                        },
                        children: bp.subheadline,
                      },
                    }
                  : null,
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontFamily: bodyFont,
                            fontSize: "20px",
                            fontWeight: 600,
                            letterSpacing: "1.5px",
                            color: "rgba(250, 247, 242, 0.75)",
                            textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                          },
                          children: bp.social_handle,
                        },
                      },
                    ],
                  },
                },
              ].filter(Boolean),
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype 2: Conceptual Split (B2B, Marketing, Strategy, Ideas)
  // -------------------------------------------------------------
  private static buildConceptualSplitTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Plus Jakarta Sans";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 60, 36);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "70px 70px 60px 70px",
          backgroundColor: "#141413",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background:
                  "linear-gradient(180deg, rgba(16,16,14,0.75) 0%, rgba(16,16,14,0.3) 35%, rgba(16,16,14,0.2) 55%, rgba(16,16,14,0.85) 100%)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: hookFont,
                      fontSize: "26px",
                      fontWeight: 700,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "#FAF7F2",
                      textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                    },
                    children: bp.brand_name,
                  },
                },
                bp.brand_tagline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "20px",
                          color: "rgba(250, 247, 242, 0.8)",
                          textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                        },
                        children: bp.brand_tagline,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                width: "100%",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "24px",
                          lineHeight: "1.4",
                          color: "rgba(250, 247, 242, 0.9)",
                          maxWidth: "900px",
                          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                        },
                        children: bp.subheadline,
                      },
                    }
                  : null,
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontFamily: bodyFont,
                            fontSize: "20px",
                            fontWeight: 600,
                            letterSpacing: "1.5px",
                            color: "rgba(250, 247, 242, 0.75)",
                            textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                          },
                          children: bp.social_handle,
                        },
                      },
                    ],
                  },
                },
              ].filter(Boolean),
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype 3: Comparison Split (Before/After, Pros/Cons, Two Realities)
  // -------------------------------------------------------------
  private static buildComparisonSplitTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Plus Jakarta Sans";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 56, 34);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "70px 70px 60px 70px",
          backgroundColor: "#141413",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background:
                  "linear-gradient(180deg, rgba(14,10,8,0.7) 0%, rgba(14,10,8,0.25) 35%, rgba(14,10,8,0.2) 55%, rgba(14,10,8,0.85) 100%)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: hookFont,
                      fontSize: "26px",
                      fontWeight: 700,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "#FAF7F2",
                      textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                    },
                    children: bp.brand_name,
                  },
                },
                bp.brand_tagline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "20px",
                          color: "rgba(250, 247, 242, 0.8)",
                          textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                        },
                        children: bp.brand_tagline,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                width: "100%",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "24px",
                          lineHeight: "1.4",
                          color: "rgba(250, 247, 242, 0.9)",
                          maxWidth: "900px",
                          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                        },
                        children: bp.subheadline,
                      },
                    }
                  : null,
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontFamily: bodyFont,
                            fontSize: "20px",
                            fontWeight: 600,
                            letterSpacing: "1.5px",
                            color: "rgba(250, 247, 242, 0.75)",
                            textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                          },
                          children: bp.social_handle,
                        },
                      },
                    ],
                  },
                },
              ].filter(Boolean),
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype 4: Vintage / Warm Organic Poster (Artisanal, Coffee, Craft)
  // -------------------------------------------------------------
  private static buildVintagePosterTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Outfit";
    const bodyFont = bp.font_family_body || "Plus Jakarta Sans";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 60, 36);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "70px 70px 60px 70px",
          backgroundColor: "#181816",
          color: "#FAF7EE",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background:
                  "linear-gradient(180deg, rgba(24,20,16,0.7) 0%, rgba(24,20,16,0.25) 35%, rgba(24,20,16,0.2) 55%, rgba(24,20,16,0.88) 100%)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: hookFont,
                      fontSize: "28px",
                      fontWeight: 700,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "#FAF7EE",
                      textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                    },
                    children: bp.brand_name,
                  },
                },
                bp.brand_tagline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "20px",
                          fontStyle: "italic",
                          color: "rgba(250, 247, 238, 0.85)",
                          textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                        },
                        children: bp.brand_tagline,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                width: "100%",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7EE",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "24px",
                          lineHeight: "1.4",
                          color: "rgba(250, 247, 238, 0.9)",
                          maxWidth: "900px",
                          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                        },
                        children: bp.subheadline,
                      },
                    }
                  : null,
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontFamily: bodyFont,
                            fontSize: "20px",
                            fontWeight: 600,
                            letterSpacing: "1.5px",
                            color: "rgba(250, 247, 238, 0.75)",
                            textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                          },
                          children: bp.social_handle,
                        },
                      },
                    ],
                  },
                },
              ].filter(Boolean),
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype 5: SaaS Dotgrid (Developer Platforms, Cloud, AI)
  // -------------------------------------------------------------
  private static buildSaaSTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#7BA7D7";
    const hookFont = bp.font_family_hook || "Plus Jakarta Sans";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 58, 36);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "70px 70px 60px 70px",
          backgroundColor: "#0A0D14",
          color: "#F8FAFC",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background:
                  "linear-gradient(180deg, rgba(10,13,20,0.75) 0%, rgba(10,13,20,0.3) 35%, rgba(10,13,20,0.2) 55%, rgba(10,13,20,0.9) 100%)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: hookFont,
                      fontSize: "26px",
                      fontWeight: 700,
                      letterSpacing: "3px",
                      textTransform: "uppercase",
                      color: "#F8FAFC",
                      textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                    },
                    children: bp.brand_name,
                  },
                },
                bp.brand_tagline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "20px",
                          color: "rgba(248, 250, 252, 0.8)",
                          textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                        },
                        children: bp.brand_tagline,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                width: "100%",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#F8FAFC",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "24px",
                          lineHeight: "1.4",
                          color: "rgba(248, 250, 252, 0.9)",
                          maxWidth: "900px",
                          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
                        },
                        children: bp.subheadline,
                      },
                    }
                  : null,
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: "16px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontFamily: bodyFont,
                            fontSize: "20px",
                            fontWeight: 600,
                            letterSpacing: "1.5px",
                            color: "rgba(248, 250, 252, 0.75)",
                            textShadow: "0 2px 6px rgba(0,0,0,0.5)",
                          },
                          children: bp.social_handle,
                        },
                      },
                    ],
                  },
                },
              ].filter(Boolean),
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype 6: Polaroid POV Overlay (Handheld In-Camera Landmark Frame + Feature Badges)
  // -------------------------------------------------------------
  private static buildPolaroidPovOverlayTemplate(bgUrl: string, bp: DesignBlueprint) {
    const hookFont = bp.font_family_hook || "Plus Jakarta Sans";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 52, 34);

    const logoPrefix = bp.logo_badge?.prefix !== undefined ? bp.logo_badge.prefix : "make";
    const logoHighlight = bp.logo_badge?.highlight !== undefined ? bp.logo_badge.highlight : "my";
    const logoSuffix = bp.logo_badge?.suffix !== undefined ? bp.logo_badge.suffix : "trip";


    const featureBadges = bp.feature_badges || [
      { label: "Flights", icon: "flight" as const },
      { label: "Hotels", icon: "hotel" as const },
      { label: "Experiences", icon: "experience" as const },
    ];

    const renderSvgIcon = (type: string) => {
      if (type === "hotel") {
        return {
          type: "svg",
          props: {
            width: "36",
            height: "36",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "#FFFFFF",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              { type: "path", props: { d: "M6 18h12" } },
              { type: "path", props: { d: "M6 14h12" } },
              { type: "rect", props: { width: "16", height: "20", x: "4", y: "2", rx: "2" } },
              { type: "path", props: { d: "M9 22v-4h6v4" } },
              { type: "path", props: { d: "M8 6h.01" } },
              { type: "path", props: { d: "M16 6h.01" } },
              { type: "path", props: { d: "M12 6h.01" } },
              { type: "path", props: { d: "M12 10h.01" } },
              { type: "path", props: { d: "M16 10h.01" } },
              { type: "path", props: { d: "M8 10h.01" } },
            ],
          },
        };
      }
      if (type === "experience") {
        return {
          type: "svg",
          props: {
            width: "36",
            height: "36",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "#FFFFFF",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              { type: "path", props: { d: "M19 9V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3" } },
              { type: "path", props: { d: "M3 16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H7v-2a2 2 0 0 0-4 0z" } },
              { type: "path", props: { d: "M5 18v2" } },
              { type: "path", props: { d: "M19 18v2" } },
            ],
          },
        };
      }
      // Default: Flight
      return {
        type: "svg",
        props: {
          width: "36",
          height: "36",
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "#FFFFFF",
          strokeWidth: "2",
          strokeLinecap: "round",
          strokeLinejoin: "round",
          children: [
            {
              type: "path",
              props: {
                d: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
              },
            },
          ],
        },
      };
    };

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          width: "1080px",
          height: "1350px",
          backgroundColor: "#141413",
          position: "relative",
          overflow: "hidden",
        },
        children: [
          // Background AI Photography
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          // Atmospheric Sky Shader Scrim (Enhances white text legibility against sky/clouds)
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "650px",
                background:
                  "linear-gradient(180deg, rgba(0, 20, 45, 0.48) 0%, rgba(0, 20, 45, 0.22) 45%, rgba(0, 20, 45, 0) 100%)",
              },
            },
          },
          // Top Content Container (Logo + Headline + Feature Badges)
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                display: "flex",
                flexDirection: "column",
                padding: "60px 60px 0 60px",
                gap: "28px",
                maxWidth: "800px",
              },
              children: [
                // Brand Logo Lockup (e.g. make [my] trip or Sapphire)
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontFamily: hookFont,
                            fontSize: "38px",
                            fontWeight: 700,
                            color: "#FFFFFF",
                            letterSpacing: "-0.5px",
                            textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                          },
                          children: logoPrefix,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            backgroundColor: "#E41D2D",
                            borderRadius: "10px",
                            padding: "2px 12px 4px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(228, 29, 45, 0.4)",
                          },
                          children: [
                            {
                              type: "span",
                              props: {
                                style: {
                                  fontFamily: hookFont,
                                  fontSize: "36px",
                                  fontWeight: 700,
                                  color: "#FFFFFF",
                                  fontStyle: "italic",
                                },
                                children: logoHighlight,
                              },
                            },
                          ],
                        },
                      },
                      ...(logoSuffix
                        ? [
                            {
                              type: "span",
                              props: {
                                style: {
                                  fontFamily: hookFont,
                                  fontSize: "38px",
                                  fontWeight: 700,
                                  color: "#FFFFFF",
                                  letterSpacing: "-0.5px",
                                  textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                },
                                children: logoSuffix,
                              },
                            },
                          ]
                        : []),
                    ],
                  },
                },

                // Bold All-Caps Headline
                {
                  type: "div",
                  props: {
                    style: {
                      fontFamily: hookFont,
                      fontSize,
                      lineHeight,
                      fontWeight: 700,
                      color: "#FFFFFF",
                      letterSpacing: "-0.5px",
                      textTransform: "uppercase",
                      textShadow: "0 2px 14px rgba(0, 0, 0, 0.4)",
                      display: "flex",
                      flexDirection: "column",
                    },
                    children: bp.headline,
                  },
                },
                // 3 Feature Badges Row (Flights, Hotels, Experiences)
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "40px",
                      paddingTop: "6px",
                    },
                    children: featureBadges.map((b) => ({
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                        },
                        children: [
                          renderSvgIcon(b.icon),
                          {
                            type: "span",
                            props: {
                              style: {
                                fontFamily: bodyFont,
                                fontSize: "17px",
                                fontWeight: 600,
                                color: "#FFFFFF",
                                textShadow: "0 2px 6px rgba(0,0,0,0.4)",
                              },
                              children: b.label,
                            },
                          },
                        ],
                      },
                    })),
                  },
                },
              ],
            },
          },
          // Polaroid Framing Card Layer in Lower Foreground
          {
            type: "div",

            props: {
              style: {
                position: "absolute",
                bottom: "50px",
                left: "210px",
                width: "660px",
                height: "680px",
                backgroundColor: "#FDFDFD",
                borderRadius: "3px",
                padding: "26px 26px 20px 26px",
                boxShadow: "0 30px 70px -10px rgba(0, 0, 0, 0.7), 0 0 15px rgba(0,0,0,0.25)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                transform: "rotate(-1.5deg)",
              },
              children: [
                // Inner Image Window (Framed Landmark View)
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      width: "608px",
                      height: "530px",
                      overflow: "hidden",
                      position: "relative",
                      borderRadius: "2px",
                      border: "1px solid rgba(0, 0, 0, 0.1)",
                    },
                    children: [

                      {
                        type: "img",
                        props: {
                          src: bgUrl,
                          alt: "Framed View",
                          style: {
                            width: "608px",
                            height: "530px",
                            objectFit: "cover",
                            objectPosition: "center 70%",
                          },
                        },
                      },
                    ],
                  },
                },
                // Bottom Polaroid Border with Handwritten Marker Location
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      paddingTop: "14px",
                      paddingBottom: "8px",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontFamily: "Outfit",
                            fontSize: "36px",
                            fontWeight: 700,
                            color: "#181816",
                            letterSpacing: "0.5px",
                            fontStyle: "italic",
                          },
                          children: bp.category_pill || bp.brand_tagline || "Ha Long Bay, Vietnam",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }


  // -------------------------------------------------------------
  // Archetype 7: Feature Badges Editorial (High-Converting Commercial Travel & SaaS)
  // -------------------------------------------------------------
  private static buildFeatureBadgesEditorialTemplate(bgUrl: string, bp: DesignBlueprint) {
    return this.buildPolaroidPovOverlayTemplate(bgUrl, bp);
  }

  // -------------------------------------------------------------
  // Archetype 8: Minimal Shader Text (Plain Shaded Background with High-Impact Typography)
  // -------------------------------------------------------------
  private static buildMinimalShaderTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Plus Jakarta Sans";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 64, 38);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "80px",
          backgroundColor: "#141413",
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background:
                  "radial-gradient(circle at 50% 30%, rgba(20,20,19,0.3) 0%, rgba(20,20,19,0.85) 100%)",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: hookFont,
                      fontSize: "24px",
                      fontWeight: 700,
                      color: "#FAF7F2",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                    },
                    children: bp.brand_name || "SAPPHIRE",
                  },
                },
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                maxWidth: "920px",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: bodyFont,
                          fontSize: "26px",
                          lineHeight: "1.4",
                          color: "rgba(250, 247, 242, 0.85)",
                        },
                        children: bp.subheadline,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                paddingTop: "24px",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: bodyFont,
                      fontSize: "20px",
                      fontWeight: 600,
                      color: "rgba(250, 247, 242, 0.7)",
                    },
                    children: bp.social_handle,
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype: Bento Grid (Clean & Tech-Forward)
  // -------------------------------------------------------------
  private static buildBentoGridTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Plus Jakarta Sans";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 50, 32);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "60px 60px 50px 60px",
          backgroundColor: "#09090b",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background: "linear-gradient(180deg, rgba(9,9,11,0.7) 0%, rgba(9,9,11,0.4) 30%, rgba(9,9,11,0.85) 65%, rgba(9,9,11,0.98) 100%)",
              },
            },
          },
          // Header Bar
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                paddingBottom: "20px",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            width: "12px",
                            height: "12px",
                            borderRadius: "6px",
                            backgroundColor: accentColor,
                          },
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            fontFamily: hookFont,
                            fontSize: "24px",
                            fontWeight: 700,
                            letterSpacing: "1px",
                            color: "#FAF7F2",
                          },
                          children: bp.brand_name,
                        },
                      },
                    ],
                  },
                },
                bp.category_pill
                  ? {
                      type: "span",
                      props: {
                        style: {
                          backgroundColor: "rgba(255, 255, 255, 0.08)",
                          border: "1px solid rgba(255, 255, 255, 0.15)",
                          padding: "6px 16px",
                          borderRadius: "20px",
                          fontSize: "14px",
                          fontWeight: 600,
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          color: accentColor,
                        },
                        children: bp.category_pill,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // Bento Grid Compartments (Lower 65%)
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                width: "100%",
              },
              children: [
                // Top Hero Bento Card
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      padding: "36px 40px",
                      backgroundColor: "rgba(24, 24, 27, 0.88)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "24px",
                    },
                    children: [
                      renderHeadlineElements(
                        bp.headline,
                        bp.highlighted_keywords,
                        accentColor,
                        "#FAF7F2",
                        hookFont,
                        fontSize,
                        lineHeight
                      ),
                      bp.subheadline
                        ? {
                            type: "span",
                            props: {
                              style: {
                                fontSize: "20px",
                                lineHeight: "1.4",
                                color: "rgba(250, 247, 242, 0.78)",
                              },
                              children: bp.subheadline,
                            },
                          }
                        : null,
                    ].filter(Boolean),
                  },
                },
                // Lower 2-Column Bento Split
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      gap: "20px",
                      width: "100%",
                    },
                    children: [
                      // Left Value Props / Stats Card
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            gap: "12px",
                            flex: 1,
                            padding: "24px 30px",
                            backgroundColor: "rgba(24, 24, 27, 0.88)",
                            border: "1px solid rgba(255, 255, 255, 0.12)",
                            borderRadius: "20px",
                          },
                          children: (bp.value_props || ["Instant Access", "Verified Quality", "24/7 Concierge"]).map((vp, idx) => ({
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              },
                              children: [
                                {
                                  type: "span",
                                  props: {
                                    style: { color: accentColor, fontSize: "16px", fontWeight: 700 },
                                    children: `0${idx + 1}.`,
                                  },
                                },
                                {
                                  type: "span",
                                  props: {
                                    style: { fontSize: "17px", fontWeight: 500, color: "#FAF7F2" },
                                    children: vp,
                                  },
                                },
                              ],
                            },
                          })),
                        },
                      },
                      // Right CTA Card
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            flex: 1,
                            padding: "24px 30px",
                            backgroundColor: accentColor,
                            borderRadius: "20px",
                            color: "#FAF7F2",
                          },
                          children: [
                            {
                              type: "span",
                              props: {
                                style: { fontSize: "14px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "rgba(255,255,255,0.85)" },
                                children: bp.brand_tagline || "Official Experience",
                              },
                            },
                            {
                              type: "div",
                              props: {
                                style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "16px" },
                                children: [
                                  {
                                    type: "span",
                                    props: {
                                      style: { fontSize: "22px", fontWeight: 700, letterSpacing: "-0.5px" },
                                      children: bp.cta_text || "Explore Now ➔",
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype: Authoritative Minimalism (Clean & Tech-Forward)
  // -------------------------------------------------------------
  private static buildMinimalismTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Plus Jakarta Sans";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 66, 42);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "80px 80px 70px 80px",
          backgroundColor: "#09090b",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background: "linear-gradient(180deg, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.3) 45%, rgba(9,9,11,0.9) 100%)",
              },
            },
          },
          // Minimal Brand Header
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: hookFont,
                      fontSize: "22px",
                      fontWeight: 700,
                      letterSpacing: "4px",
                      textTransform: "uppercase",
                      color: "#FAF7F2",
                    },
                    children: bp.brand_name,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: {
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "rgba(250, 247, 242, 0.6)",
                      letterSpacing: "1px",
                    },
                    children: bp.social_handle,
                  },
                },
              ],
            },
          },
          // Giant Negative Space Headline
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "28px",
                maxWidth: "920px",
                marginBottom: "40px",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "24px",
                          lineHeight: "1.45",
                          color: "rgba(250, 247, 242, 0.8)",
                          maxWidth: "760px",
                        },
                        children: bp.subheadline,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // Minimal Bottom Line
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                paddingTop: "24px",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontSize: "16px", color: "rgba(250, 247, 242, 0.6)" },
                    children: bp.brand_tagline || "Curated Perspective",
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: "18px", fontWeight: 600, color: accentColor },
                    children: bp.cta_text || "Read More ➔",
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype: Dark Mode UI Chrome (Clean & Tech-Forward)
  // -------------------------------------------------------------
  private static buildDarkModeUITemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Inter";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 48, 30);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "60px 60px 50px 60px",
          backgroundColor: "#09090b",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background: "linear-gradient(180deg, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.65) 50%, rgba(9,9,11,0.95) 100%)",
              },
            },
          },
          // IDE Chrome Terminal Card
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                width: "100%",
                backgroundColor: "rgba(18, 18, 22, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "20px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              },
              children: [
                // Window Header Controls (● ● ●)
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "16px 24px",
                      backgroundColor: "rgba(255, 255, 255, 0.03)",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: { display: "flex", gap: "8px" },
                          children: [
                            { type: "div", props: { style: { width: "12px", height: "12px", borderRadius: "6px", backgroundColor: "#ff5f56" } } },
                            { type: "div", props: { style: { width: "12px", height: "12px", borderRadius: "6px", backgroundColor: "#ffbd2e" } } },
                            { type: "div", props: { style: { width: "12px", height: "12px", borderRadius: "6px", backgroundColor: "#27c93f" } } },
                          ],
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: { fontSize: "14px", fontWeight: 600, color: "rgba(250, 247, 242, 0.5)", letterSpacing: "1px" },
                          children: `${bp.brand_name.toLowerCase()} // ${bp.category_pill || "release_v2"}`,
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: { fontSize: "13px", color: accentColor, fontWeight: 600 },
                          children: "● LIVE",
                        },
                      },
                    ],
                  },
                },
                // Terminal Content Area
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "24px",
                      padding: "40px",
                    },
                    children: [
                      renderHeadlineElements(
                        bp.headline,
                        bp.highlighted_keywords,
                        accentColor,
                        "#FAF7F2",
                        hookFont,
                        fontSize,
                        lineHeight
                      ),
                      bp.subheadline
                        ? {
                            type: "span",
                            props: {
                              style: { fontSize: "20px", lineHeight: "1.45", color: "rgba(250, 247, 242, 0.8)" },
                              children: bp.subheadline,
                            },
                          }
                        : null,
                    ].filter(Boolean),
                  },
                },
              ],
            },
          },
          // Bottom Status Row
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "20px 24px",
                backgroundColor: "rgba(18, 18, 22, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "16px",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontSize: "16px", fontWeight: 500, color: "rgba(250, 247, 242, 0.7)" },
                    children: bp.social_handle,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: "16px", fontWeight: 700, color: accentColor },
                    children: bp.cta_text || "Execute Query ➔",
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype: Glassmorphism (Clean & Tech-Forward)
  // -------------------------------------------------------------
  private static buildGlassmorphismTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Outfit";
    const bodyFont = bp.font_family_body || "Plus Jakarta Sans";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 54, 34);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "70px 70px 60px 70px",
          backgroundColor: "#09090b",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background: "linear-gradient(180deg, rgba(9,9,11,0.5) 0%, rgba(9,9,11,0.2) 40%, rgba(9,9,11,0.85) 100%)",
              },
            },
          },
          // Header Bar
          {
            type: "div",
            props: {
              style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontFamily: hookFont, fontSize: "24px", fontWeight: 700, letterSpacing: "2px", color: "#FAF7F2" },
                    children: bp.brand_name,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: "16px", fontWeight: 600, color: "rgba(250, 247, 242, 0.7)" },
                    children: bp.social_handle,
                  },
                },
              ],
            },
          },
          // Floating Frosted Glass Card
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                padding: "48px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "32px",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
              },
              children: [
                bp.category_pill
                  ? {
                      type: "span",
                      props: {
                        style: {
                          alignSelf: "flex-start",
                          backgroundColor: "rgba(255, 255, 255, 0.12)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                          padding: "6px 16px",
                          borderRadius: "16px",
                          fontSize: "14px",
                          fontWeight: 700,
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                          color: accentColor,
                        },
                        children: bp.category_pill,
                      },
                    }
                  : null,
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: { fontSize: "22px", lineHeight: "1.45", color: "rgba(250, 247, 242, 0.85)" },
                        children: bp.subheadline,
                      },
                    }
                  : null,
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginTop: "12px",
                      paddingTop: "20px",
                      borderTop: "1px solid rgba(255, 255, 255, 0.15)",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: { fontSize: "16px", color: "rgba(250, 247, 242, 0.7)" },
                          children: bp.brand_tagline || "Discover More",
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            backgroundColor: accentColor,
                            color: "#FAF7F2",
                            padding: "10px 24px",
                            borderRadius: "20px",
                            fontSize: "16px",
                            fontWeight: 700,
                          },
                          children: bp.cta_text || "Explore ➔",
                        },
                      },
                    ],
                  },
                },
              ].filter(Boolean),
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype: Maximalism (High Visual Impact)
  // -------------------------------------------------------------
  private static buildMaximalismTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Outfit";
    const bodyFont = bp.font_family_body || "Plus Jakarta Sans";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 68, 44);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "60px 60px 50px 60px",
          backgroundColor: "#09090b",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background: "linear-gradient(180deg, rgba(9,9,11,0.8) 0%, rgba(9,9,11,0.2) 40%, rgba(9,9,11,0.92) 85%)",
              },
            },
          },
          // Top Maximalist Header Bar
          {
            type: "div",
            props: {
              style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      backgroundColor: "#FAF7F2",
                      color: "#09090b",
                      padding: "8px 20px",
                      borderRadius: "6px",
                      fontFamily: hookFont,
                      fontSize: "24px",
                      fontWeight: 800,
                      letterSpacing: "1px",
                    },
                    children: bp.brand_name.toUpperCase(),
                  },
                },
                {
                  type: "span",
                  props: {
                    style: {
                      backgroundColor: accentColor,
                      color: "#FAF7F2",
                      padding: "8px 18px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: 800,
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                    },
                    children: "✦ MUST SEE ✦",
                  },
                },
              ],
            },
          },
          // Stacked High-Impact Typography
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column", gap: "24px", maxWidth: "940px" },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "24px",
                          fontWeight: 600,
                          lineHeight: "1.4",
                          color: "#FAF7F2",
                          backgroundColor: "rgba(9,9,11,0.75)",
                          padding: "16px 24px",
                          borderRadius: "12px",
                          border: "1px solid rgba(255,255,255,0.15)",
                        },
                        children: bp.subheadline,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // Bottom Bold Banner
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#FAF7F2",
                color: "#09090b",
                padding: "20px 32px",
                borderRadius: "16px",
                width: "100%",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontSize: "18px", fontWeight: 700 },
                    children: bp.social_handle,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: "20px", fontWeight: 800, color: accentColor },
                    children: bp.cta_text || "GET STARTED ➔",
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype: Cyberpunk HUD (High Visual Impact)
  // -------------------------------------------------------------
  private static buildCyberpunkTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = "#00F0FF"; // Cyber Cyan
    const secondaryAccent = bp.color_tokens?.accent || "#FF5500";
    const hookFont = bp.font_family_hook || "Inter";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 52, 32);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "60px 60px 50px 60px",
          backgroundColor: "#050814",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background: "linear-gradient(180deg, rgba(5,8,20,0.85) 0%, rgba(5,8,20,0.3) 40%, rgba(5,8,20,0.92) 85%)",
              },
            },
          },
          // Cyber HUD Telemetry Header
          {
            type: "div",
            props: {
              style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: hookFont,
                      fontSize: "20px",
                      fontWeight: 800,
                      letterSpacing: "3px",
                      color: accentColor,
                    },
                    children: `// ${bp.brand_name.toUpperCase()}`,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: {
                      backgroundColor: "rgba(0, 240, 255, 0.12)",
                      border: "1px solid #00F0FF",
                      color: "#00F0FF",
                      padding: "6px 16px",
                      borderRadius: "4px",
                      fontSize: "13px",
                      fontWeight: 700,
                      letterSpacing: "2px",
                    },
                    children: "[SYSTEM: ACTIVE]",
                  },
                },
              ],
            },
          },
          // HUD Main Frame
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                padding: "40px",
                backgroundColor: "rgba(5, 8, 20, 0.8)",
                border: "1px solid rgba(0, 240, 255, 0.3)",
                borderRadius: "12px",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: { fontSize: "20px", lineHeight: "1.45", color: "rgba(250, 247, 242, 0.85)" },
                        children: bp.subheadline,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // HUD Bottom Action Bar
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "16px 24px",
                backgroundColor: "rgba(5, 8, 20, 0.9)",
                borderTop: `2px solid ${secondaryAccent}`,
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontSize: "15px", color: "rgba(250, 247, 242, 0.6)", letterSpacing: "1px" },
                    children: bp.social_handle,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: "16px", fontWeight: 800, color: secondaryAccent, letterSpacing: "1px" },
                    children: bp.cta_text || "INITIATE PROTOCOL ➔",
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype: Y2K Aesthetic (High Visual Impact)
  // -------------------------------------------------------------
  private static buildY2KAestheticTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Outfit";
    const bodyFont = bp.font_family_body || "Plus Jakarta Sans";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 58, 36);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "60px 60px 50px 60px",
          backgroundColor: "#12081f",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background: "linear-gradient(180deg, rgba(18,8,31,0.75) 0%, rgba(18,8,31,0.2) 40%, rgba(18,8,31,0.9) 85%)",
              },
            },
          },
          // Y2K Header Pill
          {
            type: "div",
            props: {
              style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      color: "#12081f",
                      padding: "8px 24px",
                      borderRadius: "30px",
                      fontFamily: hookFont,
                      fontSize: "20px",
                      fontWeight: 800,
                      letterSpacing: "1px",
                    },
                    children: `✦ ${bp.brand_name.toUpperCase()} ✦`,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: "16px", fontWeight: 700, color: "#FAF7F2" },
                    children: bp.social_handle,
                  },
                },
              ],
            },
          },
          // Y2K Bubble Typography Card
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                padding: "44px",
                backgroundColor: "rgba(18, 8, 31, 0.85)",
                border: "2px solid rgba(255, 255, 255, 0.25)",
                borderRadius: "36px",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: { fontSize: "22px", lineHeight: "1.45", color: "rgba(250, 247, 242, 0.85)" },
                        children: bp.subheadline,
                      },
                    }
                  : null,
                {
                  type: "div",
                  props: {
                    style: {
                      alignSelf: "flex-start",
                      marginTop: "12px",
                      backgroundColor: accentColor,
                      color: "#FAF7F2",
                      padding: "12px 28px",
                      borderRadius: "30px",
                      fontSize: "18px",
                      fontWeight: 800,
                    },
                    children: bp.cta_text || "Click Here ➔",
                  },
                },
              ].filter(Boolean),
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype: Scrapbook Collage (Storytelling & Brand Identity)
  // -------------------------------------------------------------
  private static buildScrapbookTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Playfair Display";
    const bodyFont = bp.font_family_body || "Plus Jakarta Sans";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 52, 34);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "60px 60px 50px 60px",
          backgroundColor: "#1a1410",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background: "linear-gradient(180deg, rgba(26,20,16,0.65) 0%, rgba(26,20,16,0.2) 40%, rgba(26,20,16,0.9) 85%)",
              },
            },
          },
          // Washi Tape Header Accent
          {
            type: "div",
            props: {
              style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      backgroundColor: "rgba(245, 236, 203, 0.9)",
                      color: "#1a1410",
                      padding: "8px 24px",
                      borderRadius: "2px",
                      fontFamily: hookFont,
                      fontSize: "22px",
                      fontWeight: 700,
                      boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                    },
                    children: bp.brand_name,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: "16px", fontWeight: 600, color: "#FAF7F2" },
                    children: bp.social_handle,
                  },
                },
              ],
            },
          },
          // Tilted Photo Card Box
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                padding: "44px",
                backgroundColor: "rgba(24, 20, 18, 0.92)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "16px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: { fontSize: "22px", lineHeight: "1.45", color: "rgba(250, 247, 242, 0.85)" },
                        children: bp.subheadline,
                      },
                    }
                  : null,
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px dashed rgba(255,255,255,0.2)",
                      paddingTop: "16px",
                      marginTop: "10px",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: { fontSize: "16px", color: "rgba(250, 247, 242, 0.7)" },
                          children: bp.brand_tagline || "Field Notes",
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: { fontSize: "18px", fontWeight: 700, color: accentColor },
                          children: bp.cta_text || "Read Story ➔",
                        },
                      },
                    ],
                  },
                },
              ].filter(Boolean),
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype: Mixed Media (Storytelling & Brand Identity)
  // -------------------------------------------------------------
  private static buildMixedMediaTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Outfit";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 56, 36);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "60px 60px 50px 60px",
          backgroundColor: "#141413",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          {
            type: "img",
            props: {
              src: bgUrl,
              alt: "Background",
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                objectFit: "cover",
              },
            },
          },
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                width: "1080px",
                height: "1350px",
                background: "linear-gradient(180deg, rgba(20,20,19,0.7) 0%, rgba(20,20,19,0.2) 35%, rgba(20,20,19,0.9) 85%)",
              },
            },
          },
          // Header Bar
          {
            type: "div",
            props: {
              style: { display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontFamily: hookFont, fontSize: "24px", fontWeight: 800, letterSpacing: "2px", color: "#FAF7F2" },
                    children: bp.brand_name,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: "16px", fontWeight: 600, color: "rgba(250, 247, 242, 0.7)" },
                    children: bp.social_handle,
                  },
                },
              ],
            },
          },
          // Mixed Geometric Block Card
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                padding: "44px",
                backgroundColor: "rgba(20, 20, 19, 0.9)",
                border: `2px solid ${accentColor}`,
                borderRadius: "24px",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FAF7F2",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.subheadline
                  ? {
                      type: "span",
                      props: {
                        style: { fontSize: "22px", lineHeight: "1.45", color: "rgba(250, 247, 242, 0.85)" },
                        children: bp.subheadline,
                      },
                    }
                  : null,
                {
                  type: "div",
                  props: {
                    style: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px" },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: { fontSize: "16px", color: "rgba(250, 247, 242, 0.7)" },
                          children: bp.brand_tagline || "Creative Edition",
                        },
                      },
                      {
                        type: "span",
                        props: {
                          style: {
                            backgroundColor: accentColor,
                            color: "#FAF7F2",
                            padding: "10px 24px",
                            borderRadius: "12px",
                            fontSize: "16px",
                            fontWeight: 700,
                          },
                          children: bp.cta_text || "Discover ➔",
                        },
                      },
                    ],
                  },
                },
              ].filter(Boolean),
            },
          },
        ],
      },
    };
  }

  // -------------------------------------------------------------
  // Archetype: Luxury Typography (Storytelling & Brand Identity)
  // -------------------------------------------------------------
  private static buildLuxuryTypographyTemplate(bgUrl: string, bp: DesignBlueprint) {
    return this.buildEditorialTemplate(bgUrl, bp);
  }
}


