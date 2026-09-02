"use client";

import React from "react";
import {
  Sparkles,
  Maximize2,
  ShieldCheck,
  RefreshCw,
  CheckCheck,
  AlertCircle,
  Copy,
} from "lucide-react";
import { GenerationMode } from "@/modules/prompt-intelligence/domain/prompt-intent";
import { PromptResultInspector } from "@/components/ui/prompt-result-inspector";
import { ImageGeneration } from "@/components/ui/image-generation";

interface MobileCanvasViewProps {
  generationMode: GenerationMode;
  activePlatform: "instagram" | "linkedin";
  promptResult: any | null;
  onPromptRefine: (instruction: string) => Promise<void>;
  isRefiningPrompt: boolean;
  promptVersionHistory: any[];
  onSelectPromptVersion: (v: any) => void;
  onUpdatePromptResult: (updated: any) => void;
  brief: any | null;
  selectedConcept: "A" | "B" | null;
  onSelectConcept: (c: "A" | "B") => void;
  critiqueA: any | null;
  critiqueB: any | null;
  isRegeneratingA: boolean;
  isRegeneratingB: boolean;
  isLoading: boolean;
  imageErrorA: boolean;
  imageErrorB: boolean;
  onApproveConcept: (c: "A" | "B") => void;
  onRegenerateConcept: (conceptType: "A" | "B") => void;
  prompt: string;
  onPreviewImage: (url: string, title: string) => void;
}

