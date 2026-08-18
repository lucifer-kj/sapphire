"use strict";
import React, { useState } from "react";
import { WorkflowLogEntry } from "@/lib/schema/telemetry";
import {
  X,
  Copy,
  Check,
  Activity,
  Zap,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Terminal,
  ChevronDown,
  ChevronRight,
  Filter,
} from "lucide-react";

interface LogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: WorkflowLogEntry[];
}

export const LogDrawer: React.FC<LogDrawerProps> = ({ isOpen, onClose, logs }) => {
  const [filter, setFilter] = useState<string>("all");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalDuration = logs.reduce((acc, log) => acc + log.durationMs, 0);
  const fallbackCount = logs.filter((l) => l.status === "fallback").length;
  const errorCount = logs.filter((l) => l.status === "error").length;

  const filteredLogs = logs.filter((log) => {
    if (filter === "all") return true;
    if (filter === "groq") return log.provider === "Groq";
    if (filter === "gemini") return log.provider === "Google Gemini";
    if (filter === "image") return log.agent.includes("ImageGeneration");
    if (filter === "fallback") return log.status === "fallback";
    if (filter === "error") return log.status === "error";
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLogs = () => {
    const text = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getProviderBadge = (provider: string, model: string) => {
    switch (provider) {
      case "Groq":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#D97757]/15 text-[#D97757] border border-[#D97757]/30">
            <Zap className="w-3 h-3" />
            Groq ({model})
          </span>
        );
      case "Google Gemini":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Sparkles className="w-3 h-3" />
            Gemini ({model})
          </span>
        );
      case "Nano Banana":
      case "Nano Banana 2":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-3 h-3" />
            Nano Banana 2 ({model})
          </span>
        );
      case "Cloudflare Workers AI (Flux)":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-orange-500/15 text-orange-300 border border-orange-500/30">
            <Sparkles className="w-3 h-3" />
            Cloudflare FLUX ({model.split("/").pop()})
          </span>
        );
      case "Pollinations AI":
      case "Pollinations AI (Flux)":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Terminal className="w-3 h-3" />
            Pollinations (Flux)
          </span>
        );
      case "Puter.js":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3 h-3" />
            Puter.js ({model})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-white/5 text-stone-300 border border-white/10">
            {provider}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Success
          </span>
        );
      case "fallback":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Fallback Triggered
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-300 bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            Error
          </span>
        );
      default:
        return <span className="text-[11px] text-stone-400 font-medium">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-zinc-950 h-full shadow-2xl flex flex-col border-l border-white/10 text-zinc-100">
        {/* Header */}
        <div className="p-4 bg-zinc-900 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sapphire-terracotta/15 flex items-center justify-center text-sapphire-terracotta border border-sapphire-terracotta/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-100">
                Agent Telemetry & Execution Logs
              </h2>
              <p className="text-xs text-zinc-400 font-mono">
                {logs.length} events recorded • Total Latency: {totalDuration}ms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl transition-colors border border-white/5 shadow-sm"
              title="Copy complete JSON log trace"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Trace</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-zinc-900 border-b border-white/5 text-xs">
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5">
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">
              Total Steps
            </span>
            <span className="font-semibold text-zinc-100 text-sm">{logs.length}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5">
            <span className="text-zinc-500 block text-[10px] uppercase font-mono">
              Total Duration
            </span>
            <span className="font-semibold text-zinc-100 text-sm">
              {(totalDuration / 1000).toFixed(2)}s
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-amber-400 block text-[10px] uppercase font-mono">
              Fallbacks
            </span>
            <span className="font-semibold text-amber-300 text-sm">{fallbackCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <span className="text-rose-400 block text-[10px] uppercase font-mono">Errors</span>
            <span className="font-semibold text-rose-300 text-sm">{errorCount}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-950 border-b border-white/5 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1" />
          {[
            { id: "all", label: "All Logs" },
            { id: "groq", label: "Groq" },
            { id: "gemini", label: "Gemini" },
            { id: "image", label: "Image Gen" },
            { id: "fallback", label: `Fallbacks (${fallbackCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? "bg-sapphire-terracotta text-white"
                  : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Log Entries Timeline */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No log entries match the selected filter.
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const isExpanded = !!expandedIds[log.id];
              return (
                <div
                  key={log.id || index}
                  className={`bg-zinc-900 rounded-2xl border transition-all ${
                    log.status === "error"
                      ? "border-rose-500/40"
                      : log.status === "fallback"
                      ? "border-amber-500/40"
                      : "border-white/5 hover:border-white/15"
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-3.5 cursor-pointer flex items-start justify-between gap-2 select-none"
                  >
                    <div className="flex items-start gap-2 flex-1">
                      <button className="mt-0.5 text-zinc-400 hover:text-zinc-200">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-zinc-100">
                            {log.agent}
                          </span>
                          {getProviderBadge(log.provider, log.model)}
                          {getStatusBadge(log.status)}
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                          {log.summary}
                        </p>
                      </div>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-500">
                        <Clock className="w-3 h-3" />
                        {log.durationMs}ms
                      </span>
                    </div>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && (
                    <div className="border-t border-white/5 p-3.5 bg-zinc-950 rounded-b-2xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono uppercase text-zinc-500">
                          Raw Payload / State
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="text-[11px] font-mono bg-zinc-950 text-zinc-200 p-3 rounded-xl overflow-x-auto max-h-60 leading-tight border border-white/5">
                        {JSON.stringify(log.details || log, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

