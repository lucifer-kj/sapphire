"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BorderBeam } from "@/components/ui/border-beam";
import { cn } from "@/lib/utils";

export interface AgentExecutionCardProps {
  agentName: string;
  role: string;
  status: "pending" | "active" | "success" | "error";
  durationMs?: number;
  thinkingTrace?: string;
  summary: string;
  modelName?: string;
  inputPayload?: Record<string, any>;
  outputPayload?: Record<string, any>;
  confidenceScore?: number;
}

export function AgentExecutionCard({
  agentName,
  role,
  status,
  durationMs,
  thinkingTrace,
  summary,
  modelName,
  inputPayload,
  outputPayload,
  confidenceScore,
}: AgentExecutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all duration-200 overflow-hidden",
        status === "active" &&
          "bg-zinc-900/90 border-sapphire-terracotta/40 shadow-lg ring-1 ring-sapphire-terracotta/20",
        status === "success" &&
          "bg-zinc-900/70 border-white/5 hover:border-white/10",
        status === "pending" &&
          "bg-zinc-950/50 border-white/5 opacity-60",
        status === "error" &&
          "bg-red-950/20 border-red-500/30"
      )}
    >
      {/* Animated Border Beam for active running state */}
      {status === "active" && <BorderBeam duration={5} size={150} />}

      {/* Header Row */}
      <div

        onClick={() => setIsExpanded((prev) => !prev)}
        className="p-3.5 flex items-center justify-between cursor-pointer select-none gap-3"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Status Indicator */}
          <div className="shrink-0">
            {status === "active" && (
              <div className="w-5 h-5 rounded-full bg-sapphire-terracotta/20 flex items-center justify-center text-sapphire-terracotta animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
            )}
            {status === "success" && (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            {status === "error" && (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            {status === "pending" && (
              <div className="w-4 h-4 rounded-full border border-zinc-700" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-100 truncate">
                {agentName}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                ({role})
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{summary}</p>
          </div>
        </div>

        {/* Right Metadata Badges */}
        <div className="flex items-center gap-1.5 shrink-0">
          {confidenceScore !== undefined && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="success">
                    {confidenceScore}%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>RAG Retrieval Validation Confidence</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {modelName && (
            <Badge variant="secondary" className="font-mono hidden md:inline-flex">
              {modelName}
            </Badge>
          )}

          {durationMs !== undefined && (
            <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {(durationMs / 1000).toFixed(1)}s
            </span>
          )}

          <div className="text-zinc-500 hover:text-zinc-300 ml-1">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </div>
        </div>
      </div>

      {/* Expandable Reasoning Trace & Payloads */}
      {isExpanded && (
        <div className="p-3.5 pt-0 border-t border-white/5 space-y-3 mt-1 bg-zinc-950/60 text-xs">
          {/* Thinking / Chain-of-Thought Trace */}
          {thinkingTrace && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-sapphire-terracotta" />
                Reasoning Trace:
              </span>
              <p className="text-[11px] font-sans text-zinc-300 leading-relaxed p-2.5 rounded-xl bg-zinc-900 border border-white/5">
                {thinkingTrace}
              </p>
            </div>
          )}

          {/* Input & Output Payloads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] font-mono">
            {inputPayload && (
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1 overflow-x-auto">
                <span className="text-zinc-400 font-semibold uppercase flex items-center gap-1">
                  <Terminal className="w-2.5 h-2.5 text-blue-400" />
                  Inputs:
                </span>
                <pre className="text-zinc-300">{JSON.stringify(inputPayload, null, 2)}</pre>
              </div>
            )}
            {outputPayload && (
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 space-y-1 overflow-x-auto">
                <span className="text-zinc-400 font-semibold uppercase flex items-center gap-1">
                  <Terminal className="w-2.5 h-2.5 text-emerald-400" />
                  Outputs:
                </span>
                <pre className="text-zinc-300">{JSON.stringify(outputPayload, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
