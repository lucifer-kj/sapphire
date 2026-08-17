"use client";
import React, { useState } from "react";
import { BrandProfile } from "@/lib/schema/brand";
import { X, Check, Building2, Sparkles, Plus, Palette } from "lucide-react";

export const PRECONFIGURED_BRANDS: BrandProfile[] = [
  {
    name: "Vagabond Travel Agency",
    industry: "Travel & Hospitality",
    description: "Bespoke experiential travel agency specializing in immersive, culturally rich journeys across India and Asia.",
    positioning: "Premium editorial travel with human storytelling.",
    target_audience: "Aspirational millennial travelers, luxury experience seekers, cultural enthusiasts.",
    visual_identity: {
      logo_variants: ["full-logo-dark", "icon-mark-terracotta"],
      primary_colors: ["#181816", "#FAF9F5"],
      secondary_colors: ["#D97757", "#7BA7D7", "#87A96B"],
      fonts: {
        heading: "Playfair Display",
        body: "Plus Jakarta Sans",
        serif: "Playfair Display",
      },
      typography_rules: ["Subtle, clean text overlay", "High contrast on images"],
      photography_style: "Cinematic editorial travel photography, golden hour lighting, authentic human moments.",
      graphic_style: "Restrained, minimal, high-end editorial composition.",
      image_preferences: ["Warm earth tones", "Subtle landscape compositions", "Human element in frame"],
    },
    voice: {
      tone: "Inspiring, sophisticated, authentic, adventurous",
      vocabulary: ["Journey", "Freedom", "Immersive", "Discovery", "Horizon"],
      sentence_style: "Poetic yet concise opening hooks followed by clear trip details.",
      cta_style: "Subtle invitation to explore",
      forbidden_phrases: ["Cheap deals", "Discount blowout", "Hurry before it's gone!"],
      preferred_phrases: ["Craft your journey", "Discover the unseen"],
    },
    learned_preferences: {
      preferred_visual_styles: [{ value: "editorial_travel", confidence: 0.9, evidence_count: 8, source: "selection_pattern" }],
      preferred_compositions: [{ value: "rule_of_thirds_landscape", confidence: 0.85, evidence_count: 5, source: "selection_pattern" }],
      preferred_hooks: [],
      preferred_caption_styles: [{ value: "storytelling_first", confidence: 0.9, evidence_count: 6, source: "explicit_feedback" }],
      logo_prominence: { value: "subtle_bottom_corner", confidence: 0.95, evidence_count: 6, source: "explicit_feedback" },
      color_preferences: [],
      archetype_affinity: {
        editorial_magazine: 0.92,
        conceptual_split: 0.6,
        comparison_split: 0.4,
        vintage_poster: 0.75,
        saas_dotgrid: 0.25,
      },
      typography_density_preference: "minimalist_punchy",
      visual_temperature_preference: "warm_golden",
    },
  },
  {
    name: "Café Vagabond & Roastery",
    industry: "Artisanal Food & Beverage",
    description: "Specialty micro-batch coffee roastery and Scandinavian cafe.",
    positioning: "Slow living, organic origins, quiet luxury coffee.",
    target_audience: "Design conscious coffee connoisseurs, urban creatives.",
    visual_identity: {
      logo_variants: ["monogram-terracotta"],
      primary_colors: ["#21211F", "#FAF7EE"],
      secondary_colors: ["#D97757", "#2B160E"],
      fonts: {
        heading: "Outfit",
        body: "Plus Jakarta Sans",
        serif: "Georgia",
      },
      typography_rules: ["Neo-vintage stamps", "Warm organic contrast"],
      photography_style: "Warm espresso tones, top-down artisanal table spreads, tactile steam.",
      graphic_style: "Organic neo-vintage poster aesthetic.",
      image_preferences: ["Espresso tones", "Rustic ceramic mugs", "Morning shadows"],
    },
    voice: {
      tone: "Warm, grounding, tactile, artisanal",
      vocabulary: ["Roast", "Velvety", "Origin", "Ritual", "Harvest"],
      sentence_style: "Sensory evocative phrases celebrating morning rituals.",
      cta_style: "Warm invitation to sip and stay",
      forbidden_phrases: ["Mass-market", "Instant coffee", "Caffeine rush"],
      preferred_phrases: ["Brewed slow", "Crafted daily"],
    },
    learned_preferences: {
      preferred_visual_styles: [],
      preferred_compositions: [],
      preferred_hooks: [],
      preferred_caption_styles: [],
      logo_prominence: { value: "vintage_stamp", confidence: 0.9, evidence_count: 4, source: "selection_pattern" },
      color_preferences: [],
      archetype_affinity: {
        editorial_magazine: 0.8,
        conceptual_split: 0.35,
        comparison_split: 0.3,
        vintage_poster: 0.95,
        saas_dotgrid: 0.1,
      },
      typography_density_preference: "balanced",
      visual_temperature_preference: "warm_golden",
    },
  },
  {
    name: "Sapphire Cloud & Labs",
    industry: "Software & Technology",
    description: "Developer platform for multi-agent autonomous creative workflows and real-time canvas rendering.",
    positioning: "Next-generation generative AI infrastructure with zero-latency.",
    target_audience: "CTOs, design engineers, growth marketers, tech founders.",
    visual_identity: {
      logo_variants: ["matrix-blue"],
      primary_colors: ["#0F172A", "#F8FAFC"],
      secondary_colors: ["#7BA7D7", "#D97757"],
      fonts: {
        heading: "Plus Jakarta Sans",
        body: "Inter",
        serif: "Inter",
      },
      typography_rules: ["Clean micro-chrome", "Monospace stats"],
      photography_style: "Dark slate 3D card stacks, glowing matrix accents, architectural micro-details.",
      graphic_style: "SaaS dot-grid interface chrome.",
      image_preferences: ["Dark slate backdrops", "Floating UI modules", "Clean vector geometry"],
    },
    voice: {
      tone: "Sharp, authoritative, technical, visionary",
      vocabulary: ["Autonomous", "Orchestration", "Scale", "Latency", "Infrastructure"],
      sentence_style: "Direct value proposition with benchmark metrics.",
      cta_style: "Direct developer action",
      forbidden_phrases: ["Magic AI", "Effortless buttons"],
      preferred_phrases: ["Deploy in seconds", "Precision architecture"],
    },
    learned_preferences: {
      preferred_visual_styles: [],
      preferred_compositions: [],
      preferred_hooks: [],
      preferred_caption_styles: [],
      logo_prominence: { value: "top_capsule", confidence: 0.9, evidence_count: 5, source: "selection_pattern" },
      color_preferences: [],
      archetype_affinity: {
        editorial_magazine: 0.3,
        conceptual_split: 0.88,
        comparison_split: 0.82,
        vintage_poster: 0.15,
        saas_dotgrid: 0.95,
      },
      typography_density_preference: "detailed_value_props",
      visual_temperature_preference: "cool_dark",
    },
  },
  {
    name: "Aura Botanicals & Rituals",
    industry: "Health & Organic Wellness",
    description: "Holistic herbal remedies, cold-pressed botanical essences, and mindful daily rituals.",
    positioning: "Purity of nature formulated for modern calm.",
    target_audience: "Wellness enthusiasts, organic lifestyle practitioners.",
    visual_identity: {
      logo_variants: ["leaf-crest"],
      primary_colors: ["#1E4D2B", "#FAF7EE"],
      secondary_colors: ["#87A96B", "#D97757"],
      fonts: {
        heading: "Outfit",
        body: "Plus Jakarta Sans",
        serif: "Playfair Display",
      },
      typography_rules: ["Clean botanical badges", "Subtle organic borders"],
      photography_style: "Soft natural overcast lighting, dewy botanical textures, minimal glass droppers.",
      graphic_style: "Clean neo-vintage organic poster with botanical stamps.",
      image_preferences: ["Earthy green palettes", "Natural sunlight", "Dewdrops on leaves"],
    },
    voice: {
      tone: "Gentle, serene, scientifically grounded, nurturing",
      vocabulary: ["Botanical", "Essence", "Ritual", "Restoration", "Purity"],
      sentence_style: "Calming cadence focusing on self-care rituals.",
      cta_style: "Gentle invitation to restore",
      forbidden_phrases: ["Miracle cure", "Quick fix"],
      preferred_phrases: ["Daily restorative ritual", "Pure organic harvest"],
    },
    learned_preferences: {
      preferred_visual_styles: [],
      preferred_compositions: [],
      preferred_hooks: [],
      preferred_caption_styles: [],
      logo_prominence: { value: "subtle_badge", confidence: 0.88, evidence_count: 4, source: "selection_pattern" },
      color_preferences: [],
      archetype_affinity: {
        editorial_magazine: 0.85,
        conceptual_split: 0.4,
        comparison_split: 0.5,
        vintage_poster: 0.92,
        saas_dotgrid: 0.1,
      },
      typography_density_preference: "minimalist_punchy",
      visual_temperature_preference: "neutral_studio",
    },
  },
];

