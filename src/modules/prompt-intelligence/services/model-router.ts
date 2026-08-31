import {
  ModelCapability,
  ModelRecommendation,
  SupportedModelFamily,
} from "../domain/model-strategy";
import { Platform, PostType } from "../domain/prompt-intent";
import { DesignArchetype } from "@/lib/design-system/archetypes";
import { MODEL_REGISTRY } from "../knowledge/model-rules";

export interface ModelRoutingContext {
  platform: Platform;
  postType: PostType;
  archetype: DesignArchetype;
  hasInImageTextNeeded: boolean;
  visualStyle: string;
  hasReferenceImage: boolean;
}

export class ModelRouterService {
  /**
   * Recommends the optimal image generation model family and aspect ratio based on concept attributes.
   */
  static routeModel(context: ModelRoutingContext): ModelRecommendation {
    const { platform, postType, archetype, hasInImageTextNeeded, visualStyle, hasReferenceImage } = context;

    // 1. Determine recommended Aspect Ratio
    let aspectRatio = "4:5";
    if (platform === "instagram") {
      aspectRatio = "4:5"; // 1080x1350 vertical
    } else if (platform === "linkedin") {
      aspectRatio = archetype === "saas_dotgrid" ? "1:1" : "4:5";
    }

    // 2. Routing Decision Tree
    let selectedModel: SupportedModelFamily = "flux_1_schnell";
    let fallbackModel: SupportedModelFamily = "flux_1_dev";
    let confidence = 0.88;
    let reason = "Selected FLUX.1 [schnell] for rapid inference, superior photorealism, and high natural prompt adherence.";

    // Rule A: If in-image typography layout is explicitly requested
    if (hasInImageTextNeeded || archetype === "vintage_poster" || archetype === "comparison_split") {
      selectedModel = "ideogram_v2";
      fallbackModel = "midjourney_v6";
      confidence = 0.92;
      reason = "Selected Ideogram v2 for industry-leading in-image typography rendering and crisp layout box alignment.";
    }
    // Rule B: If artistic vintage or cinematic moody styling
    else if (visualStyle.toLowerCase().includes("vintage") || visualStyle.toLowerCase().includes("cinematic") || visualStyle.toLowerCase().includes("retro")) {
      selectedModel = "midjourney_v6";
      fallbackModel = "flux_1_dev";
      confidence = 0.90;
      reason = "Selected Midjourney v6.1 for cinematic color grading, atmospheric texture, and artistic cohesion.";
    }
    // Rule C: If luxury editorial or high-end commercial hero
    else if (archetype === "editorial_magazine" || visualStyle.toLowerCase().includes("luxury") || visualStyle.toLowerCase().includes("commercial")) {
      selectedModel = "flux_1_dev";
      fallbackModel = "flux_1_schnell";
      confidence = 0.94;
      reason = "Selected FLUX.1 [dev] for supreme micro-contrast, authentic skin/material textures, and precise lighting detail.";
    }
    // Rule D: Complex abstract thought leadership metaphor
    else if (postType === "thought_leadership" || postType === "educational_framework") {
      selectedModel = "dalle_3";
      fallbackModel = "flux_1_dev";
      confidence = 0.86;
      reason = "Selected DALL-E 3 for strong semantic comprehension of complex conceptual business metaphors.";
    }

    const modelCap: ModelCapability = MODEL_REGISTRY[selectedModel];

    return {
      recommendedModel: selectedModel,
      displayName: modelCap.displayName,
      provider: modelCap.provider,
      aspectRatio,
      confidence,
      selectionReason: reason,
      fallbackModel,
    };
  }
}
