import fs from "fs";
import path from "path";
import React from "react";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { DesignSpecification } from "@/lib/schema/layout-dsl";

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

// Warm font cache at startup
try {
  loadFontRegistry();
} catch {}

export class SatoriCompositorService {
  /**
   * Deterministically composites a Canva-grade 1080×1350 vertical social post
   * from a DesignSpecification and an optional AI background photograph.
   */
  static async compositePost(
    spec: DesignSpecification,
    backgroundImageUrl?: string
  ): Promise<string> {
    const fonts = loadFontRegistry();
    const width = spec.canvas.width || 1080;
    const height = spec.canvas.height || 1350;
    const tokens = spec.brandTokens;

    // Separate layout nodes by semantic roles
    const textNodes = spec.layoutTree.filter((n) => n.type === "text");
    const pillBadges = spec.layoutTree.filter((n) => n.type === "pill_badge");
    const ctaNodes = spec.layoutTree.filter((n) => n.type === "cta");
    const valueCards = spec.layoutTree.filter((n) => n.type === "value_card");

    const cleanText = (str: string = "") =>
      str
        .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-")
        .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
        .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
        .replace(/[→➜➔]/g, "")
        .trim();

    const rawEyebrow = pillBadges[0]?.content || textNodes.find((n) => n.role === "eyebrow")?.content || "FIELD GUIDE";
    const eyebrow = cleanText(rawEyebrow).toUpperCase();

    const rawHook = textNodes.find((n) => n.role === "hook")?.content || "Elevate Your Perspective";
    const hook = cleanText(rawHook);

    const subheadline = cleanText(textNodes.find((n) => n.role === "subheadline")?.content || "");
    const rawCta = ctaNodes[0]?.content || textNodes.find((n) => n.role === "cta")?.content || "Swipe to explore";
    const ctaText = cleanText(rawCta);

    // Adaptive typography calculation to prevent overflow
    const hookLength = hook.length;
    let headlineFontSize = 62;
    if (hookLength > 45) {
      headlineFontSize = 44;
    } else if (hookLength > 28) {
      headlineFontSize = 52;
    }

    // Ensure valid base64 image or fallback safely without hanging
    let resolvedImageSrc: string | null = null;
    if (backgroundImageUrl && backgroundImageUrl.startsWith("data:image/")) {
      resolvedImageSrc = backgroundImageUrl;
    } else if (backgroundImageUrl && backgroundImageUrl.startsWith("http")) {
      try {
        const res = await fetch(backgroundImageUrl, { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          const mime = res.headers.get("content-type") || "image/jpeg";
          resolvedImageSrc = `data:${mime};base64,${buf.toString("base64")}`;
        }
      } catch {
        resolvedImageSrc = null;
      }
    }

    // High-contrast atmospheric scrim layer
    const scrimBackground = resolvedImageSrc
      ? "linear-gradient(180deg, rgba(9,9,11,0.85) 0%, rgba(9,9,11,0.30) 40%, rgba(9,9,11,0.92) 100%)"
      : "radial-gradient(circle at 50% 30%, rgba(39, 39, 42, 0.7) 0%, rgba(9, 9, 11, 0.98) 75%)";

    const fontHeading = tokens.fontFamilyHeading || "Outfit";
    const fontBody = tokens.fontFamilyBody || "Plus Jakarta Sans";
    const accentBg = tokens.accentColor || "#D97757";

    // Satori React element tree in natural DOM painting order
    const element = React.createElement(
      "div",
      {
        style: {
          width: `${width}px`,
          height: `${height}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          backgroundColor: "#09090b",
          fontFamily: fontBody,
          padding: "70px 60px",
          color: "#FAF7F2",
          overflow: "hidden",
        },
      },
      // 1. Background image (if provided and resolved)
      resolvedImageSrc
        ? React.createElement("img", {
            src: resolvedImageSrc,
            style: {
              position: "absolute",
              top: 0,
              left: 0,
              width: `${width}px`,
              height: `${height}px`,
              objectFit: "cover",
            },
          })
        : null,

      // 2. Atmospheric contrast scrim layer
      React.createElement("div", {
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: `${width}px`,
          height: `${height}px`,
          backgroundImage: scrimBackground,
        },
      }),

      // 3. Top Header Section: Category Pill + Brand Lockup
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 22px",
              backgroundColor: accentBg,
              borderRadius: "9999px",
              color: "#FFFFFF",
              fontSize: "19px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            },
          },
          eyebrow
        ),
        React.createElement(
          "div",
          {
            style: {
              fontSize: "22px",
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "0.04em",
              textShadow: "0 2px 10px rgba(0,0,0,0.8)",
            },
          },
          tokens.brandName
        )
      ),

      // 4. Middle Content Section: Hook + Subhead + Cards
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
            marginTop: "auto",
            marginBottom: "auto",
          },
        },
        // Headline Hook
        React.createElement(
          "div",
          {
            style: {
              fontSize: `${headlineFontSize}px`,
              fontFamily: fontHeading,
              fontWeight: 700,
              lineHeight: 1.12,
              color: "#FFFFFF",
              textShadow: "0 4px 24px rgba(0,0,0,0.95)",
              display: "flex",
              flexDirection: "column",
            },
          },
          hook
        ),
        // Subheadline (High-Contrast Zinc-200)
        subheadline
          ? React.createElement(
              "div",
              {
                style: {
                  fontSize: "28px",
                  lineHeight: 1.35,
                  color: "#E4E4E7",
                  maxWidth: "920px",
                  fontWeight: 400,
                  textShadow: "0 2px 14px rgba(0,0,0,0.9)",
                },
              },
              subheadline
            )
          : null,
        // Value Cards (if any)
        valueCards.length > 0
          ? React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "16px",
                  marginTop: "12px",
                },
              },
              valueCards.slice(0, 3).map((card, idx) =>
                React.createElement(
                  "div",
                  {
                    key: idx,
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      padding: "16px 20px",
                      backgroundColor: "rgba(24, 24, 27, 0.85)",
                      borderRadius: "16px",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      flex: 1,
                    },
                  },
                  React.createElement(
                    "div",
                    { style: { fontSize: "16px", color: accentBg, fontWeight: 700 } },
                    card.indexNumber || `0${idx + 1}`
                  ),
                  React.createElement(
                    "div",
                    { style: { fontSize: "19px", fontWeight: 700, color: "#FFFFFF" } },
                    card.title
                  )
                )
              )
            )
          : null
      ),

      // 5. Bottom Footer Section: Social Handle + CTA Badge
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.15)",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              fontSize: "20px",
              color: "#D4D4D8",
              fontWeight: 500,
              textShadow: "0 2px 8px rgba(0,0,0,0.8)",
            },
          },
          tokens.socialHandle
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 24px",
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              fontSize: "19px",
              fontWeight: 600,
              color: "#FFFFFF",
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            },
          },
          `${ctaText} ->`
        )
      )
    );

    // Render Satori SVG
    const svg = await satori(element, {
      width,
      height,
      fonts: fonts.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: f.style,
      })),
    });

    // Rasterize SVG to high-DPI PNG with Resvg
    const resvg = new Resvg(svg, {
      fitTo: {
        mode: "width",
        value: width,
      },
    });

    const pngBuffer = resvg.render().asPng();
    const base64 = pngBuffer.toString("base64");
    return `data:image/png;base64,${base64}`;
  }
}
