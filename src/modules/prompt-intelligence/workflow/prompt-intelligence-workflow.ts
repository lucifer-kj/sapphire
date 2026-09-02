import { generateObject, generateText } from "ai";
import { z } from "zod";
import { BrandBrainService } from "@/services/brand-brain";
import { DesignKnowledgeService } from "@/services/design-knowledge";
import { ExecutionLogger } from "@/services/telemetry";
import { getReasoningModel, getReasoningFallbackModel, getGroundingModel } from "@/lib/ai-model";
import { createAdminClient } from "@/lib/supabase/admin";
import { DesignArchetype } from "@/lib/design-system/archetypes";
import { Platform, PostType } from "../domain/prompt-intent";
import { PromptSpecification, TypographyLayoutSchema } from "../domain/prompt-spec";
import { PromptResult } from "../domain/prompt-result";
import { ModelRouterService } from "../services/model-router";
import { PromptFormattersService } from "../services/prompt-formatters";
import { PromptValidatorService } from "../services/prompt-validator";
import { PLATFORM_VISUAL_RULES, POST_TYPE_GUIDANCE } from "../knowledge/platform-rules";
import { BrandProfile } from "@/lib/schema/brand";


const IntentSynthesisSchema = z.object({
  topic: z.string().describe("Core topic or hook"),
  event: z.string().optional().describe("Associated holiday, milestone, or cultural event"),
  post_type: z.string().describe("Classified post type for platform"),
  content_objective: z.string().describe("Primary marketing or value objective"),
  target_audience: z.string().describe("Target demographic and psychographic audience"),
  visual_opportunity: z.string().describe("Strategic visual hook angle"),
  explicit_constraints: z.array(z.string()).default([]),
});

const CreativeDirectionSynthesisSchema = z.object({
  creative_concept: z.string().describe("Core visual metaphor and conceptual hook"),
  interpreted_direction: z.string().describe("1-2 sentence high-level creative brief"),
  archetype: z.enum([
    "editorial_magazine",
    "conceptual_split",
    "comparison_split",
    "vintage_poster",
    "saas_dotgrid",
  ]).describe("Selected canonical design archetype"),
  subject: z.string().describe("Detailed photographic subject, pose, authentic materials, and hero focus"),
  environment: z.string().describe("Setting, background depth, atmospheric conditions, and architectural context"),
  lighting: z.string().describe("Lighting architecture: direction (e.g. 45-degree key light, rim backlight), quality (diffused softbox, golden hour ambient), and color temperature"),
  camera_and_optics: z.string().describe("Camera angle, framing, focal length (e.g. 85mm f/1.4, 50mm f/1.2), depth of field falloff"),
  color_and_materials: z.string().describe("Curated 3-4 color palette anchors and tactile material textures (e.g. matte ceramic, rough linen, brushed steel)"),
  negative_constraints: z.array(z.string()).describe("Visual clichés, plastic smoothing, and unwanted elements explicitly forbidden"),
  typography_layout: z.object({
    headline: z.string().describe("Punchy, scroll-stopping headline text (e.g. 'KYOTO: THE ART OF STILLNESS')"),
    kicker_badge: z.string().optional().describe("Small eyebrow badge (e.g. 'PRIVATE EXPEDITIONS 2026')"),
    subheadline: z.string().optional().describe("Supporting contextual line"),
    cta_text: z.string().describe("Call to action (e.g. 'Tap Link in Bio for the 7-Day Itinerary')"),
    brand_watermark: z.string().describe("Brand signature or handle (e.g. 'Vagabond Travel Agency')"),
    font_pairing_recommendation: z.string().describe("Suggested typography pairing (e.g. 'Playfair Display Serif + Inter Sans')"),
    text_placement_zone: z.enum(["top_third", "bottom_third", "split_center", "sidebar_margin"]),
  }),
  caption_text: z.string().describe("Complete social media post caption tailored to platform audience"),
  hashtags: z.array(z.string()).default([]),
  reference_strategy_type: z.enum([
    "none",
    "style_reference",
    "subject_reference",
    "product_reference",
    "composition_reference",
  ]),
  reference_guidance: z.string().describe("Guidance on what a reference image should control"),
  rationale_creative: z.string().describe("Why this visual concept was selected"),
  rationale_platform: z.string().describe("Why this framing works on the target platform"),
  anti_cliche_guardrails: z.array(z.string()).describe("3-4 generic clichés avoided"),
});

