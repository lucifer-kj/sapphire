"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Cpu,
  Layers,
  ShieldCheck,
  Sliders,
  Maximize2,
  Info,
  CheckCircle2,
  RefreshCw,
  Send,
  AlertTriangle,
  Lightbulb,
  Camera,
  Image as ImageIcon,
  Compass,
  FileCode,
  ArrowRight,
  Eye,
  Tag,
  Wand2,
} from "lucide-react";
import { PromptResult } from "@/modules/prompt-intelligence/domain/prompt-result";
import { SupportedModelFamily } from "@/modules/prompt-intelligence/domain/model-strategy";

interface PromptResultInspectorProps {
  result: PromptResult;
  onRefine?: (instruction: string) => Promise<void>;
  isRefining?: boolean;
  versionHistory?: PromptResult[];
  onSelectVersion?: (versionResult: PromptResult) => void;
}

const MODEL_TAB_CONFIG: Array<{ id: SupportedModelFamily; label: string; badge: string }> = [
  { id: "flux_1_dev", label: "FLUX.1 [dev]", badge: "Photorealism" },
  { id: "midjourney_v6", label: "Midjourney v6.1", badge: "Cinematic" },
  { id: "ideogram_v2", label: "Ideogram v2", badge: "Typography" },
  { id: "dalle_3", label: "DALL-E 3", badge: "Conceptual" },
  { id: "flux_1_schnell", label: "FLUX [schnell]", badge: "Fast" },
  { id: "stable_diffusion_xl", label: "SDXL", badge: "Custom" },
];

const QUICK_REFINEMENT_PRESETS = [
  {
    icon: "🎬",
    label: "Cinematic Lighting",
    prompt: "Enhance dramatic cinematic lighting with subtle volumetric backlight and richer color grade",
  },
  {
    icon: "📐",
    label: "Minimalist Framing",
    prompt: "Make composition more minimalist with expansive clean negative space and clear focal isolation",
  },
  {
    icon: "🏛️",
    label: "Editorial Architecture",
    prompt: "Incorporate clean modern architectural perspective lines and structured environmental depth",
  },
  {
    icon: "🔍",
    label: "Macro Texture Detail",
    prompt: "Emphasize tactile physical material textures, micro-contrast, and authentic organic surface finishes",
  },
  {
    icon: "🌅",
    label: "Warm Golden Hour",
    prompt: "Shift atmospheric lighting to warm dusk golden-hour illumination with soft amber highlights",
  },
  {
    icon: "💼",
    label: "Executive Metaphor",
    prompt: "Refine towards a sophisticated executive conceptual metaphor tailored for high-signal LinkedIn resonance",
  },
];

