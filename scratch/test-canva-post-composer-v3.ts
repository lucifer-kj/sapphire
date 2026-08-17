import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

async function generatePhotorealisticCoffee(): Promise<string> {
  const prompt = "Studio product shot of an iced latte in a clear takeaway plastic cup with ice cubes and black straw, floating roasted dark coffee beans around it, warm beige and mocha caramel background, dramatic advertising lighting, crisp condensation droplets, commercial food photography, 8k";
  console.log("Generating photorealistic coffee shot via Pollinations Flux...");
  const start = Date.now();
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1080&height=1350&model=flux&nologo=true&seed=888`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  const buf = Buffer.from(await res.arrayBuffer());
  console.log(`✅ Background ready in ${Date.now() - start}ms (${buf.length} bytes)`);
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

async function composeCanvaPostV3() {
  const fontBold = fs.readFileSync(path.resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Bold.ttf"));
  const fontRegular = fs.readFileSync(path.resolve(process.cwd(), "src/assets/fonts/PlusJakartaSans-Regular.ttf"));

  const bgDataUrl = await generatePhotorealisticCoffee();

  console.log("Compositing V3 with Satori...");

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
        color: "#2C1810",
        fontFamily: "Plus Jakarta Sans",
        position: "relative",
        overflow: "hidden",
      },
      children: [
        // 1. AI Photo Backdrop
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

        // 2. High-End Editorial Scrim (Subtle Dark Gradients at Header and Footer for Perfect Text Readability)
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              top: "0px",
              left: "0px",
              width: "1080px",
              height: "1350px",
              background: "linear-gradient(to bottom, rgba(20,10,5,0.6) 0%, rgba(20,10,5,0.15) 25%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 65%, rgba(20,10,5,0.75) 100%)",
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
              // Brand Logo
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    flexDirection: "column",
                    lineHeight: "0.98",
                  },
                  children: [
                    {
                      type: "span",
                      props: {
                        style: {
                          fontSize: "48px",
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
                          fontSize: "48px",
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
                          fontSize: "48px",
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

        // 4. CENTER FLOATING PILL
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
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.45)",
                    borderRadius: "9999px",
                    padding: "10px 28px",
                    color: "#FFFFFF",
                    fontSize: "20px",
                    fontWeight: 700,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                  },
                  children: "ICED COFFEE SPECIAL",
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

              // Bottom Social Handle + CTA Button
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

  const outputPath = path.resolve(process.cwd(), "scratch", "dynamic-canva-post-v3.png");
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`\n🎉 V3 POST SAVED: ${outputPath}`);
}

composeCanvaPostV3();