export class PromptIntelligenceWorkflow {
  /**
   * Executes the 6-stage asynchronous Prompt Intelligence DAG with real-time SSE progress streaming.
   */
  static async execute(
    prompt: string,
    brandId?: string,
    platform: Platform = "instagram",
    onProgress?: (step: number, totalSteps: number, summary: string, status: "active" | "success" | "error", data?: any) => Promise<void>,
    explicitBrandProfile?: BrandProfile
  ): Promise<PromptResult> {
    const logger = new ExecutionLogger();
    const resultId = `prompt_${Date.now()}`;

    // -------------------------------------------------------------
    // Stage 0: Brand DNA Loading & Researching Topic Grounding
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(0, 6, "Loading Brand DNA & Researching Topic Grounding (Gemini 2.5 Search)...", "active");
    }

    const brand = explicitBrandProfile || (await BrandBrainService.getBrandById(brandId));
    const intentStart = Date.now();

    // Stage 0.5: Real-World Topic Research & Entity Grounding
    let topicDossier = "";
    try {
      const groundingRes = await generateText({
        model: getGroundingModel(),
        system: "You are Sapphire's Principal Research Analyst. You accurately ground user topics, technical terms, company announcements, protocols, and industry frameworks in verified facts.",
        prompt: `Research and factually explain this topic: "${prompt}".
If this involves a technology, protocol (e.g. Google A2A), framework, acronym, or real company announcement:
1. State the exact, verified definition and what the acronym actually stands for.
2. Explain its core technological architecture, purpose, and value proposition.
3. Clarify common misconceptions.
If it is a general creative/lifestyle concept, provide key real-world sensory and cultural anchors.
Keep your factual summary crisp and authoritative (under 120 words).`,
      });
      topicDossier = groundingRes.text;
    } catch (groundingErr) {
      console.warn("Topic grounding notice:", groundingErr);
    }

    const intentPrompt = `Analyze this content brief for Brand "${brand.name}" on social platform ${platform.toUpperCase()}:
User Brief: "${prompt}"
Industry: ${brand.industry}
Brand Tone: ${brand.voice?.tone || "Elevated"}
Brand Positioning: ${brand.positioning || "Modern excellence"}

Verified Real-World Context:
${topicDossier || "No specific external entity detected."}

Classify the post type and extract the strategic intent.`;

    let intent: z.infer<typeof IntentSynthesisSchema>;
    try {
      const intentRes = await generateObject({
        model: getReasoningModel(),
        schema: IntentSynthesisSchema,
        system: "You are Sapphire's Principal Social Content Strategist. Analyze user briefs and classify them into platform-native post types.",
        prompt: intentPrompt,
      });
      intent = intentRes.object;
    } catch {
      const fallbackRes = await generateObject({
        model: getReasoningFallbackModel(),
        schema: IntentSynthesisSchema,
        system: "You are Sapphire's Principal Social Content Strategist.",
        prompt: intentPrompt,
      });
      intent = fallbackRes.object;
    }

    logger.log({
      agent: "IntentAgent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - intentStart,
      summary: `Parsed intent: Post Type "${intent.post_type}", Topic: "${intent.topic}"`,
    });

    if (onProgress) {
      await onProgress(0, 6, `Brand DNA Loaded: "${brand.name}". Post type identified: ${intent.post_type}`, "success");
    }

