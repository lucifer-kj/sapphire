"use client";
import React, { useState } from "react";
import { PRECONFIGURED_BRANDS } from "@/lib/constants/brands";
import { BrandProfile } from "@/lib/schema/brand";
import { WorkspaceGrid } from "@/components/workspace/workspace-grid";
import {
  Building2,
  Sparkles,
  Plus,
  ArrowLeft,
  ArrowRight,
  Palette,
  Layers,
  ShieldCheck,
  Check,
  X,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WorkspacesPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<(BrandProfile & { id: string })[]>(PRECONFIGURED_BRANDS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Brand Form State
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandIndustry, setNewBrandIndustry] = useState("Hospitality & Lifestyle");
  const [newBrandPositioning, setNewBrandPositioning] = useState("");
  const [newBrandHandle, setNewBrandHandle] = useState("@mybrand");
  const [newBrandHeadingFont, setNewBrandHeadingFont] = useState("Playfair Display");
  const [newBrandTone, setNewBrandTone] = useState("Sophisticated, authentic, inspiring");
  const [newBrandPrimaryColor, setNewBrandPrimaryColor] = useState("#181816");
  const [newBrandAccentColor, setNewBrandAccentColor] = useState("#D97757");

  const handleCreateBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    const slug = newBrandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const created: BrandProfile & { id: string } = {
      id: slug,
      name: newBrandName.trim(),
      industry: newBrandIndustry,
      positioning: newBrandPositioning || "Contemporary editorial brand storytelling.",
      social_handle: newBrandHandle,
      visual_identity: {
        logo_variants: [],
        primary_colors: [newBrandPrimaryColor, "#FAF9F5"],
        secondary_colors: [newBrandAccentColor, "#7BA7D7"],
        fonts: {
          heading: newBrandHeadingFont,
          body: "Plus Jakarta Sans",
          serif: newBrandHeadingFont,
        },
        typography_rules: ["Clean, modern editorial layout"],
        photography_style: "Studio commercial photography, natural authentic lighting, soft shadows.",
        graphic_style: "Clean minimal editorial layout.",
        image_preferences: ["Warm natural tones"],
      },
      voice: {
        tone: newBrandTone,
        vocabulary: ["Authentic", "Craft", "Precision"],
        sentence_style: "Concise hooks with clear value propositions.",
        cta_style: "Subtle engagement",
        forbidden_phrases: ["Cheap deals", "Act fast!"],
        preferred_phrases: ["Crafted with care"],
      },
      learned_preferences: {
        preferred_visual_styles: [],
        preferred_compositions: [],
        preferred_hooks: [],
        preferred_caption_styles: [],
        color_preferences: [],
        archetype_affinity: {
          editorial_magazine: 0.85,
          conceptual_split: 0.5,
          comparison_split: 0.5,
          vintage_poster: 0.7,
          saas_dotgrid: 0.3,
        },
        typography_density_preference: "minimalist_punchy",
        visual_temperature_preference: "warm_golden",
      },
    };

    setBrands((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    // Navigate to studio with newly created workspace
    router.push(`/?workspace=${created.id}`);
  };

  return (
    <div className="min-h-screen bg-sapphire-bg text-sapphire-dark flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-sapphire-border/60 bg-sapphire-surface/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle transition-colors flex items-center gap-1.5 text-text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Studio
            </Link>
            <div className="h-4 w-px bg-sapphire-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-sapphire-terracotta flex items-center justify-center text-white font-serif font-bold text-sm shadow-xs">
                S
              </div>
              <span className="font-serif font-bold text-text-md tracking-tight">Sapphire</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-sapphire-muted bg-sapphire-subtle px-2 py-0.5 rounded-full">
                Workspaces
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sapphire-dark text-white hover:bg-sapphire-dark/90 transition-all text-text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Client Workspace
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Hero Banner */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-sapphire-dark">
            Client Workspaces & Brand DNA
          </h1>
          <p className="text-text-sm text-sapphire-muted max-w-2xl leading-relaxed">
            Select an active client workspace to load its custom typography hierarchy, color harmonies, photography mood, and brand voice guidelines directly into the autonomous creative generation engine.
          </p>
        </div>

        {/* Workspace Cards */}
        <WorkspaceGrid
          brands={brands}
          onSelectWorkspace={(brand) => {
            router.push(`/?workspace=${brand.id}`);
          }}
        />
      </main>

      {/* Create New Brand Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sapphire-dark/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-sapphire-bg border border-sapphire-border rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-sapphire-border flex items-center justify-between bg-sapphire-surface">
              <div className="flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-sapphire-terracotta" />
                <h3 className="font-serif font-semibold text-text-lg text-sapphire-dark">
                  New Client Workspace
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                  Brand / Client Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luminary Architects"
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sapphire-border bg-sapphire-surface text-sapphire-dark text-text-sm focus:outline-none focus:border-sapphire-terracotta focus:ring-1 focus:ring-sapphire-terracotta"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Architecture & Design"
                    value={newBrandIndustry}
                    onChange={(e) => setNewBrandIndustry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs"
                  />
                </div>
                <div>
                  <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    placeholder="@handle"
                    value={newBrandHandle}
                    onChange={(e) => setNewBrandHandle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                  Brand Positioning & Purpose
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Sustainable luxury architectural design for forward-thinking spaces."
                  value={newBrandPositioning}
                  onChange={(e) => setNewBrandPositioning(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs focus:outline-none focus:border-sapphire-terracotta"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                    Primary Headline Font
                  </label>
                  <select
                    value={newBrandHeadingFont}
                    onChange={(e) => setNewBrandHeadingFont(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs"
                  >
                    <option value="Playfair Display">Playfair Display (Serif)</option>
                    <option value="Outfit">Outfit (Geometric)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern)</option>
                    <option value="Inter">Inter (Clean Clean)</option>
                    <option value="Cinzel">Cinzel (Luxury Classic)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                    Brand Voice Tone
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Visionary, calm, precise"
                    value={newBrandTone}
                    onChange={(e) => setNewBrandTone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-sapphire-border bg-sapphire-surface text-text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newBrandPrimaryColor}
                      onChange={(e) => setNewBrandPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={newBrandPrimaryColor}
                      onChange={(e) => setNewBrandPrimaryColor(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-sapphire-border bg-sapphire-surface text-text-xs font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-text-xs font-semibold text-sapphire-dark mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newBrandAccentColor}
                      onChange={(e) => setNewBrandAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={newBrandAccentColor}
                      onChange={(e) => setNewBrandAccentColor(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-sapphire-border bg-sapphire-surface text-text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-sapphire-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-text-xs font-semibold text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-semibold hover:bg-sapphire-terracotta/90 shadow-sm"
                >
                  Create & Launch Studio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
