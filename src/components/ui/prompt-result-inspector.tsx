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
  SplitSquareVertical,
  Type,
  MessageSquare,
  Hash,
  Bookmark,
  Share2,
} from "lucide-react";
import { PromptResult } from "@/modules/prompt-intelligence/domain/prompt-result";
import { SupportedModelFamily } from "@/modules/prompt-intelligence/domain/model-strategy";
import { TokenizedPromptEditor } from "./tokenized-prompt-editor";
import { ComparativeSyntaxView } from "./comparative-syntax-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GenerativeArtifactCanvas } from "@/components/ai-generative/generative-artifact-canvas";

interface PromptResultInspectorProps {
  result: PromptResult;
  onRefine?: (instruction: string) => Promise<void>;
  isRefining?: boolean;
  versionHistory?: PromptResult[];
  onSelectVersion?: (versionResult: PromptResult) => void;
  onUpdateResult?: (updatedResult: PromptResult) => void;
}

const MODEL_TAB_CONFIG: Array<{ id: SupportedModelFamily; label: string; badge: string }> = [
  { id: "ideogram_v2", label: "Ideogram v2", badge: "Poster & Text" },
  { id: "midjourney_v6", label: "Midjourney v6.1", badge: "Cinematic" },
  { id: "flux_1_dev", label: "FLUX.1 [dev]", badge: "Photorealism" },
  { id: "dalle_3", label: "DALL-E 3", badge: "Graphic" },
  { id: "flux_1_schnell", label: "FLUX [schnell]", badge: "Fast" },
  { id: "stable_diffusion_xl", label: "SDXL", badge: "Custom" },
];

const QUICK_REFINEMENT_PRESETS = [
  {
    id: "preset-headline-bold",
    icon: "🔤",
    label: "Bolder Headline",
    prompt: "Make the headline more provocative, bold, and high-contrast for maximum scroll-stopping pattern interrupt",
  },
  {
    id: "preset-cinematic",
    icon: "🎬",
    label: "Cinematic Lighting",
    prompt: "Enhance dramatic cinematic lighting with subtle volumetric backlight and richer color grade",
  },
  {
    id: "preset-minimalist",
    icon: "📐",
    label: "Minimalist Framing",
    prompt: "Make composition more minimalist with expansive clean negative space in upper third for typography",
  },
  {
    id: "preset-cta",
    icon: "🎯",
    label: "Stronger CTA",
    prompt: "Refine call to action to drive high-urgency comments and saves with direct link-in-bio directive",
  },
  {
    id: "preset-macro",
    icon: "🔍",
    label: "Macro Texture Detail",
    prompt: "Emphasize tactile physical material textures, micro-contrast, and authentic organic surface finishes",
  },
  {
    id: "preset-executive",
    icon: "💼",
    label: "Executive Tone",
    prompt: "Refine typography and layout towards a sophisticated editorial layout tailored for LinkedIn authority",
  },
];

