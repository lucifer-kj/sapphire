import { generateObject } from "ai";
import { getLightModel, getGroqModel } from "@/lib/ai-model";
import {
  DesignSpecification,
  LayoutItemSchema,
  LayoutPlanGeneration,
  LayoutPlanGenerationSchema,
} from "@/lib/schema/layout-dsl";
import { ConceptItem } from "@/lib/schema/campaign";
import { BrandProfile } from "@/lib/schema/brand";
import { z } from "zod";

export class LayoutPlannerAgent {
  /**
   * Compiles a high-level ConceptItem into a deterministic Semantic Design Specification.
   */
  static async compileLayout(
    concept: ConceptItem,
    brand: BrandProfile,
    platform: "instagram" | "linkedin" = "instagram"
  ): Promise<DesignSpecification> {
    const brandColors = brand.visual_identity?.primary_colors || ["#09090b", "#FAF7F2"];
    const accentColor = brand.visual_identity?.secondary_colors?.[0] || "#D97757";

    const systemPrompt = `You are Sapphire's Layout Planner Agent.
Your task is to plan the layout elements and editorial photography prompt for "${brand.name}".

RULES:
1. EYEBROW: 1-3 words in ALL CAPS (e.g. "TRAVEL RITUAL", "MILAN FIELD GUIDE").
2. HOOK: 2-7 words punchy headline that stops the scroll.
3. SUBHEADLINE: 1 short sentence supporting the hook.
4. CTA: Actionable button text (e.g. "Explore Journeys →", "Read Guide").
5. VALUE CARDS: 2-3 structured takeaway cards with title and description.
6. PHOTO PROMPT (CRITICAL - REAL EDITORIAL PHOTOGRAPHY):
   - Authentic 35mm photography (Kodak Portra 400, Leica 50mm f/1.4, natural golden hour lighting, cinematic grain).
   - Real-world tangible scenes ONLY. NO surreal floating elements, NO AI glowing lines, NO abstract shapes.
   - Strictly specify: "Upper 40% is clean, softly out-of-focus negative space for text overlay. Subject is in the lower half."
   - NO text in the photo.`;

    const userPrompt = `Creative Direction: "${concept.creative_direction}"
Visual Style: "${concept.visual_style}"
Composition: "${concept.composition}"
Image Prompt: "${concept.image_prompt}"
Platform: ${platform}`;

    let plan: LayoutPlanGeneration;

    try {
      const model = getLightModel();
      const result = await generateObject({
        model,
        schema: LayoutPlanGenerationSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      plan = result.object;
    } catch (err) {
      console.warn("Layout Planner primary model failed, falling back to Groq:", err);
      const fallbackModel = getGroqModel("openai/gpt-oss-120b");
      const result = await generateObject({
        model: fallbackModel,
        schema: LayoutPlanGenerationSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      plan = result.object;
    }

    // Assemble deterministic layout tree
    type LayoutItem = z.infer<typeof LayoutItemSchema>;
    const layoutTree: LayoutItem[] = [
      {
        type: "pill_badge",
        role: "eyebrow",
        content: plan.eyebrow,
        label: "Category",
        title: plan.eyebrow,
        description: "Category eyebrow badge",
        indexNumber: "0",
      },
      {
        type: "text",
        role: "hook",
        content: plan.hook,
        label: "Headline",
        title: plan.hook,
        description: "Main scroll-stopping headline",
        indexNumber: "1",
      },
      {
        type: "text",
        role: "subheadline",
        content: plan.subheadline,
        label: "Subheadline",
        title: plan.subheadline,
        description: "Supporting context",
        indexNumber: "2",
      },
      ...plan.value_cards.map((card, i) => ({
        type: "value_card" as const,
        role: "body" as const,
        content: card.title,
        label: `Pillar 0${i + 1}`,
        title: card.title,
        description: card.description,
        indexNumber: `0${i + 1}`,
      })),
      {
        type: "cta",
        role: "cta",
        content: plan.cta,
        label: "CTA",
        title: plan.cta,
        description: "Call to action button",
        indexNumber: "9",
      },
      {
        type: "scrim_overlay",
        role: "none",
        content: "",
        label: "Contrast Scrim",
        title: "Scrim",
        description: "Directional gradient overlay",
        indexNumber: "10",
      },
    ];

    const headingFont = (brand.visual_identity?.fonts?.heading as any) || "Outfit";
    const bodyFont = (brand.visual_identity?.fonts?.body as any) || "Plus Jakarta Sans";

    return {
      id: `spec_${Date.now()}`,
      version: "2.0",
      platform,
      archetype: plan.archetype,
      canvas: {
        width: 1080,
        height: 1350,
        aspectRatio: "4:5",
        backgroundColor: "#09090b",
        safeZone: { top: 80, bottom: 80, left: 60, right: 60 },
      },
      brandTokens: {
        primaryColor: brandColors[1] || "#FAF7F2",
        surfaceColor: "#18181b",
        accentColor,
        mutedColor: "#A1A1AA",
        fontFamilyHeading: headingFont,
        fontFamilyBody: bodyFont,
        brandName: brand.name,
        socialHandle: `@${brand.name.toLowerCase().replace(/[^a-z0-9]/g, "")}`,
      },
      layoutTree,
      photoPrompt: plan.photoPrompt,
      negativePrompt: plan.negativePrompt || "surreal, floating objects, glowing lines, abstract digital art, text, watermark",
    };
  }
}
