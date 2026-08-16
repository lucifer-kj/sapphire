export interface ImageGenResult {
  url: string;
  provider: "Nano Banana 2" | "Pollinations AI";
  model: string;
  durationMs: number;
  status: "success" | "fallback";
}

/**
 * Multi-Layer Image Generation Service integrating Nano Banana 2 (Gemini 3.1 Flash Image)
 * with multimodal reference conditioning and Pollinations AI (Flux) as secondary/fallback.
 */
export class ImageGenerationService {
  /**
   * Generates an image URL and returns execution metadata.
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

    // 1. Try Nano Banana 2 (Gemini 3.1 Flash Image) if Google API key exists
    const googleKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (googleKey) {
      try {
        const nanoBananaUrl = await this.generateWithNanoBanana(
          fullPrompt,
          googleKey,
          referenceImageDataUrl
        );
        if (nanoBananaUrl) {
          const durationMs = Math.round(performance.now() - start);
          return {
            url: nanoBananaUrl,
            provider: "Nano Banana 2",
            model: "gemini-3.1-flash-image",
            durationMs,
            status: "success",
          };
        }
      } catch (err) {
        console.warn("Nano Banana 2 generation error, falling back to Pollinations:", err);
      }
    }

    // 2. Fallback to Pollinations AI Flux
    const url = this.generateWithPollinations(fullPrompt, seed, negativePrompt);
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
   * String-returning helper for quick compatibility.
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
   * Generates or edits an image using Google's Nano Banana 2 (gemini-3.1-flash-image) model,
   * supporting multimodal image conditioning when a reference image is attached.
   */
  private static async generateWithNanoBanana(
    prompt: string,
    apiKey: string,
    referenceImageDataUrl?: string | null
  ): Promise<string | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;

    const parts: any[] = [{ text: prompt }];

    // If reference image provided, pass as multimodal conditioning
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts,
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
   * Formats prompt with high photographic fidelity parameters up to 700 characters.
   */
  static generateWithPollinations(
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
