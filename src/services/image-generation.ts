/**
 * Image Generation Service integrating Pollinations AI with Flux model parameters.
 */
export class ImageGenerationService {
  /**
   * Generates a social media image URL (1080x1350 aspect ratio 4:5) based on a detailed prompt.
   */
  static generateImageUrl(
    prompt: string,
    seed: number = Math.floor(Math.random() * 1000000)
  ): string {
    const apiKey = process.env.POLLINATIONS_API_KEY || "";
    // Clean prompt to ensure valid URL encoding
    const cleanPrompt = prompt
      .replace(/[^\w\s,.-]/gi, "")
      .trim()
      .slice(0, 300);

    const encodedPrompt = encodeURIComponent(cleanPrompt);

    // High quality Flux model settings for 4:5 social posts
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
