import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { DesignBlueprint, DesignArchetype } from "@/lib/design-system/archetypes";

let cachedBoldFont: Buffer | null = null;
let cachedRegularFont: Buffer | null = null;

function loadFonts(): { bold: Buffer; regular: Buffer } {
  if (cachedBoldFont && cachedRegularFont) {
    return { bold: cachedBoldFont, regular: cachedRegularFont };
  }

  const fontsDir = path.resolve(process.cwd(), "src", "assets", "fonts");
  const boldPath = path.join(fontsDir, "PlusJakartaSans-Bold.ttf");
  const regPath = path.join(fontsDir, "PlusJakartaSans-Regular.ttf");

  if (fs.existsSync(boldPath) && fs.existsSync(regPath)) {
    cachedBoldFont = fs.readFileSync(boldPath);
    cachedRegularFont = fs.readFileSync(regPath);
  } else {
    // Fallback: create empty buffers to prevent fatal crash
    cachedBoldFont = Buffer.alloc(0);
    cachedRegularFont = Buffer.alloc(0);
  }

  return { bold: cachedBoldFont, regular: cachedRegularFont };
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
    const { bold, regular } = loadFonts();

    if (!bold.length || !regular.length) {
      console.warn("Fonts missing in src/assets/fonts/, returning raw background.");
      return bgImageDataUrl;
    }

    const templateElement = this.buildArchetypeJSX(bgImageDataUrl, blueprint);

    try {
      const svg = await satori(templateElement as any, {
        width: 1080,
        height: 1350,
        fonts: [
          { name: "Plus Jakarta Sans", data: regular, weight: 400, style: "normal" },
          { name: "Plus Jakarta Sans", data: bold, weight: 700, style: "normal" },
        ],
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
  // Archetype 1: Editorial Magazine (e.g. Tasty Morning Joy)
  // -------------------------------------------------------------
  private static buildEditorialTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";

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
          fontFamily: "Plus Jakarta Sans",
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
          // 2. Editorial Scrim
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
                  "linear-gradient(to bottom, rgba(20,10,5,0.7) 0%, rgba(20,10,5,0.15) 25%, rgba(0,0,0,0) 45%, rgba(0,0,0,0) 65%, rgba(20,10,5,0.8) 100%)",
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
                            fontSize: "46px",
                            fontWeight: 700,
                            letterSpacing: "-1.5px",
                            color: "#FAF7F2",
                            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
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
                                fontSize: "24px",
                                fontWeight: 700,
                                color: "#FAF7F2",
                                textShadow: "0 2px 8px rgba(0,0,0,0.5)",
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
                          backgroundColor: "rgba(255, 255, 255, 0.18)",
                          border: "1px solid rgba(255, 255, 255, 0.4)",
                          borderRadius: "9999px",
                          padding: "10px 28px",
                          color: "#FFFFFF",
                          fontSize: "20px",
                          fontWeight: 700,
                          letterSpacing: "3px",
                          textTransform: "uppercase",
                          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
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
                            fontSize: "28px",
                            fontWeight: 700,
                            lineHeight: "1.35",
                            color: "#FAF7F2",
                            maxWidth: "460px",
                            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                          },
                          children: [
                            {
                              type: "span",
                              props: {
                                style: { fontSize: "36px", color: accentColor, marginBottom: "4px" },
                                children: bp.headline,
                              },
                            },
                            ...(bp.value_props && bp.value_props.length
                              ? bp.value_props.slice(0, 3).map((vp) => ({
                                  type: "span",
                                  props: { children: vp },
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
                            fontSize: "24px",
                            fontWeight: 600,
                            lineHeight: "1.35",
                            color: "#FAF7F2",
                            maxWidth: "440px",
                            textAlign: "right",
                            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
                          },
                          children: [{ type: "span", props: { children: bp.subheadline } }],
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
                      borderTop: "1px solid rgba(255,255,255,0.3)",
                      paddingTop: "18px",
                      color: "#FAF7F2",
                    },
                    children: [
                      {
                        type: "span",
                        props: {
                          style: {
                            fontSize: "22px",
                            fontWeight: 700,
                            letterSpacing: "1px",
                            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
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
                            fontSize: "20px",
                            fontWeight: 700,
                            color: "#FFFFFF",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
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
  // Archetype 2: Conceptual Split (e.g. Building Brand Without Strategy)
  // -------------------------------------------------------------
  private static buildConceptualSplitTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";

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
          fontFamily: "Plus Jakarta Sans",
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
                  "linear-gradient(to right, rgba(20,20,19,0.2) 0%, rgba(20,20,19,0.7) 45%, rgba(20,20,19,0.92) 100%)",
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
                {
                  type: "h1",
                  props: {
                    style: {
                      fontSize: "64px",
                      fontWeight: 700,
                      lineHeight: "1.15",
                      color: "#FFFFFF",
                      maxWidth: "600px",
                      margin: 0,
                    },
                    children: bp.headline,
                  },
                },
                {
                  type: "p",
                  props: {
                    style: {
                      fontSize: "28px",
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
                borderTop: "1px solid rgba(255,255,255,0.2)",
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
                      fontSize: "22px",
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
  // Archetype 3: Comparison Split (e.g. Without SEO vs With SEO)
  // -------------------------------------------------------------
  private static buildComparisonSplitTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";

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
          fontFamily: "Plus Jakarta Sans",
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
                  "linear-gradient(to bottom, rgba(250,249,245,0.92) 0%, rgba(250,249,245,0.4) 25%, rgba(0,0,0,0) 50%, rgba(20,20,19,0.85) 100%)",
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
                    style: { fontSize: "32px", fontWeight: 700, color: "#141413" },
                    children: bp.brand_name,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: { fontSize: "22px", fontWeight: 600, color: "#787670" },
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
                {
                  type: "h1",
                  props: {
                    style: {
                      fontSize: "56px",
                      fontWeight: 700,
                      color: "#141413",
                      margin: 0,
                    },
                    children: bp.headline,
                  },
                },
                {
                  type: "p",
                  props: {
                    style: {
                      fontSize: "26px",
                      fontWeight: 500,
                      color: "#4B4944",
                      maxWidth: "700px",
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
                    style: { fontSize: "24px", fontWeight: 700 },
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
  // Archetype 4: Vintage Poster (e.g. Fresh Daily Healthy Choice)
  // -------------------------------------------------------------
  private static buildVintagePosterTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";

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
          fontFamily: "Plus Jakarta Sans",
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
                  "linear-gradient(to bottom, rgba(250,247,238,0.92) 0%, rgba(250,247,238,0.3) 25%, rgba(0,0,0,0) 50%, rgba(250,247,238,0.85) 100%)",
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
                {
                  type: "h1",
                  props: {
                    style: {
                      fontSize: "68px",
                      fontWeight: 700,
                      letterSpacing: "4px",
                      textTransform: "uppercase",
                      color: "#1E4D2B",
                      margin: 0,
                    },
                    children: bp.headline,
                  },
                },
                bp.category_pill
                  ? {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "30px",
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
                    style: { fontSize: "20px", fontWeight: 700, letterSpacing: "2px" },
                    children: bp.subheadline,
                  },
                },
                {
                  type: "span",
                  props: {
                    style: {
                      fontSize: "20px",
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
  // Archetype 5: SaaS Dot-Grid (e.g. LinkedIn Sales Tools)
  // -------------------------------------------------------------
  private static buildSaaSTemplate(bgUrl: string, bp: DesignBlueprint) {
    const accentColor = bp.color_tokens?.accent || "#D97757";

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
          fontFamily: "Plus Jakarta Sans",
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
                  "linear-gradient(to bottom, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.4) 30%, rgba(0,0,0,0) 60%, rgba(15,23,42,0.92) 100%)",
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
                    style: { fontSize: "28px", fontWeight: 700, letterSpacing: "2px" },
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
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      border: "2px solid #64748B",
                      fontSize: "24px",
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
                {
                  type: "h1",
                  props: {
                    style: {
                      fontSize: "64px",
                      fontWeight: 700,
                      lineHeight: "1.15",
                      color: "#F8FAFC",
                      margin: 0,
                    },
                    children: bp.headline,
                  },
                },
                {
                  type: "p",
                  props: {
                    style: {
                      fontSize: "26px",
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
                          backgroundColor: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.3)",
                          padding: "8px 20px",
                          borderRadius: "9999px",
                          fontSize: "18px",
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
}