    // -------------------------------------------------------------
    // Stage 1: Targeted Design Knowledge & Platform Rules Retrieval
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(1, 6, "Retrieving Platform Rules & Curated Visual Knowledge...", "active");
    }

    const platformRules = PLATFORM_VISUAL_RULES[platform];
    const postTypeGuidance = POST_TYPE_GUIDANCE[intent.post_type as PostType] || {
      recommendedArchetypes: ["editorial_magazine", "conceptual_split"],
      visualGoal: "Command visual attention with editorial polish",
      keyElements: ["High contrast subject", "Legible headline zone"],
    };

    const designKnowledge = await DesignKnowledgeService.searchKnowledge(
      `${intent.topic} ${brand.industry} ${platform}`,
      2
    );


    logger.log({
      agent: "KnowledgeAgent",
      provider: "Hybrid KB RAG",
      model: "local-kb-markdown",
      status: "success",
      durationMs: 40,
      summary: `Loaded platform rules for ${platform} and ${designKnowledge.length} design themes.`,
    });

    if (onProgress) {
      await onProgress(1, 6, `Platform rules and visual themes synchronized for ${platform}.`, "success");
    }

    // -------------------------------------------------------------
    // Stage 2: Strategist & Creative Director Concept Formulation
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(2, 6, "Synthesizing High-Confidence Visual Direction (Creative Director Agent)...", "active");
    }
    const cdStart = Date.now();

    const cdPrompt = `Synthesize an unignorable, magazine-grade social media post for Brand "${brand.name}":

Platform: ${platform.toUpperCase()}
Post Type: ${intent.post_type}
Topic: "${intent.topic}"
Objective: "${intent.content_objective}"
Target Audience: "${intent.target_audience}"
Visual Opportunity: "${intent.visual_opportunity}"

VERIFIED REAL-WORLD TOPIC DOSSIER (STRICT ACCURACY MANDATE):
${topicDossier || "General creative exploration."}
*RULE: Base all technical claims, terminology, and system definitions strictly on this verified factual dossier. Do NOT guess, alter, or hallucinate acronyms.*

MANDATORY BRAND IDENTITY LOCK:
- Exact Brand Name: "${brand.name}"
- Exact Industry: "${brand.industry}"
- Visual Identity Style: ${brand.visual_identity?.photography_style || "Authentic editorial commercial"}
- Primary Colors (HEX): ${brand.visual_identity?.primary_colors?.join(", ") || "#181816, #FAF9F5"}
- Secondary Colors (HEX): ${brand.visual_identity?.secondary_colors?.join(", ") || "#D97757"}
- Brand Watermark / Signature: MUST strictly be "${brand.name}". NEVER substitute default or other brand names.
- Industry Domain Alignment: Align visual subjects strictly with "${brand.industry}". If the brand is Business Design, Strategy, or Tech, NEVER frame it as travel, vacation, or coffee.

RADICAL PLATFORM DIVERGENCE:
${platform === "linkedin" ? `
[LINKEDIN B2B STRATEGIC AUTHORITY DOCTRINE]:
- Visual Tone: High-contrast, dark mode, executive, technical sophistication.
- Recommended Archetypes: 'saas_dotgrid', 'conceptual_split', or 'editorial_magazine'.
- Photographic Setting: Sleek obsidian hardware, matte dark devices with technical architecture flows, clean minimalist engineering studio or architectural executive environment, tactile high-end materials (matte ceramic, brushed aluminum, tinted architectural glass).
- Eyebrow Badge: Strategic technical tag (e.g. "[SYSTEM ARCHITECTURE]", "[PROTOCOL ANALYSIS]", "[ENTERPRISE BRIEFING]").
- Headline Grammar: Paradigm shift or strategic insight (4-7 words, e.g. "A2A: THE OPERATING PROTOCOL FOR AUTONOMOUS AGENTS").
- Subheadline: Analytical value proposition (e.g. "How Google's Agent2Agent standard replaces fragmented workflows with secure multi-agent orchestration.").
- CTA Text: Enterprise engagement (e.g. "Explore the Architectural Analysis", "Read the Implementation Blueprint").
- Caption Blueprint:
  1. High-impact strategic hook line (first 2 lines before 'see more').
  2. The Enterprise Friction / Status Quo.
  3. 3-4 structured bullet points detailing architectural advantages.
  4. Strategic debate question to drive executive comments.
