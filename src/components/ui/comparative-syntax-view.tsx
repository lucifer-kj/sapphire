"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Info,
  ExternalLink,
} from "lucide-react";
import { PromptResult } from "@/modules/prompt-intelligence/domain/prompt-result";
import { SupportedModelFamily } from "@/modules/prompt-intelligence/domain/model-strategy";

interface ComparativeSyntaxViewProps {
  result: PromptResult;
}

interface ModelComparisonCard {
  id: SupportedModelFamily;
  title: string;
  badge: string;
  badgeColor: string;
  engineType: string;
  keyStrength: string;
}

const COMPARISON_MODELS: ModelComparisonCard[] = [
  {
    id: "flux_1_dev",
    title: "FLUX.1 [dev]",
    badge: "Photorealism Leader",
    badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-500/20",
    engineType: "Flow Transformer 12B",
    keyStrength: "Unmatched human skin textures, authentic lens optics, micro-contrast",
  },
  {
    id: "midjourney_v6",
    title: "Midjourney v6.1",
    badge: "Cinematic Aesthetics",
    badgeColor: "bg-purple-950 text-purple-300 border-purple-500/20",
    engineType: "Diffusion V6.1 Raw",
    keyStrength: "Atmospheric mood, volumetric lighting, flag-controlled parameters",
  },
  {
    id: "ideogram_v2",
    title: "Ideogram v2",
    badge: "Typography Master",
    badgeColor: "bg-blue-950 text-blue-300 border-blue-500/20",
    engineType: "Text & Layout Diffusion",
    keyStrength: "Crisp in-image brand typography, graphic margins, safe-zones",
  },
  {
    id: "dalle_3",
    title: "DALL-E 3",
    badge: "Concept Coherence",
    badgeColor: "bg-amber-950 text-amber-300 border-amber-500/20",
    engineType: "OpenAI GPT-Augmented Diffusion",
    keyStrength: "Strict adherence to complex multi-object spatial compositions",
  },
];

export function ComparativeSyntaxView({ result }: ComparativeSyntaxViewProps) {
  const [copiedModel, setCopiedModel] = useState<string | null>(null);

  const handleCopyModelPrompt = (modelId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedModel(modelId);
    setTimeout(() => setCopiedModel(null), 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sapphire-terracotta" />
          <h4 className="text-text-sm font-bold text-zinc-100 uppercase tracking-wider">
            Comparative Multi-Model Syntax Matrix
          </h4>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">
          Side-by-Side Model Architecture Differentials
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMPARISON_MODELS.map((m) => {
          const formatted = result.all_model_formats?.[m.id] || {
            finalPrompt: result.final_prompt,
            negativePrompt: result.negative_prompt,
            copyablePrompt: result.final_prompt,
          };
          const isCopied = copiedModel === m.id;
          const isRecommended = result.model_recommendation.recommendedModel === m.id;

          return (
            <div
              key={m.id}
              className={`p-5 rounded-3xl bg-zinc-900/90 border flex flex-col justify-between transition-all ${
                isRecommended
                  ? "border-sapphire-terracotta ring-1 ring-sapphire-terracotta/40 shadow-xl"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-text-sm text-zinc-100">{m.title}</h5>
                    {isRecommended && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        Target Model
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${m.badgeColor}`}
                  >
                    {m.badge}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-400 flex items-center justify-between font-mono">
                  <span>{m.engineType}</span>
                  <span className="text-zinc-500">{result.aspect_ratio}</span>
                </div>

                {/* Prompt Box */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10 font-mono text-[11px] text-zinc-200 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap select-all shadow-inner">
                  {formatted.finalPrompt}
                </div>

                {/* Negatives if Midjourney / SDXL */}
                {formatted.negativePrompt && (
                  <div className="p-2 rounded-xl bg-zinc-950/60 border border-white/5 font-mono text-[10px] text-zinc-400 truncate">
                    <span className="text-zinc-500">Exclusions: </span>
                    {formatted.negativePrompt}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-zinc-400 leading-tight max-w-[200px] truncate">
                  {m.keyStrength}
                </span>

                <button
                  onClick={() => handleCopyModelPrompt(m.id, formatted.copyablePrompt)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-text-xs font-semibold transition-all ${
                    isCopied
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-950 hover:bg-zinc-800 border border-white/10 text-zinc-200 active:scale-95"
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Syntax</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
