"use client";

import React from "react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface ParameterSliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  description?: string;
  onChange: (val: number) => void;
}

export function ParameterSliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  description,
  onChange,
}: ParameterSliderControlProps) {
  return (
    <div className="p-3 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
          <span>{label}</span>
          {description && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-zinc-500 hover:text-zinc-300">
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <span className="font-mono text-[11px] font-semibold text-sapphire-terracotta bg-sapphire-terracotta/10 px-2 py-0.5 rounded-md border border-sapphire-terracotta/20">
          {value}{unit}
        </span>
      </div>

      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(vals) => onChange(vals[0])}
        className="cursor-pointer py-1"
      />
    </div>
  );
}