export function MobileCanvasView({
  generationMode,
  activePlatform,
  promptResult,
  onPromptRefine,
  isRefiningPrompt,
  promptVersionHistory,
  onSelectPromptVersion,
  onUpdatePromptResult,
  brief,
  selectedConcept,
  onSelectConcept,
  critiqueA,
  critiqueB,
  isRegeneratingA,
  isRegeneratingB,
  isLoading,
  imageErrorA,
  imageErrorB,
  onApproveConcept,
  onRegenerateConcept,
  prompt,
  onPreviewImage,
}: MobileCanvasViewProps) {
  // If in Prompt Intelligence mode
  if (generationMode === "prompt_only") {
    return (
      <div className="flex-1 flex flex-col h-full bg-sapphire-surface text-zinc-100 overflow-y-auto pb-24 p-3.5">
        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
          <Sparkles className="w-4 h-4 text-sapphire-terracotta" />
          <h2 className="text-xs font-semibold text-zinc-100">
            Prompt Intelligence Studio ({activePlatform.toUpperCase()})
          </h2>
        </div>

        <div className="pt-3">
          {promptResult ? (
            <PromptResultInspector
              result={promptResult}
              onRefine={onPromptRefine}
              isRefining={isRefiningPrompt}
              versionHistory={promptVersionHistory}
              onSelectVersion={onSelectPromptVersion}
              onUpdateResult={onUpdatePromptResult}
            />
          ) : (
            <div className="p-6 rounded-2xl bg-sapphire-elevated border border-white/5 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-sapphire-terracotta mx-auto" />
              <h3 className="text-xs font-semibold text-zinc-200">
                Awaiting Content Brief
              </h3>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Submit a topic in the studio feed to engineer a production-ready prompt.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If in Campaign Mode � render scrollable stack of cards
  return (
    <div className="flex-1 flex flex-col h-full bg-sapphire-bg text-zinc-100 overflow-y-auto pb-24 p-3.5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <h2 className="text-xs font-semibold text-zinc-100">
          Visual Compositions ({activePlatform.toUpperCase()})
        </h2>
        <span className="text-[10px] text-zinc-400 font-mono">
          {brief ? "2 Concepts Ready" : "Awaiting Generation"}
        </span>
      </div>

      {!brief && !isLoading && (
        <div className="p-8 rounded-2xl bg-sapphire-elevated border border-white/5 text-center space-y-2">
          <Sparkles className="w-7 h-7 text-sapphire-terracotta mx-auto" />
          <h3 className="text-xs font-semibold text-zinc-200">
            Canvas Empty
          </h3>
          <p className="text-[11px] text-zinc-400">
            Submit a prompt in the Studio tab to synthesize Canva-grade artwork.
          </p>
        </div>
      )}

      {/* Concept A Card */}
      {(brief || isLoading) && (
        <div
          className={`rounded-2xl bg-sapphire-elevated p-4 space-y-3.5 border transition-all shadow-md ${
            selectedConcept === "A"
              ? "border-sapphire-terracotta ring-1 ring-sapphire-terracotta/40"
              : "border-white/5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-sapphire-bg border border-white/5 text-zinc-100 truncate max-w-[200px]">
              {brief ? brief.concept_a.label : "Concept A � Emotional"}
            </span>
            <span className="text-[10px] font-semibold text-sapphire-blue bg-sapphire-blue/10 px-2 py-0.5 rounded-full">
              Direction A
            </span>
          </div>

          {/* Plain Language Founder Summary */}
          {brief?.concept_a.design_blueprint?.founder_summary && (
            <p className="text-[11px] text-zinc-300 bg-sapphire-bg/60 border border-white/5 rounded-xl p-2.5 leading-relaxed">
              {brief.concept_a.design_blueprint.founder_summary}
            </p>
          )}

          {/* Interactive Artwork Card (Click to Zoom Lightbox) */}
          <div
            onClick={() => {
              if (brief?.concept_a.image_url) {
                onPreviewImage(brief.concept_a.image_url, brief.concept_a.label || "Concept A");
              }
            }}
            className="relative aspect-[4/5] rounded-xl bg-zinc-950 border border-white/5 overflow-hidden flex items-center justify-center cursor-pointer group shadow-inner"
          >
            {isRegeneratingA || (isLoading && !brief?.concept_a.image_url) ? (
              <ImageGeneration
                prompt={brief?.concept_a.image_prompt || prompt}
                resolution="1080 � 1350"
              />
            ) : brief?.concept_a.image_url && !imageErrorA ? (
              <>
                <img
                  src={brief.concept_a.image_url}
                  alt="Concept A AI Artwork"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Floating Tap-to-Zoom Badge */}
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />
                  <span>Tap to Zoom</span>
                </div>
              </>
            ) : (
              <div className="p-4 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
                <p className="text-[11px] text-zinc-400">Artwork unavailable</p>
              </div>
            )}
          </div>

          {/* Brand Compliance Scorecard */}
          {critiqueA && (
            <div className="p-2.5 rounded-xl bg-sapphire-bg/70 border border-white/5 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Brand Alignment
              </span>
              <span className="text-emerald-400 font-bold font-mono">
                {critiqueA.brand_alignment_score}/100
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {brief?.concept_a && (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onRegenerateConcept("A")}
                disabled={isRegeneratingA}
                className="flex-1 py-2 px-3 rounded-xl border border-white/10 bg-sapphire-bg text-zinc-300 hover:text-zinc-100 text-[11px] font-medium flex items-center justify-center gap-1.5 press-scale"
              >
                <RefreshCw className={`w-3 h-3 ${isRegeneratingA ? "animate-spin" : ""}`} />
                <span>Regenerate</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectConcept("A");
                  onApproveConcept("A");
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-sapphire-terracotta text-white text-[11px] font-medium flex items-center justify-center gap-1.5 press-scale"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Approve & Deliver</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Concept B Card */}
      {brief?.concept_b && (
        <div
          className={`rounded-2xl bg-sapphire-elevated p-4 space-y-3.5 border transition-all shadow-md ${
            selectedConcept === "B"
              ? "border-sapphire-terracotta ring-1 ring-sapphire-terracotta/40"
              : "border-white/5"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-sapphire-bg border border-white/5 text-zinc-100 truncate max-w-[200px]">
              {brief.concept_b.label}
            </span>
            <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              Direction B
            </span>
          </div>

          {/* Plain Language Founder Summary */}
          {brief?.concept_b.design_blueprint?.founder_summary && (
            <p className="text-[11px] text-zinc-300 bg-sapphire-bg/60 border border-white/5 rounded-xl p-2.5 leading-relaxed">
              {brief.concept_b.design_blueprint.founder_summary}
            </p>
          )}

          {/* Interactive Artwork Card (Click to Zoom Lightbox) */}
          <div
            onClick={() => {
              if (brief?.concept_b.image_url) {
                onPreviewImage(brief.concept_b.image_url, brief.concept_b.label || "Concept B");
              }
            }}
            className="relative aspect-[4/5] rounded-xl bg-zinc-950 border border-white/5 overflow-hidden flex items-center justify-center cursor-pointer group shadow-inner"
          >
            {isRegeneratingB ? (
              <ImageGeneration
                prompt={brief?.concept_b.image_prompt || prompt}
                resolution="1080 � 1350"
              />
            ) : brief?.concept_b.image_url && !imageErrorB ? (
              <>
                <img
                  src={brief.concept_b.image_url}
                  alt="Concept B AI Artwork"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-medium flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                  <Maximize2 className="w-3 h-3" />
                  <span>Tap to Zoom</span>
                </div>
              </>
            ) : (
              <div className="p-4 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto" />
                <p className="text-[11px] text-zinc-400">Artwork unavailable</p>
              </div>
            )}
          </div>

          {/* Brand Compliance Scorecard */}
          {critiqueB && (
            <div className="p-2.5 rounded-xl bg-sapphire-bg/70 border border-white/5 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Brand Alignment
              </span>
              <span className="text-emerald-400 font-bold font-mono">
                {critiqueB.brand_alignment_score}/100
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onRegenerateConcept("B")}
              disabled={isRegeneratingB}
              className="flex-1 py-2 px-3 rounded-xl border border-white/10 bg-sapphire-bg text-zinc-300 hover:text-zinc-100 text-[11px] font-medium flex items-center justify-center gap-1.5 press-scale"
            >
              <RefreshCw className={`w-3 h-3 ${isRegeneratingB ? "animate-spin" : ""}`} />
              <span>Regenerate</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectConcept("B");
                onApproveConcept("B");
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-sapphire-terracotta text-white text-[11px] font-medium flex items-center justify-center gap-1.5 press-scale"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Approve & Deliver</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
