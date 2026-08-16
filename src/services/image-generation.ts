/**
 * Image Generation Service integrating Pollinations AI.
 */
export class ImageGenerationService {
  /**
   * Generates a social media image URL (1080x1350 aspect ratio 4:5) based on a detailed prompt and optional reference style.
   */
  static generateImageUrl(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000),
    styleOverride?: string
  ): string {
    const apiKey = process.env.POLLINATIONS_API_KEY || "";

    // Build optimized prompt putting key style descriptors first
    let fullPrompt = prompt;
    if (styleOverride) {
      fullPrompt = `${styleOverride}, ${prompt}`;
    }

    // Clean prompt to ensure valid URL encoding while preserving key descriptive words
    const cleanPrompt = fullPrompt
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
