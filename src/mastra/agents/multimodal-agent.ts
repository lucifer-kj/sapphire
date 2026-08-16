import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { ReferenceImageAnalysisSchema, ReferenceImageAnalysis } from "@/lib/schema/reference";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export class MultimodalAgent {
  /**
   * Analyzes an uploaded reference image URL/base64 string using Gemini 2.5 Flash to extract visual traits.
   */
  static async analyzeReferenceImage(
    imageDataUrl: string
  ): Promise<ReferenceImageAnalysis> {
    try {
      const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: ReferenceImageAnalysisSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this visual reference image for a brand marketing campaign. Extract its photography style, mood, color palette, lighting, composition, and visual subject.",
              },
              {
                type: "image",
                image: imageDataUrl,
              },
            ],
          },
        ],
      });

      return result.object;
    } catch (err) {
      console.warn("Gemini Multimodal Agent fallback:", err);
      return {
        photography_style: "Editorial Travel Photography",
        mood: "Aspirational & Warm",
        color_palette: ["#D97757", "#FAF9F5", "#141413"],
        lighting: "Warm Golden Hour",
        composition: "Centered Rule of Thirds",
        visual_subject: "Traveler in scenic landscape",
        key_elements: ["Golden hour light", "Natural landscapes", "Editorial depth"],
      };
    }
  }
}
