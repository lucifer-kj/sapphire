export interface ImageGenResult {
  url: string;
  provider: "Nano Banana" | "Pollinations AI";
  model: string;
  durationMs: number;
  status: "success" | "fallback";
}

/**
 * Image Generation Service integrating Nano Banana (Gemini 2.5 Flash Image)
 * as primary with Pollinations AI (Flux) as secondary/fallback.
 */
export class ImageGenerationService {
  /**
   * Generates an image URL and returns execution metadata.
   */
  static async generateImageUrlWithMeta(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000),
    styleOverride?: string
  ): Promise<ImageGenResult> {
    const start = performance.now();
    const fullPrompt = styleOverride ? `${styleOverride}, ${prompt}` : prompt;

    // 1. Try Nano Banana (Gemini 2.5 Flash Image) if Google API key exists
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (googleKey) {
      try {
        const nanoBananaUrl = await this.generateWithNanoBanana(fullPrompt, googleKey);
        if (nanoBananaUrl) {
          const durationMs = Math.round(performance.now() - start);
          return {
            url: nanoBananaUrl,
            provider: "Nano Banana",
            model: "gemini-2.5-flash-image",
            durationMs,
            status: "success",
          };
        }
      } catch (err) {
        console.warn("Nano Banana generation error, falling back to Pollinations:", err);
      }
    }

    // 2. Fallback to Pollinations AI
    const url = this.generateWithPollinations(fullPrompt, seed);
    const durationMs = Math.round(performance.now() - start);
    return {
      url,
      provider: "Pollinations AI",
      model: "flux",
      durationMs,
      status: "fallback",
    };
  }

  /**
   * Legacy string-returning helper for quick compatibility.
   */
  static async generateImageUrl(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000),
    styleOverride?: string
  ): Promise<string> {
    const res = await this.generateImageUrlWithMeta(prompt, seed, styleOverride);
    return res.url;
  }

  /**
   * Generates an image using Google's Nano Banana (gemini-2.5-flash-image) model.
   */
  private static async generateWithNanoBanana(
    prompt: string,
    apiKey: string
  ): Promise<string | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE"],
        },
      }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const candidatePart = data?.candidates?.[0]?.content?.parts?.[0];
    const inlineData = candidatePart?.inlineData;

    if (inlineData?.data && inlineData?.mimeType) {
      return `data:${inlineData.mimeType};base64,${inlineData.data}`;
    }

    return null;
  }

  /**
   * Fallback generation with Pollinations AI (Flux model).
   */
  static generateWithPollinations(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000)
  ): string {
    const apiKey = process.env.POLLINATIONS_API_KEY || "";

    const cleanPrompt = prompt
      .replace(/["'#]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 450);

    const encodedPrompt = encodeURIComponent(cleanPrompt);

    const baseUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    const queryParams = new URLSearchParams({
      width: "1080",
      height: "1350",
      nologo: "true",
      seed: seed.toString(),
      model: "flux",
    });

    if (apiKey) {
      queryParams.append("api_key", apiKey);
    }

    return `${baseUrl}?${queryParams.toString()}`;
  }
}
