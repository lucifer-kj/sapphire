import { z } from "zod";

export const DesignArchetypeEnum = z.enum([
  // Core Archetypes
  "editorial_magazine",
  "conceptual_split",
  "comparison_split",
  "vintage_poster",
  "saas_dotgrid",
  "scrapbook_maximalist",
  "bold_funky",
  // Extended Categorized Styles
  "bento_grid",
  "minimalism",
  "dark_mode_ui",
  "glassmorphism",
  "maximalism",
  "cyberpunk",
  "y2k_aesthetic",
  "scrapbook",
  "mixed_media",
  "luxury_typography",
  "polaroid_pov_overlay",
  "feature_badges_editorial",
  "minimal_shader_text",
]);

export type DesignArchetype = z.infer<typeof DesignArchetypeEnum>;
export const DesignArchetypeSchema = DesignArchetypeEnum;

export const ColorRoleSchema = z.object({
  hex: z.string(),
  role: z.enum(["background", "content", "accent"]),
  source: z.enum([
    "brand_primary",
    "brand_secondary",
    "derived_complementary",
    "derived_split_complementary",
  ]),
});

export type ColorRole = z.infer<typeof ColorRoleSchema>;

export const TypographySystemSchema = z.object({
  pairing_type: z.enum(["contrast_pairing", "mono_scale"]),
  headline_font: z.string(),
  body_font: z.string(),
  headline_to_body_ratio: z.number().default(3),
});

export type TypographySystem = z.infer<typeof TypographySystemSchema>;

export const FeatureBadgeSchema = z.object({
  label: z.string(),
  icon: z.enum(["flight", "hotel", "experience", "star", "shield", "sparkle", "pin", "tag", "code", "cpu", "globe", "zap"]).default("flight"),
});

export type FeatureBadge = z.infer<typeof FeatureBadgeSchema>;

export const DesignBlueprintSchema = z.object({
  archetype: DesignArchetypeEnum,
  color_system: z
    .object({
      proportion_rule: z.enum(["60_30_10", "40_40_20", "color_blocked_50_50"]).default("60_30_10"),
      colors: z.array(ColorRoleSchema),
    })
    .default({
      proportion_rule: "60_30_10",
      colors: [
        { hex: "#09090b", role: "background", source: "brand_primary" },
        { hex: "#FAF7F2", role: "content", source: "brand_primary" },
        { hex: "#D97757", role: "accent", source: "brand_secondary" },
      ],
    }),
  typography: TypographySystemSchema.default({
    pairing_type: "contrast_pairing",
    headline_font: "Playfair Display",
    body_font: "Plus Jakarta Sans",
    headline_to_body_ratio: 3.2,
  }),
  composition: z
    .object({
      grid_logic: z.string().default("rule_of_thirds"),
      negative_space_pct: z.number().default(40),
      layer_count: z.number().optional(),
      micro_rotation_deg: z.number().optional(),
    })
    .default({
      grid_logic: "rule_of_thirds",
      negative_space_pct: 40,
    }),
  virality: z
    .object({
      pattern_interrupt: z.string().default("High-contrast focal hook breaking visual expectation"),
      focal_point: z.string().default("Hero subject"),
      curiosity_gap_headline: z.boolean().default(true),
    })
    .default({
      pattern_interrupt: "High-contrast focal hook breaking visual expectation",
      focal_point: "Hero subject",
      curiosity_gap_headline: true,
    }),
  brand_guardrail_check: z
    .object({
      brand_color_present: z.boolean().default(true),
      tone_ceiling_applied: z.enum(["playful_bold", "premium_restrained", "professional_corporate"]).default("premium_restrained"),
      archetype_allowed_reason: z.string().default("Matches brand positioning and tone ceiling"),
    })
    .default({
      brand_color_present: true,
      tone_ceiling_applied: "premium_restrained",
      archetype_allowed_reason: "Matches brand positioning and tone ceiling",
    }),
  headline: z.string(),
  subheadline: z.string().optional().default(""),
  category_pill: z.string().optional(),
  brand_tagline: z.string().optional(),
  value_props: z.array(z.string()).default(["Curated Experience", "Authentic Discovery", "Seamless Access"]),
  feature_badges: z.array(FeatureBadgeSchema).optional(),
  logo_badge: z
    .object({
      prefix: z.string().optional().default(""),
      highlight: z.string().optional().default(""),
      suffix: z.string().optional().default(""),
    })
    .optional(),
  cta_text: z.string().default("Learn More ➔"),
  social_handle: z.string().default("@sapphire"),
  brand_name: z.string().default("Sapphire"),
  font_family_hook: z
    .enum(["Plus Jakarta Sans", "Inter", "Playfair Display", "Outfit"])
    .optional(),
  font_family_body: z
    .enum(["Plus Jakarta Sans", "Inter", "Outfit"])
    .optional(),
  highlighted_keywords: z.array(z.string()).default([]),
  font_scale: z.enum(["compact", "regular", "large"]).optional(),
  scrim_intensity: z.enum(["subtle", "medium", "heavy"]).optional(),
  shader_style: z.enum(["sky_vignette", "dark_gradient", "subtle_blur", "clean_plain", "neon_glow", "cyber_grid", "frosted_glass", "paper_texture"]).optional(),
  color_tokens: z
    .object({
      primary_text: z.string().default("#FAF7F2"),
      accent: z.string().default("#D97757"),
      canvas_background: z.string().default("#141413"),
      scrim_color: z.string().default("rgba(20,10,5,0.65)"),
    })
    .optional(),
  decorative_elements: z
    .array(
      z.object({
        type: z.enum(["pill_badge", "stamp_badge", "arrow_pill", "starburst", "dots", "tape", "hud_chip"]),
        text: z.string().optional(),
        position: z.string().optional(),
      })
    )
    .optional(),
  negative_space_directive: z.string(),
  founder_summary: z.string().default("Editorial design aligning with brand visual DNA"),
});