` : `
[INSTAGRAM VISUAL CULTURE & AESTHETIC DOCTRINE]:
- Visual Tone: Sensory, cultural, emotive, highly cinematic, thumb-stopping visual pacing.
- Recommended Archetypes: 'editorial_magazine', 'vintage_poster', or 'conceptual_split'.
- Photographic Setting: Warm natural or dramatic raking light, authentic candid textures, tactile craftsmanship, deep atmospheric shadows, cinematic depth.
- Eyebrow Badge: Minimalist cultural tag (e.g. "EDITION 04", "ESSENTIALS").
- Headline Grammar: Poetic, curiosity-gap, evocative hook (e.g. "THE ARCHITECTURE OF SILENCE").
- CTA Text: Community action (e.g. "Save for Later", "Tap Link in Bio to Explore").
- Caption Blueprint:
  1. Short, evocative opening hook.
  2. Atmospheric micro-storytelling.
  3. Clear Link in Bio action.
  4. 5-8 curated aesthetic hashtags.
`}

CRITICAL ANTI-CLICHÉ & CREATIVE QUALITY MANDATES:
1. STRICT INDUSTRY ANTI-CLICHÉ GUARDRAILS:
   - Coffee / Café: FORBIDDEN: Hands holding a coffee mug, rain drops on a window pane, crude retail discount signs (e.g. "40% OFF", "Limited Offer"), and generic cozy stock aesthetics. MANDATED: High-concept artisanal depth — kinetic pour-over chemistry, espresso extraction micro-physics, warm raking morning light catching rising steam, raw slate countertops, architectural terrazzo, and sensory coffee craft.
   - Travel / Hospitality: FORBIDDEN: Tourist from behind looking at sunset, passport on bed, generic tropical beaches. MANDATED: Intimate documentary moments, atmospheric architectural framing, authentic cultural textures, and kinetic local transit.
   - Business Design / SaaS / Tech: FORBIDDEN: Floating blue holograms, handshake over laptop, generic glowing network nodes, cartoonish infographics. MANDATED: Tactile hardware, dark minimalist typography, abstract architectural geometries, and high-contrast data matrices with brand primary hex accents.

2. EDITORIAL HEADLINE DOCTRINE:
   - NEVER generate cheap retail discount slogans (e.g. "40% OFF", "Special Discount", "Sale This Week"). Social media audiences scroll past blatant advertisements.
   - Formulate evocative, cultural, curiosity-gap, or strategic editorial hooks that command attention.

3. SPATIAL SAFE-ZONE LAW (ZERO TYPOGRAPHY COLLISION):
   - You MUST design the photographic scene so that the selected text_placement_zone (e.g. "top_third") is composed with clean, calm, low-detail negative space (such as deep atmospheric shadows, clean architectural wall, or soft bokeh).
   - The hero subject MUST be positioned strictly in the remaining area (e.g. the lower two-thirds) to ensure 100% zero collision between the headline and the image subject.

CRITICAL DELIVERABLES:
1. Complete Graphic Typography Layout: Punchy Headline, Kicker Eyebrow Badge, Subheadline, Call to Action (CTA), Brand Signature ("${brand.name}"), and safe-zone placement.
2. Photographic Scene & Negative Space Plan: Camera optics (e.g. 50mm f/1.2), lighting architecture, tactile materials, and explicit negative space zone.
3. Complete Social Media Caption: Platform-native hook, story/value, bullet points, and CTA with 4-6 hashtags.`;

    let cdSynthesis: z.infer<typeof CreativeDirectionSynthesisSchema>;
    try {
      const cdRes = await generateObject({
        model: getReasoningModel(),
        schema: CreativeDirectionSynthesisSchema,
        system: "You are Sapphire's Executive Creative Director. You formulate unignorable, magazine-grade social media posts with punchy typography headlines, brand badges, CTAs, and photographic direction. You strictly forbid generic AI stock clichés and retail discount ads.",
        prompt: cdPrompt,
      });

      cdSynthesis = cdRes.object;
    } catch {
      const cdFallback = await generateObject({
        model: getReasoningFallbackModel(),
        schema: CreativeDirectionSynthesisSchema,
        system: "You are Sapphire's Executive Creative Director.",
        prompt: cdPrompt,
      });
      cdSynthesis = cdFallback.object;
    }

    logger.log({
      agent: "CreativeDirectorAgent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - cdStart,
      summary: `Formulated post: "${cdSynthesis.typography_layout.headline}" (Archetype: ${cdSynthesis.archetype})`,
    });

    if (onProgress) {
      await onProgress(2, 6, `Post formulated: "${cdSynthesis.typography_layout.headline}"`, "success", {
        direction: cdSynthesis.interpreted_direction,
        archetype: cdSynthesis.archetype,
        headline: cdSynthesis.typography_layout.headline,
      });
    }

    // -------------------------------------------------------------
    // Stage 3: Model Routing & Intermediate PromptSpecification Assembly
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(3, 6, "Routing Optimal Image Model & Assembling Prompt Specification...", "active");
    }

    const modelRecommendation = ModelRouterService.routeModel({
      platform,
      postType: intent.post_type as PostType,
      archetype: cdSynthesis.archetype as DesignArchetype,
      hasInImageTextNeeded: true,
      visualStyle: cdSynthesis.subject,
      hasReferenceImage: false,
    });

    const promptSpec: PromptSpecification = {
      id: `spec_${Date.now()}`,
      version: 1,
      platform,
      post_type: intent.post_type as PostType,
      archetype: cdSynthesis.archetype as DesignArchetype,
      creative_concept: cdSynthesis.creative_concept,
      subject: cdSynthesis.subject,
      environment: cdSynthesis.environment,
      lighting: cdSynthesis.lighting,
      camera_and_optics: cdSynthesis.camera_and_optics,
      color_and_materials: cdSynthesis.color_and_materials,
      negative_constraints: [
        ...cdSynthesis.negative_constraints,
        ...platformRules.antiPatternsToAvoid,
      ],
      brand_tokens: {
        brand_name: brand.name,
        primary_color: brand.visual_identity?.primary_colors?.[0],
        tone: brand.voice?.tone,
        forbidden_motifs: brand.voice?.forbidden_phrases || [],
      },
      typography_layout: {
        headline: cdSynthesis.typography_layout.headline,
        kicker_badge: cdSynthesis.typography_layout.kicker_badge,
        subheadline: cdSynthesis.typography_layout.subheadline,
        cta_text: cdSynthesis.typography_layout.cta_text,
        brand_watermark: brand.name,
        font_pairing_recommendation: cdSynthesis.typography_layout.font_pairing_recommendation,
        text_placement_zone: cdSynthesis.typography_layout.text_placement_zone,

      },
      caption_text: cdSynthesis.caption_text,
      hashtags: cdSynthesis.hashtags,
      target_model: modelRecommendation.recommendedModel,
      aspect_ratio: modelRecommendation.aspectRatio,
      reference_strategy: {
        type: cdSynthesis.reference_strategy_type,
        guidance: cdSynthesis.reference_guidance,
        importance: cdSynthesis.reference_strategy_type === "none" ? "optional" : "recommended",
      },
    };

    logger.log({
      agent: "ModelRouterService",
      provider: "Capability Heuristics",
      model: modelRecommendation.recommendedModel,
      status: "success",
      durationMs: 15,
      summary: `Routed to ${modelRecommendation.displayName} (${modelRecommendation.aspectRatio})`,
    });

    if (onProgress) {
      await onProgress(3, 6, `Model routed: ${modelRecommendation.displayName} (${modelRecommendation.aspectRatio})`, "success");
    }

    // -------------------------------------------------------------
    // Stage 4: Model-Aware Multi-Format Prompt Formatting
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(4, 6, "Engineering Poster Typography Prompts Across Models...", "active");
    }

    const formattedBundle = PromptFormattersService.formatPromptBundle(promptSpec);

    logger.log({
      agent: "PromptFormattersService",
      provider: "Syntax Compiler",
      model: modelRecommendation.recommendedModel,
      status: "success",
      durationMs: 10,
      summary: "Rendered dual poster and photographic prompt bundles.",
    });

    if (onProgress) {
      await onProgress(4, 6, "Poster typography prompts engineered.", "success");
    }

    // -------------------------------------------------------------
    // Stage 5: Prompt Critic 100-Point Quality & Compliance Audit
    // -------------------------------------------------------------
    if (onProgress) {
      await onProgress(5, 6, "Auditing Prompt Quality & Brand Compliance (100-pt Rubric)...", "active");
    }

    const criticStart = Date.now();
    const criticEvaluation = await PromptValidatorService.evaluatePrompt(
      promptSpec,
      formattedBundle.primary.finalPrompt,
      brand
    );

    logger.log({
      agent: "PromptCriticAgent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: "success",
      durationMs: Date.now() - criticStart,
      summary: `Quality Score: ${criticEvaluation.score}/100 (Pass: ${criticEvaluation.pass})`,
    });

    if (onProgress) {
      await onProgress(5, 6, `Quality audit complete. Score: ${criticEvaluation.score}/100`, "success");
    }

    // Assemble final PromptResult
    const finalResult: PromptResult = {
      id: resultId,
      mode: "prompt_only",
      platform,
      post_type: intent.post_type as PostType,
      archetype: cdSynthesis.archetype as DesignArchetype,
      interpreted_direction: cdSynthesis.interpreted_direction,
      model_recommendation: modelRecommendation,
      aspect_ratio: modelRecommendation.aspectRatio,
      reference_strategy: promptSpec.reference_strategy,
      final_prompt: formattedBundle.primary.finalPrompt,
      negative_prompt: formattedBundle.primary.negativePrompt,
      poster_prompt: formattedBundle.posterPrompt,
      photographic_prompt: formattedBundle.photographicPrompt,
      typography_layout: promptSpec.typography_layout,
      caption_text: promptSpec.caption_text,
      hashtags: promptSpec.hashtags,
      all_model_formats: formattedBundle.allModelFormats,
      syntax_tokens: formattedBundle.syntaxTokens,
      specification: promptSpec,
      critic_evaluation: criticEvaluation,
      rationale: {
        creative_direction_reason: cdSynthesis.rationale_creative,
        platform_psychology_reason: cdSynthesis.rationale_platform,
        model_selection_reason: modelRecommendation.selectionReason,
        anti_cliche_guardrails: cdSynthesis.anti_cliche_guardrails,
      },
      version: 1,
      created_at: new Date().toISOString(),
    };

    // Asynchronously snapshot to Supabase campaigns table if available
    try {
      const supabase = createAdminClient();
      if (supabase) {
        await supabase.from("campaigns").insert({
          id: resultId,
          brand_id: brand.id,
          campaign_title: `${brand.name} — ${intent.topic} (Social Post Specification)`,
          topic: prompt,
          platform,
          intent,
          research: {
            search_queries: [prompt],
            key_trends: designKnowledge.map((t: any) => t.theme_name),
            visual_motifs: designKnowledge.map((t: any) => t.prompt_keywords),

            overused_patterns_to_avoid: platformRules.antiPatternsToAvoid,
            summary: cdSynthesis.interpreted_direction,
          },
          concept_a: {
            label: "Graphic Poster Specification",
            creative_direction: cdSynthesis.interpreted_direction,
            visual_style: cdSynthesis.subject,
            composition: cdSynthesis.camera_and_optics,
            lighting: cdSynthesis.lighting,
            color_palette: [cdSynthesis.color_and_materials],
            image_prompt: formattedBundle.posterPrompt,
            caption_instagram: cdSynthesis.caption_text,
            caption_linkedin: cdSynthesis.caption_text,
            optimized_image_prompt: formattedBundle.posterPrompt,
          },
          concept_b: {
            label: "Photographic Background",
            creative_direction: modelRecommendation.selectionReason,
            visual_style: modelRecommendation.displayName,
            composition: modelRecommendation.aspectRatio,
            lighting: cdSynthesis.lighting,
            color_palette: [],
            image_prompt: formattedBundle.photographicPrompt,
            caption_instagram: cdSynthesis.caption_text,
            caption_linkedin: cdSynthesis.caption_text,
          },
        });
      }
    } catch (dbErr) {
      console.warn("Supabase prompt result persistence notice:", dbErr);
    }

    return finalResult;
  }
}
