"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Sparkles,
  Layers,
  BrainCircuit,
  Activity,
  BookOpen,
  Image as ImageIcon,
  Sliders,
  X,
  ArrowRight,
  Check,
  Zap,
  Globe,
  Briefcase,
  Camera,
  FolderOpen,
} from "lucide-react";
import { PRECONFIGURED_BRANDS } from "@/lib/constants/brands";
import { BrandProfile } from "@/lib/schema/brand";
import { GenerationMode, Platform } from "@/modules/prompt-intelligence/domain/prompt-intent";

export interface CommandItem {
  id: string;
  category: "Navigation" | "Brands" | "Generation Mode" | "Platform" | "View & Layout" | "Quick Templates";
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeBrand: string;
  onSelectBrand: (brand: BrandProfile) => void;
  generationMode: GenerationMode;
  onSetGenerationMode: (mode: GenerationMode) => void;
  activePlatform: Platform;
  onSetPlatform: (platform: Platform) => void;
  onOpenNodeGraph: () => void;
  onOpenKnowledgeBase: () => void;
  onOpenBrandBrain: () => void;
  onOpenTelemetry: () => void;
  onOpenOnboarding: () => void;
  onSelectTemplate?: (promptText: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  activeBrand,
  onSelectBrand,
  generationMode,
  onSetGenerationMode,
  activePlatform,
  onSetPlatform,
  onOpenNodeGraph,
  onOpenKnowledgeBase,
  onOpenBrandBrain,
  onOpenTelemetry,
  onOpenOnboarding,
  onSelectTemplate,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build command list
  const commands: CommandItem[] = [
    // Mode Switching
    {
      id: "mode-prompt-only",
      category: "Generation Mode",
      title: "Switch to Prompt Intelligence Mode",
      subtitle: "Generate production-ready, model-tuned prompts and critic audits",
      icon: <Sparkles className="w-4 h-4 text-sapphire-terracotta" />,
      action: () => {
        onSetGenerationMode("prompt_only");
        onClose();
      },
    },
    {
      id: "mode-campaign",
      category: "Generation Mode",
      title: "Switch to Creative Campaign Generation",
      subtitle: "Full multi-agent visual generation (V1 Paused / Quarantine)",
      icon: <ImageIcon className="w-4 h-4 text-zinc-400" />,
      action: () => {
        onSetGenerationMode("campaign");
        onClose();
      },
    },

    // Platform Switching
    {
      id: "platform-instagram",
      category: "Platform",
      title: "Set Platform: Instagram (4:5 Vertical Portrait)",
      subtitle: "Optimized for Instagram feed scroll-stopping velocity",
      icon: <Camera className="w-4 h-4 text-pink-400" />,
      action: () => {
        onSetPlatform("instagram");
        onClose();
      },
    },
    {
      id: "platform-linkedin",
      category: "Platform",
      title: "Set Platform: LinkedIn (4:5 / 1:1 Professional)",
      subtitle: "Optimized for executive clarity and conceptual frameworks",
      icon: <Briefcase className="w-4 h-4 text-blue-400" />,
      action: () => {
        onSetPlatform("linkedin");
        onClose();
      },
    },

    // Navigation & Modals
    {
      id: "nav-node-graph",
      category: "Navigation",
      title: "Open Visual Multi-Agent Node Graph",
      subtitle: "Inspect DAG orchestration context, payload variables, and RAG confidence",
      icon: <Layers className="w-4 h-4 text-amber-400" />,
      action: () => {
        onOpenNodeGraph();
        onClose();
      },
      shortcut: "G",
    },
    {
      id: "nav-knowledge-base",
      category: "Navigation",
      title: "Open Knowledge Base Manager",
      subtitle: "Inspect platform strategy markdown, model routing rules, and design matrices",
      icon: <BookOpen className="w-4 h-4 text-emerald-400" />,
      action: () => {
        onOpenKnowledgeBase();
        onClose();
      },
      shortcut: "K",
    },
    {
      id: "nav-brand-brain",
      category: "Navigation",
      title: "Open Brand Brain Configuration Drawer",
      subtitle: "Tune voice guidelines, visual palette, and Bayesian preferences",
      icon: <BrainCircuit className="w-4 h-4 text-purple-400" />,
      action: () => {
        onOpenBrandBrain();
        onClose();
      },
      shortcut: "B",
    },
    {
      id: "nav-telemetry",
      category: "Navigation",
      title: "Open Telemetry & Latency Trace Drawer",
      subtitle: "View step-by-step agent execution durations and LLM token metrics",
      icon: <Activity className="w-4 h-4 text-sapphire-blue" />,
      action: () => {
        onOpenTelemetry();
        onClose();
      },
      shortcut: "T",
    },
    {
      id: "nav-onboarding",
      category: "Navigation",
      title: "Workspace & Client Onboarding Portal",
      subtitle: "Switch workspaces or autonomously extract new Brand Brain from URL",
      icon: <FolderOpen className="w-4 h-4 text-zinc-400" />,
      action: () => {
        onOpenOnboarding();
        onClose();
      },
    },

    // Brands
    ...PRECONFIGURED_BRANDS.map((b) => ({
      id: `brand-${b.id}`,
      category: "Brands" as const,
      title: `Switch Brand to: ${b.name}`,
      subtitle: `${b.industry} • ${b.positioning}`,
      icon: (
        <div
          className="w-4 h-4 rounded-full border border-white/20 shrink-0"
          style={{ backgroundColor: b.visual_identity?.primary_colors?.[0] || "#D97757" }}
        />
      ),
      action: () => {
        onSelectBrand(b);
        onClose();
      },
    })),

    // Quick Templates
    {
      id: "template-hotel-kyoto",
      category: "Quick Templates",
      title: "Boutique Kyoto Hotel Retreat (Editorial)",
      subtitle: "Japanese autumn zen garden with serene traditional architecture",
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      action: () => {
        onSelectTemplate?.(
          "Luxury boutique hotel retreat in Kyoto, Japan during autumn with traditional timber architecture and serene zen garden atmosphere"
        );
        onClose();
      },
    },
    {
      id: "template-b2b-saas",
      category: "Quick Templates",
      title: "B2B SaaS Data Flywheel Framework (LinkedIn)",
      subtitle: "Executive conceptual breakdown of engineering velocity",
      icon: <Zap className="w-4 h-4 text-blue-400" />,
      action: () => {
        onSelectTemplate?.(
          "Why 90% of B2B AI startups fail to build a defensible data flywheel — executive framework"
        );
        onClose();
      },
    },
    {
      id: "template-coffee-roast",
      category: "Quick Templates",
      title: "Artisanal Coffee Bloom Ritual (Macro Editorial)",
      subtitle: "Single-origin pour-over with golden hour backlight and textured ceramic",
      icon: <Zap className="w-4 h-4 text-amber-500" />,
      action: () => {
        onSelectTemplate?.(
          "Artisanal single-origin Ethiopian coffee pour-over brewing ritual with blooming crema and golden morning sunlight"
        );
        onClose();
      },
    },
  ];

  // Filter commands by search query
  const filteredCommands = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  // Group commands by category
  const groupedCategories = Array.from(new Set(filteredCommands.map((c) => c.category)));

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 sm:pt-28 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-zinc-950/60 shrink-0">
          <Search className="w-5 h-5 text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, switch brands, toggle modes, or insert templates..."
            className="flex-1 bg-transparent border-none outline-none text-text-sm text-zinc-100 placeholder:text-zinc-500 font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-white/5">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 space-y-1">
              <Search className="w-6 h-6 mx-auto stroke-1 opacity-50 mb-2" />
              <p className="text-text-xs font-semibold text-zinc-400">No commands found</p>
              <p className="text-[11px]">Try searching for brand names, modes, or knowledge base.</p>
            </div>
          ) : (
            groupedCategories.map((category) => {
              const categoryCommands = filteredCommands.filter((c) => c.category === category);
              return (
                <div key={category} className="space-y-1">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                    {category}
                  </div>
                  <div className="space-y-0.5">
                    {categoryCommands.map((cmd) => {
                      const itemIndex = filteredCommands.indexOf(cmd);
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <button
                          key={cmd.id}
                          onClick={cmd.action}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                            isSelected
                              ? "bg-zinc-800 text-zinc-100 shadow-sm"
                              : "text-zinc-300 hover:bg-zinc-800/50"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`p-2 rounded-xl border ${
                                isSelected
                                  ? "bg-zinc-900 border-white/10 text-zinc-100"
                                  : "bg-zinc-950 border-white/5 text-zinc-400"
                              }`}
                            >
                              {cmd.icon}
                            </div>
                            <div className="min-w-0">
                              <div className="text-text-xs font-semibold truncate">
                                {cmd.title}
                              </div>
                              {cmd.subtitle && (
                                <div className="text-[11px] text-zinc-400 truncate">
                                  {cmd.subtitle}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {cmd.shortcut && (
                              <kbd className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-[10px] font-mono text-zinc-400">
                                {cmd.shortcut}
                              </kbd>
                            )}
                            {isSelected && (
                              <ArrowRight className="w-3.5 h-3.5 text-sapphire-terracotta animate-in fade-in" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-5 py-3 border-t border-white/5 bg-zinc-950/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px]">↑↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/5 text-[9px]">↵</kbd>
              <span>Select</span>
            </span>
          </div>
          <span className="text-zinc-400 font-medium">Sapphire Command Palette</span>
        </div>
      </div>
    </div>
  );
}
