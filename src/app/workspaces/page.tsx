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

const STORAGE_KEY = "sapphire_user_workspaces";

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<BrandProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [onboardingPath, setOnboardingPath] = useState<"client_extract" | "personal" | "select">("select");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load workspaces from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setWorkspaces(parsed);
          }
        }
      } catch (err) {
        console.warn("Error reading workspaces from storage:", err);
      }
    }
  }, []);

  // Save workspaces to localStorage
  const saveWorkspaces = (updated: BrandProfile[]) => {
    setWorkspaces(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleOpenOnboarding = (path: "client_extract" | "personal") => {
    setOnboardingPath(path);
    setIsOnboardingOpen(true);
  };

  const handleOnboardingComplete = (newBrand: BrandProfile) => {
    const brandWithId: BrandProfile = {
      ...newBrand,
      id: newBrand.id || newBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    };

    const updated = [brandWithId, ...workspaces.filter((w) => w.id !== brandWithId.id)];
    saveWorkspaces(updated);
    setIsOnboardingOpen(false);

    // Navigate to studio with the new workspace
    router.push(`/?workspace=${brandWithId.id}`);
  };

  const handleDeleteWorkspace = (id?: string) => {
    if (!id) return;
    const updated = workspaces.filter((w) => w.id !== id);
    saveWorkspaces(updated);
    setDeleteConfirmId(null);
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
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-text-xs font-medium bg-sapphire-terracotta/10 text-sapphire-terracotta border border-sapphire-terracotta/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Autonomous Brand Intelligence & Workspace Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-sapphire-dark">
            Create or Select a Workspace
          </h1>
          <p className="text-text-sm text-sapphire-muted max-w-2xl leading-relaxed">
            Extract brand DNA directly from any client website or calibrate a bespoke personal creator identity.
          </p>
        </div>

        {/* Top Section: Two Primary Onboarding Flows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Path A: Client Brand Workspace (OpenBrand Extraction) */}
          <div
            onClick={() => handleOpenOnboarding("client_extract")}
            className="p-7 rounded-2xl bg-sapphire-surface border border-sapphire-border hover:border-sapphire-terracotta transition-all duration-300 cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sapphire-terracotta/5 rounded-full blur-2xl pointer-events-none group-hover:bg-sapphire-terracotta/10 transition-colors" />

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sapphire-terracotta/10 border border-sapphire-terracotta/20 flex items-center justify-center text-sapphire-terracotta group-hover:scale-105 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-sapphire-dark group-hover:text-sapphire-terracotta transition-colors">
                    Client Brand Workspace
                  </h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sapphire-terracotta/10 text-sapphire-terracotta uppercase tracking-wider">
                    Autonomous
                  </span>
                </div>
                <p className="text-text-xs text-sapphire-muted leading-relaxed">
                  Enter any client website URL. Sapphire’s OpenBrand crawler autonomously extracts color palettes, typography rules, logos, taglines, and positioning into a durable Brand Brain.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-text-xs font-semibold text-sapphire-terracotta group-hover:translate-x-1 transition-transform">
              <span>Extract Client Brand</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Path B: Personal / Creator Workspace */}
          <div
            onClick={() => handleOpenOnboarding("personal")}
            className="p-7 rounded-2xl bg-sapphire-surface border border-sapphire-border hover:border-sapphire-dark transition-all duration-300 cursor-pointer group shadow-xs hover:shadow-md flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sapphire-subtle rounded-full blur-2xl pointer-events-none group-hover:bg-sapphire-border/50 transition-colors" />

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sapphire-subtle border border-sapphire-border flex items-center justify-center text-sapphire-dark group-hover:scale-105 transition-transform">
                <User className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-sapphire-dark group-hover:text-sapphire-dark transition-colors">
                    Personal Creator Workspace
                  </h2>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sapphire-subtle text-sapphire-dark uppercase tracking-wider border border-sapphire-border">
                    Cognitive
                  </span>
                </div>
                <p className="text-text-xs text-sapphire-muted leading-relaxed">
                  Tailored for creators, agencies, and founders. Answer strategic cognitive questions, select a customized multi-color palette, and pick from 4 curated design templates.
                </p>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-text-xs font-semibold text-sapphire-dark group-hover:translate-x-1 transition-transform">
              <span>Setup Personal Brand</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Bottom Section: Existing Workspaces Grid */}
        <div className="space-y-6 pt-4 border-t border-sapphire-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-sapphire-dark">
                Your Workspaces ({workspaces.length})
              </h2>
              <p className="text-text-xs text-sapphire-muted">
                Select a client workspace to enter the creative studio canvas.
              </p>
            </div>

            {workspaces.length > 0 && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-sapphire-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-text-xs rounded-xl bg-sapphire-surface border border-sapphire-border focus:outline-none focus:border-sapphire-terracotta transition-colors"
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
                    className="p-5 rounded-2xl bg-sapphire-surface border border-sapphire-border hover:border-sapphire-terracotta/80 transition-all duration-200 flex flex-col justify-between group relative shadow-xs"
                  >
                    <div className="space-y-4">
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-sapphire-bg border border-sapphire-border flex items-center justify-center font-bold text-text-sm text-sapphire-dark">
                            {brand.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-text-sm text-sapphire-dark group-hover:text-sapphire-terracotta transition-colors">
                              {brand.name}
                            </h3>
                            <span className="text-[11px] text-sapphire-muted">
                              {brand.industry}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        {isDeleting ? (
                          <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200">
                            <button
                              onClick={() => handleDeleteWorkspace(brandId)}
                              className="text-[10px] px-2 py-0.5 rounded bg-red-600 text-white font-medium hover:bg-red-700"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-[10px] px-1.5 py-0.5 rounded text-sapphire-muted hover:text-sapphire-dark"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(brandId)}
                            title="Delete workspace"
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-sapphire-muted hover:text-red-600 hover:bg-red-50 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Positioning / Description */}
                      <p className="text-text-xs text-sapphire-muted line-clamp-2 leading-relaxed">
                        {brand.positioning || brand.description || "Active Brand Brain with customized visual rules."}
                      </p>

                      {/* Color Palette Tokens */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {colors.map((c, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-sapphire-border shadow-hairline"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))}
                        <span className="text-[10px] font-mono text-sapphire-muted ml-1">
                          {brand.visual_identity?.fonts?.heading || "Plus Jakarta Sans"}
                        </span>
                      </div>
                    </div>

                    {/* Open Studio Action */}
                    <div className="pt-5 mt-4 border-t border-sapphire-border/50 flex items-center justify-between">
                      <span className="text-[11px] text-sapphire-muted">
                        {brand.social_handle || "@brand"}
                      </span>
                      <button
                        onClick={() => router.push(`/?workspace=${brandId}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-text-xs font-semibold bg-sapphire-bg hover:bg-sapphire-terracotta hover:text-white border border-sapphire-border transition-all shadow-hairline"
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
            <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-sapphire-border bg-sapphire-surface/50 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sapphire-subtle mx-auto flex items-center justify-center text-sapphire-muted">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-text-sm font-semibold text-sapphire-dark">
                No Workspaces Created Yet
              </h3>
              <p className="text-text-xs text-sapphire-muted max-w-sm mx-auto">
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
