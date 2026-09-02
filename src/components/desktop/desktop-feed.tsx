"use client";

import React from "react";
import {
  PanelLeftOpen,
  PanelRightOpen,
  Sparkles,
  Search,
  Layers,
  BookOpen,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { BrandProfile } from "@/lib/schema/brand";
import { GenerationMode } from "@/modules/prompt-intelligence/domain/prompt-intent";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { StudioComposer } from "@/components/ui/studio-composer";
import { ReasoningAccordion } from "@/components/ui/reasoning-accordion";
import { AgentPlanning, PlanStep } from "@/components/ui/agent-planning";

export interface DesktopFeedProps {
  isLeftOpen: boolean;
  onOpenLeft: () => void;
  isRightOpen: boolean;
  onOpenRight: () => void;
  activeBrandProfile: BrandProfile;
  allWorkspaces: BrandProfile[];
  onSelectWorkspace: (brand: BrandProfile) => void;
  onOpenOnboarding: () => void;
  onOpenCommandPalette: () => void;
  onOpenNodeGraph: () => void;
  onOpenKnowledgeBase: () => void;
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
  onSubmit: () => void;
  activePlatform: "instagram" | "linkedin";

  onChangePlatform: (p: "instagram" | "linkedin") => void;
  generationMode: GenerationMode;
  onChangeGenerationMode: (m: GenerationMode) => void;
  referenceImages: string[];
  onAddReferenceImage: (base64: string) => void;
  onRemoveReferenceImage: (idx: number) => void;
  workflowLogs: any[];
}

export function DesktopFeed({
  isLeftOpen,
  onOpenLeft,
  isRightOpen,
  onOpenRight,
  activeBrandProfile,
  allWorkspaces,
  onSelectWorkspace,
  onOpenOnboarding,
  onOpenCommandPalette,
  onOpenNodeGraph,
  onOpenKnowledgeBase,
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
}: DesktopFeedProps) {
  return (
    <main className="flex-1 flex flex-col bg-sapphire-bg overflow-hidden min-w-0 relative h-full">
      {/* Top Global Sub-Header Bar */}
      <div className="h-12 px-4 border-b border-white/5 bg-sapphire-surface/80 backdrop-blur-md flex items-center justify-between shrink-0 z-10 border-toplit">
        <div className="flex items-center gap-2">
          {!isLeftOpen && (
            <button
              onClick={onOpenLeft}
              title="Expand Left Panel (Ctrl+B)"
              className="p-1.5 rounded-lg text-text-xs text-zinc-400 hover:text-zinc-100 bg-sapphire-elevated border border-white/5 transition-colors shadow-sm press-scale"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
          <WorkspaceSwitcher
            activeBrand={activeBrandProfile}
            workspaces={allWorkspaces}
            onSelectWorkspace={onSelectWorkspace}
            onOpenOnboarding={onOpenOnboarding}
          />
        </div>

        {/* Center Command Palette Quick Search Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sapphire-elevated hover:bg-sapphire-input border border-white/10 text-[11px] text-zinc-400 hover:text-zinc-200 transition-all shadow-xs press-scale"
        >
          <Search className="w-3.5 h-3.5 text-sapphire-terracotta" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="px-1.5 py-0.2 rounded bg-sapphire-bg text-[9px] font-mono text-zinc-400 border border-white/5">
            ?K
          </kbd>
        </button>

        {/* Right Tools: Node Graph, KB, Telemetry, Right Panel Toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onOpenNodeGraph}
            title="Visual Multi-Agent DAG Node Graph"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-sapphire-elevated transition-colors press-scale"
          >
            <Layers className="w-4 h-4 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={onOpenKnowledgeBase}
            title="Knowledge Base & Strategy Rules"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-sapphire-elevated transition-colors press-scale"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </button>

          <button
            type="button"
            onClick={onOpenLogs}
            title="Telemetry Traces & Workflow Telemetry"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-sapphire-elevated transition-colors press-scale"
          >
            <Activity className="w-4 h-4 text-sapphire-blue" />
          </button>

          {!isRightOpen && (
            <button
              onClick={onOpenRight}
              title="Expand Right Canvas (Ctrl+Alt+B)"
              className="p-1.5 rounded-lg text-text-xs text-zinc-400 hover:text-zinc-100 bg-sapphire-elevated border border-white/5 transition-colors shadow-sm ml-1 press-scale"
            >
              <PanelRightOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Centered Conversation Area (L0 Canvas Base) */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl transition-all ${
                msg.role === "user"
                  ? "bg-sapphire-elevated border border-white/5 ml-6 md:ml-16 text-zinc-300 shadow-sm"
                  : msg.role === "system"
                  ? "bg-sapphire-surface border border-white/5 text-zinc-400 text-text-xs"
                  : "bg-sapphire-elevated ambient-glow border border-white/5 mr-6 md:mr-16 shadow-md"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium mb-2">
                <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  {msg.role === "user" ? (
                    "You"
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-sapphire-terracotta" />
                      Sapphire Creative Director
                    </>
                  )}
                </span>
                <span className="text-zinc-500">{msg.timestamp}</span>
              </div>
              <p className="text-[13px] md:text-text-sm text-zinc-200 leading-relaxed md:leading-7 whitespace-pre-wrap font-sans">
                {msg.content}
              </p>
            </div>
          ))}

          {/* Multimodal Visual Blueprint Manifest Card */}
          {referenceAnalysis && (
            <div className="border border-white/5 rounded-2xl p-5 bg-sapphire-elevated space-y-3.5 shadow-md animate-fade-in">
              <div className="flex items-center justify-between text-text-xs font-medium text-zinc-400 border-b border-white/5 pb-2.5">
                <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                  <Layers className="w-3.5 h-3.5 text-sapphire-terracotta" />
                  Visual Blueprint Manifest
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synthesized
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-text-xs">
                <div className="p-3 rounded-xl bg-sapphire-bg border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                    Camera & Optics
                  </span>
                  <p className="text-zinc-200 font-medium text-[11px] leading-relaxed">
                    {referenceAnalysis.camera_optics || referenceAnalysis.photography_style}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sapphire-bg border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                    Lighting Vector
                  </span>
                  <p className="text-zinc-200 font-medium text-[11px] leading-relaxed">
                    {referenceAnalysis.lighting_vector || referenceAnalysis.lighting}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sapphire-bg border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                    Negative Space Budget
                  </span>
                  <p className="text-zinc-200 font-medium text-[11px] leading-relaxed">
                    {referenceAnalysis.spatial_negative_space_plan || referenceAnalysis.negative_space_zone || "Upper 40% reserved for headline typography"}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-sapphire-bg border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                    Palette Anchors
                  </span>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    {(referenceAnalysis.color_palette_anchors || referenceAnalysis.color_palette).slice(0, 4).map((c: string, i: number) => (
                      <div key={i} className="flex items-center gap-1 bg-sapphire-surface px-1.5 py-0.5 rounded border border-white/5">
                        <div className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-xs" style={{ backgroundColor: c }} />
                        <span className="font-mono text-[9px] text-zinc-300">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {research && (
            <div className="border border-white/5 rounded-2xl p-5 bg-sapphire-elevated space-y-2.5 shadow-md">
              <div className="flex items-center justify-between text-text-xs font-medium text-zinc-400">
                <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                  <Search className="w-3.5 h-3.5 text-sapphire-blue" />
                  Research Synthesis
                </span>
                <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Complete
                </span>
              </div>
              <p className="text-text-xs text-zinc-300 leading-relaxed md:leading-6">{research.summary}</p>
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

          {/* Dynamic Live Multi-Agent Planning & Orchestration Timeline */}
          {(isLoading || planningSteps.some((s) => s.status === "success" || s.status === "active" || s.status === "error")) && (
            <AgentPlanning
              title={
                generationMode === "prompt_only"
                  ? "Prompt Intelligence DAG Execution (Serverless)"
                  : "Multi-Agent Pipeline Step Traces"
              }
              steps={planningSteps}
              className="animate-in fade-in duration-300"
            />
          )}

          {/* Auto-scroll target anchor */}
          <div ref={agentTreeEndRef as any} className="h-4 pointer-events-none" />
        </div>
      </div>

      {/* Centered Composer Input (L1 Elevated with diffuse top shadow) */}
      <div className="p-4 border-t border-white/5 bg-sapphire-surface/85 backdrop-blur-md shadow-[0_-2px_8px_rgba(0,0,0,0.4)] border-toplit">
        <div className="max-w-3xl lg:max-w-4xl w-full mx-auto">
          <StudioComposer
            prompt={prompt}
            onChangePrompt={onChangePrompt}
            onSubmit={onSubmit}
            isLoading={isLoading}
            platform={activePlatform}
            onChangePlatform={onChangePlatform}
            generationMode={generationMode}
            onChangeGenerationMode={onChangeGenerationMode}
            referenceImages={referenceImages}
            onAddReferenceImage={onAddReferenceImage}
            onRemoveReferenceImage={onRemoveReferenceImage}
          />
        </div>
      </div>
    </main>
  );
}
