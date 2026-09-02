"use client";
import React, { useState, useEffect } from "react";
import { BrandProfile } from "@/lib/schema/brand";
import { WorkspaceOnboardingModal } from "@/components/workspace/workspace-onboarding-modal";
import {
  Globe,
  User,
  Sparkles,
  ArrowRight,
  Trash2,
  Search,
  ExternalLink,
  Plus,
  Layers,
  ArrowLeft,
  Building2,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

import {
  STORAGE_KEY,
  ACTIVE_WORKSPACE_KEY,
  mergeWorkspaces,
  getLocalWorkspaces,
  saveLocalWorkspace,
  slugify,
} from "@/lib/utils/workspace-sync";

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<BrandProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [onboardingPath, setOnboardingPath] = useState<"client_extract" | "personal" | "select">("select");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load workspaces safely: local first, then merge server without wiping local
  useEffect(() => {
    let isMounted = true;

    async function loadWorkspaces() {
      // 1. Initial immediate load from local cache
      const cached = getLocalWorkspaces();
      if (isMounted) {
        setWorkspaces(cached);
      }

      // 2. Fetch global workspaces from Supabase via API & merge
      try {
        const res = await fetch("/api/workspaces");
        if (res.ok) {
          const data = await res.json();
          if (data.workspaces && Array.isArray(data.workspaces) && data.workspaces.length > 0) {
            if (isMounted) {
              const merged = mergeWorkspaces(cached, data.workspaces);
              setWorkspaces(merged);
              if (typeof window !== "undefined") {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              }
            }
          }
        }
      } catch (apiErr) {
        console.warn("Could not fetch global workspaces from server:", apiErr);
      }
    }

    loadWorkspaces();
    return () => {
      isMounted = false;
    };
  }, []);

  // Save workspaces to both Supabase database and localStorage
  const saveWorkspaces = async (updated: BrandProfile[], newBrandToPersist?: BrandProfile) => {
    setWorkspaces(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    if (newBrandToPersist) {
      try {
        await fetch("/api/workspaces", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBrandToPersist),
        });
      } catch (err) {
        console.warn("Error persisting workspace globally:", err);
      }
    }
  };

  const handleOpenOnboarding = (path: "client_extract" | "personal") => {
    setOnboardingPath(path);
    setIsOnboardingOpen(true);
  };

  const handleOnboardingComplete = async (newBrand: BrandProfile) => {
    const slug = slugify(newBrand.name);
    const brandWithId: BrandProfile = {
      ...newBrand,
      id: newBrand.id || slug,
    };

    // 1. Save to local storage immediately
    const updated = saveLocalWorkspace(brandWithId);
    setWorkspaces(updated);
    setIsOnboardingOpen(false);

    // 2. Persist to Supabase
    try {
      await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brandWithId),
      });
    } catch (err) {
      console.warn("Error persisting workspace globally:", err);
    }

    // 3. Set active workspace in local storage & navigate
    if (typeof window !== "undefined") {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, brandWithId.id || slug);
    }
    router.push(`/?workspace=${brandWithId.id || slug}`);
  };


  const handleDeleteWorkspace = async (id?: string) => {
    if (!id) return;
    const updated = workspaces.filter((w) => w.id !== id);
    setWorkspaces(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    setDeleteConfirmId(null);

    try {
      await fetch(`/api/workspaces?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("Error deleting workspace globally:", err);
    }
  };

  const filteredWorkspaces = workspaces.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-sapphire-bg text-sapphire-dark flex flex-col font-sans selection:bg-sapphire-subtle">
      {/* 1. Header Row 1 & 2 */}
      <header className="border-b border-sapphire-border/80 bg-sapphire-surface sticky top-0 z-30 px-6 py-3.5 select-none shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-sapphire-border bg-sapphire-surface flex items-center justify-center p-1 shadow-hairline group-hover:border-sapphire-terracotta transition-colors">
                <Image
                  src="/logo.png"
                  alt="Sapphire"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-text-sm tracking-tight text-sapphire-dark">
                  Sapphire
                </span>
                <span className="text-[10px] text-sapphire-muted font-mono tracking-wide">
                  Workspace Portal
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-text-xs font-medium bg-sapphire-bg hover:bg-sapphire-subtle border border-sapphire-border text-sapphire-dark transition-colors shadow-hairline"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-sapphire-muted" />
              <span>Back to Studio</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Main Portal Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-12">
        {/* Hero Section */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-text-xs font-medium bg-sapphire-terracotta/10 text-sapphire-terracotta border border-sapphire-terracotta/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Brand Intelligence & Workspace Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
            Create or Select a Workspace
          </h1>
          <p className="text-text-sm text-zinc-400 leading-relaxed">
            Extract brand DNA directly from any client website or calibrate a bespoke personal creator identity.
          </p>
        </div>

        {/* Top Section: Two Primary Onboarding Flows (High-End Dashboard Hero Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Path A: Client Brand Workspace (OpenBrand Extraction) */}
          <div
            onClick={() => handleOpenOnboarding("client_extract")}
            className="p-10 sm:p-12 rounded-3xl bg-zinc-900/60 hover:bg-zinc-900/90 transition-all duration-300 cursor-pointer group shadow-lg flex flex-col justify-between relative overflow-hidden border border-white/5 hover:border-white/15"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-sapphire-terracotta/5 rounded-full blur-3xl pointer-events-none group-hover:bg-sapphire-terracotta/10 transition-colors" />

            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-sapphire-terracotta/10 border border-sapphire-terracotta/20 flex items-center justify-center text-sapphire-terracotta group-hover:scale-105 transition-transform">
                <Globe className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-zinc-100 tracking-tight group-hover:text-sapphire-terracotta transition-colors">
                    Client Brand Workspace
                  </h2>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-sapphire-terracotta/10 text-sapphire-terracotta uppercase tracking-wider">
                    Autonomous
                  </span>
                </div>
                <p className="text-text-xs md:text-[13px] text-zinc-400 leading-relaxed">
                  Enter any client website URL. Sapphire’s OpenBrand crawler autonomously extracts color palettes, typography rules, logos, taglines, and positioning into a durable Brand Brain.
                </p>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-between text-text-xs font-semibold text-sapphire-terracotta group-hover:translate-x-1 transition-transform">
              <span>Extract Client Brand</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Path B: Personal / Creator Workspace */}
          <div
            onClick={() => handleOpenOnboarding("personal")}
            className="p-10 sm:p-12 rounded-3xl bg-zinc-900/60 hover:bg-zinc-900/90 transition-all duration-300 cursor-pointer group shadow-lg flex flex-col justify-between relative overflow-hidden border border-white/5 hover:border-white/15"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition-colors" />

            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-200 group-hover:scale-105 transition-transform">
                <User className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-zinc-100 tracking-tight group-hover:text-white transition-colors">
                    Personal Creator Workspace
                  </h2>
                  <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 uppercase tracking-wider border border-white/5">
                    Cognitive
                  </span>
                </div>
                <p className="text-text-xs md:text-[13px] text-zinc-400 leading-relaxed">
                  Tailored for creators, agencies, and founders. Answer strategic cognitive questions, select a customized multi-color palette, and pick from 4 curated design templates.
                </p>
              </div>
            </div>

            <div className="pt-8 flex items-center justify-between text-text-xs font-semibold text-zinc-200 group-hover:translate-x-1 transition-transform">
              <span>Setup Personal Brand</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Bottom Section: Existing Workspaces Grid */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight">
                Your Workspaces ({workspaces.length})
              </h2>
              <p className="text-text-xs text-zinc-400">
                Select a client workspace to enter the creative studio canvas.
              </p>
            </div>

            {workspaces.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-text-xs rounded-xl bg-zinc-900 border border-white/5 focus:outline-none focus:border-sapphire-terracotta text-zinc-200 transition-colors"
                />
              </div>
            )}
          </div>

          {filteredWorkspaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorkspaces.map((brand) => {
                const brandId = brand.id || brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                const isDeleting = deleteConfirmId === brandId;
                const colors = [
                  ...(brand.visual_identity?.primary_colors || []),
                  ...(brand.visual_identity?.secondary_colors || []),
                ].slice(0, 4);

                return (
                  <div
                    key={brandId}
                    className="p-6 rounded-2xl bg-zinc-900/70 border border-white/5 hover:border-white/15 transition-all duration-200 flex flex-col justify-between group relative shadow-md"
                  >
                    <div className="space-y-4">
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center font-bold text-text-sm text-zinc-200">
                            {brand.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-text-sm text-zinc-100 group-hover:text-sapphire-terracotta transition-colors">
                              {brand.name}
                            </h3>
                            <span className="text-[11px] text-zinc-400">
                              {brand.industry}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        {isDeleting ? (
                          <div className="flex items-center gap-1 bg-red-950/80 p-1 rounded-lg border border-red-800">
                            <button
                              onClick={() => handleDeleteWorkspace(brandId)}
                              className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-medium hover:bg-red-700"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-[10px] px-1.5 py-0.5 rounded text-zinc-400 hover:text-zinc-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(brandId)}
                            title="Delete workspace"
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/40 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Positioning / Description */}
                      <p className="text-text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {brand.positioning || brand.description || "Active Brand Brain with customized visual rules."}
                      </p>

                      {/* Color Palette Tokens */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {colors.map((c, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-white/10 shadow-hairline"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                        <span className="text-[10px] font-mono text-zinc-500 ml-1">
                          {brand.visual_identity?.fonts?.heading || "Plus Jakarta Sans"}
                        </span>
                      </div>
                    </div>

                    {/* Open Studio Action */}
                    <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500">
                        {brand.social_handle || "@brand"}
                      </span>
                      <button
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            localStorage.setItem(ACTIVE_WORKSPACE_KEY, brandId);
                          }
                          router.push(`/?workspace=${brandId}`);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-text-xs font-semibold bg-zinc-800 hover:bg-sapphire-terracotta hover:text-white border border-white/5 transition-all shadow-sm"
                      >
                        <span>Open Studio</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 px-6 rounded-3xl border border-white/5 bg-zinc-900/40 space-y-3 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-zinc-800 mx-auto flex items-center justify-center text-zinc-400 border border-white/5">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-text-sm font-semibold text-zinc-200">
                No Workspaces Created Yet
              </h3>
              <p className="text-text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Select Client Workspace or Personal Creator above to configure your first Brand Brain.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Onboarding Modal Component */}

      <WorkspaceOnboardingModal
        isOpen={isOnboardingOpen}
        initialPath={onboardingPath}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={handleOnboardingComplete}
      />
    </div>
  );
}