export function PromptResultInspector({
  result,
  onRefine,
  isRefining = false,
  versionHistory = [],
  onSelectVersion,
  onUpdateResult,
}: PromptResultInspectorProps) {
  const [selectedModelTab, setSelectedModelTab] = useState<SupportedModelFamily>(
    result.specification.target_model || "ideogram_v2"
  );
  const [promptDisplayMode, setPromptDisplayMode] = useState<"poster" | "photo">("poster");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [refineText, setRefineText] = useState("");
  const [activeViewTab, setActiveViewTab] = useState<string>("prompt");
  const [activeModifiers, setActiveModifiers] = useState<string[]>([]);
  const [negativeSpacePct, setNegativeSpacePct] = useState(35);

  const activeModelFormat = result.all_model_formats?.[selectedModelTab] || {
    finalPrompt: result.final_prompt,
    negativePrompt: result.negative_prompt,
    copyablePrompt: result.final_prompt,
    posterPrompt: result.poster_prompt,
    photographicPrompt: result.photographic_prompt,
  };

  const displayedPrompt =
    promptDisplayMode === "poster"
      ? activeModelFormat.posterPrompt || result.poster_prompt || activeModelFormat.finalPrompt
      : activeModelFormat.photographicPrompt || result.photographic_prompt || activeModelFormat.finalPrompt;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineText.trim() || isRefining || !onRefine) return;
    const text = refineText.trim();
    setRefineText("");
    await onRefine(text);
  };

  const handlePresetClick = async (presetId: string, presetPrompt: string) => {
    if (isRefining || !onRefine) return;
    setActiveModifiers((prev) =>
      prev.includes(presetId) ? prev.filter((id) => id !== presetId) : [...prev, presetId]
    );
    await onRefine(presetPrompt);
  };

  const {
    platform,
    post_type,
    archetype,
    interpreted_direction,
    model_recommendation,
    aspect_ratio,
    critic_evaluation,
    rationale,
    specification,
    syntax_tokens = [],
    typography_layout,
    caption_text,
    hashtags = [],
    version,
  } = result;

  const typo = typography_layout || specification.typography_layout;

  return (
    <div className="space-y-6 text-zinc-100">
      {/* 1. Header Overview & Version Timeline */}
      <div className="p-5 rounded-3xl bg-zinc-900/90 border border-white/5 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="terracotta" className="gap-1.5 py-1 px-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Social Post & Prompt Intelligence</span>
            </Badge>

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
              <Badge variant="secondary" className="font-mono">
                v{version}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="capitalize">
              {platform}
            </Badge>
            <Badge variant="secondary">
              {post_type.replace(/_/g, " ")}
            </Badge>
            <Badge variant="outline" className="text-blue-300 border-blue-500/20 bg-blue-500/10">
              {archetype.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sapphire-terracotta font-mono">
              Post Headline:
            </span>
            <span className="text-[13px] font-bold text-zinc-100 font-sans">
              &ldquo;{typo?.headline}&rdquo;
            </span>
          </div>
          <p className="text-text-xs text-zinc-400 mt-1 leading-relaxed">
            {interpreted_direction}
          </p>
        </div>

        {/* View Toggle Tabs Bar (shadcn Tabs) */}
        <Tabs value={activeViewTab} onValueChange={setActiveViewTab} className="w-full">
          <TabsList className="w-full justify-start overflow-x-auto h-10 p-1">
            <TabsTrigger value="prompt" className="gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-sapphire-terracotta" />
              <span>Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-1.5 text-xs">
              <Type className="w-3.5 h-3.5 text-pink-400" />
              <span>Post Layout & Canvas</span>
            </TabsTrigger>
            <TabsTrigger value="caption" className="gap-1.5 text-xs">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span>Caption & CTA</span>
            </TabsTrigger>
            <TabsTrigger value="editor" className="gap-1.5 text-xs">
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Token Editor</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-1.5 text-xs">
              <SplitSquareVertical className="w-3.5 h-3.5 text-purple-400" />
              <span>Compare Models</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit ({critic_evaluation.score}/100)</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 2. Main Tab 1: Generation Prompts */}
      {activeViewTab === "prompt" && (
        <div className="space-y-4">
          {/* Dual Mode Switcher: Full Graphic Poster vs Clean Photographic Backdrop */}
          <div className="flex items-center justify-between p-2 rounded-2xl bg-zinc-950 border border-white/10">
            <div className="flex items-center gap-2">
              <Button
                variant={promptDisplayMode === "poster" ? "terracotta" : "ghost"}
                size="sm"
                onClick={() => setPromptDisplayMode("poster")}
                className="gap-1.5"
              >
                <Type className="w-3.5 h-3.5" />
                <span>🖼️ Graphic Poster (In-Image Text)</span>
              </Button>

              <Button
                variant={promptDisplayMode === "photo" ? "terracotta" : "ghost"}
                size="sm"
                onClick={() => setPromptDisplayMode("photo")}
                className="gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>📸 Clean Photographic Canvas</span>
              </Button>
            </div>

            <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline pr-2">
              {promptDisplayMode === "poster"
                ? "Engineered for Ideogram / Midjourney"
                : "Engineered for FLUX / Compositing"}
            </span>
          </div>

          {/* Target Model Selector Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-text-xs text-zinc-400 font-medium px-1">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sapphire-terracotta" />
                <span>Target Model Syntax:</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                Instant 0ms Re-Formatting
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
                      <Badge variant="success" className="absolute top-2 right-2 text-[8px] py-0 px-1">
                        Recommended
                      </Badge>
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

          {/* Prompt Output Box */}
          <div className="p-5 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sapphire-terracotta" />
                <h4 className="text-text-sm font-bold text-zinc-100 uppercase tracking-wider">
                  {MODEL_TAB_CONFIG.find((t) => t.id === selectedModelTab)?.label} — {promptDisplayMode === "poster" ? "Full Poster Prompt" : "Clean Photo Prompt"}
                </h4>
                <Badge variant="secondary" className="font-mono">
                  {aspect_ratio}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(JSON.stringify(specification, null, 2), "json")}
                  className="gap-1.5"
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
                </Button>

                <Button
                  variant={copiedType === "prompt" ? "default" : "terracotta"}
                  size="sm"
                  onClick={() => handleCopy(displayedPrompt, "prompt")}
                  className="gap-1.5"
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
                </Button>
              </div>
            </div>

            {/* Prompt Text Box */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 font-mono text-text-xs text-zinc-200 leading-relaxed select-all whitespace-pre-wrap shadow-inner">
              {displayedPrompt}
            </div>

            {/* Negative Prompt */}
            {activeModelFormat.negativePrompt && (
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase text-zinc-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    Negative Exclusions / Anti-Cliché Blocklist:
                  </span>
                  <button
                    onClick={() => handleCopy(activeModelFormat.negativePrompt!, "negative")}
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
        </div>
      )}

      {/* 3. Main Tab 2: Post Typography & Generative Artifact Canvas */}
      {activeViewTab === "typography" && typo && (
        <div className="space-y-5">
          {/* AI Generative Artifact Canvas Simulator */}
          <GenerativeArtifactCanvas
            aspectRatio={aspect_ratio}
            typography={typo}
            brandName={specification.brand_tokens.brand_name}
            negativeSpacePct={negativeSpacePct}
            onUpdateNegativeSpace={setNegativeSpacePct}
          />

          {/* Typography Token Breakdown Grid */}
          <div className="p-5 rounded-3xl bg-zinc-900 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-pink-400" />
                <h4 className="text-text-sm font-bold text-zinc-100 uppercase tracking-wider">
                  Post Typography & Design Overlay Blueprint
                </h4>
              </div>
              <Badge variant="secondary">Canva / Figma Spec</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-text-xs">
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">
                    Main Headline
                  </span>
                  <button
                    onClick={() => handleCopy(typo.headline, "headline")}
                    className="text-[10px] text-sapphire-terracotta hover:underline font-medium"
                  >
                    {copiedType === "headline" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-zinc-100 font-bold text-[13px]">&ldquo;{typo.headline}&rdquo;</p>
              </div>

              {typo.kicker_badge && (
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">
                      Eyebrow / Kicker Badge
                    </span>
                    <button
                      onClick={() => handleCopy(typo.kicker_badge!, "kicker")}
                      className="text-[10px] text-sapphire-terracotta hover:underline font-medium"
                    >
                      {copiedType === "kicker" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-zinc-200 font-mono text-[12px]">{typo.kicker_badge}</p>
                </div>
              )}

              {typo.subheadline && (
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">
                      Subheadline
                    </span>
                    <button
                      onClick={() => handleCopy(typo.subheadline!, "subhead")}
                      className="text-[10px] text-sapphire-terracotta hover:underline font-medium"
                    >
                      {copiedType === "subhead" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-zinc-300 text-[12px]">{typo.subheadline}</p>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono">
                    Call To Action (CTA)
                  </span>
                  <button
                    onClick={() => handleCopy(typo.cta_text, "cta")}
                    className="text-[10px] text-sapphire-terracotta hover:underline font-medium"
                  >
                    {copiedType === "cta" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="text-emerald-400 font-medium text-[12px]">{typo.cta_text}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono block">
                  Font Pairing Recommendation
                </span>
                <p className="text-zinc-200 font-mono text-[11px]">{typo.font_pairing_recommendation}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-400 font-mono block">
                  Text Placement Zone
                </span>
                <p className="text-zinc-200 font-mono text-[11px] capitalize">
                  {typo.text_placement_zone.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Tab 3: Complete Social Caption & Hashtags */}
      {activeViewTab === "caption" && (
        <div className="p-5 rounded-3xl bg-zinc-900 border border-white/10 shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <h4 className="text-text-sm font-bold text-zinc-100 uppercase tracking-wider">
                Platform-Native Social Media Caption
              </h4>
            </div>
            <Button
              variant="terracotta"
              size="sm"
              onClick={() => handleCopy(`${caption_text}\n\n${hashtags.join(" ")}`, "full-caption")}
              className="gap-1.5"
            >
              {copiedType === "full-caption" ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Caption Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Full Caption</span>
                </>
              )}
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 font-sans text-text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap select-all shadow-inner">
            {caption_text || "No caption generated for this prompt."}
          </div>

          {hashtags && hashtags.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[11px] font-semibold uppercase text-zinc-400 font-mono flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-400" />
                Targeted Hashtags:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {hashtags.map((h, i) => (
                  <Badge key={i} variant="secondary" className="font-mono text-blue-300">
                    {h.startsWith("#") ? h : `#${h}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Main Tab 4: Tokenized Editor */}
      {activeViewTab === "editor" && (
        <TokenizedPromptEditor
          result={result}
          onUpdateResult={onUpdateResult}
        />
      )}

      {/* 6. Main Tab 5: Comparative Models View */}
      {activeViewTab === "compare" && (
        <ComparativeSyntaxView result={result} />
      )}

      {/* 7. Main Tab 6: Quality Critic Audit */}
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
              <Badge variant="success">Passed Audit</Badge>
            </div>
          </div>

          <TooltipProvider>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1 cursor-help">
                    <div className="text-zinc-400">Intent Fidelity</div>
                    <div className="font-mono font-bold text-zinc-200">
                      {critic_evaluation.intent_fidelity} / 20
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Adherence to brand topic and audience goals</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1 cursor-help">
                    <div className="text-zinc-400">Platform Fit</div>
                    <div className="font-mono font-bold text-zinc-200">
                      {critic_evaluation.platform_native_fit} / 15
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Native aesthetic and aspect ratio for {platform}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1 cursor-help">
                    <div className="text-zinc-400">Brand Alignment</div>
                    <div className="font-mono font-bold text-zinc-200">
                      {critic_evaluation.brand_alignment} / 15
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Compliance with brand colors, voice, and motifs</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1 cursor-help">
                    <div className="text-zinc-400">Visual Specificity</div>
                    <div className="font-mono font-bold text-zinc-200">
                      {critic_evaluation.visual_specificity} / 15
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exact lens, lighting, materials, and depth</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1 cursor-help">
                    <div className="text-zinc-400">Composition Coherence</div>
                    <div className="font-mono font-bold text-zinc-200">
                      {critic_evaluation.composition_coherence} / 10
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Safe-zone negative space budget for typography</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1 cursor-help">
                    <div className="text-zinc-400">Model Compatibility</div>
                    <div className="font-mono font-bold text-zinc-200">
                      {critic_evaluation.model_compatibility} / 10
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Optimal model capabilities and flag syntax</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

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

      {/* 8. Strategic Direction Rationale Card */}
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
                <Badge key={i} variant="secondary">
                  ✕ {c}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 9. 1-Click Quick Refinement Presets Bar with Stateful Modifiers */}
      {onRefine && (
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-white/10 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="w-4 h-4 text-sapphire-terracotta" />
              <h4 className="text-text-sm font-bold text-zinc-100">
                Quick Refinement Modifiers
              </h4>
            </div>
            <Badge variant="secondary" className="font-mono">
              {activeModifiers.length} active
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {QUICK_REFINEMENT_PRESETS.map((preset) => {
              const isActive = activeModifiers.includes(preset.id);

              return (
                <Button
                  key={preset.id}
                  type="button"
                  variant={isActive ? "terracotta" : "outline"}
                  size="sm"
                  disabled={isRefining}
                  onClick={() => handlePresetClick(preset.id, preset.prompt)}
                  className="gap-1.5"
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                  {isActive && <Check className="w-3 h-3 text-white" />}
                </Button>
              );
            })}
          </div>

          {/* Conversational Prompt Refiner */}
          <form onSubmit={handleRefineSubmit} className="flex items-center gap-2 pt-2 border-t border-white/5">
            <input
              type="text"
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              placeholder="Or type custom refinement (e.g. 'Make headline shorter and change CTA to Tap Bio')..."
              disabled={isRefining}
              className="flex-1 px-4 py-2 rounded-xl bg-zinc-950 border border-white/10 text-text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-sapphire-terracotta transition-colors"
            />
            <Button
              type="submit"
              variant="terracotta"
              disabled={isRefining || !refineText.trim()}
              className="gap-1.5"
            >
              {isRefining ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Refine</span>
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