interface BrandSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBrandName: string;
  onSelectBrand: (brand: BrandProfile) => void;
}

export const BrandSwitcherModal: React.FC<BrandSwitcherModalProps> = ({
  isOpen,
  onClose,
  activeBrandName,
  onSelectBrand,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredBrands = PRECONFIGURED_BRANDS.filter(
    (b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative max-w-lg w-full bg-sapphire-surface border border-sapphire-border rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sapphire-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sapphire-terracotta/15 flex items-center justify-center text-sapphire-terracotta">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-text-sm text-sapphire-dark">
                Switch Active Brand Profile
              </h3>
              <p className="text-[11px] text-sapphire-muted">
                Loads brand voice DNA, color science, and learned taste vectors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-sapphire-border bg-sapphire-bg/50">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search brands or industries..."
            className="w-full px-3 py-2 text-text-xs rounded-lg border border-sapphire-border bg-sapphire-surface outline-none focus:border-white/30 text-sapphire-dark placeholder:text-sapphire-muted/60"
            autoFocus
          />
        </div>

        {/* Brand List */}
        <div className="p-3 overflow-y-auto max-h-[380px] space-y-2">
          {filteredBrands.map((brand) => {
            const isSelected = brand.name === activeBrandName;
            return (
              <div
                key={brand.name}
                onClick={() => {
                  onSelectBrand(brand);
                  onClose();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  isSelected
                    ? "bg-sapphire-subtle/80 border-sapphire-terracotta/60 ring-1 ring-sapphire-terracotta/30"
                    : "bg-sapphire-surface border-sapphire-border hover:border-white/20 hover:bg-sapphire-subtle/40"
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-text-xs text-sapphire-dark">
                      {brand.name}
                    </span>
                    <span className="text-[10px] text-sapphire-muted bg-sapphire-bg px-2 py-0.5 rounded border border-sapphire-border">
                      {brand.industry}
                    </span>
                  </div>
                  <p className="text-[11px] text-sapphire-muted leading-tight line-clamp-2">
                    {brand.description}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="flex items-center gap-1">
                      {brand.visual_identity.secondary_colors.map((c) => (
                        <span
                          key={c}
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-sapphire-muted font-mono">
                      {brand.visual_identity.fonts.heading}
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  {isSelected ? (
                    <span className="w-6 h-6 rounded-full bg-sapphire-terracotta text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[11px] text-sapphire-muted font-medium hover:text-sapphire-dark">
                      Select
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sapphire-border bg-sapphire-bg/60 flex items-center justify-between text-text-xs text-sapphire-muted">
          <span>{PRECONFIGURED_BRANDS.length} Brand Profiles available</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-sapphire-border bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-subtle transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
