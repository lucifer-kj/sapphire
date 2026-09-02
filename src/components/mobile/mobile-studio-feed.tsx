"use client";

import React, { useState } from "react";
import Link from "next/link";

import {
  Sparkles,
  Search,
  Layers,
  Activity,
  CheckCircle2,
  Send,
  Plus,
  X,
  SlidersHorizontal,
  Home,
} from "lucide-react";
import { BrandProfile } from "@/lib/schema/brand";
import { GenerationMode } from "@/modules/prompt-intelligence/domain/prompt-intent";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";

import { ReasoningAccordion } from "@/components/ui/reasoning-accordion";
import { AgentPlanning, PlanStep } from "@/components/ui/agent-planning";

interface MobileStudioFeedProps {
  activeBrandProfile: BrandProfile;
  allWorkspaces: BrandProfile[];
  onSelectWorkspace: (brand: BrandProfile) => void;
  onOpenOnboarding: () => void;
  onOpenCommandPalette: () => void;
  onOpenNodeGraph: () => void;
  onOpenLogs: () => void;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
    timestamp: string;
  }>;
  referenceAnalysis: any | null;
  research: any | null;
  isLoading: boolean;
  planningSteps: PlanStep[];
  agentTreeEndRef: React.RefObject<HTMLDivElement | null>;
  prompt: string;
  onChangePrompt: (p: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  activePlatform: "instagram" | "linkedin";
  onChangePlatform: (p: "instagram" | "linkedin") => void;
  generationMode: GenerationMode;
  onChangeGenerationMode: (m: GenerationMode) => void;
  referenceImages: string[];
  onAddReferenceImage: (base64: string) => void;
  onRemoveReferenceImage: (idx: number) => void;
}

