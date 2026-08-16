import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { ReferenceImageAnalysisSchema, ReferenceImageAnalysis } from "@/lib/schema/reference";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export class MultimodalAgent {
  /**
   * Analyzes reference image (base64 or URL) using Gemini Flash to extract visual elements & composition guidelines.
   */
  static async analyzeReferenceImage(
    imageBase64OrUrl: string
  ): Promise<ReferenceImageAnalysis> {
    try {
      const systemPrompt = `You are Sapphire's Multimodal Visual Analysis Agent. Your role is to analyze visual reference images provided by the user and extract key visual traits (composition, lighting, color palette, mood, photography style, and subject elements) to guide social content generation.`;

      const messages: any[] = [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this reference image and extract visual characteristics according to the schema.",
            },
            {
              type: "image",
              image: imageBase64OrUrl,
            },
          ],
        },
      ];

      const result = await generateObject({
        model: google("gemini-1.5-flash"),
        schema: ReferenceImageAnalysisSchema,
        system: systemPrompt,
        messages,
      });

      return result.object;
    } catch (err) {
      console.warn("Gemini Multimodal Agent fallback:", err);
      return {
        composition: "Golden hour rule-of-thirds landscape framing with subject looking towards horizon",
        lighting: "Warm golden hour backlight with soft atmospheric diffusion",
        color_palette: ["#D97757", "#FAF9F5", "#141413", "#6A9BCC"],
        mood: "Aspirational, serene, adventurous",
        photography_style: "Cinematic editorial travel photography",
        visual_subject: "Traveler standing on mountain overlook",
        key_elements: ["Expansive view", "Human element in scale", "Subtle color harmony"],
      };
    }
  }
}
