import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

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

async function generateAIBackground(prompt: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  console.log("Generating AI photo via Cloudflare...");
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      return `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch (e: any) {
    console.warn("Cloudflare error:", e.message);
  }

  // Fallback
  const polUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1350&model=flux&nologo=true`;
  const polRes = await fetch(polUrl, { signal: AbortSignal.timeout(15000) });
  const polBuf = Buffer.from(await polRes.arrayBuffer());
  return `data:image/jpeg;base64,${polBuf.toString("base64")}`;
}

async function composeCanvaPostV2() {
  const fontBold = fs.readFileSync(path.resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Bold.ttf"));
  const fontRegular = fs.readFileSync(path.resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Regular.ttf"));

  // 1. Generate stunning central product photo with warm coffee atmosphere
  const bgPrompt = "Studio commercial product shot, vertical portrait, a single clear plastic cup filled with iced latte coffee and ice cubes, condensation beads, floating dark roasted coffee beans in air, warm mocha studio background with dramatic rim lighting, hyperrealistic advertisement 8k";
  const bgDataUrl = await generateAIBackground(bgPrompt);

  console.log("Compositing V2 with Satori...");

  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "1080px",
        height: "1350px",
        padding: "70px 70px 50px 70px",
        backgroundColor: "#C6AA8D",
        color: "#2C1810",
        fontFamily: "Plus Jakarta Sans",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // 1. AI Hero Visual Image
        {
          type: "img",
          props: {
            src: bgDataUrl,
            alt: "Coffee Hero",
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

        // 2. Artistic Vignette Scrim (keeps center open, frames top & bottom text)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "0px",
              left: "0px",
              width: "1080px",
              height: "1350px",
              background: "linear-gradient(to bottom, rgba(200,170,140,0.5) 0%, rgba(200,170,140,0.05) 30%, rgba(44,24,16,0.1) 70%, rgba(30,15,10,0.7) 100%)",
            },
          },
        },

        // 3. TOP HEADER
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
              // Logo
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
                          fontSize: "50px",
                          fontWeight: 700,
                          letterSpacing: "-1.5px",
                          color: "#1E0E08",
                        },
                        children: "Morning",
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "50px",
                          fontWeight: 700,
                          letterSpacing: "-1.5px",
                          color: "#1E0E08",
                        },
                        children: "Brew",
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "50px",
                          fontWeight: 700,
                          letterSpacing: "-1.5px",
                          color: "#1E0E08",
                        },
                        children: "Bistro",
                      },
                    },
                  ],
                },
              },
              // Tagline Pill
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    textAlign: "right",
                    gap: "6px",
                  },
                  children: [
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "26px",
                          fontWeight: 700,
                          color: "#1E0E08",
                        },
                        children: "Brewed for you .",
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "26px",
                          fontWeight: 700,
                          color: "#1E0E08",
                        },
                        children: "served on ice.",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },

        // 4. FLOATING EDITORIAL BADGE OVERLAY
        {
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
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    borderRadius: "9999px",
                    padding: "12px 32px",
                    color: "#FFFFFF",
                    fontSize: "22px",
                    fontWeight: 700,
                    letterSpacing: "4px",
                    textTransform: "uppercase",
                    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                  },
                  children: "✦ Artisan Cold Brew ✦",
                },
              },
            ],
          },
        },

        // 5. BOTTOM EDITORIAL SECTION
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "28px",
              width: "100%",
            },
            children: [
              // Value Props Row
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
                    // Bottom Left
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
                          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        },
                        children: [
                          { type: "span", props: { children: "Step in." } },
                          { type: "span", props: { children: "Sip slow." } },
                          { type: "span", props: { children: "Stay awhile." } },
                        ],
                      },
                    },
                    // Bottom Right
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          flexDirection: "column",
                          fontSize: "24px",
                          fontWeight: 700,
                          lineHeight: "1.35",
                          color: "#FAF7F2",
                          maxWidth: "480px",
                          textAlign: "right",
                          textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                        },
                        children: [
                          { type: "span", props: { children: "We don't just serve iced" } },
                          { type: "span", props: { children: "coffee — we serve cool" } },
                          { type: "span", props: { children: "confidence in a cup." } },
                        ],
                      },
                    },
                  ],
                },
              },

              // Bottom Social Handle Bar
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid rgba(255,255,255,0.25)",
                    paddingTop: "20px",
                    color: "#FAF7F2",
                  },
                  children: [
                    {
                      type: "span",
                      props: {
                        style: { fontSize: "24px", fontWeight: 700, letterSpacing: "1px" },
                        children: "@morningbrewbistro",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "#D97757",
                          padding: "10px 24px",
                          borderRadius: "10px",
                          fontSize: "20px",
                          fontWeight: 700,
                          color: "#FFFFFF",
                        },
                        children: "Order Now ➔",
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

  const svg = await satori(element as any, {
    width: 1080,
    height: 1350,
    fonts: [
      { name: "Plus Jakarta Sans", data: fontRegular, weight: 400, style: "normal" },
      { name: "Plus Jakarta Sans", data: fontBold, weight: 700, style: "normal" },
    ],
  });

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1080 } });
  const pngBuffer = resvg.render().asPng();

  const outputPath = path.resolve(process.cwd(), "scratch", "dynamic-canva-post-v2.png");
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`\n🎉 V2 POST SAVED: ${outputPath}`);
}

composeCanvaPostV2();