export function MobileStudioFeed({
  activeBrandProfile,
  allWorkspaces,
  onSelectWorkspace,
  onOpenOnboarding,
  onOpenCommandPalette,
  onOpenNodeGraph,
  onOpenLogs,
  messages,
  referenceAnalysis,
  research,
  isLoading,
  planningSteps,
  agentTreeEndRef,
  prompt,
  onChangePrompt,
  onSubmit,
  activePlatform,
  onChangePlatform,
  generationMode,
  onChangeGenerationMode,
  referenceImages,
  onAddReferenceImage,
  onRemoveReferenceImage,
}: MobileStudioFeedProps) {
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    setIsComposerExpanded(false);
    onSubmit(e);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEv) => {
      const b64 = loadEv.target?.result as string;
      if (b64) onAddReferenceImage(b64);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-sapphire-bg text-zinc-100 overflow-hidden relative">
      {/* Top Mobile Sub-Header */}
      <div className="h-14 px-3 border-b border-white/5 bg-sapphire-surface/90 backdrop-blur-md flex items-center justify-between shrink-0 z-20 border-toplit">
        <div className="flex items-center gap-1.5 min-w-0">
          <Link
            href="/workspaces"
            className="flex items-center gap-1.5 p-1 rounded-xl bg-sapphire-input/60 hover:bg-sapphire-input border border-white/10 transition-colors press-scale shrink-0"
            title="Return to Workspaces Portal"
          >
            <div className="w-6 h-6 rounded-lg overflow-hidden border border-white/10 bg-sapphire-surface flex items-center justify-center p-0.5">
              <img src="/logo.png" alt="Sapphire" className="w-full h-full object-contain" />
            </div>
            <Home className="w-3.5 h-3.5 text-sapphire-terracotta" />
          </Link>

          <WorkspaceSwitcher
            activeBrand={activeBrandProfile}
            workspaces={allWorkspaces}
            onSelectWorkspace={onSelectWorkspace}
            onOpenOnboarding={onOpenOnboarding}
          />
        </div>


        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            title="Search / Command Palette"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-sapphire-input transition-colors press-scale"
          >
            <Search className="w-4 h-4 text-sapphire-terracotta" />
          </button>
          <button
            type="button"
            onClick={onOpenNodeGraph}
            title="DAG Execution Graph"
            className="p-2 rounded-xl text-zinc-400 hover:text-amber-400 hover:bg-sapphire-input transition-colors press-scale"
          >
            <Layers className="w-4 h-4 text-amber-400" />
          </button>
          <button
            type="button"
            onClick={onOpenLogs}
            title="Live Logs"
            className="p-2 rounded-xl text-zinc-400 hover:text-blue-400 hover:bg-sapphire-input transition-colors press-scale"
          >
            <Activity className="w-4 h-4 text-sapphire-blue" />
          </button>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4 pb-44">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-2xl transition-all shadow-sm ${
              msg.role === "user"
                ? "bg-sapphire-elevated border border-white/5 text-zinc-200"
                : msg.role === "system"
                ? "bg-sapphire-surface border border-white/5 text-zinc-400 text-xs"
                : "bg-sapphire-elevated ambient-glow border border-white/5 text-zinc-100"
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium mb-1.5">
              <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
                {msg.role === "user" ? (
                  "You"
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-sapphire-terracotta" />
                    Sapphire
                  </>
                )}
              </span>
              <span className="text-[10px] text-zinc-500">{msg.timestamp}</span>
            </div>
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap font-sans">
              {msg.content}
            </p>
          </div>
        ))}

        {/* Multimodal Visual Blueprint Manifest Card */}
        {referenceAnalysis && (
          <div className="border border-white/5 rounded-2xl p-4 bg-sapphire-elevated space-y-3 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-200 border-b border-white/5 pb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sapphire-terracotta" />
                Visual Blueprint
              </span>
              <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Synthesized
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-sapphire-bg border border-white/5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">
                  Optics
                </span>
                <p className="text-zinc-200 font-medium text-[11px] truncate">
                  {referenceAnalysis.camera_optics || referenceAnalysis.photography_style}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-sapphire-bg border border-white/5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">
                  Lighting
                </span>
                <p className="text-zinc-200 font-medium text-[11px] truncate">
                  {referenceAnalysis.lighting_vector || referenceAnalysis.lighting}
                </p>
              </div>
            </div>
          </div>
        )}

        {research && (
          <div className="border border-white/5 rounded-2xl p-4 bg-sapphire-elevated space-y-2 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-200">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-sapphire-blue" />
                Research Synthesis
              </span>
              <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Complete
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{research.summary}</p>
          </div>
        )}

        {/* Reasoning Accordion */}
        {isLoading && (
          <ReasoningAccordion
            isThinking={true}
            thoughtContent="Deconstructing brief into brand tokens, retrieving platform rules, formulating visual metaphor, and routing optimal model..."
            modelName="Gemini 2.5 Flash"
          />
        )}

        {/* Dynamic Multi-Agent DAG Execution Timeline */}
        {(isLoading || planningSteps.some((s) => s.status === "success" || s.status === "active" || s.status === "error")) && (
          <AgentPlanning
            title={
              generationMode === "prompt_only"
                ? "DAG Execution"
                : "Multi-Agent Pipeline"
            }
            steps={planningSteps}
            className="animate-in fade-in duration-300"
          />
        )}

        <div ref={agentTreeEndRef as any} className="h-4 pointer-events-none" />
      </div>

      {/* Floating Mobile Composer (Pinned right above the floating tab bar) */}
      <div className="fixed bottom-20 inset-x-3.5 max-w-sm mx-auto z-30">
        <form
          onSubmit={handleFormSubmit}
          className="bg-sapphire-surface/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2.5 shadow-2xl space-y-2 border-toplit"
        >
          {/* Top Platform + Mode Pills */}
          <div className="flex items-center justify-between text-xs pb-1 px-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onChangePlatform("instagram")}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                  activePlatform === "instagram"
                    ? "bg-sapphire-terracotta text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Instagram
              </button>
              <button
                type="button"
                onClick={() => onChangePlatform("linkedin")}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                  activePlatform === "linkedin"
                    ? "bg-sapphire-terracotta text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                LinkedIn
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                onChangeGenerationMode(
                  generationMode === "prompt_only" ? "campaign" : "prompt_only"
                )
              }
              className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3 text-sapphire-terracotta" />
              <span>{generationMode === "prompt_only" ? "Prompt Only" : "Full Post"}</span>
            </button>
          </div>

          {/* Reference Image Thumbnail Previews */}
          {referenceImages.length > 0 && (
            <div className="flex items-center gap-1.5 px-1 overflow-x-auto py-1">
              {referenceImages.map((b64, idx) => (
                <div key={idx} className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 group">
                  <img src={b64} alt="ref" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => onRemoveReferenceImage(idx)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Field + Submit Button */}
          <div className="flex items-end gap-2">
            <label className="cursor-pointer p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-sapphire-input transition-colors shrink-0 press-scale">
              <Plus className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <textarea
              value={prompt}
              onChange={(e) => onChangePrompt(e.target.value)}
              placeholder="Describe your social content idea..."
              rows={isComposerExpanded ? 3 : 1}
              onFocus={() => setIsComposerExpanded(true)}
              className="flex-1 bg-transparent border-0 outline-none text-xs text-zinc-100 placeholder:text-zinc-500 resize-none py-1.5 font-sans leading-relaxed"
            />

            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="p-2 rounded-xl bg-sapphire-terracotta text-white disabled:opacity-40 hover:bg-sapphire-terracotta-hover transition-colors shrink-0 shadow-sm press-scale"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
