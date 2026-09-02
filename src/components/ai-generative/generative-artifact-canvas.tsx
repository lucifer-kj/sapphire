"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Type,
  Camera,
  Copy,
  Check,
  Maximize2,
  Share2,
  Sliders,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ParameterSliderControl } from "./parameter-slider-control";
import { ShimmerSkeleton } from "./shimmer-skeleton";
import { AspectRatioVisualizer, AspectRatioType } from "@/components/ui/aspect-ratio-visualizer";
import { TypographyLayout } from "@/modules/prompt-intelligence/domain/prompt-spec";
import { cn } from "@/lib/utils";

interface GenerativeArtifactCanvasProps {
  isLoading?: boolean;
  aspectRatio?: string;
  typography?: TypographyLayout;
  brandName?: string;
  onUpdateNegativeSpace?: (pct: number) => void;
  negativeSpacePct?: number;
  onUpdateAspectRatio?: (ratio: string) => void;
}

export function GenerativeArtifactCanvas({
  isLoading = false,
  aspectRatio = "4:5",
  typography,
  brandName = "Brand",
  onUpdateNegativeSpace,
  negativeSpacePct = 35,
  onUpdateAspectRatio,
}: GenerativeArtifactCanvasProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showParameters, setShowParameters] = useState(false);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-3xl bg-zinc-900/80 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sapphire-terracotta animate-spin" />
            <ShimmerSkeleton className="w-48 h-5" />
          </div>
          <ShimmerSkeleton className="w-16 h-5 rounded-md" />
        </div>
        <ShimmerSkeleton variant="card" className="h-96" />
        <div className="grid grid-cols-2 gap-3">
          <ShimmerSkeleton className="h-12 rounded-xl" />
          <ShimmerSkeleton className="h-12 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl space-y-5">
      {/* Header Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sapphire-terracotta/15 border border-sapphire-terracotta/30 flex items-center justify-center text-sapphire-terracotta">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">
              Generative Post Canvas Simulator
            </h4>
            <p className="text-[10px] text-zinc-400 font-mono">
              Live Mockup • Safe-Zone Overlay • {aspectRatio}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParameters((prev) => !prev)}
            className="flex items-center gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-sapphire-terracotta" />
            <span>{showParameters ? "Hide Tuning" : "Tune Layout"}</span>
          </Button>

          <Badge variant="terracotta">
            {aspectRatio}
          </Badge>
        </div>
      </div>

      {/* Optional Tuning Sliders & Aspect Ratio Drawer */}
      {showParameters && (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-4">
          <div className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Layout & Canvas Parameters</span>
          </div>

          {onUpdateAspectRatio && (
            <AspectRatioVisualizer
              currentRatio={aspectRatio}
              onRatioChange={(r) => onUpdateAspectRatio(r)}
              negativeSpacePct={negativeSpacePct}
            />
          )}

          {onUpdateNegativeSpace && (
            <ParameterSliderControl
              label="Negative Space Safe-Zone"
              value={negativeSpacePct}
              min={20}
              max={50}
              step={5}
              unit="%"
              description="Percentage of vertical frame reserved cleanly for typography without background clutter."
              onChange={onUpdateNegativeSpace}
            />
          )}
        </div>
      )}


      {/* Interactive Mockup Preview Card (Compact & Zone-Aware) */}
      {typography && (
        <div className="relative aspect-[4/5] max-w-[320px] mx-auto rounded-3xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border border-white/15 p-5 flex flex-col justify-between shadow-2xl overflow-hidden group">
          {/* Ambient subtle light glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sapphire-terracotta/20 via-transparent to-transparent pointer-events-none" />

          {/* If Top Zone: Typography on top, scenery in middle/lower */}
          {typography.text_placement_zone !== "bottom_third" ? (
            <>
              {/* Top Zone: Kicker Eyebrow Badge + Main Bold Headline */}
              <div className="space-y-1.5 relative z-10">
                {typography.kicker_badge && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sapphire-terracotta/20 border border-sapphire-terracotta/40 text-[9px] font-bold uppercase tracking-wider text-sapphire-terracotta backdrop-blur">
                    <span>{typography.kicker_badge}</span>
                  </div>
                )}

                <h2 className="text-lg md:text-xl font-bold font-serif text-white leading-tight tracking-tight drop-shadow-lg">
                  {typography.headline}
                </h2>

                {typography.subheadline && (
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed drop-shadow-md">
                    {typography.subheadline}
                  </p>
                )}
              </div>

              {/* Lower Photographic Focal Placeholder */}
              <div className="border border-dashed border-white/15 rounded-xl p-3 text-center my-2 text-[10px] text-zinc-500 font-mono bg-zinc-950/40 backdrop-blur-xs flex-1 flex flex-col items-center justify-center">
                <Camera className="w-4 h-4 mx-auto mb-1 text-zinc-600" />
                <span>[ Hero Photographic Scenery Focal Zone ]</span>
                <div className="text-[8px] text-zinc-600 mt-0.5">
                  Upper Clean Negative Space ({negativeSpacePct}%)
                </div>
              </div>

              {/* Bottom Margin: CTA Action + Brand Watermark */}
              <div className="space-y-1.5 pt-2 border-t border-white/10 relative z-10">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-zinc-200">
                    👉 {typography.cta_text}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    {typography.brand_watermark}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* If Bottom Zone: Scenery on top, typography on bottom */}
              <div className="border border-dashed border-white/15 rounded-xl p-3 text-center mb-2 text-[10px] text-zinc-500 font-mono bg-zinc-950/40 backdrop-blur-xs flex-1 flex flex-col items-center justify-center">
                <Camera className="w-4 h-4 mx-auto mb-1 text-zinc-600" />
                <span>[ Hero Photographic Scenery Focal Zone ]</span>
                <div className="text-[8px] text-zinc-600 mt-0.5">
                  Lower Clean Negative Space ({negativeSpacePct}%)
                </div>
              </div>

              <div className="space-y-1.5 relative z-10 pt-2 border-t border-white/10">
                {typography.kicker_badge && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sapphire-terracotta/20 border border-sapphire-terracotta/40 text-[9px] font-bold uppercase tracking-wider text-sapphire-terracotta backdrop-blur">
                    <span>{typography.kicker_badge}</span>
                  </div>
                )}

                <h2 className="text-lg md:text-xl font-bold font-serif text-white leading-tight tracking-tight drop-shadow-lg">
                  {typography.headline}
                </h2>

                {typography.subheadline && (
                  <p className="text-[11px] text-zinc-300 font-sans leading-relaxed drop-shadow-md">
                    {typography.subheadline}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="font-semibold text-zinc-200">
                    👉 {typography.cta_text}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400">
                    {typography.brand_watermark}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}
