export interface ImageGenResult {
  url: string;
  provider: "Nano Banana 2" | "Pollinations AI (Flux)" | "Puter.js";
  model: string;
  durationMs: number;
  status: "success" | "fallback";
}

/**
 * Production-Grade Image Generation Service:
 * 1. Primary: Google Gemini Nano Banana (gemini-3.1-flash-image) with multi-key support.
 * 2. Instant Fast Fallback: Pollinations AI Flux (Server-Side Fetch → Base64 Data URL, ~3.3s).
 * 3. Tertiary: Puter.js driver fallback if configured.
 */
export class ImageGenerationService {
  /**
   * Generates a high-quality 4:5 social media image and returns execution metadata + base64 data URL.
   */
  static async generateImageUrlWithMeta(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000),
    styleOverride?: string,
    negativePrompt?: string,
    referenceImageDataUrl?: string | null
  ): Promise<ImageGenResult> {
    const start = performance.now();
    const fullPrompt = styleOverride ? `${styleOverride}, ${prompt}` : prompt;

    // 1. Try Google Gemini Nano Banana (if key has active quota/billing)
    const candidateKeys = [
      process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY,
      process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    ].filter(Boolean) as string[];

    for (const apiKey of candidateKeys) {
      for (const model of ["gemini-3.1-flash-image", "gemini-2.5-flash-image"]) {
        try {
          const nanoBananaUrl = await this.generateWithNanoBanana(
            fullPrompt,
            model,
            apiKey,
            referenceImageDataUrl
          );
          if (nanoBananaUrl) {
            const durationMs = Math.round(performance.now() - start);
            return {
              url: nanoBananaUrl,
              provider: "Nano Banana 2",
              model,
              durationMs,
              status: "success",
            };
          }
        } catch {
          // Fall through quietly to instant Pollinations Flux fallback
        }
      }
    }

    // 2. Primary Fast Fallback: Server-Side Pollinations AI Flux Fetch
    try {
      const pollinationsDataUrl = await this.fetchPollinationsBase64(
        fullPrompt,
        seed,
        negativePrompt
      );
      if (pollinationsDataUrl) {
        const durationMs = Math.round(performance.now() - start);
        return {
          url: pollinationsDataUrl,
          provider: "Pollinations AI (Flux)",
          model: "flux",
          durationMs,
          status: "fallback",
        };
      }
    } catch (err) {
      console.warn("Pollinations server-side fetch warning:", err);
    }

    // 3. Guaranteed Direct URL Fallback
    const directUrl = this.buildPollinationsUrl(fullPrompt, seed, negativePrompt);
    const durationMs = Math.round(performance.now() - start);
    return {
      url: directUrl,
      provider: "Pollinations AI (Flux)",
      model: "flux",
      durationMs,
      status: "fallback",
    };
  }

  /**
   * Helper returning image URL or data URL.
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
   * Generates image using Google's Nano Banana models (generateContent with IMAGE modality).
   */
  private static async generateWithNanoBanana(
    prompt: string,
    model: string,
    apiKey: string,
    referenceImageDataUrl?: string | null
  ): Promise<string | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: prompt }];

    if (referenceImageDataUrl && referenceImageDataUrl.startsWith("data:")) {
      const match = referenceImageDataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2],
          },
        });
      }
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    const partsList = data?.candidates?.[0]?.content?.parts || [];
    for (const part of partsList) {
      if (part.inlineData?.data && part.inlineData?.mimeType) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    return null;
  }

  /**
   * Performs server-side fetch from Pollinations Flux and converts to a base64 data URL.
   * Runs in ~3-4 seconds, eliminating CORS and client-side network timeouts.
   */
  private static async fetchPollinationsBase64(
    prompt: string,
    seed: number,
    negativePrompt?: string
  ): Promise<string | null> {
    const url = this.buildPollinationsUrl(prompt, seed, negativePrompt);
    const res = await fetch(url, {
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 500) {
      return null;
    }

    const mimeType = res.headers.get("content-type") || "image/jpeg";
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  }

  /**
   * Constructs an optimized Pollinations Flux URL for 4:5 Instagram vertical format.
   */
  static buildPollinationsUrl(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000),
    negativePrompt?: string
  ): string {
    const apiKey = process.env.POLLINATIONS_API_KEY || "";

    let cleanPrompt = prompt
      .replace(/["'#]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 700);

    if (negativePrompt) {
      cleanPrompt += ` (exclude: ${negativePrompt.slice(0, 100)})`;
    }

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
