"use client";
import React, { useState, useEffect } from "react";
import { BrandProfile, LearnedPreferences } from "@/lib/schema/brand";
import {
  X,
  BrainCircuit,
  Sliders,
  Check,
  Mail,
  Flame,
  Type,
  Layers,
  Sparkles,
  RefreshCw,
  Clock,
  Zap,
} from "lucide-react";

interface QuotaInfo {
  configured?: boolean;
  totalNeurons?: number;
  limit?: number;
  dailyLimitNeurons?: number;
  remainingNeurons: number;
  percentUsed: number;
  resetsIn: string;
  estimatedPostsRemaining: number;
  requestsToday?: number;
  provider?: string;
}

interface BrandBrainDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  brand: BrandProfile;
  quotaInfo?: QuotaInfo | null;
  onRefreshQuota?: () => void;
  isRefreshingQuota?: boolean;
  onSavePreferences: (prefs: LearnedPreferences, deliveryEmail?: string) => void;
}


export const BrandBrainDrawer: React.FC<BrandBrainDrawerProps> = ({
  isOpen,
  onClose,
  brand,
  quotaInfo,
  onRefreshQuota,
  isRefreshingQuota = false,
  onSavePreferences,
}) => {
  const [affinities, setAffinities] = useState<Record<string, number>>({
    editorial_magazine: 0.85,
    conceptual_split: 0.6,
    comparison_split: 0.4,
    vintage_poster: 0.7,
    saas_dotgrid: 0.3,
  });

  const [density, setDensity] = useState<"minimalist_punchy" | "detailed_value_props" | "balanced">(
    "minimalist_punchy"
  );
  const [temperature, setTemperature] = useState<
    "warm_golden" | "neutral_studio" | "cool_dark" | "vibrant_contrast"
  >("warm_golden");

  const [email, setEmail] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (brand.learned_preferences) {
      if (brand.learned_preferences.archetype_affinity) {
        setAffinities(brand.learned_preferences.archetype_affinity);
      }
      if (brand.learned_preferences.typography_density_preference) {
        setDensity(brand.learned_preferences.typography_density_preference);
      }
      if (brand.learned_preferences.visual_temperature_preference) {
        setTemperature(brand.learned_preferences.visual_temperature_preference);
      }
    }
  }, [brand]);

  if (!isOpen) return null;

  const handleSliderChange = (archetype: string, val: number) => {
    setAffinities((prev) => ({ ...prev, [archetype]: val }));
  };

  const handleSave = () => {
    const updated: LearnedPreferences = {
      preferred_visual_styles: brand.learned_preferences?.preferred_visual_styles || [],
      preferred_compositions: brand.learned_preferences?.preferred_compositions || [],
      preferred_hooks: brand.learned_preferences?.preferred_hooks || [],
      preferred_caption_styles: brand.learned_preferences?.preferred_caption_styles || [],
      logo_prominence: brand.learned_preferences?.logo_prominence || {
        value: "subtle_bottom_corner",
        confidence: 0.9,
        evidence_count: 5,
        source: "explicit_feedback",
      },
      color_preferences: brand.learned_preferences?.color_preferences || [],
      archetype_affinity: affinities,
      typography_density_preference: density,
      visual_temperature_preference: temperature,
    };

    onSavePreferences(updated, email.trim() || undefined);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-sapphire-bg h-full shadow-2xl flex flex-col border-l border-sapphire-border text-sapphire-dark">
        {/* Header */}
        <div className="p-4 bg-sapphire-surface border-b border-sapphire-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sapphire-terracotta/15 flex items-center justify-center text-sapphire-terracotta">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-text-sm font-semibold text-sapphire-dark">
                Brand Brain & Settings
              </h2>
              <p className="text-text-xs text-sapphire-muted">
                {brand.name} • Instagram Creative Memory & Quotas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-sapphire-subtle text-sapphire-muted hover:text-sapphire-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Brand DNA Overview Card */}
          <div className="p-4 rounded-2xl bg-sapphire-surface border border-sapphire-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sapphire-dark text-text-sm">{brand.name}</span>
              <span className="text-[10px] text-sapphire-green font-medium bg-sapphire-green/10 px-2 py-0.5 rounded-full border border-sapphire-green/20">
                Active Brand Profile
              </span>
            </div>
            <p className="text-text-xs text-sapphire-muted leading-relaxed">
              {brand.positioning}
            </p>
            <div className="flex items-center gap-2 pt-1 border-t border-sapphire-border/50 text-[11px] text-sapphire-muted">
              <span className="font-medium text-sapphire-dark">Industry:</span>
              <span>{brand.industry}</span>
              <span className="text-sapphire-border">•</span>
              <span className="font-medium text-sapphire-dark">Handle:</span>
              <span>{brand.social_handle || "@vagabondtravel"}</span>
            </div>

          </div>

          {/* Cloudflare Quota Status Widget */}
          <div className="p-4 rounded-2xl bg-sapphire-surface border border-sapphire-border space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-sapphire-green" />
                <h3 className="font-semibold text-text-xs uppercase tracking-wider text-sapphire-dark">
                  Cloudflare FLUX Quota Tracker
                </h3>
              </div>
              {onRefreshQuota && (
                <button
                  type="button"
                  onClick={onRefreshQuota}
                  disabled={isRefreshingQuota}
                  title="Refresh Quota"
                  className="p-1 rounded hover:bg-sapphire-subtle text-sapphire-muted hover:text-sapphire-dark transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingQuota ? "animate-spin" : ""}`} />
                </button>
              )}
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-sapphire-muted">
                <span>
                  {quotaInfo
                    ? `${quotaInfo.remainingNeurons.toLocaleString()} / 10k Neurons Available`
                    : "Connecting to Cloudflare Workers AI..."}
                </span>
                {quotaInfo && (
                  <span className="text-sapphire-dark font-medium font-sans">
                    ~{quotaInfo.estimatedPostsRemaining} generations left
                  </span>
                )}
              </div>
              <div className="w-full bg-sapphire-subtle rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sapphire-terracotta h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max(5, 100 - (quotaInfo?.percentUsed || 0))}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-sapphire-muted font-sans pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Daily Reset: {quotaInfo?.resetsIn || "00:00 UTC"}
                </span>
                <span className="text-sapphire-green font-medium">Free Tier Active</span>
              </div>
            </div>
          </div>

          {/* Section 1: Archetype Affinities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-sapphire-border pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sapphire-terracotta" />
                <h3 className="font-semibold text-text-xs uppercase tracking-wider text-sapphire-muted">
                  Visual Archetype Win Rates
                </h3>
              </div>
              <span className="text-[11px] text-sapphire-green font-medium">Bayesian Updated</span>
            </div>

            <div className="space-y-3.5 pt-1">
              {[
                { key: "editorial_magazine", label: "Editorial Magazine (Warm Depth / Playfair Serif)" },
                { key: "vintage_poster", label: "Vintage Poster (Organic Cream / Stamp Badges)" },
                { key: "conceptual_split", label: "Conceptual Split (50/50 Studio / Bold Highlight)" },
                { key: "comparison_split", label: "Comparison Split (Before & After / Duality)" },
                { key: "saas_dotgrid", label: "SaaS Dot-Grid (Card Stacks / Dark Slate)" },
              ].map(({ key, label }) => {
                const val = Math.round((affinities[key] ?? 0.5) * 100);
                return (
                  <div key={key} className="space-y-1.5 p-2.5 rounded-xl bg-sapphire-surface border border-sapphire-border">
                    <div className="flex items-center justify-between text-text-xs">
                      <span className="font-medium text-sapphire-dark">{label}</span>
                      <span className="font-mono text-sapphire-terracotta font-semibold">{val}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => handleSliderChange(key, parseInt(e.target.value, 10) / 100)}
                      className="w-full h-1.5 bg-sapphire-subtle rounded-lg appearance-none cursor-pointer accent-sapphire-terracotta"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Visual Temperature */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-sapphire-border pb-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-text-xs uppercase tracking-wider text-sapphire-muted">
                Visual Temperature Preference
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {[
                { id: "warm_golden", label: "Warm Golden Hour", desc: "Sun-drenched, creamy bokeh" },
                { id: "neutral_studio", label: "Neutral Studio", desc: "Crisp white & balanced lighting" },
                { id: "cool_dark", label: "Cool Dark Slate", desc: "Cinematic moody evening" },
                { id: "vibrant_contrast", label: "Vibrant High Contrast", desc: "Punchy dynamic saturation" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemperature(t.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    temperature === t.id
                      ? "bg-sapphire-subtle border-sapphire-terracotta ring-1 ring-sapphire-terracotta/40"
                      : "bg-sapphire-surface border-sapphire-border hover:bg-sapphire-subtle/50 text-sapphire-muted"
                  }`}
                >
                  <p className="text-text-xs font-semibold text-sapphire-dark">{t.label}</p>
                  <p className="text-[10px] text-sapphire-muted">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Typography Density */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-sapphire-border pb-2">
              <Type className="w-4 h-4 text-sapphire-blue" />
              <h3 className="font-semibold text-text-xs uppercase tracking-wider text-sapphire-muted">
                Instagram Copy Density
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: "minimalist_punchy", label: "Minimalist", desc: "Punchy 3-word hooks" },
                { id: "balanced", label: "Balanced", desc: "Hook + 2 value props" },
                { id: "detailed_value_props", label: "Detailed", desc: "In-depth bullet points" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDensity(d.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    density === d.id
                      ? "bg-sapphire-subtle border-sapphire-terracotta ring-1 ring-sapphire-terracotta/40"
                      : "bg-sapphire-surface border-sapphire-border hover:bg-sapphire-subtle/50"
                  }`}
                >
                  <p className="text-text-xs font-semibold text-sapphire-dark">{d.label}</p>
                  <p className="text-[10px] text-sapphire-muted">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 4: Delivery Recipient */}
          <div className="space-y-2 p-3 rounded-xl bg-sapphire-surface border border-sapphire-border">
            <div className="flex items-center gap-2 text-text-xs font-semibold text-sapphire-dark">
              <Mail className="w-4 h-4 text-sapphire-terracotta" />
              <span>Default Instagram Package Delivery Email</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. founder@brand.com"
              className="w-full p-2.5 text-text-xs rounded-lg border border-sapphire-border bg-sapphire-bg outline-none focus:border-white/30 text-sapphire-dark"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-sapphire-surface border-t border-sapphire-border flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-sapphire-border text-text-xs font-medium hover:bg-sapphire-subtle text-sapphire-dark transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-medium hover:bg-opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Preferences Saved!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save Taste Vectors</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
