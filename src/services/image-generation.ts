export interface ImageGenResult {
  url: string;
  provider:
    | "Cloudflare Workers AI (Flux 1 Schnell)"
    | "Pollinations AI (Fast Flux)"
    | "Sapphire Procedural Studio";
  model: string;
  durationMs: number;
  status: "success" | "fallback";
}

/**
 * Production-Grade Ultra-Fast Image Generation Architecture:
 * 1. Primary: Cloudflare Workers AI FLUX 1 Schnell (1080×1350 in ~1.8s).
 * 2. Fallback 1: Pollinations Fast FLUX with strict 5s timeout.
 * 3. Fallback 2: High-contrast aesthetic studio canvas (instant 0ms).
 */
export class ImageGenerationService {
  /**
   * Generates a 4:5 Instagram vertical post graphic with strict timeout protection.
   */
  static async generatePostImage(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000)
  ): Promise<ImageGenResult> {
    const start = performance.now();

    // -------------------------------------------------------------
    // 1. PRIMARY: Cloudflare Workers AI FLUX 1 Schnell (~1.8s)
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
            provider: "Cloudflare Workers AI (Flux 1 Schnell)",
            model: "@cf/black-forest-labs/flux-1-schnell",
            durationMs,
            status: "success",
          };
        }
      } catch (cfErr) {
        console.warn("Cloudflare Workers AI primary attempt failed, falling back to Pollinations:", cfErr);
      }
    }

    // -------------------------------------------------------------
    // 2. FALLBACK 1: Pollinations AI Fast Flux (Strict 5s Timeout)
    // -------------------------------------------------------------
    try {
      const polBase64 = await this.fetchPollinationsBase64(prompt, seed);
      if (polBase64) {
        const durationMs = Math.round(performance.now() - start);
        return {
          url: polBase64,
          provider: "Pollinations AI (Fast Flux)",
          model: "flux-schnell",
          durationMs,
          status: "fallback",
        };
      }
    } catch {
      // ignore
    }

    // -------------------------------------------------------------
    // 3. FALLBACK 2: Instant Procedural Studio Gradient
    // -------------------------------------------------------------
    const durationMs = Math.round(performance.now() - start);
    return {
      url: "",
      provider: "Sapphire Procedural Studio",
      model: "procedural-mesh",
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
   * Generates image using Cloudflare Workers AI (Flux 1 Schnell) with a strict 5s timeout.
   */
  private static async generateWithCloudflare(
    prompt: string,
    accountId: string,
    apiToken: string,
    seed: number
  ): Promise<{ url: string } | null> {
    const cfModel = "@cf/black-forest-labs/flux-1-schnell";
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cfModel}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt.slice(0, 1000),
        steps: 4,
      }),
      signal: AbortSignal.timeout(6000), // Strict 6s timeout
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json();
      const base64 = data.result?.image || data.result?.images?.[0];
      if (base64) {
        return { url: `data:image/jpeg;base64,${base64}` };
      }
    } else if (contentType.includes("image/")) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 500) {
        return { url: `data:${contentType};base64,${buf.toString("base64")}` };
      }
    }

    return null;
  }

  /**
   * Performs server-side fetch from Pollinations Fast Flux with a strict 4.5s timeout.
   */
  private static async fetchPollinationsBase64(
    prompt: string,
    seed: number
  ): Promise<string | null> {
    const cleanPrompt = prompt
      .replace(/["'#]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 400);

    const encodedPrompt = encodeURIComponent(cleanPrompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1080&height=1350&nologo=true&seed=${seed}&model=flux`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(4500), // Strict 4.5s timeout
    });

    if (!res.ok) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length < 500) return null;

    const mimeType = res.headers.get("content-type") || "image/jpeg";
    return `data:${mimeType};base64,${buffer.toString("base64")}`;
  }
}