export type DesignBlueprint = z.infer<typeof DesignBlueprintSchema>;

export const DESIGN_KNOWLEDGE_GRAPH = {
  typography_pairings: {
    // 1. Bento Grid
    bento_grid: {
      hookFont: "Plus Jakarta Sans" as const,
      bodyFont: "Inter" as const,
      style: "Modular Bento Grid + Structured Feature Cards",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-1px",
      lineHeight: 1.15,
    },
    // 2. Minimalism
    minimalism: {
      hookFont: "Plus Jakarta Sans" as const,
      bodyFont: "Inter" as const,
      style: "Authoritative Negative Space + High-Impact Display",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-2px",
      lineHeight: 1.1,
    },
    // 3. Dark Mode UI
    dark_mode_ui: {
      hookFont: "Inter" as const,
      bodyFont: "Inter" as const,
      style: "Sleek Dark Canvas + Monospace IDE Chrome & Code Accents",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-0.5px",
      lineHeight: 1.2,
    },
    // 4. Glassmorphism
    glassmorphism: {
      hookFont: "Outfit" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "Frosted Glass Translucent Panels + Diffused Luminous Depth",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-0.5px",
      lineHeight: 1.15,
    },
    // 5. Maximalism
    maximalism: {
      hookFont: "Outfit" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "Dense High-Impact Stacked Typography + Saturated Contrast Stamps",
      hookWeight: 800,
      bodyWeight: 600,
      tracking: "-1px",
      lineHeight: 1.05,
    },
    // 6. Cyberpunk
    cyberpunk: {
      hookFont: "Inter" as const,
      bodyFont: "Inter" as const,
      style: "Futuristic HUD Coordinate Chips + Vivid Electric Neon Glows",
      hookWeight: 800,
      bodyWeight: 500,
      tracking: "1px",
      lineHeight: 1.15,
    },
    // 7. Y2K Aesthetic
    y2k_aesthetic: {
      hookFont: "Outfit" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "Nostalgic Cyber Y2K + Chrome Metallic Badges & Starburst Stamps",
      hookWeight: 800,
      bodyWeight: 500,
      tracking: "0.5px",
      lineHeight: 1.1,
    },
    // 8. Scrapbook
    scrapbook: {
      hookFont: "Playfair Display" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "Tactile Collage + Washi Tape Accents & Tilted Polaroid Card Framing",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-0.5px",
      lineHeight: 1.18,
    },
    // 9. Mixed Media
    mixed_media: {
      hookFont: "Outfit" as const,
      bodyFont: "Inter" as const,
      style: "Artistic Photographic Cutout + Geometric Vector Graphic Blocks",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-1px",
      lineHeight: 1.15,
    },
    // 10. Luxury Typography
    luxury_typography: {
      hookFont: "Playfair Display" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "High-Contrast Luxury Editorial Serif + Refined Hairline Dividers",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-1.5px",
      lineHeight: 1.12,
    },
    // Aliases
    editorial_magazine: {
      hookFont: "Playfair Display" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "High-contrast Luxury Editorial Serif + Clean Sans",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-1.5px",
      lineHeight: 1.12,
    },
    conceptual_split: {
      hookFont: "Plus Jakarta Sans" as const,
      bodyFont: "Inter" as const,
      style: "Modern Grotesk Sans + Two-Tone Keyword Highlight",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-2px",
      lineHeight: 1.15,
    },
    comparison_split: {
      hookFont: "Inter" as const,
      bodyFont: "Inter" as const,
      style: "High-Readability Dual Column Sans",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-1px",
      lineHeight: 1.2,
    },
    vintage_poster: {
      hookFont: "Outfit" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "Warm Organic Display + Balanced Sans",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "2px",
      lineHeight: 1.1,
    },
    saas_dotgrid: {
      hookFont: "Plus Jakarta Sans" as const,
      bodyFont: "Inter" as const,
      style: "Sharp B2B Tech Grotesk + Micro-Chrome",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-1.5px",
      lineHeight: 1.15,
    },
    polaroid_pov_overlay: {
      hookFont: "Plus Jakarta Sans" as const,
      bodyFont: "Inter" as const,
      style: "First-Person Handheld Framing + High-Impact All-Caps & Badges",
      hookWeight: 700,
      bodyWeight: 600,
      tracking: "-0.5px",
      lineHeight: 1.15,
    },
    feature_badges_editorial: {
      hookFont: "Plus Jakarta Sans" as const,
      bodyFont: "Inter" as const,
      style: "Top Brand Logo + Bold Headline + 3 Icon Feature Badges",
      hookWeight: 700,
      bodyWeight: 600,
      tracking: "-0.5px",
      lineHeight: 1.15,
    },
    minimal_shader_text: {
      hookFont: "Plus Jakarta Sans" as const,
      bodyFont: "Inter" as const,
      style: "Radial Contrast Shaded Typography Canvas",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-1px",
      lineHeight: 1.2,
    },
    scrapbook_maximalist: {
      hookFont: "Playfair Display" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "Deliberate Collage Layering + Washi Tape Accents & Micro-Rotations",
      hookWeight: 700,
      bodyWeight: 400,
      tracking: "-0.5px",
      lineHeight: 1.18,
    },
    bold_funky: {
      hookFont: "Outfit" as const,
      bodyFont: "Plus Jakarta Sans" as const,
      style: "Single Oversized Focal Element + High-Contrast Color Block Background",
      hookWeight: 800,
      bodyWeight: 600,
      tracking: "-1px",
      lineHeight: 1.05,
    },
  },
  spatial_budgeting: {
    bento_grid: {
      voidRegion: "Lower 60% grid region (y: 40% to 100%)",
      subjectPlacement: "Upper 40% atmospheric backdrop (y: 0% to 40%)",
      cameraDirective: "Modular background with clean neutral geometric depth, no clutter behind compartments, 35mm f/8 sharp focus",
    },
    minimalism: {
      voidRegion: "Upper 70% negative space void (y: 0% to 70%)",
      subjectPlacement: "Lower-right or lower-center third (y: 60% to 100%)",
      cameraDirective: "Extreme negative space void in upper 65%, single subject anchored in lower third, clean ambient lighting, 50mm f/4 sharp focus",
    },
    dark_mode_ui: {
      voidRegion: "Lower 70% UI window region",
      subjectPlacement: "Background abstract or subtle dark tech gradient",
      cameraDirective: "High-tech dark studio background with subtle edge lighting and clean dark gradients, 35mm f/8",
    },
    glassmorphism: {
      voidRegion: "Centered 80% canvas with floating frosted cards",
      subjectPlacement: "Rich vibrant atmospheric backdrop",
      cameraDirective: "Rich color gradients and vibrant ambient lighting that shines through frosted glass layers, 50mm f/4",
    },
    maximalism: {
      voidRegion: "Full-bleed dynamic composition",
      subjectPlacement: "Centrally packed high-energy subject and patterns",
      cameraDirective: "Richly detailed scene, intense natural textures, high contrast, vibrant saturated color grading, 35mm f/8 tack-sharp",
    },
    cyberpunk: {
      voidRegion: "Upper-left quadrant for HUD telemetry overlays",
      subjectPlacement: "Lower-center futuristic subject",
      cameraDirective: "Cinematic nighttime street with vivid neon reflections, cyan and orange edge light, sharp digital focus, 35mm f/4",
    },
    y2k_aesthetic: {
      voidRegion: "Upper 40% for chrome badges and starbursts",
      subjectPlacement: "Centered retro-styled subject",
      cameraDirective: "Direct flash studio photography, glossy chrome reflections, vibrant nostalgic color temperature, 50mm f/4",
    },
    scrapbook: {
      voidRegion: "Centered tilted photo card framing",
      subjectPlacement: "Hero candid scene inside paper frame",
      cameraDirective: "First-person POV or candid moment on a rustic wooden/canvas surface, natural sunlight, 35mm f/4 sharp",
    },
    mixed_media: {
      voidRegion: "Asymmetric split for vector blocks and collage",
      subjectPlacement: "Isolated hero subject with clean edge contrast",
      cameraDirective: "Sharp isolated hero subject against authentic natural setting with room for vector sticker overlays, 50mm f/4",
    },
    luxury_typography: {
      voidRegion: "Upper 45% (y: 0% to 45%)",
      subjectPlacement: "Lower-center third (y: 50% to 100%)",
      cameraDirective: "Warm golden-hour ambient side-lighting, 50mm f/4 tack-sharp focus, deep natural tonal transitions, clean sky void in upper 45%",
    },
    // Aliases
    editorial_magazine: {
      voidRegion: "Upper 40% (y: 0% to 40%)",
      subjectPlacement: "Lower-center third (y: 50% to 100%)",
      cameraDirective: "Shot on 50mm f/4 lens, tack-sharp focus on subject and props, warm ambient side-lighting, clean void in upper 40% for headline overlay",
    },
    conceptual_split: {
      voidRegion: "Right 50% (x: 50% to 100%)",
      subjectPlacement: "Left 50% (x: 0% to 50%)",
      cameraDirective: "High-key studio shot, subject isolated on left 45%, clean seamless off-white cyclorama backdrop on right 55%, 50mm f/4",
    },
    comparison_split: {
      voidRegion: "Top 25% and bottom 20% safe zones",
      subjectPlacement: "Dual contrasting subjects split across vertical center line",
      cameraDirective: "Commercial studio composition, 50/50 vertical division with neutral seamless background, 35mm f/8",
    },
    vintage_poster: {
      voidRegion: "150px outer margin borders on all 4 sides",
      subjectPlacement: "Centered hero product/subject",
      cameraDirective: "Top-down clean studio flat-lay or 45-degree angle on warm cream background with generous clean margins, 50mm f/4",
    },
    saas_dotgrid: {
      voidRegion: "Top-left quadrant (x: 0% to 65%, y: 0% to 50%)",
      subjectPlacement: "Bottom-right quadrant (x: 45% to 100%, y: 40% to 100%)",
      cameraDirective: "Isometric 3D product showcase angled in lower-right, clean deep slate-navy void in upper-left, 35mm f/8",
    },
    polaroid_pov_overlay: {
      voidRegion: "Upper 45% open sky/ambient area (y: 0% to 45%)",
      subjectPlacement: "Lower 55% first-person POV hand holding Polaroid frame (y: 45% to 100%)",
      cameraDirective: "First-person POV hand holding a crisp white Polaroid instant photograph in sharp focus in lower foreground, framed against matching scenic landscape, with upper 45% having wide clear blue sky void with zero clutter for headline and badges",
    },
    feature_badges_editorial: {
      voidRegion: "Upper 45% open sky/ambient area (y: 0% to 45%)",
      subjectPlacement: "Lower 55% scenic landscape or hero view",
      cameraDirective: "Scenic landscape photography with expansive clear sky in upper 45% for logo, bold headline, and 3 icon feature badges",
    },
    minimal_shader_text: {
      voidRegion: "Centered 80% canvas with radial dark vignette",
      subjectPlacement: "Background abstract or subtle texture",
      cameraDirective: "Atmospheric shaded background with subtle micro-textures and dark gradient scrim, 50mm f/4",
    },
    scrapbook_maximalist: {
      voidRegion: "Deliberate collage layering with 3-5 overlapping elements",
      subjectPlacement: "Hero photo framed inside tilted card with washi tape accents",
      cameraDirective: "Layered tactile collage with 3-5 elements at 2-6° micro-rotations, natural lighting, 35mm f/4 sharp focus",
    },
    bold_funky: {
      voidRegion: "High-contrast color blocked background with minimal supporting elements",
      subjectPlacement: "Single oversized focal element cropped tight and large",
      cameraDirective: "Oversized hero subject cropped tight, bold high-contrast background color block, 50mm f/4 tack-sharp",
    },
  },
  color_science: {
    distribution: "60% background photo / 30% neutral typography canvas / 10% high-chroma brand accent",
    scrim_multi_stop: {
      subtle:
        "linear-gradient(to bottom, rgba(20,20,19,0.55) 0%, rgba(20,20,19,0.2) 30%, rgba(0,0,0,0) 55%, rgba(20,20,19,0.7) 100%)",
      medium:
        "linear-gradient(to bottom, rgba(20,10,5,0.75) 0%, rgba(20,10,5,0.3) 30%, rgba(0,0,0,0) 50%, rgba(20,10,5,0.4) 75%, rgba(20,10,5,0.9) 100%)",
      heavy:
        "linear-gradient(to bottom, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.55) 35%, rgba(0,0,0,0.1) 60%, rgba(15,23,42,0.95) 100%)",
    },
  },
} as const;

