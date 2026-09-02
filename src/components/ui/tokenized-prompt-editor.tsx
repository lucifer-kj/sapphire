"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Camera,
  Sun,
  Layers,
  Sliders,
  Check,
  RotateCcw,
  Copy,
  ChevronDown,
  Tag,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { PromptSpecification } from "@/modules/prompt-intelligence/domain/prompt-spec";
import { PromptResult } from "@/modules/prompt-intelligence/domain/prompt-result";
import { PromptFormattersService } from "@/modules/prompt-intelligence/services/prompt-formatters";
import { DesignArchetype } from "@/lib/design-system/archetypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ParameterSliderControl } from "@/components/ai-generative/parameter-slider-control";

interface TokenizedPromptEditorProps {
  result: PromptResult;
  onUpdateResult?: (updatedResult: PromptResult) => void;
}

const LENS_OPTIONS = [
  { label: "85mm f/1.4 (Portrait & Hero Subject)", value: "85mm f/1.4 portrait lens, shallow depth of field, creamy bokeh falloff" },
  { label: "50mm f/1.2 (Editorial Authentic)", value: "50mm f/1.2 prime lens, natural human eye perspective, crisp focal isolation" },
  { label: "35mm f/1.8 (Environmental Storytelling)", value: "35mm f/1.8 documentary lens, expansive contextual environmental depth" },
  { label: "24mm f/2.8 (Architectural Dynamics)", value: "24mm wide-angle lens, leading perspective lines, geometric structural clarity" },
  { label: "100mm f/2.8 Macro (Tactile Detail)", value: "100mm f/2.8 macro lens, extreme textural micro-contrast, tactile surface details" },
];

const LIGHTING_OPTIONS = [
  { label: "Soft Diffused Keylight (45° Key + Rim)", value: "Soft 45-degree diffused keylight with subtle warm rim backlight and soft shadows" },
  { label: "Warm Golden Hour Ambient", value: "Warm golden hour natural sunlight with low-angle amber illumination and long soft shadows" },
  { label: "Volumetric Cinematic Backlight", value: "Atmospheric volumetric lighting with subtle haze rays and high-contrast rim separation" },
  { label: "Moody High-Contrast Chiaroscuro", value: "High-contrast chiaroscuro studio lighting, deep rich blacks, focused specular highlights" },
  { label: "Crisp High-Key Studio Flash", value: "Crisp commercial high-key studio flash, clean neutral illumination, zero harsh shadows" },
];

const ASPECT_RATIO_OPTIONS = [
  { label: "4:5 (Instagram Portrait / Feed Standard)", value: "4:5" },
  { label: "1:1 (Square Universal / Feed)", value: "1:1" },
  { label: "16:9 (Landscape / Banner)", value: "16:9" },
  { label: "9:16 (Story / Vertical Video)", value: "9:16" },
];

const ARCHETYPE_OPTIONS: Array<{ label: string; value: DesignArchetype }> = [
  { label: "Editorial Magazine (Tactile & High-Contrast)", value: "editorial_magazine" },
  { label: "Conceptual Split (Metaphor & Abstract)", value: "conceptual_split" },
  { label: "Comparison Split (Before/After Context)", value: "comparison_split" },
  { label: "Vintage Poster (Warm Grain & Geometry)", value: "vintage_poster" },
  { label: "SaaS Dotgrid (Structured Tech Blueprint)", value: "saas_dotgrid" },
];

