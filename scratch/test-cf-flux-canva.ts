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

async function generateCloudflareFluxImage(prompt: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  console.log("Generating FLUX 1 Schnell image via Cloudflare Workers AI...");
  const start = Date.now();

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
    signal: AbortSignal.timeout(20000),
  });

  const data = await res.json();
  const base64 = data.result?.image;
  console.log(`✅ Cloudflare FLUX generated in ${Date.now() - start}ms (base64 length: ${base64?.length})`);
  return `data:image/jpeg;base64,${base64}`;
}

async function composeCloudflareCanvaPost() {
  const fontBold = fs.readFileSync(path.resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Bold.ttf"));
  const fontRegular = fs.readFileSync(path.resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Regular.ttf"));

  const bgPrompt = "Studio product photography, vertical 4:5 portrait, a delicious iced latte coffee with melting ice cubes and cold condensation droplets in a clear plastic cup, dark roasted whole coffee beans floating in air around it, warm beige and mocha caramel background, studio lighting, hyper-realistic, 8k";
  const bgDataUrl = await generateCloudflareFluxImage(bgPrompt);

  console.log("Compositing Canva graphic layers with Satori...");

  const element = {
    type: "div",
    props: {
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "1080px",
        height: "1350px",
        padding: "60px 65px 45px 65px",
        backgroundColor: "#C6AA8D",
        color: "#FAF7F2",
        fontFamily: "Plus Jakarta Sans",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // 1. Cloudflare FLUX Base Photography Layer
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

        // 2. High-End Editorial Scrim (Gradient Overlay)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "0px",
              left: "0px",
              width: "1080px",
              height: "1350px",
              background: "linear-gradient(to bottom, rgba(20,10,5,0.65) 0%, rgba(20,10,5,0.1) 25%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(20,10,5,0.8) 100%)",
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
            },
            children: [
              // Logo
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: "0.95",
                  },
                  children: [
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "50px",
                          fontWeight: 700,
                          letterSpacing: "-1.5px",
                          color: "#FAF7F2",
                          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
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
                          color: "#FAF7F2",
                          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
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
                          color: "#FAF7F2",
                          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
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
                          fontSize: "24px",
                          fontWeight: 700,
                          color: "#FAF7F2",
                          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                        },
                        children: "Brewed for you .",
                      },
                    },
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "24px",
                          fontWeight: 700,
                          color: "#FAF7F2",
                          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
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

        // 4. FLOATING EDITORIAL BADGE PILL
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
                  children: "✦ ARTISAN COLD BREW ✦",
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
              gap: "24px",
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
                          fontSize: "26px",
                          fontWeight: 700,
                          lineHeight: "1.3",
                          color: "#FAF7F2",
                          textShadow: "0 2px 10px rgba(0,0,0,0.6)",
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
                          lineHeight: "1.3",
                          color: "#FAF7F2",
                          maxWidth: "460px",
                          textAlign: "right",
                          textShadow: "0 2px 10px rgba(0,0,0,0.6)",
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

              // Bottom Social Handle Bar + CTA
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
                          borderRadius: "8px",
                          fontSize: "20px",
                          fontWeight: 700,
                          color: "#FFFFFF",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        },
                        children: "Order Online ➔",
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

  const outputPath = path.resolve(process.cwd(), "scratch", "cloudflare-flux-canva-post.png");
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`\n🎉 CLOUDFLARE FLUX CANVA POST SAVED: ${outputPath}`);
}

composeCloudflareCanvaPost();
