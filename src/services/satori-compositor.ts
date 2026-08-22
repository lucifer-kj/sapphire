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
    const valueCards = spec.layoutTree.filter((n) => n.type === "value_card");

    const eyebrow = textNodes.find((n) => n.role === "eyebrow")?.content || pillBadges[0]?.label || "INSIGHT";
    const hook = textNodes.find((n) => n.role === "hook")?.content || "Elevate Your Perspective";
    const subheadline = textNodes.find((n) => n.role === "subheadline")?.content || "";
    const ctaText = textNodes.find((n) => n.role === "cta")?.content || "Swipe to explore →";

    // Adaptive typography calculation to prevent overflow
    const hookLength = hook.length;
    let headlineFontSize = 64;
    if (hookLength > 45) {
      headlineFontSize = 44;
    } else if (hookLength > 28) {
      headlineFontSize = 54;
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

    // Scrim gradient
    const scrimBackground = resolvedImageSrc
      ? "linear-gradient(180deg, rgba(9,9,11,0.75) 0%, rgba(9,9,11,0.2) 35%, rgba(9,9,11,0.88) 100%)"
      : "radial-gradient(circle at 50% 30%, rgba(39, 39, 42, 0.6) 0%, rgba(9, 9, 11, 0.95) 75%)";

    const fontHeading = tokens.fontFamilyHeading || "Outfit";
    const fontBody = tokens.fontFamilyBody || "Plus Jakarta Sans";

    // Satori React element tree in natural DOM painting order (NO zIndex)
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
          backgroundColor: spec.canvas.backgroundColor || "#09090b",
          fontFamily: fontBody,
          padding: "70px 60px",
          color: tokens.primaryColor,
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

      // 2. Atmospheric scrim layer
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
              padding: "10px 20px",
              backgroundColor: tokens.accentColor,
              borderRadius: "9999px",
              color: "#ffffff",
              fontSize: "20px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            },
          },
          `✦ ${eyebrow}`
        ),
        React.createElement(
          "div",
          {
            style: {
              fontSize: "22px",
              fontWeight: 700,
              color: tokens.primaryColor,
              opacity: 0.9,
              letterSpacing: "0.05em",
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
            gap: "24px",
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
              lineHeight: 1.1,
              color: tokens.primaryColor,
              textShadow: "0 4px 20px rgba(0,0,0,0.8)",
              display: "flex",
              flexDirection: "column",
            },
          },
          hook
        ),
        // Subheadline
        subheadline
          ? React.createElement(
              "div",
              {
                style: {
                  fontSize: "28px",
                  lineHeight: 1.35,
                  color: tokens.mutedColor || "#D4D4D8",
                  maxWidth: "900px",
                  textShadow: "0 2px 10px rgba(0,0,0,0.7)",
                },
              },
              subheadline
            )
          : null,
        // Optional Value Cards
        valueCards.length > 0
          ? React.createElement(
              "div",
              {
                style: {
                  display: "flex",
                  gap: "16px",
                  marginTop: "16px",
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
                      gap: "6px",
                      padding: "16px 20px",
                      backgroundColor: "rgba(24, 24, 27, 0.75)",
                      borderRadius: "16px",
                      border: "1px solid rgba(255, 255, 255, 0.15)",
                      flex: 1,
                    },
                  },
                  React.createElement(
                    "div",
                    { style: { fontSize: "16px", color: tokens.accentColor, fontWeight: 700 } },
                    card.indexNumber || `0${idx + 1}`
                  ),
                  React.createElement(
                    "div",
                    { style: { fontSize: "20px", fontWeight: 700, color: tokens.primaryColor } },
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
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              fontSize: "20px",
              color: tokens.mutedColor || "#A1A1AA",
              fontWeight: 500,
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
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              fontSize: "20px",
              fontWeight: 600,
              color: tokens.primaryColor,
            },
          },
          ctaText
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