export const DEFAULT_ARCHETYPE_CONFIGS: Record<
  DesignArchetype,
  {
    name: string;
    negativeSpaceDirective: string;
    suggestedFont: "Plus Jakarta Sans" | "Inter" | "Playfair Display" | "Outfit";
    suggestedBodyFont: "Plus Jakarta Sans" | "Inter" | "Outfit";
    scrimGradient: string;
  }
> = {
  bento_grid: {
    name: "Bento Grid Showcase",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.bento_grid.cameraDirective,
    suggestedFont: "Plus Jakarta Sans",
    suggestedBodyFont: "Inter",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.heavy,
  },
  minimalism: {
    name: "Authoritative Minimalism",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.minimalism.cameraDirective,
    suggestedFont: "Plus Jakarta Sans",
    suggestedBodyFont: "Inter",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.subtle,
  },
  dark_mode_ui: {
    name: "Dark Mode UI Chrome",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.dark_mode_ui.cameraDirective,
    suggestedFont: "Inter",
    suggestedBodyFont: "Inter",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.heavy,
  },
  glassmorphism: {
    name: "Frosted Glassmorphism",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.glassmorphism.cameraDirective,
    suggestedFont: "Outfit",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.medium,
  },
  maximalism: {
    name: "High-Density Maximalism",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.maximalism.cameraDirective,
    suggestedFont: "Outfit",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.subtle,
  },
  cyberpunk: {
    name: "Cyberpunk HUD Glow",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.cyberpunk.cameraDirective,
    suggestedFont: "Inter",
    suggestedBodyFont: "Inter",
    scrimGradient: "linear-gradient(180deg, rgba(5,10,25,0.85) 0%, rgba(5,10,25,0.4) 40%, rgba(5,10,25,0.92) 100%)",
  },
  y2k_aesthetic: {
    name: "Nostalgic Y2K Chrome",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.y2k_aesthetic.cameraDirective,
    suggestedFont: "Outfit",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient: "linear-gradient(180deg, rgba(20,10,30,0.7) 0%, rgba(20,10,30,0.2) 35%, rgba(20,10,30,0.85) 100%)",
  },
  scrapbook: {
    name: "Tactile Scrapbook Collage",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.scrapbook.cameraDirective,
    suggestedFont: "Playfair Display",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient: "linear-gradient(180deg, rgba(25,20,15,0.6) 0%, rgba(25,20,15,0.2) 35%, rgba(25,20,15,0.85) 100%)",
  },
  mixed_media: {
    name: "Mixed Media Art Direction",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.mixed_media.cameraDirective,
    suggestedFont: "Outfit",
    suggestedBodyFont: "Inter",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.medium,
  },
  luxury_typography: {
    name: "Luxury Editorial Serif",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.luxury_typography.cameraDirective,
    suggestedFont: "Playfair Display",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.medium,
  },
  // Aliases
  editorial_magazine: {
    name: "Editorial Magazine Cover",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.editorial_magazine.cameraDirective,
    suggestedFont: "Playfair Display",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.medium,
  },
  conceptual_split: {
    name: "Conceptual Asymmetric Split",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.conceptual_split.cameraDirective,
    suggestedFont: "Plus Jakarta Sans",
    suggestedBodyFont: "Inter",
    scrimGradient: "linear-gradient(to right, rgba(20,20,19,0.15) 0%, rgba(20,20,19,0.75) 45%, rgba(20,20,19,0.96) 100%)",
  },
  comparison_split: {
    name: "Side-by-Side Comparison",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.comparison_split.cameraDirective,
    suggestedFont: "Inter",
    suggestedBodyFont: "Inter",
    scrimGradient: "linear-gradient(to bottom, rgba(250,249,245,0.95) 0%, rgba(250,249,245,0.45) 25%, rgba(0,0,0,0) 50%, rgba(20,20,19,0.88) 100%)",
  },
  vintage_poster: {
    name: "Neo-Vintage Poster",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.vintage_poster.cameraDirective,
    suggestedFont: "Outfit",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient: "linear-gradient(to bottom, rgba(250,247,238,0.94) 0%, rgba(250,247,238,0.35) 25%, rgba(0,0,0,0) 50%, rgba(250,247,238,0.88) 100%)",
  },
  saas_dotgrid: {
    name: "Modern SaaS Dot-Grid",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.saas_dotgrid.cameraDirective,
    suggestedFont: "Plus Jakarta Sans",
    suggestedBodyFont: "Inter",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.heavy,
  },
  polaroid_pov_overlay: {
    name: "POV Polaroid Landmark Overlay",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.polaroid_pov_overlay.cameraDirective,
    suggestedFont: "Plus Jakarta Sans",
    suggestedBodyFont: "Inter",
    scrimGradient: "linear-gradient(180deg, rgba(0, 20, 45, 0.48) 0%, rgba(0, 20, 45, 0.22) 45%, rgba(0, 20, 45, 0) 100%)",
  },
  feature_badges_editorial: {
    name: "Feature Badges Commercial Hero",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.feature_badges_editorial.cameraDirective,
    suggestedFont: "Plus Jakarta Sans",
    suggestedBodyFont: "Inter",
    scrimGradient: "linear-gradient(180deg, rgba(0, 20, 45, 0.48) 0%, rgba(0, 20, 45, 0.22) 45%, rgba(0, 20, 45, 0) 100%)",
  },
  minimal_shader_text: {
    name: "Minimal Shader Contrast Canvas",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.minimal_shader_text.cameraDirective,
    suggestedFont: "Plus Jakarta Sans",
    suggestedBodyFont: "Inter",
    scrimGradient: "radial-gradient(circle at 50% 30%, rgba(20,20,19,0.3) 0%, rgba(20,20,19,0.85) 100%)",
  },
  scrapbook_maximalist: {
    name: "Scrapbook Maximalist Collage",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.scrapbook_maximalist.cameraDirective,
    suggestedFont: "Playfair Display",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient: "linear-gradient(180deg, rgba(25,20,15,0.6) 0%, rgba(25,20,15,0.2) 35%, rgba(25,20,15,0.85) 100%)",
  },
  bold_funky: {
    name: "Bold Funky Color Block",
    negativeSpaceDirective: DESIGN_KNOWLEDGE_GRAPH.spatial_budgeting.bold_funky.cameraDirective,
    suggestedFont: "Outfit",
    suggestedBodyFont: "Plus Jakarta Sans",
    scrimGradient: DESIGN_KNOWLEDGE_GRAPH.color_science.scrim_multi_stop.subtle,
  },
};
