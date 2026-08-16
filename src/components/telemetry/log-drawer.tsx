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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-[#F5E8E4] text-[#D97757] border border-[#D97757]/20">
            <Zap className="w-3 h-3" />
            Groq ({model})
          </span>
        );
      case "Google Gemini":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3 h-3" />
            Gemini ({model})
          </span>
        );
      case "Nano Banana":
      case "Nano Banana 2":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <Sparkles className="w-3 h-3" />
            Nano Banana 2 ({model})
          </span>
        );
      case "Pollinations AI":
      case "Pollinations AI (Flux)":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <Terminal className="w-3 h-3" />
            Pollinations (Flux)
          </span>
        );
      case "Puter.js":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Sparkles className="w-3 h-3" />
            Puter.js ({model})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-stone-100 text-stone-700 border border-stone-200">
            {provider}
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Success
          </span>
        );
      case "fallback":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Fallback Triggered
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Error
          </span>
        );
      default:
        return <span className="text-[11px] text-stone-500 font-medium">{status}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#FAF9F5] h-full shadow-2xl flex flex-col border-l border-[#141413]/10">
        {/* Header */}
        <div className="p-4 bg-[#FFFFFF] border-b border-[#141413]/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D97757]/10 flex items-center justify-center text-[#D97757]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#141413]">
                Agent Telemetry & Execution Logs
              </h2>
              <p className="text-xs text-stone-500 font-mono">
                {logs.length} events recorded • Total Latency: {totalDuration}ms
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLogs}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-[#141413] rounded-md transition-colors border border-stone-200"
              title="Copy complete JSON log trace"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
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
              className="p-1.5 rounded-md hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Metrics Bar */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-[#FFFFFF] border-b border-[#141413]/10 text-xs">
          <div className="p-2 rounded bg-stone-50 border border-stone-200">
            <span className="text-stone-500 block text-[10px] uppercase font-mono">
              Total Steps
            </span>
            <span className="font-semibold text-stone-800 text-sm">{logs.length}</span>
          </div>
          <div className="p-2 rounded bg-stone-50 border border-stone-200">
            <span className="text-stone-500 block text-[10px] uppercase font-mono">
              Total Duration
            </span>
            <span className="font-semibold text-stone-800 text-sm">
              {(totalDuration / 1000).toFixed(2)}s
            </span>
          </div>
          <div className="p-2 rounded bg-amber-50/60 border border-amber-200">
            <span className="text-amber-700 block text-[10px] uppercase font-mono">
              Fallbacks
            </span>
            <span className="font-semibold text-amber-800 text-sm">{fallbackCount}</span>
          </div>
          <div className="p-2 rounded bg-rose-50/60 border border-rose-200">
            <span className="text-rose-700 block text-[10px] uppercase font-mono">Errors</span>
            <span className="font-semibold text-rose-800 text-sm">{errorCount}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#FAF9F5] border-b border-[#141413]/10 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-stone-400 mr-1" />
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
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === tab.id
                  ? "bg-[#141413] text-[#FAF9F5]"
                  : "bg-stone-200/60 hover:bg-stone-200 text-stone-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Log Entries Timeline */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              No log entries match the selected filter.
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              const isExpanded = !!expandedIds[log.id];
              return (
                <div
                  key={log.id || index}
                  className={`bg-[#FFFFFF] rounded-lg border transition-all ${
                    log.status === "error"
                      ? "border-rose-300"
                      : log.status === "fallback"
                      ? "border-amber-300"
                      : "border-[#141413]/10 hover:border-stone-400"
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="p-3 cursor-pointer flex items-start justify-between gap-2 select-none"
                  >
                    <div className="flex items-start gap-2 flex-1">
                      <button className="mt-0.5 text-stone-400 hover:text-stone-700">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-[#141413]">
                            {log.agent}
                          </span>
                          {getProviderBadge(log.provider, log.model)}
                          {getStatusBadge(log.status)}
                        </div>

                        <p className="text-xs text-stone-600 leading-relaxed font-sans">
                          {log.summary}
                        </p>
                      </div>
                    </div>

                    <div className="text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-500">
                        <Clock className="w-3 h-3" />
                        {log.durationMs}ms
                      </span>
                    </div>
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && (
                    <div className="border-t border-stone-100 p-3 bg-stone-50/80 rounded-b-lg">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono uppercase text-stone-500">
                          Raw Payload / State
                        </span>
                        <span className="text-[10px] font-mono text-stone-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <pre className="text-[11px] font-mono bg-[#141413] text-[#FAF9F5] p-2.5 rounded overflow-x-auto max-h-60 leading-tight">
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