export function PromptResultInspector({
  result,
  onRefine,
  isRefining = false,
  versionHistory = [],
  onSelectVersion,
}: PromptResultInspectorProps) {
  const [selectedModelTab, setSelectedModelTab] = useState<SupportedModelFamily>(
    result.specification.target_model || "flux_1_dev"
  );
  const [copiedType, setCopiedType] = useState<"prompt" | "negative" | "json" | null>(null);
  const [refineText, setRefineText] = useState("");
  const [activeViewTab, setActiveViewTab] = useState<"prompt" | "tokens" | "audit">("prompt");

  // Lookup prompt based on selected model tab
  const activeModelFormat = result.all_model_formats?.[selectedModelTab] || {
    finalPrompt: result.final_prompt,
    negativePrompt: result.negative_prompt,
    copyablePrompt: result.final_prompt,
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(activeModelFormat.finalPrompt);
    setCopiedType("prompt");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCopyNegative = () => {
    if (activeModelFormat.negativePrompt) {
      navigator.clipboard.writeText(activeModelFormat.negativePrompt);
      setCopiedType("negative");
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result.specification, null, 2));
    setCopiedType("json");
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim() || isRefining || !onRefine) return;
    const text = refineText.trim();
    setRefineText("");
    await onRefine(text);
  };

  const handlePresetClick = async (presetPrompt: string) => {
    if (isRefining || !onRefine) return;
    await onRefine(presetPrompt);
  };

  const {
    platform,
    post_type,
    archetype,
    interpreted_direction,
    model_recommendation,
    aspect_ratio,
    reference_strategy,
    critic_evaluation,
    rationale,
    specification,
    syntax_tokens = [],
    version,
  } = result;

  return (
    <div className="space-y-6 text-zinc-100">
      {/* 1. Header Overview & Version Timeline */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-white/5 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-text-xs font-semibold bg-sapphire-terracotta/15 text-sapphire-terracotta border border-sapphire-terracotta/30">
              <Sparkles className="w-3.5 h-3.5" />
              Prompt Intelligence Mode
            </span>

            {/* Version Badge & History Stepper */}
            {versionHistory.length > 1 ? (
              <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-lg border border-white/5">
                {versionHistory.map((vh) => (
                  <button
                    key={vh.version}
                    onClick={() => onSelectVersion?.(vh)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                      vh.version === version
                        ? "bg-sapphire-terracotta text-white font-bold"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    v{vh.version}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-lg border border-white/5 uppercase font-semibold">
                v{version}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-white/5 capitalize">
              {platform}
            </span>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-white/5">
              {post_type.replace(/_/g, " ")}
            </span>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20">
              {archetype.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-heading-sm font-semibold text-zinc-100 leading-snug">
            {interpreted_direction}
          </h3>
          <p className="text-text-xs text-zinc-400 mt-1 leading-relaxed">
            {specification.creative_concept}
          </p>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 pt-1 border-t border-white/5">
          <button
            onClick={() => setActiveViewTab("prompt")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-text-xs font-medium transition-colors ${
              activeViewTab === "prompt"
                ? "bg-zinc-800 text-zinc-100 font-semibold border border-white/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sapphire-terracotta" />
            <span>Engineered Prompt</span>
          </button>

          <button
            onClick={() => setActiveViewTab("tokens")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-text-xs font-medium transition-colors ${
              activeViewTab === "tokens"
                ? "bg-zinc-800 text-zinc-100 font-semibold border border-white/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <span>Syntax Breakdown ({syntax_tokens.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab("audit")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-text-xs font-medium transition-colors ${
              activeViewTab === "audit"
                ? "bg-zinc-800 text-zinc-100 font-semibold border border-white/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Critic Audit ({critic_evaluation.score}/100)</span>
          </button>
        </div>
      </div>

      {/* 2. Dynamic Model Switcher Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-text-xs text-zinc-400 font-medium px-1">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-sapphire-terracotta" />
            <span>Target Model Syntax:</span>
          </span>
          <span className="text-[10px] text-zinc-500 font-mono">
            Instant 0ms Multi-Model Formatting
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MODEL_TAB_CONFIG.map((tab) => {
            const isSelected = selectedModelTab === tab.id;
            const isRecommended = model_recommendation.recommendedModel === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setSelectedModelTab(tab.id)}
                className={`p-2.5 rounded-2xl border text-left transition-all relative ${
                  isSelected
                    ? "bg-zinc-900 border-sapphire-terracotta shadow-md ring-1 ring-sapphire-terracotta/40"
                    : "bg-zinc-950/70 border-white/5 hover:border-white/15 hover:bg-zinc-900/60"
                }`}
              >
                {isRecommended && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/20">
                    Recommended
                  </span>
                )}
                <div className="font-semibold text-[12px] text-zinc-100 truncate pr-14">
                  {tab.label}
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sapphire-terracotta/60" />
                  <span>{tab.badge}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Display Area based on activeViewTab */}
      {activeViewTab === "prompt" && (
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sapphire-terracotta" />
              <h4 className="text-text-sm font-bold text-zinc-100 uppercase tracking-wider">
                {MODEL_TAB_CONFIG.find((t) => t.id === selectedModelTab)?.label} Prompt
              </h4>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-white/5">
                {aspect_ratio}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyJson}
                className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-[11px] text-zinc-300 font-medium transition-colors flex items-center gap-1.5"
                title="Copy structured JSON specification"
              >
                {copiedType === "json" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>JSON Copied</span>
                  </>
                ) : (
                  <>
                    <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy Spec</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyPrompt}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-text-xs font-semibold transition-all shadow-md ${
                  copiedType === "prompt"
                    ? "bg-emerald-600 text-white"
                    : "bg-sapphire-terracotta hover:bg-sapphire-terracotta/90 text-white active:scale-95"
                }`}
              >
                {copiedType === "prompt" ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Prompt</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Prompt Text Box */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 font-mono text-text-xs text-zinc-200 leading-relaxed select-all whitespace-pre-wrap shadow-inner">
            {activeModelFormat.finalPrompt}
          </div>

          {/* Negative Prompt / Exclusions */}
          {activeModelFormat.negativePrompt && (
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase text-zinc-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  Negative Exclusions / Cliché Blocklist:
                </span>
                <button
                  onClick={handleCopyNegative}
                  className="text-[10px] text-sapphire-terracotta hover:underline font-medium"
                >
                  {copiedType === "negative" ? "Copied!" : "Copy Negative"}
                </button>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-white/5 font-mono text-[11px] text-zinc-400">
                {activeModelFormat.negativePrompt}
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Tab 2: Visual Syntax Token Breakdown */}
      {activeViewTab === "tokens" && (
        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-400" />
              <h4 className="text-text-sm font-bold text-zinc-100">
                Visual Ingredient Syntax Breakdown
              </h4>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              Structured Intermediate Representation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {syntax_tokens.map((token, i) => {
              const categoryBadge =
                token.category === "subject"
                  ? "bg-blue-950 text-blue-300 border-blue-500/20"
                  : token.category === "environment"
                  ? "bg-indigo-950 text-indigo-300 border-indigo-500/20"
                  : token.category === "lighting"
                  ? "bg-amber-950 text-amber-300 border-amber-500/20"
                  : token.category === "camera_optics"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-500/20"
                  : token.category === "materials_texture"
                  ? "bg-purple-950 text-purple-300 border-purple-500/20"
                  : token.category === "brand_token"
                  ? "bg-orange-950 text-orange-300 border-orange-500/20"
                  : "bg-rose-950 text-rose-300 border-rose-500/20";

              return (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${categoryBadge}`}
                    >
                      {token.label}
                    </span>
                  </div>
                  <p className="text-[12px] text-zinc-200 leading-relaxed font-sans">
                    {token.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* View Tab 3: Critic Audit */}
      {activeViewTab === "audit" && (
        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h4 className="text-text-sm font-bold text-zinc-100">
                100-Point Quality Critic Evaluation
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-heading-sm font-bold font-mono text-emerald-400">
                {critic_evaluation.score}/100
              </span>
              <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/20">
                Passed Audit
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1">
              <div className="text-zinc-400">Intent Fidelity</div>
              <div className="font-mono font-bold text-zinc-200">
                {critic_evaluation.intent_fidelity} / 20
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1">
              <div className="text-zinc-400">Platform Fit</div>
              <div className="font-mono font-bold text-zinc-200">
                {critic_evaluation.platform_native_fit} / 15
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1">
              <div className="text-zinc-400">Brand Alignment</div>
              <div className="font-mono font-bold text-zinc-200">
                {critic_evaluation.brand_alignment} / 15
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1">
              <div className="text-zinc-400">Visual Specificity</div>
              <div className="font-mono font-bold text-zinc-200">
                {critic_evaluation.visual_specificity} / 15
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1">
              <div className="text-zinc-400">Composition Coherence</div>
              <div className="font-mono font-bold text-zinc-200">
                {critic_evaluation.composition_coherence} / 10
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1">
              <div className="text-zinc-400">Model Compatibility</div>
              <div className="font-mono font-bold text-zinc-200">
                {critic_evaluation.model_compatibility} / 10
              </div>
            </div>
          </div>

          {critic_evaluation.strengths && critic_evaluation.strengths.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Audited Strengths:
              </div>
              <div className="space-y-1">
                {critic_evaluation.strengths.map((s, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-text-xs text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Strategic Direction Rationale Card */}
      <div className="p-5 rounded-3xl bg-zinc-900 border border-white/5 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h4 className="text-text-sm font-bold text-zinc-100">
            Strategic Direction Rationale
          </h4>
        </div>

        <div className="space-y-2 text-text-xs text-zinc-300 leading-relaxed">
          <div>
            <strong className="text-zinc-100">Creative Direction: </strong>
            {rationale.creative_direction_reason}
          </div>
          <div>
            <strong className="text-zinc-100">Platform Psychology ({platform}): </strong>
            {rationale.platform_psychology_reason}
          </div>
          <div>
            <strong className="text-zinc-100">Model Selection: </strong>
            {rationale.model_selection_reason}
          </div>
        </div>

        {rationale.anti_cliche_guardrails && rationale.anti_cliche_guardrails.length > 0 && (
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Generic Clichés Avoided:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {rationale.anti_cliche_guardrails.map((c, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-400 border border-white/5 text-[11px]"
                >
                  ✕ {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. 1-Click Quick Refinement Presets Bar */}
      {onRefine && (
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-sapphire-terracotta" />
              <h4 className="text-text-sm font-bold text-zinc-100">
                Quick Refinement Presets
              </h4>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              1-Click Surgical Modifiers
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_REFINEMENT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isRefining}
                onClick={() => handlePresetClick(preset.prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 disabled:opacity-50 border border-white/5 text-[11px] text-zinc-200 font-medium transition-all active:scale-95 shadow-xs"
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Conversational Prompt Refiner */}
          <form onSubmit={handleRefineSubmit} className="flex items-center gap-2 pt-2 border-t border-white/5">
            <input
              type="text"
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              placeholder="Or type custom refinement (e.g. 'Make camera angle lower for hero stature')..."
              disabled={isRefining}
              className="flex-1 px-4 py-2 rounded-xl bg-zinc-950 border border-white/10 text-text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-sapphire-terracotta transition-colors"
            />
            <button
              type="submit"
              disabled={isRefining || !refineText.trim()}
              className="px-4 py-2 rounded-xl bg-sapphire-terracotta hover:bg-sapphire-terracotta/90 disabled:opacity-50 text-white text-text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {isRefining ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Refine</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
