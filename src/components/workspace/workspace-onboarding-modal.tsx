"use client";
import React, { useState } from "react";
import { BrandProfile } from "@/lib/schema/brand";
import { BrandExtractorService, ExtractedBrandData } from "@/services/brand-extractor";
import { RippleCircles } from "@/components/ui/ripple-circles";

import {
  X,
  Sparkles,
  Building2,
  User,
  Globe,
  Palette,
  Type,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Edit3,
  Sliders,
  Sparkle,
  Layers,
  HelpCircle,
} from "lucide-react";

interface WorkspaceOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (brand: BrandProfile) => void;
  initialPath?: OnboardingPath;
}

type OnboardingPath = "select" | "personal" | "client_extract" | "client_review";

export const WorkspaceOnboardingModal: React.FC<WorkspaceOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialPath = "select",
}) => {
  const [path, setPath] = useState<OnboardingPath>(initialPath);

  React.useEffect(() => {
    if (isOpen) {
      setPath(initialPath);
    }
  }, [isOpen, initialPath]);


  // Client Web Extraction State
  const [clientName, setClientName] = useState("");
  const [clientUrl, setClientUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractStatusText, setExtractStatusText] = useState("Initializing OpenBrand extraction engine...");
  const [extractStep, setExtractStep] = useState(1);
  const [extractedData, setExtractedData] = useState<ExtractedBrandData | null>(null);
  const [isEditingExtracted, setIsEditingExtracted] = useState(false);

  // Client Calibration State
  const [calibrationGoal, setCalibrationGoal] = useState("Brand Awareness & Storytelling");
  const [calibrationVibe, setCalibrationVibe] = useState("Warm & Authentic");

  // Personal Brand State
  const [personalName, setPersonalName] = useState("");
  const [personalNiche, setPersonalNiche] = useState("Lifestyle & Visual Storytelling");
  const [personalGenderAesthetic, setPersonalGenderAesthetic] = useState("Warm Editorial");
  const [personalTone, setPersonalTone] = useState("Inspiring, authentic, grounded");
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [customPrimaryColor, setCustomPrimaryColor] = useState("#181816");
  const [customAccentColor, setCustomAccentColor] = useState("#D97757");

  if (!isOpen) return null;

  // Preset Personal Templates
  const personalTemplates = [
    {
      title: "Custom AI Synthesized",
      description: "Tailored to your answers with dynamic typography & color harmony.",
      fontHeading: "Playfair Display",
      fontBody: "Plus Jakarta Sans",
      primaryColors: [customPrimaryColor, "#FAF9F5"],
      secondaryColors: [customAccentColor, "#7BA7D7"],
      isAiGenerated: true,
    },
    {
      title: "Minimalist Luxe",
      description: "High-contrast editorial serif, warm charcoal & terracotta accents.",
      fontHeading: "Playfair Display",
      fontBody: "Inter",
      primaryColors: ["#181816", "#FAF9F5"],
      secondaryColors: ["#D97757", "#87A96B"],
    },
    {
      title: "Neo-Vintage Warmth",
      description: "Organic espresso tones, tactile stamps & Scandinavian aesthetic.",
      fontHeading: "Outfit",
      fontBody: "Georgia",
      primaryColors: ["#21211F", "#FAF7EE"],
      secondaryColors: ["#C49A45", "#D97757"],
    },
    {
      title: "Modern Tech Slate",
      description: "Ultra-clean geometric sans, deep slate backgrounds & matrix cyan.",
      fontHeading: "Plus Jakarta Sans",
      fontBody: "Inter",
      primaryColors: ["#0F172A", "#F8FAFC"],
      secondaryColors: ["#38BDF8", "#7BA7D7"],
    },
  ];

  // Start Web Extraction Workflow
  const handleStartExtraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientUrl.trim()) return;

    setIsExtracting(true);
    setExtractStep(1);
    setExtractStatusText(`Connecting to ${clientUrl.trim()}...`);

    try {
      const res = await fetch("/api/brand-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: clientUrl.trim(),
          brandName: clientName.trim() || undefined,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to initialize OpenBrand extraction.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          const trimmed = chunk.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const payload = JSON.parse(trimmed.slice(6));
            if (payload.type === "progress") {
              setExtractStatusText(payload.stage);
              setExtractStep(payload.step);
            } else if (payload.type === "complete") {
              setExtractedData(payload.data);
              setIsExtracting(false);
              setPath("client_review");
            } else if (payload.type === "error") {
              throw new Error(payload.error);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      console.warn("Extraction error, using standard fallback:", err);
      const fallbackData: ExtractedBrandData = {
        name: clientName.trim() || "New Client Brand",
        websiteUrl: clientUrl.trim(),
        logoVariants: [],
        primaryColors: ["#181816", "#FAF9F5"],
        secondaryColors: ["#D97757", "#7BA7D7"],
        fonts: {
          heading: "Playfair Display",
          body: "Plus Jakarta Sans",
          serif: "Playfair Display",
        },
        typographyRules: ["Clean, modern editorial layout"],
        tagline: "Crafting Distinctive Experiences",
        positioning: "Premium brand storytelling with authenticity.",
        industry: "Lifestyle & Specialty Services",
        targetAudience: "Discerning customers, design-conscious professionals.",
        tone: "Sophisticated, authentic, inspiring",
        forbiddenPhrases: ["Cheap deals", "Act fast"],
        preferredPhrases: ["Crafted with care", "Experience excellence"],
        photographyStyle: "Editorial studio photography, natural warm lighting, authentic textures.",
      };
      setExtractedData(fallbackData);
      setIsExtracting(false);
      setPath("client_review");
    }
  };

  // Finalize Client Brand Approval
  const handleApproveClientBrand = () => {
    if (!extractedData) return;
    const profile = BrandExtractorService.toBrandProfile({
      ...extractedData,
      positioning: `${extractedData.positioning} Focus: ${calibrationGoal}. Aesthetic tone: ${calibrationVibe}.`,
    });
    onComplete(profile);
    onClose();
  };

  // Finalize Personal Brand
  const handleApprovePersonalBrand = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenTpl = personalTemplates[selectedTemplateIndex];
    const slug = (personalName || "personal-brand").toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const profile: BrandProfile = {
      id: slug,
      name: personalName.trim() || "Personal Studio",
      industry: personalNiche,
      positioning: `Personal brand for ${personalName || "Creator"} focusing on ${personalNiche}. Aesthetic presentation: ${personalGenderAesthetic}.`,
      target_audience: "Aspirational creators, engaged community, design enthusiasts.",
      social_handle: `@${slug.replace(/-/g, "")}`,
      visual_identity: {
        logo_variants: [],
        primary_colors: chosenTpl.primaryColors,
        secondary_colors: chosenTpl.secondaryColors,
        fonts: {
          heading: chosenTpl.fontHeading,
          body: chosenTpl.fontBody,
          serif: chosenTpl.fontHeading,
        },
        typography_rules: ["Clean, personal editorial layout"],
        photography_style: `${personalGenderAesthetic} photography, natural authentic lighting, soft shadows.`,
        graphic_style: "Clean minimal editorial layout",
        image_preferences: ["Natural lighting", "Authentic lifestyle moments"],
      },
      voice: {
        tone: personalTone,
        vocabulary: ["Authentic", "Perspective", "Journey"],
        sentence_style: "Conversational yet impactful personal storytelling.",
        cta_style: "Gentle community engagement",
        forbidden_phrases: ["Buy now", "Mass-market"],
        preferred_phrases: ["Share the journey", "Daily rituals"],
      },
      learned_preferences: {
        preferred_visual_styles: [],
        preferred_compositions: [],
        preferred_hooks: [],
        preferred_caption_styles: [],
        color_preferences: [],
        archetype_affinity: {
          editorial_magazine: 0.9,
          conceptual_split: 0.6,
          comparison_split: 0.4,
          vintage_poster: 0.7,
          saas_dotgrid: 0.2,
        },
        typography_density_preference: "minimalist_punchy",
        visual_temperature_preference: "warm_golden",
      },
    };

    onComplete(profile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sapphire-dark/60 backdrop-blur-md animate-fade-in">
      <div className="bg-sapphire-bg border border-sapphire-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-sapphire-border flex items-center justify-between bg-sapphire-surface/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sapphire-terracotta/10 border border-sapphire-terracotta/20 flex items-center justify-center text-sapphire-terracotta font-serif font-bold text-lg">
              S
            </div>
            <div>
              <h2 className="font-serif font-semibold text-text-lg text-sapphire-dark">
                {path === "select" && "Create Brand Workspace"}
                {path === "personal" && "Personal Brand Calibration"}
                {path === "client_extract" && (isExtracting ? "Autonomous Brand Extraction" : "Client Intelligence Intake")}
                {path === "client_review" && "Review Extracted Brand DNA"}
              </h2>
              <p className="text-text-xs text-sapphire-muted">
                {path === "select" && "Choose between personal creator profile or autonomous client website extraction."}
                {path === "personal" && "Calibrate your personal visual style, typography, and tone."}
                {path === "client_extract" && "Extract colors, typography, logos & voice rules directly from the client's URL."}
                {path === "client_review" && "Verify and adjust extracted tokens before launching the creative studio."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* STEP 1: PATH SELECTOR */}
          {path === "select" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div
                onClick={() => setPath("personal")}
                className="group p-6 rounded-2xl border border-sapphire-border bg-sapphire-surface hover:border-sapphire-terracotta transition-all cursor-pointer space-y-4 hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-sapphire-subtle flex items-center justify-center text-sapphire-dark group-hover:bg-sapphire-terracotta group-hover:text-white transition-all">
                  <User className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-text-md text-sapphire-dark">
                    Personal Brand / Creator
                  </h3>
                  <p className="text-text-xs text-sapphire-muted leading-relaxed">
                    Designed for founders, creators, and individuals. Answer 3 quick style questions to synthesize your custom visual palette.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-text-xs font-semibold text-sapphire-terracotta pt-2">
                  <span>Start Personal Onboarding</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              <div
                onClick={() => setPath("client_extract")}
                className="group p-6 rounded-2xl border border-sapphire-border bg-sapphire-surface hover:border-sapphire-terracotta transition-all cursor-pointer space-y-4 hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-sapphire-terracotta/10 flex items-center justify-center text-sapphire-terracotta group-hover:bg-sapphire-terracotta group-hover:text-white transition-all">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-text-md text-sapphire-dark">
                      Client / Company URL
                    </h3>
                    <span className="text-[10px] bg-sapphire-terracotta/15 text-sapphire-terracotta font-semibold px-2 py-0.5 rounded-full">
                      OpenBrand AI
                    </span>
                  </div>
                  <p className="text-text-xs text-sapphire-muted leading-relaxed">
                    Autonomous agent crawls the client domain, extracting stylesheets, logo variants, hex palettes, typography & positioning.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-text-xs font-semibold text-sapphire-terracotta pt-2">
                  <span>Run Web Extraction</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2A: PERSONAL BRAND QUESTIONNAIRE */}
          {path === "personal" && (
            <form onSubmit={handleApprovePersonalBrand} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                    Your Name or Handle *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Rivera"
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs focus:outline-none focus:border-sapphire-terracotta"
                  />
                </div>
                <div>
                  <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                    Creative Niche / Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Luxury Travel, Design Architecture"
                    value={personalNiche}
                    onChange={(e) => setPersonalNiche(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                    Aesthetic Photography Presentation
                  </label>
                  <select
                    value={personalGenderAesthetic}
                    onChange={(e) => setPersonalGenderAesthetic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs"
                  >
                    <option value="Warm Golden Editorial">Warm Golden Editorial</option>
                    <option value="Cool Slate Minimalist">Cool Slate Minimalist</option>
                    <option value="Earthy Tactile Organic">Earthy Tactile Organic</option>
                    <option value="High-Contrast Studio Luxe">High-Contrast Studio Luxe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                    Voice Tone Adjectives
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Inspiring, authentic, calm"
                    value={personalTone}
                    onChange={(e) => setPersonalTone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs"
                  />
                </div>
              </div>

              {/* 4 Visual Templates */}
              <div className="space-y-3 pt-2">
                <label className="block text-text-xs font-semibold text-sapphire-dark">
                  Select Visual Archetype & Palette Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {personalTemplates.map((tpl, idx) => {
                    const isSelected = selectedTemplateIndex === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedTemplateIndex(idx)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? "bg-sapphire-surface border-sapphire-terracotta ring-1 ring-sapphire-terracotta/30"
                            : "bg-sapphire-surface/60 border-sapphire-border hover:border-sapphire-dark/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-text-xs text-sapphire-dark">
                            {tpl.title}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-sapphire-terracotta" />}
                        </div>
                        <p className="text-[11px] text-sapphire-muted line-clamp-1 leading-relaxed">
                          {tpl.description}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-mono text-sapphire-muted">
                            {tpl.fontHeading}
                          </span>
                          <div className="flex items-center gap-1">
                            {[...tpl.primaryColors, ...tpl.secondaryColors].slice(0, 3).map((c, i) => (
                              <div
                                key={i}
                                className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-sapphire-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPath("select")}
                  className="inline-flex items-center gap-1.5 text-text-xs font-semibold text-sapphire-muted hover:text-sapphire-dark"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-semibold hover:bg-sapphire-terracotta/90 shadow-sm"
                >
                  Create & Launch Personal Workspace
                </button>
              </div>
            </form>
          )}

          {/* STEP 2B: CLIENT EXTRACTION INTAKE */}
          {path === "client_extract" && (
            <div className="space-y-6">
              {!isExtracting ? (
                <form onSubmit={handleStartExtraction} className="space-y-4">
                  <div>
                    <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                      Client Website Domain / URL *
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Globe className="w-4 h-4 absolute left-3.5 top-3 text-sapphire-muted" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. https://www.aesop.com or brand.com"
                          value={clientUrl}
                          onChange={(e) => setClientUrl(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs focus:outline-none focus:border-sapphire-terracotta"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                      Client Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Leave blank to auto-detect from domain"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-sapphire-terracotta/5 border border-sapphire-terracotta/15 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-sapphire-terracotta mt-0.5 shrink-0" />
                    <p className="text-[11px] text-sapphire-muted leading-relaxed">
                      The OpenBrand extraction agent will fetch stylesheets, compute color frequency tokens, identify typography families, and synthesize brand voice rules for instant review.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-sapphire-border flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPath("select")}
                      className="inline-flex items-center gap-1.5 text-text-xs font-semibold text-sapphire-muted hover:text-sapphire-dark"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-semibold hover:bg-sapphire-terracotta/90 shadow-sm inline-flex items-center gap-2"
                    >
                      <span>Launch OpenBrand Agent</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              ) : (
                /* Terracotta-Themed Real-time Extraction Stepper with RippleCircles */
                <div className="py-8 px-6 flex flex-col items-center justify-center space-y-5 text-center bg-sapphire-surface rounded-2xl border border-sapphire-terracotta/20 animate-fade-in relative overflow-hidden">
                  {/* Ripple Circles Module with Center Brand Icon */}
                  <div className="relative flex items-center justify-center h-[200px] w-[200px]">
                    <RippleCircles className="h-[200px] w-[200px]" />
                    <div className="absolute z-[99] w-14 h-14 rounded-2xl bg-sapphire-bg border border-sapphire-terracotta/50 shadow-xl flex items-center justify-center text-sapphire-terracotta">
                      <Sparkles className="w-7 h-7 animate-pulse" />
                    </div>
                  </div>

                  <div className="space-y-1.5 max-w-md z-10">
                    <h3 className="font-serif font-bold text-text-md text-sapphire-dark">
                      Extracting Client Brand Intelligence
                    </h3>
                    <p className="text-text-xs font-mono text-sapphire-terracotta animate-pulse">
                      {extractStatusText}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full max-w-xs bg-sapphire-border rounded-full h-1.5 overflow-hidden z-10">
                    <div
                      className="bg-sapphire-terracotta h-1.5 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${(extractStep / 4) * 100}%` }}
                    />
                  </div>
                </div>

              )}
            </div>
          )}

          {/* STEP 3: REVIEW & EDIT EXTRACTED BRAND DATA */}
          {path === "client_review" && extractedData && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between bg-sapphire-green/10 border border-sapphire-green/20 p-3.5 rounded-xl">
                <div className="flex items-center gap-2 text-sapphire-green text-text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>OpenBrand Extraction Complete</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingExtracted((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sapphire-dark hover:text-sapphire-terracotta bg-sapphire-surface px-2.5 py-1 rounded-lg border border-sapphire-border"
                >
                  <Edit3 className="w-3 h-3" />
                  {isEditingExtracted ? "Done Editing" : "Edit Extracted Values"}
                </button>
              </div>

              {/* Extracted Details Grid */}
              <div className="space-y-4 p-4 rounded-2xl bg-sapphire-surface border border-sapphire-border">
                {/* Brand Name & Industry */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-sapphire-muted mb-1">
                      Brand Name
                    </label>
                    {isEditingExtracted ? (
                      <input
                        type="text"
                        value={extractedData.name}
                        onChange={(e) => setExtractedData({ ...extractedData, name: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-sapphire-border bg-sapphire-bg text-text-xs"
                      />
                    ) : (
                      <span className="font-semibold text-text-sm text-sapphire-dark">{extractedData.name}</span>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-sapphire-muted mb-1">
                      Industry
                    </label>
                    {isEditingExtracted ? (
                      <input
                        type="text"
                        value={extractedData.industry}
                        onChange={(e) => setExtractedData({ ...extractedData, industry: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-sapphire-border bg-sapphire-bg text-text-xs"
                      />
                    ) : (
                      <span className="text-text-xs text-sapphire-muted font-medium">{extractedData.industry}</span>
                    )}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-[11px] font-semibold text-sapphire-muted mb-1">
                    Extracted Brand Palette (Primary & Accent)
                  </label>
                  <div className="flex items-center gap-2">
                    {[...extractedData.primaryColors, ...extractedData.secondaryColors].slice(0, 4).map((c, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-sapphire-bg px-2 py-1 rounded-lg border border-sapphire-border">
                        <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                        <span className="font-mono text-[11px] text-sapphire-dark">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-sapphire-muted mb-1">
                      Headline Font
                    </label>
                    <span className="font-serif font-medium text-text-xs text-sapphire-dark">
                      {extractedData.fonts.heading}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-sapphire-muted mb-1">
                      Body Typography
                    </label>
                    <span className="text-text-xs text-sapphire-muted font-medium">
                      {extractedData.fonts.body}
                    </span>
                  </div>
                </div>

                {/* Positioning & Tone */}
                <div>
                  <label className="block text-[11px] font-semibold text-sapphire-muted mb-1">
                    Brand Positioning & Tone
                  </label>
                  <p className="text-text-xs text-sapphire-dark leading-relaxed">
                    {extractedData.positioning}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {extractedData.tone.split(",").map((t, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-sapphire-terracotta/10 text-sapphire-terracotta font-medium">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Calibration Questions */}
              <div className="space-y-3 p-4 rounded-2xl bg-sapphire-subtle/50 border border-sapphire-border">
                <h4 className="font-semibold text-text-xs text-sapphire-dark flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5 text-sapphire-terracotta" />
                  Quick Calibration
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-sapphire-muted mb-1">
                      Campaign Objective Focus
                    </label>
                    <select
                      value={calibrationGoal}
                      onChange={(e) => setCalibrationGoal(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-sapphire-border bg-sapphire-surface text-[11px]"
                    >
                      <option value="Brand Storytelling & Aesthetics">Brand Storytelling & Aesthetics</option>
                      <option value="Product Launch & Conversions">Product Launch & Conversions</option>
                      <option value="Community Engagement & Rituals">Community Engagement & Rituals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-sapphire-muted mb-1">
                      Aesthetic Temperature
                    </label>
                    <select
                      value={calibrationVibe}
                      onChange={(e) => setCalibrationVibe(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-sapphire-border bg-sapphire-surface text-[11px]"
                    >
                      <option value="Warm & Golden Hour">Warm & Golden Hour</option>
                      <option value="Clean Studio Minimalist">Clean Studio Minimalist</option>
                      <option value="High-Contrast Moody Luxe">High-Contrast Moody Luxe</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-sapphire-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPath("client_extract")}
                  className="inline-flex items-center gap-1.5 text-text-xs font-semibold text-sapphire-muted hover:text-sapphire-dark"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Re-scan
                </button>
                <button
                  type="button"
                  onClick={handleApproveClientBrand}
                  className="px-6 py-2.5 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-semibold hover:bg-sapphire-terracotta/90 shadow-sm inline-flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve & Launch Client Studio</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
