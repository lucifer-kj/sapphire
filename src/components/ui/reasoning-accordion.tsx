"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  BrainCircuit,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReasoningAccordionProps {
  isThinking?: boolean;
  thoughtContent: string;
  durationMs?: number;
  modelName?: string;
  defaultOpen?: boolean;
  className?: string;
}

export function ReasoningAccordion({
  isThinking = false,
  thoughtContent,
  durationMs,
  modelName = "Gemini 2.5 Flash",
  defaultOpen = false,
  className,
}: ReasoningAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen || isThinking);
  const [elapsedMs, setElapsedMs] = useState(0);

  // Live timer while isThinking is active
  useEffect(() => {
    let timer: any;
    if (isThinking) {
      setIsOpen(true);
      const start = Date.now();
      timer = setInterval(() => {
        setElapsedMs(Date.now() - start);
      }, 100);
    } else {
      if (durationMs) setElapsedMs(durationMs);
    }
    return () => clearInterval(timer);
  }, [isThinking, durationMs]);

  if (!thoughtContent && !isThinking) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200 overflow-hidden",
        isThinking
          ? "bg-zinc-950/80 border-sapphire-terracotta/30 shadow-md"
          : "bg-zinc-950/50 border-white/5",
        className
      )}
    >
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-3 flex items-center justify-between cursor-pointer select-none text-left"
      >
        <div className="flex items-center gap-2">
          {isThinking ? (
            <div className="w-5 h-5 rounded-full bg-sapphire-terracotta/15 flex items-center justify-center text-sapphire-terracotta animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
          ) : (
            <BrainCircuit className="w-4 h-4 text-zinc-400" />
          )}

          <span className="text-xs font-semibold text-zinc-300">
            {isThinking ? "Reasoning & Formulating..." : "Reasoning Process"}
          </span>

          <Badge variant="secondary" className="font-mono text-[9px]">
            {(elapsedMs / 1000).toFixed(1)}s
          </Badge>

          {modelName && (
            <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
              ({modelName})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-zinc-500 hover:text-zinc-300">
          <span className="text-[10px] font-mono">{isOpen ? "Hide" : "View"}</span>
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-white/5 space-y-2">
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-white/5 font-mono text-[11px] text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
            {thoughtContent || (
              <span className="text-zinc-500 italic">
                Deconstructing brief, querying platform rules, formulating visual metaphor...
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
