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

  console.log("Generating AI background via Cloudflare Workers AI...");
  const start = Date.now();

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
      console.log(`✅ Cloudflare background generated in ${Date.now() - start}ms (${buf.length} bytes)`);
      return `data:image/png;base64,${buf.toString("base64")}`;
    }
  } catch (e: any) {
    console.warn("Cloudflare background error, falling back to Pollinations:", e.message);
  }

  // Fallback to Pollinations
  const polUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1350&model=flux&nologo=true`;
  const polRes = await fetch(polUrl, { signal: AbortSignal.timeout(15000) });
  const polBuf = Buffer.from(await polRes.arrayBuffer());
  console.log(`Pollinations background generated in ${Date.now() - start}ms (${polBuf.length} bytes)`);
  return `data:image/jpeg;base64,${polBuf.toString("base64")}`;
}

async function composeCanvaPost() {
  const fontBold = fs.readFileSync(path.resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Bold.ttf"));
  const fontRegular = fs.readFileSync(path.resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Regular.ttf"));

  // Generate hero AI backdrop
  const bgPrompt = "Studio commercial photography, vertical 4:5 shot, a single clear plastic cup filled with iced latte coffee and ice cubes with condensation droplets in center, floating roasted coffee beans around it, warm beige mocha background, soft studio light, high key, 8k";
  const bgDataUrl = await generateAIBackground(bgPrompt);

  console.log("Compositing graphic design layers with Satori...");
  const satoriStart = Date.now();

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
        backgroundColor: "#CDB092",
        color: "#2C1810",
        fontFamily: "Plus Jakarta Sans",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // 1. Base AI Generated Hero Visual
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

        // 2. Contrast Scrim Overlay
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "0px",
              left: "0px",
              width: "1080px",
              height: "1350px",
              background: "linear-gradient(to bottom, rgba(205,176,146,0.35) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(44,24,16,0.45) 100%)",
            },
          },
        },

        // 3. TOP HEADER BAR
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
              zIndex: 10,
            },
            children: [
              // Brand Logo
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
                          fontSize: "52px",
                          fontWeight: 700,
                          letterSpacing: "-1.5px",
                          color: "#2B160E",
                        },
                        children: "Morning",
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "52px",
                          fontWeight: 700,
                          letterSpacing: "-1.5px",
                          color: "#2B160E",
                        },
                        children: "Brew",
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "52px",
                          fontWeight: 700,
                          letterSpacing: "-1.5px",
                          color: "#2B160E",
                        },
                        children: "Bistro",
                      },
                    },
                  ],
                },
              },
              // Top Right: Tagline
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    textAlign: "right",
                    gap: "4px",
                  },
                  children: [
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "26px",
                          fontWeight: 700,
                          color: "#2B160E",
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
                          color: "#2B160E",
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

        // 4. GIANT CENTER BACKDROP TYPOGRAPHY ("ICED COFFEE")
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              lineHeight: "0.85",
              zIndex: 5,
              opacity: 0.9,
              marginTop: "40px",
              marginBottom: "40px",
            },
            children: [
              {
                type: "span",
                props: {
                  style: {
                    fontSize: "210px",
                    fontWeight: 700,
                    color: "#FAF7F2",
                    letterSpacing: "8px",
                    textShadow: "0 6px 35px rgba(43,22,14,0.2)",
                  },
                  children: "ICED",
                },
              },
              {
                type: "span",
                props: {
                  style: {
                    fontSize: "210px",
                    fontWeight: 700,
                    color: "#FAF7F2",
                    letterSpacing: "8px",
                    textShadow: "0 6px 35px rgba(43,22,14,0.2)",
                  },
                  children: "COFFEE",
                },
              },
            ],
          },
        },

        // 5. BOTTOM SECTION
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: "32px",
              width: "100%",
              zIndex: 10,
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
                          fontSize: "26px",
                          fontWeight: 700,
                          lineHeight: "1.35",
                          color: "#2B160E",
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
                          color: "#2B160E",
                          maxWidth: "460px",
                          textAlign: "right",
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

              // Bottom Center: Social Handle + Icon Badges
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "16px",
                    fontSize: "24px",
                    fontWeight: 700,
                    color: "#2B160E",
                    borderTop: "1px solid rgba(43,22,14,0.25)",
                    paddingTop: "18px",
                  },
                  children: [
                    {
                      type: "span",
                      props: {
                        style: { letterSpacing: "1px" },
                        children: "@morningbrewbistro",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          border: "2px solid #2B160E",
                          fontSize: "16px",
                          fontWeight: 700,
                        },
                        children: "f",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          border: "2px solid #2B160E",
                          fontSize: "14px",
                          fontWeight: 700,
                        },
                        children: "📷",
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

  console.log(`Satori generated SVG in ${Date.now() - satoriStart}ms!`);
  const resvgStart = Date.now();

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1080 },
  });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  console.log(`Resvg rasterized PNG in ${Date.now() - resvgStart}ms (${pngBuffer.length} bytes)!`);

  const outputPath = path.resolve(process.cwd(), "scratch", "dynamic-canva-post.png");
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`\n🎉 COMPOSITED POST SAVED: ${outputPath}`);
}

composeCanvaPost();
