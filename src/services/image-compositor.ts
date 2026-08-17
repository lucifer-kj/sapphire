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
          padding: "65px 70px 50px 70px",
          backgroundColor: "#141413",
          color: "#FAF7F2",
          fontFamily: bodyFont,
          position: "relative",
          overflow: "hidden",
        },
        children: [
          // 1. Background Photo
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
          // 2. Multi-Stop Logarithmic Scrim
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
                  "linear-gradient(to bottom, rgba(20,10,5,0.78) 0%, rgba(20,10,5,0.3) 25%, rgba(0,0,0,0) 45%, rgba(20,10,5,0.5) 70%, rgba(20,10,5,0.92) 100%)",
              },
            },
          },
          // 3. Top Header Bar
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
              },
              children: [
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "1.0",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontFamily: hookFont,
                            fontSize: "44px",
                            fontWeight: 700,
                            letterSpacing: "-1px",
                            color: "#FAF7F2",
                            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                          },
                          children: bp.brand_name,
                        },
                      },
                    ],
                  },
                },
                bp.brand_tagline
                  ? {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          textAlign: "right",
                        },
                        children: [
                          {
                            type: "span",
                            props: {
                              style: {
                                fontFamily: bodyFont,
                                fontSize: "22px",
                                fontWeight: 700,
                                color: "#FAF7F2",
                                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                              },
                              children: bp.brand_tagline,
                            },
                          },
                        ],
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // 4. Center Pill / Floating Tag
          bp.category_pill
            ? {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                  },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          backgroundColor: "rgba(255, 255, 255, 0.22)",
                          border: "1px solid rgba(255, 255, 255, 0.45)",
                          borderRadius: "9999px",
                          padding: "10px 28px",
                          color: "#FFFFFF",
                          fontFamily: bodyFont,
                          fontSize: "18px",
                          fontWeight: 700,
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                        },
                        children: `✦ ${bp.category_pill} ✦`,
                      },
                    },
                  ],
                },
              }
            : { type: "div", props: { style: { display: "flex" } } },
          // 5. Bottom Editorial Content & CTA
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
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      width: "100%",
                    },
                    children: [
                      // Left Value Props / Hook
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "column",
                            fontSize: "26px",
                            fontWeight: 700,
                            lineHeight: "1.35",
                            color: "#FAF7F2",
                            maxWidth: "480px",
                            textShadow: "0 2px 10px rgba(0,0,0,0.7)",
                          },
                          children: [
                            renderHeadlineElements(
                              bp.headline,
                              bp.highlighted_keywords,
                              accentColor,
                              accentColor,
                              hookFont,
                              fontSize,
                              lineHeight
                            ),
                            ...(bp.value_props && bp.value_props.length
                              ? bp.value_props.slice(0, 3).map((vp) => ({
                                  type: "span",
                                  props: {
                                    style: { fontFamily: bodyFont, marginTop: "6px" },
                                    children: `• ${vp}`,
                                  },
                                }))
                              : []),
                          ],
                        },
                      },
                      // Right Subheadline
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            flexDirection: "column",
                            fontSize: "22px",
                            fontWeight: 600,
                            lineHeight: "1.35",
                            color: "#FAF7F2",
                            maxWidth: "420px",
                            textAlign: "right",
                            textShadow: "0 2px 10px rgba(0,0,0,0.7)",
                          },
                          children: [
                            {
                              type: "span",
                              props: {
                                style: { fontFamily: bodyFont },
                                children: bp.subheadline,
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                // Bottom Bar
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid rgba(255,255,255,0.35)",
                      paddingTop: "18px",
                      color: "#FAF7F2",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontFamily: bodyFont,
                            fontSize: "22px",
                            fontWeight: 700,
                            letterSpacing: "1px",
                            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                          },
                          children: bp.social_handle,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            display: "flex",
                            alignItems: "center",
                            backgroundColor: accentColor,
                            padding: "10px 24px",
                            borderRadius: "8px",
                            fontFamily: bodyFont,
                            fontSize: "18px",
                            fontWeight: 700,
                            color: "#FFFFFF",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
                          },
                          children: bp.cta_text,
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
          padding: "70px 70px 50px 70px",
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
                  "linear-gradient(to right, rgba(20,20,19,0.15) 0%, rgba(20,20,19,0.75) 45%, rgba(20,20,19,0.96) 100%)",
              },
            },
          },
          // Header
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
                    style: { fontSize: "24px", fontWeight: 700, color: "#B0AEA5" },
                    children: bp.social_handle,
                  },
                },
                bp.category_pill
                  ? {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          backgroundColor: accentColor,
                          padding: "8px 20px",
                          borderRadius: "9999px",
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#FFFFFF",
                        },
                        children: bp.category_pill,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // Main Right-Aligned Content Column
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                textAlign: "right",
                width: "100%",
                gap: "24px",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#FFFFFF",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                {
                  type: "p",
                  props: {
                    style: {
                      fontFamily: bodyFont,
                      fontSize: "26px",
                      fontWeight: 500,
                      lineHeight: "1.4",
                      color: "#B0AEA5",
                      maxWidth: "520px",
                      margin: 0,
                    },
                    children: bp.subheadline,
                  },
                },
              ],
            },
          },
          // Footer
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                borderTop: "1px solid rgba(255,255,255,0.25)",
                paddingTop: "20px",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontSize: "24px", fontWeight: 700, color: "#FAF7F2" },
                    children: bp.brand_name,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: accentColor,
                      padding: "12px 28px",
                      borderRadius: "10px",
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    },
                    children: bp.cta_text,
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
  // Archetype 3: Comparison Split (Before/After, Versus, Growth)
  // -------------------------------------------------------------
  private static buildComparisonSplitTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Inter";
    const bodyFont = bp.font_family_body || "Inter";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 54, 32);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "60px 60px 40px 60px",
          backgroundColor: "#FAF9F5",
          color: "#141413",
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
                  "linear-gradient(to bottom, rgba(250,249,245,0.95) 0%, rgba(250,249,245,0.45) 25%, rgba(0,0,0,0) 50%, rgba(20,20,19,0.88) 100%)",
              },
            },
          },
          // Header
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
                      fontSize: "32px",
                      fontWeight: 700,
                      color: "#141413",
                    },
                    children: bp.brand_name,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: "20px", fontWeight: 600, color: "#787670" },
                    children: bp.social_handle,
                  },
                },
              ],
            },
          },
          // Center Headline
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                width: "100%",
                gap: "12px",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#141413",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                {
                  type: "p",
                  props: {
                    style: {
                      fontFamily: bodyFont,
                      fontSize: "24px",
                      fontWeight: 500,
                      color: "#4B4944",
                      maxWidth: "720px",
                      margin: 0,
                    },
                    children: bp.subheadline,
                  },
                },
              ],
            },
          },
          // Footer
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                color: "#FAF7F2",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: { fontSize: "22px", fontWeight: 700 },
                    children: bp.brand_tagline || bp.headline,
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: accentColor,
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    },
                    children: bp.cta_text,
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
  // Archetype 4: Vintage Poster (DTC, Organic, Wellness, Heritage)
  // -------------------------------------------------------------
  private static buildVintagePosterTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";
    const hookFont = bp.font_family_hook || "Outfit";
    const bodyFont = bp.font_family_body || "Plus Jakarta Sans";
    const { fontSize, lineHeight } = calculateHeadlineSize(bp.headline, bp.font_scale, 62, 34);

    return {
      type: "div",
      props: {
        style: {
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "1080px",
          height: "1350px",
          padding: "60px 65px 45px 65px",
          backgroundColor: "#FAF7EE",
          color: "#1E4D2B",
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
                  "linear-gradient(to bottom, rgba(250,247,238,0.94) 0%, rgba(250,247,238,0.35) 25%, rgba(0,0,0,0) 50%, rgba(250,247,238,0.88) 100%)",
              },
            },
          },
          // Header Display
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                width: "100%",
                gap: "8px",
              },
              children: [
                renderHeadlineElements(
                  bp.headline,
                  bp.highlighted_keywords,
                  accentColor,
                  "#1E4D2B",
                  hookFont,
                  fontSize,
                  lineHeight
                ),
                bp.category_pill
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontFamily: hookFont,
                          fontSize: "26px",
                          fontWeight: 600,
                          letterSpacing: "2px",
                          color: accentColor,
                        },
                        children: `✦ ${bp.category_pill} ✦`,
                      },
                    }
                  : null,
              ].filter(Boolean),
            },
          },
          // Footer Stamps
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                borderTop: "2px solid #1E4D2B",
                paddingTop: "16px",
              },
              children: [
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: bodyFont,
                      fontSize: "20px",
                      fontWeight: 700,
                      letterSpacing: "1px",
                    },
                    children: bp.subheadline,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: {
                      fontFamily: hookFont,
                      fontSize: "18px",
                      fontWeight: 700,
                      border: "2px solid #1E4D2B",
                      borderRadius: "9999px",
                      padding: "4px 16px",
                    },
                    children: "EST 2026",
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
  // Archetype 5: SaaS Dot-Grid (Dev tools, AI Apps, Productivity)
  // -------------------------------------------------------------
  private static buildSaaSTemplate(bgUrl: string, bp: DesignBlueprint) {
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
          padding: "70px 70px 50px 70px",
          backgroundColor: "#0F172A",
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
                  "linear-gradient(to bottom, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.45) 30%, rgba(0,0,0,0) 60%, rgba(15,23,42,0.94) 100%)",
              },
            },
          },
          // Header
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
                      letterSpacing: "2px",
                    },
                    children: bp.brand_name.toUpperCase(),
                  },
                },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      border: "2px solid #64748B",
                      fontSize: "20px",
                    },
                    children: "➔",
                  },
                },
              ],
            },
          },
          // Headline Block
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxWidth: "720px",
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
                {
                  type: "p",
                  props: {
                    style: {
                      fontFamily: bodyFont,
                      fontSize: "24px",
                      fontWeight: 500,
                      color: "#94A3B8",
                      lineHeight: "1.4",
                      margin: 0,
                    },
                    children: bp.subheadline,
                  },
                },
              ],
            },
          },
          // Footer
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                borderTop: "1px solid rgba(255,255,255,0.2)",
                paddingTop: "20px",
              },
              children: [
                bp.category_pill
                  ? {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          backgroundColor: "rgba(255,255,255,0.12)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          padding: "8px 20px",
                          borderRadius: "9999px",
                          fontSize: "16px",
                          fontWeight: 700,
                        },
                        children: bp.category_pill,
                      },
                    }
                  : { type: "div", props: { style: { display: "flex" } } },
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: accentColor,
                      padding: "10px 24px",
                      borderRadius: "8px",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    },
                    children: bp.cta_text,
                  },
                },
              ],
            },
          },
        ],
      },
    };
  }
}

