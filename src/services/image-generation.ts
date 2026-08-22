export interface ImageGenResult {
  url: string;
  provider:
    | "Modal Serverless GPU (Qwen-Image)"
    | "Cloudflare Workers AI (Flux)"
    | "Cloudflare Workers AI (Leonardo Phoenix)"
    | "Pollinations AI (Flux)";
  model: string;
  durationMs: number;
  status: "success" | "fallback";
}

/**
 * Production-Grade Hybrid Image Generation Architecture:
 * 1. Primary: Modal Serverless GPU running Qwen-Image 3.0 (bilingual native typography at 1080×1350).
 * 2. Fallback 1: Cloudflare Workers AI Flux / Leonardo Phoenix.
 * 3. Fallback 2: Pollinations AI Flux for offline / zero-rate-limit reliability.
 */
export class ImageGenerationService {
  /**
   * Generates a 4:5 Instagram vertical post graphic with native typography.
   */
  static async generatePostImage(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000),
    negativePrompt?: string
  ): Promise<ImageGenResult> {
    const start = performance.now();

    // -------------------------------------------------------------
    // 1. PRIMARY: Modal Serverless GPU (Qwen-Image 3.0)
    // -------------------------------------------------------------
    const modalEndpoint = process.env.MODAL_QWEN_ENDPOINT_URL;
    const modalApiKey = process.env.MODAL_QWEN_API_KEY;

    if (modalEndpoint) {
      try {
        const modalImage = await this.generateWithModalQwen(
          modalEndpoint,
          modalApiKey,
          prompt,
          seed,
          negativePrompt
        );
        if (modalImage) {
          const durationMs = Math.round(performance.now() - start);
          return {
            url: modalImage,
            provider: "Modal Serverless GPU (Qwen-Image)",
            model: "Qwen/Qwen-Image-3.0",
            durationMs,
            status: "success",
          };
        }
      } catch (modalErr) {
        console.warn("Modal Qwen-Image primary attempt failed, falling back to Cloudflare:", modalErr);
      }
    }

    // -------------------------------------------------------------
    // 2. FALLBACK 1: Cloudflare Workers AI FLUX / Leonardo Phoenix
    // -------------------------------------------------------------
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (cfAccountId && cfApiToken) {
      try {
        const cfResult = await this.generateWithCloudflare(
          prompt,
          cfAccountId,
          cfApiToken,
          seed
        );
        if (cfResult) {
          const durationMs = Math.round(performance.now() - start);
          return {
            url: cfResult.url,
            provider: cfResult.provider,
            model: cfResult.model,
            durationMs,
            status: "fallback",
          };
        }
      } catch (cfErr) {
        console.warn("Cloudflare Workers AI fallback failed, falling back to Pollinations:", cfErr);
      }
    }

    // -------------------------------------------------------------
    // 3. FALLBACK 2: Pollinations AI Fast Direct Fallback
    // -------------------------------------------------------------
    try {
      const polBase64 = await this.fetchPollinationsBase64(prompt, seed);
      if (polBase64) {
        const durationMs = Math.round(performance.now() - start);
        return {
          url: polBase64,
          provider: "Pollinations AI (Flux)",
          model: "flux-dev",
          durationMs,
          status: "fallback",
        };
      }
    } catch {
      // ignore
    }

    const directUrl = this.buildPollinationsUrl(prompt, seed);
    const durationMs = Math.round(performance.now() - start);
    return {
      url: directUrl,
      provider: "Pollinations AI (Flux)",
      model: "flux-dev",
      durationMs,
      status: "fallback",
    };
  }

  /**
   * Backward-compatible alias for existing call sites.
   */
  static async generateImageUrlWithMeta(prompt: string, seed?: number): Promise<ImageGenResult> {
    return this.generatePostImage(prompt, seed);
  }

  /**
   * Generates image via Modal Serverless GPU running Qwen-Image.
   */
  private static async generateWithModalQwen(
    endpoint: string,
    apiKey: string | undefined,
    prompt: string,
    seed: number,
    negativePrompt?: string
  ): Promise<string | null> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt,
        negative_prompt: negativePrompt || "blurry text, low quality, distorted anatomy, noisy artifacts",
        width: 1080,
        height: 1350,
        steps: 25,
        guidance_scale: 7.5,
        seed,
      }),
      signal: AbortSignal.timeout(6000), // 6s fast timeout: returns instantly if warm, otherwise falls back immediately
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`Modal Qwen endpoint error ${res.status}:`, text);
      return null;
    }

    const data = await res.json();
    if (data.image) {
      return `data:image/png;base64,${data.image}`;
    }
    return null;
  }

  /**
   * Generates image using Cloudflare Workers AI (Flux 1 Schnell or Leonardo Phoenix).
   */
  private static async generateWithCloudflare(
    prompt: string,
    accountId: string,
    apiToken: string,
    seed: number
  ): Promise<{ url: string; provider: "Cloudflare Workers AI (Flux)" | "Cloudflare Workers AI (Leonardo Phoenix)"; model: string } | null> {
    // Primary CF model: Leonardo Phoenix or Flux 1 Schnell
    const cfModel = "@cf/black-forest-labs/flux-1-schnell";
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cfModel}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        width: 1080,
        height: 1350,
        seed,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      const base64 = data.result?.image || data.result?.images?.[0];
      if (base64) {
        return {
          url: `data:image/jpeg;base64,${base64}`,
          provider: "Cloudflare Workers AI (Flux)",
          model: cfModel,
        };
      }
    } else if (contentType.includes("image/")) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 500) {
        return {
          url: `data:${contentType};base64,${buf.toString("base64")}`,
          provider: "Cloudflare Workers AI (Flux)",
          model: cfModel,
        };
      }
    }

    return null;
  }

  /**
   * Performs server-side fetch from Pollinations Flux and converts to a base64 data URL.
   */
  private static async fetchPollinationsBase64(
    prompt: string,
    seed: number
  ): Promise<string | null> {
    const url = this.buildPollinationsUrl(prompt, seed);
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
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
    seed: number = Math.floor(Math.random() * 1000000)
  ): string {
    const apiKey = process.env.POLLINATIONS_API_KEY || "";

    const cleanPrompt = prompt
      .replace(/["'#]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 700);

    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const baseUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    const queryParams = new URLSearchParams({
      width: "1080",
      height: "1350",
      nologo: "true",
      seed: seed.toString(),
      model: "flux-dev",
    });

    if (apiKey) {
      queryParams.append("api_key", apiKey);
    }

    return `${baseUrl}?${queryParams.toString()}`;
  }
}
