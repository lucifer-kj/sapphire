import { InstagramPostType, LinkedInPostType, Platform } from "../domain/prompt-intent";

export interface PlatformVisualRule {
  platform: Platform;
  recommendedAspectRatios: string[];
  safeZoneMarginPercent: number;
  maxTextOverlayPercent: number;
  compositionDoctrine: string;
  visualHookPriority: string;
  antiPatternsToAvoid: string[];
}

export const PLATFORM_VISUAL_RULES: Record<Platform, PlatformVisualRule> = {
  instagram: {
    platform: "instagram",
    recommendedAspectRatios: ["4:5", "1:1"],
    safeZoneMarginPercent: 8,
    maxTextOverlayPercent: 15,
    compositionDoctrine: "Scroll-stop velocity (<1.2s recognition). Dominant central or lower-third focal point. High tactile texture, dynamic lighting, and clear negative space for badges.",
    visualHookPriority: "Aesthetic tension, vibrant contrast, human or product tactile hero shot.",
    antiPatternsToAvoid: [
      "Cluttered busy backgrounds with zero focal hierarchy",
      "Generic 3D plastic spheres or floaty isometric clichés",
      "Overly corporate sterile stock office photography",
      "Illegible typography placed over high-frequency background patterns",
    ],
  },
  linkedin: {
    platform: "linkedin",
    recommendedAspectRatios: ["4:5", "1:1"],
    safeZoneMarginPercent: 6,
    maxTextOverlayPercent: 25,
    compositionDoctrine: "Professional credibility and intellectual clarity. Editorial portraiture, architectural minimalism, conceptual diagrammatic metaphors, and crisp high-contrast value framing.",
    visualHookPriority: "Conceptual metaphor representing a business dilemma, breakthrough framework, or authentic founder/industry craft.",
    antiPatternsToAvoid: [
      "Artificial stock corporate handshakes and forced boardroom smiles",
      "Overly casual or noisy party/meme aesthetics",
      "Neon rainbow glowing tech gradients",
      "Tiny unreadable text labels that fail mobile LinkedIn feed scanning",
    ],
  },
};

export const POST_TYPE_GUIDANCE: Record<string, { visualGoal: string; recommendedArchetype: string; hookFormula: string }> = {
  // Instagram Post Types
  product_promotion: {
    visualGoal: "Macro texture, dramatic directional lighting, hero product isolation.",
    recommendedArchetype: "editorial_magazine",
    hookFormula: "Tangible luxury and immediate craft detail.",
  },
  lifestyle_editorial: {
    visualGoal: "Authentic atmosphere, natural golden-hour illumination, aspirational candid setting.",
    recommendedArchetype: "editorial_magazine",
    hookFormula: "Emotional resonance and transportive storytelling.",
  },
  educational_infographic: {
    visualGoal: "Clean dual-split layout with high-contrast badge callouts.",
    recommendedArchetype: "comparison_split",
    hookFormula: "Immediate problem vs solution clarity.",
  },
  brand_awareness: {
    visualGoal: "Bold iconic visual metaphor with strict brand color harmony.",
    recommendedArchetype: "conceptual_split",
    hookFormula: "Brand positioning crystallized into a single unignorable image.",
  },
  inspirational_quote: {
    visualGoal: "Minimalist mood canvas with expansive negative space for punchy typography.",
    recommendedArchetype: "editorial_magazine",
    hookFormula: "Contemplative, high-impact serenity.",
  },
  offer_promotion: {
    visualGoal: "Urgent contrast, sharp product focus with crisp editorial framing.",
    recommendedArchetype: "editorial_magazine",
    hookFormula: "Exclusive invitation to an elevated experience.",
  },
  story_led_visual: {
    visualGoal: "Cinematic depth of field, narrative environmental storytelling.",
    recommendedArchetype: "vintage_poster",
    hookFormula: "Intrigue that compels reading the first caption line.",
  },

  // LinkedIn Post Types
  thought_leadership: {
    visualGoal: "Sophisticated conceptual metaphor or black-and-white editorial portrait.",
    recommendedArchetype: "conceptual_split",
    hookFormula: "Counter-intuitive mental model visualised simply.",
  },
  educational_framework: {
    visualGoal: "Structured geometric card or clean comparison split.",
    recommendedArchetype: "comparison_split",
    hookFormula: "Actionable system or blueprint at a glance.",
  },
  data_insight: {
    visualGoal: "High-contrast dark-mode SaaS canvas with glowing metric callout points.",
    recommendedArchetype: "saas_dotgrid",
    hookFormula: "Shocking or clarifying benchmark statistic.",
  },
  industry_commentary: {
    visualGoal: "Dramatic editorial setting with architectural lines symbolizing industry shift.",
    recommendedArchetype: "editorial_magazine",
    hookFormula: "Macro trend transition captured in physical metaphor.",
  },
  case_study_highlight: {
    visualGoal: "Before vs After split demonstrating tangible turnaround.",
    recommendedArchetype: "comparison_split",
    hookFormula: "Measurable outcome backed by visual proof.",
  },
  company_culture: {
    visualGoal: "Behind-the-scenes authentic documentary photography with warm ambient light.",
    recommendedArchetype: "editorial_magazine",
    hookFormula: "Unfiltered craftsmanship and human dedication.",
  },
  product_announcement: {
    visualGoal: "Sleek SaaS dotgrid canvas or minimal spotlight product render.",
    recommendedArchetype: "saas_dotgrid",
    hookFormula: "Zero-latency innovation unveiled.",
  },
  personal_story: {
    visualGoal: "Intimate, high-resolution portrait in a thoughtful real-world workspace.",
    recommendedArchetype: "editorial_magazine",
    hookFormula: "Vulnerable vulnerability meets executive grit.",
  },
};