export function TokenizedPromptEditor({
  result,
  onUpdateResult,
}: TokenizedPromptEditorProps) {
  const [copied, setCopied] = useState(false);
  const [negativeSpacePct, setNegativeSpacePct] = useState(35);

  const spec = result.specification;

  const handleUpdateParameter = (field: keyof PromptSpecification, value: any) => {
    const updatedSpec: PromptSpecification = {
      ...spec,
      [field]: value,
    };

    const bundle = PromptFormattersService.formatPromptBundle(updatedSpec);

    const updatedResult: PromptResult = {
      ...result,
      aspect_ratio: updatedSpec.aspect_ratio,
      archetype: updatedSpec.archetype,
      specification: updatedSpec,
      final_prompt: bundle.primary.finalPrompt,
      negative_prompt: bundle.primary.negativePrompt,
      poster_prompt: bundle.posterPrompt,
      photographic_prompt: bundle.photographicPrompt,
      all_model_formats: bundle.allModelFormats,
      syntax_tokens: bundle.syntaxTokens,
    };

    if (onUpdateResult) {
      onUpdateResult(updatedResult);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(result.final_prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentLensLabel =
    LENS_OPTIONS.find((l) => spec.camera_and_optics.includes(l.value.slice(0, 10)))?.label ||
    spec.camera_and_optics.slice(0, 32) + "...";

  const currentLightingLabel =
    LIGHTING_OPTIONS.find((l) => spec.lighting.includes(l.value.slice(0, 12)))?.label ||
    spec.lighting.slice(0, 32) + "...";

  return (
    <div className="p-5 rounded-3xl bg-zinc-900 border border-white/10 shadow-xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Tokenized Parameter Studio
            </h4>
            <p className="text-[10px] text-zinc-400 font-mono">
              Accessible Radix Dropdowns • 0ms Re-Compilation
            </p>
          </div>
        </div>

        <Badge variant="terracotta" className="gap-1">
          <Zap className="w-2.5 h-2.5" />
          <span>Live 0ms</span>
        </Badge>
      </div>

      {/* Interactive Parameter Dropdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* 1. Camera & Optics Token */}
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-sapphire-terracotta" />
              <span>Lens & Perspective:</span>
            </span>
            <Badge variant="secondary">Optics</Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal h-auto py-2 px-3 text-xs"
              >
                <span className="truncate pr-2 font-medium text-zinc-200">
                  {currentLensLabel}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              {LENS_OPTIONS.map((opt, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => handleUpdateParameter("camera_and_optics", opt.value)}
                  className="text-xs py-2"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 2. Lighting Architecture Token */}
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Lighting Architecture:</span>
            </span>
            <Badge variant="secondary">Lighting</Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal h-auto py-2 px-3 text-xs"
              >
                <span className="truncate pr-2 font-medium text-zinc-200">
                  {currentLightingLabel}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              {LIGHTING_OPTIONS.map((opt, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => handleUpdateParameter("lighting", opt.value)}
                  className="text-xs py-2"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 3. Aspect Ratio Token */}
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Aspect Ratio:</span>
            </span>
            <Badge variant="secondary">Canvas</Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal h-auto py-2 px-3 text-xs"
              >
                <span className="font-mono font-bold text-zinc-100">
                  {spec.aspect_ratio} ({ASPECT_RATIO_OPTIONS.find((a) => a.value === spec.aspect_ratio)?.label.split("(")[1]?.replace(")", "") || "Custom"})
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              {ASPECT_RATIO_OPTIONS.map((opt, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => handleUpdateParameter("aspect_ratio", opt.value)}
                  className="text-xs py-2"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 4. Design Archetype Token */}
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-purple-400" />
              <span>Design Archetype:</span>
            </span>
            <Badge variant="secondary">Style</Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between text-left font-normal h-auto py-2 px-3 text-xs"
              >
                <span className="truncate pr-2 font-medium text-zinc-200 capitalize">
                  {spec.archetype.replace(/_/g, " ")}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
              {ARCHETYPE_OPTIONS.map((opt, i) => (
                <DropdownMenuItem
                  key={i}
                  onClick={() => handleUpdateParameter("archetype", opt.value)}
                  className="text-xs py-2"
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Parameter Slider: Negative Space Budget */}
      <ParameterSliderControl
        label="Reserved Negative Space for Typography"
        value={negativeSpacePct}
        min={20}
        max={50}
        step={5}
        unit="%"
        description="Calculates vertical clear zone to prevent photographic subjects from obstructing headlines."
        onChange={(val) => {
          setNegativeSpacePct(val);
        }}
      />

      {/* Re-Compiled Prompt Display */}
      <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-sapphire-terracotta" />
            <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
              Re-Compiled Prompt ({result.specification.target_model}):
            </span>
          </div>

          <Button
            size="sm"
            variant={copied ? "default" : "terracotta"}
            onClick={handleCopyPrompt}
            className="gap-1.5 text-[11px]"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900 border border-white/5 font-mono text-text-xs text-zinc-200 leading-relaxed max-h-36 overflow-y-auto select-all">
          {result.final_prompt}
        </div>
      </div>
    </div>
  );
}
