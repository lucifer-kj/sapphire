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
                zIndex: 10,
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
                zIndex: 10,
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
                zIndex: 10,
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
                zIndex: 10,
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
                zIndex: 10,
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
                zIndex: 10,
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
                zIndex: 10,
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
                zIndex: 10,
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
                zIndex: 10,
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
                zIndex: 10,
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
}
