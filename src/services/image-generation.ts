import { DesignBlueprint } from "@/lib/design-system/archetypes";
import { ImageCompositor } from "./image-compositor";

export interface ImageGenResult {
  url: string;
  provider:
    | "Cloudflare Workers AI (Flux)"
    | "Nano Banana 2"
    | "Pollinations AI (Flux)"
    | "Puter.js";
  model: string;
  durationMs: number;
  status: "success" | "fallback";
}

/**
 * Production-Grade Hybrid Image Generation & Canva Compositing Service:
 * 1. Primary AI Photography: Cloudflare Workers AI FLUX 1 Schnell (~2.2s, 10,000 free Neurons/day).
 * 2. Instant Fast Fallback: Pollinations AI Flux (Server-Side Fetch → Base64 Data URL, ~3.3s).
 * 3. Tertiary: Google Gemini Nano Banana (gemini-3.1-flash-image).
 * 4. Design Layer: Satori + Resvg JSX-to-PNG Vector Compositor (~150ms).
 */
export class ImageGenerationService {
  /**
   * Generates a high-quality 4:5 social media post with AI photography and Satori vector typography.
   */
  static async generateImageUrlWithMeta(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000),
    styleOverride?: string,
    negativePrompt?: string,
    referenceImageDataUrl?: string | null,
    designBlueprint?: DesignBlueprint
  ): Promise<ImageGenResult> {
    const start = performance.now();
    const fullPrompt = styleOverride ? `${styleOverride}, ${prompt}` : prompt;

    let rawPhotoUrl: string | null = null;
    let provider: ImageGenResult["provider"] = "Cloudflare Workers AI (Flux)";
    let model = "@cf/black-forest-labs/flux-1-schnell";
    let status: "success" | "fallback" = "success";

    // 1. Primary: Cloudflare Workers AI FLUX 1 Schnell
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (accountId && apiToken) {
      try {
        rawPhotoUrl = await this.generateWithCloudflareFlux(
          fullPrompt,
          accountId,
          apiToken
        );
        if (rawPhotoUrl) {
          provider = "Cloudflare Workers AI (Flux)";
          model = "@cf/black-forest-labs/flux-1-schnell";
          status = "success";
        }
      } catch (cfErr) {
        console.warn("Cloudflare FLUX generation fallback:", cfErr);
      }
    }

    // 2. Fallback: Server-Side Pollinations AI Flux Fetch
    if (!rawPhotoUrl) {
      try {
        rawPhotoUrl = await this.fetchPollinationsBase64(
          fullPrompt,
          seed,
          negativePrompt
        );
        if (rawPhotoUrl) {
          provider = "Pollinations AI (Flux)";
          model = "flux";
          status = "fallback";
        }
      } catch (polErr) {
        console.warn("Pollinations fallback:", polErr);
      }
    }

    // 3. Fallback: Google Gemini Nano Banana
    if (!rawPhotoUrl) {
      const candidateKeys = [
        process.env.SECONDARY_GOOGLE_GENERATIVE_AI_API_KEY,
        process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      ].filter(Boolean) as string[];

      for (const apiKey of candidateKeys) {
        for (const m of ["gemini-3.1-flash-image", "gemini-2.5-flash-image"]) {
          try {
            rawPhotoUrl = await this.generateWithNanoBanana(
              fullPrompt,
              m,
              apiKey,
              referenceImageDataUrl
            );
            if (rawPhotoUrl) {
              provider = "Nano Banana 2";
              model = m;
              status = "fallback";
              break;
            }
          } catch {}
        }
        if (rawPhotoUrl) break;
      }
    }

    // 4. Guaranteed Direct URL Fallback
    if (!rawPhotoUrl) {
      rawPhotoUrl = this.buildPollinationsUrl(fullPrompt, seed, negativePrompt);
      provider = "Pollinations AI (Flux)";
      model = "flux";
      status = "fallback";
    }

    // 5. Apply Satori Canva-Grade Design Compositor if blueprint is provided
    let finalUrl = rawPhotoUrl;
    if (designBlueprint && rawPhotoUrl.startsWith("data:")) {
      try {
        finalUrl = await ImageCompositor.composite(rawPhotoUrl, designBlueprint);
      } catch (compErr) {
        console.warn("ImageCompositor fallback:", compErr);
        finalUrl = rawPhotoUrl;
      }
    }

    const durationMs = Math.round(performance.now() - start);
    return {
      url: finalUrl,
      provider,
      model,
      durationMs,
      status,
    };
  }

  /**
   * Helper returning image URL or data URL.
   */
  static async generateImageUrl(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000),
    styleOverride?: string,
    designBlueprint?: DesignBlueprint
  ): Promise<string> {
    const res = await this.generateImageUrlWithMeta(
      prompt,
      seed,
      styleOverride,
      undefined,
      undefined,
      designBlueprint
    );
    return res.url;
  }

  /**
   * Generates photorealistic image using Cloudflare Workers AI FLUX 1 Schnell.
   */
  private static async generateWithCloudflareFlux(
    prompt: string,
    accountId: string,
    apiToken: string
  ): Promise<string | null> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return null;
    }

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      const base64 = data.result?.image;
      if (base64) {
        return `data:image/jpeg;base64,${base64}`;
      }
    } else if (contentType.includes("image/")) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 500) {
        return `data:${contentType};base64,${buf.toString("base64")}`;
      }
    }

    return null;
  }

  /**
   * Generates image using Google's Nano Banana models.
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

    if (!res.ok) return null;

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

    if (!res.ok) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 500) return null;

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
