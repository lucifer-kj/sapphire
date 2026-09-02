"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Maximize2, Layout, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export type AspectRatioType = "4:5" | "1:1" | "9:16" | "16:9";

interface AspectRatioVisualizerProps {
  currentRatio: string;
  onRatioChange: (ratio: AspectRatioType) => void;
  negativeSpacePct?: number;
  className?: string;
}

const RATIO_CONFIG: Array<{
  ratio: AspectRatioType;
  label: string;
  sublabel: string;
  resolution: string;
  widthPercent: number;
  heightPercent: number;
}> = [
  {
    ratio: "4:5",
    label: "4:5 Portrait",
    sublabel: "Instagram Standard",
    resolution: "1080 × 1350",
    widthPercent: 80,
    heightPercent: 100,
  },
  {
    ratio: "1:1",
    label: "1:1 Square",
    sublabel: "Universal Feed",
    resolution: "1080 × 1080",
    widthPercent: 85,
    heightPercent: 85,
  },
  {
    ratio: "9:16",
    label: "9:16 Story",
    sublabel: "Reels / TikTok",
    resolution: "1080 × 1920",
    widthPercent: 56,
    heightPercent: 100,
  },
  {
    ratio: "16:9",
    label: "16:9 Banner",
    sublabel: "Web / Landscape",
    resolution: "1920 × 1080",
    widthPercent: 100,
    heightPercent: 56,
  },
];

export function AspectRatioVisualizer({
  currentRatio,
  onRatioChange,
  negativeSpacePct = 35,
  className,
}: AspectRatioVisualizerProps) {
  const activeConfig =
    RATIO_CONFIG.find((c) => c.ratio === currentRatio) || RATIO_CONFIG[0];

  return (
    <div className={cn("p-4 rounded-3xl bg-zinc-950 border border-white/5 space-y-4", className)}>
      {/* Segmented Ratio Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Layout className="w-4 h-4 text-sapphire-terracotta" />
          <span className="text-xs font-semibold text-zinc-200">
            Aspect Ratio & Canvas Safe-Zone
          </span>
        </div>

        <Badge variant="secondary" className="font-mono">
          {activeConfig.resolution}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-white/5">
        {RATIO_CONFIG.map((item) => {
          const isActive = currentRatio === item.ratio;
          return (
            <button
              key={item.ratio}
              type="button"
              onClick={() => onRatioChange(item.ratio)}
              className={cn(
                "p-2 rounded-xl text-left transition-all flex flex-col justify-between",
                isActive
                  ? "bg-zinc-800 text-zinc-100 font-semibold shadow-xs ring-1 ring-sapphire-terracotta/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs">{item.ratio}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-sapphire-terracotta" />
                )}
              </div>
              <span className="text-[10px] text-zinc-500 mt-1 truncate">
                {item.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Mini Interactive Canvas Silhouette Frame */}
      <div className="h-44 w-full rounded-2xl bg-zinc-900/60 border border-white/5 flex items-center justify-center relative overflow-hidden p-3">
        {/* Dimension Lines */}
        <div
          style={{
            width: `${activeConfig.widthPercent}%`,
            height: `${activeConfig.heightPercent}%`,
          }}
          className="transition-all duration-300 rounded-xl border border-sapphire-terracotta/50 bg-zinc-950 flex flex-col justify-between p-2.5 relative shadow-xl"
        >
          {/* Upper Negative Space Safe Zone Guide */}
          <div
            style={{ height: `${negativeSpacePct}%` }}
            className="w-full rounded-lg border border-dashed border-emerald-500/40 bg-emerald-500/5 flex items-center justify-center"
          >
            <span className="text-[9px] font-mono text-emerald-400 font-semibold tracking-wider">
              {negativeSpacePct}% Safe-Zone
            </span>
          </div>

          {/* Hero Center Indicator */}
          <div className="text-center text-[9px] font-mono text-zinc-600">
            [ Visual Hero Focus ]
          </div>

          {/* Footer Safe Zone */}
          <div className="w-full h-4 rounded border border-dashed border-white/10 bg-white/5 flex items-center justify-between px-2 text-[8px] font-mono text-zinc-500">
            <span>CTA</span>
            <span>Brand</span>
          </div>
        </div>
      </div>
    </div>
  );
}
