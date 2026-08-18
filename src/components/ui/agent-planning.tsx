"use client";
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Check,
  BrainCircuit,
  Sparkles,
  Layers,
  ShieldCheck,
  Palette,
  Eye,
} from "lucide-react";

export type PlanStepStatus = "pending" | "active" | "success" | "error";

export interface PlanStep {
  id: string;
  title: string;
  content?: React.ReactNode;
  status: PlanStepStatus;
  icon?: React.ReactNode;
  duration?: string;
  defaultExpanded?: boolean;
}

export interface AgentPlanningProps {
  title?: string;
  steps?: PlanStep[];
  className?: string;
}

export const AgentPlanning: React.FC<AgentPlanningProps> = ({
  title = "Sapphire Multi-Agent Orchestrator",
  steps,
  className = "",
}) => {
  const [isMainExpanded, setIsMainExpanded] = useState(true);

  const defaultSteps: PlanStep[] = [
    {
      id: "1",
      title: "1. Intent Parsing & Brand DNA Extraction (Groq Llama 3.3)",
      status: "success",
      duration: "0.3s",
      icon: <BrainCircuit className="w-3.5 h-3.5" />,
      content: (
        <div className="space-y-2 font-mono text-[11px] text-zinc-400 mt-1">
          <div className="flex items-start gap-2 text-emerald-400 font-medium">
            <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Extracted brand tone, event context, and audience parameters</span>
          </div>
          <div className="grid grid-cols-[90px_1fr] gap-1.5 bg-zinc-950 p-2.5 rounded-xl border border-white/5 text-[11px]">
            <span className="text-zinc-500 font-medium">Target Canvas:</span>
            <span className="text-zinc-200 font-medium">Instagram 4:5 Portrait (1080x1350)</span>
            <span className="text-zinc-500 font-medium">Model:</span>
            <span className="text-zinc-200 font-medium">Groq / llama-3.3-70b-versatile</span>
          </div>
        </div>
      ),
    },
    {
      id: "2",
      title: "2. Multimodal Visual Reference & Web Trends (Gemini 2.5)",
      status: "success",
      duration: "0.8s",
      icon: <Eye className="w-3.5 h-3.5" />,
      content: (
        <div className="space-y-2 font-mono text-[11px] text-zinc-400 mt-1">
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-white/5 space-y-1">
            <div className="text-emerald-400 font-medium flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              <span>Reference Aesthetics Analyzed</span>
            </div>
            <ul className="space-y-1 list-disc list-inside text-zinc-400 pt-1">
              <li>Lighting: Warm golden hour ambient side-lighting</li>
              <li>Depth: Shallow depth-of-field with creamy bokeh</li>
              <li>Composition: 40% upper negative space preserved</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "3",
      title: "3. Creative Direction & A/B Archetype Formulation",
      status: "success",
      duration: "0.5s",
      icon: <Layers className="w-3.5 h-3.5" />,
      content: (
        <div className="space-y-2 font-mono text-[11px] text-zinc-400 mt-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-zinc-950 border border-white/5">
              <span className="text-sapphire-terracotta font-semibold">Concept A:</span>
              <p className="text-[10px] text-zinc-300">Editorial Magazine (Playfair Serif)</p>
            </div>
            <div className="p-2 rounded-lg bg-zinc-950 border border-white/5">
              <span className="text-sapphire-blue font-semibold">Concept B:</span>
              <p className="text-[10px] text-zinc-300">Conceptual Split (Plus Jakarta Sans)</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "4",
      title: "4. Spatial Prompt Engineering & Satori Blueprint",
      status: "success",
      duration: "0.6s",
      icon: <Sparkles className="w-3.5 h-3.5" />,
      content: (
        <div className="space-y-1.5 font-mono text-[11px] text-zinc-400 mt-1 p-2.5 rounded-xl bg-zinc-950 border border-white/5">
          <div className="text-emerald-400 font-medium flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>4-Zone Negative Space Conditioning Applied</span>
          </div>
          <p className="text-[10px] text-zinc-400">
            Typography Hook: <strong className="text-zinc-200">Playfair Display Italic</strong> (72px) + Scrim gradient.
          </p>
        </div>
      ),
    },
    {
      id: "5",
      title: "5. FLUX Photorealistic Generation & Typography Compositing",
      status: "success",
      duration: "1.4s",
      icon: <Palette className="w-3.5 h-3.5" />,
      content: (
        <div className="space-y-1.5 font-mono text-[11px] text-zinc-400 mt-1 p-2.5 rounded-xl bg-zinc-950 border border-white/5">
          <div className="flex items-center justify-between text-zinc-200 font-medium">
            <span>Cloudflare FLUX 1 Schnell + Satori Engine</span>
            <span className="text-emerald-400 font-semibold">1080x1350 Composite</span>
          </div>
        </div>
      ),
    },
    {
      id: "6",
      title: "6. Critic Agent Brand Voice & Compliance Audit",
      status: "success",
      duration: "0.4s",
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      content: (
        <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-400 font-medium flex items-center justify-between mt-1">
          <span>Brand Alignment Score</span>
          <span className="font-bold text-text-xs">96 / 100 Passed</span>
        </div>
      ),
    },
  ];

  const activeSteps = steps && steps.length > 0 ? steps : defaultSteps;

  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(
    activeSteps.reduce((acc, step) => {
      acc[step.id] = step.defaultExpanded || false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleStep = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const hasActive = activeSteps.some((s) => s.status === "active");
  const allSuccess = activeSteps.every((s) => s.status === "success");

  const getStatusColor = (status: PlanStepStatus) => {
    switch (status) {
      case "success":
        return "bg-emerald-950/60 text-emerald-400 ring-emerald-800/60";
      case "active":
        return "bg-sapphire-terracotta/20 text-sapphire-terracotta ring-sapphire-terracotta/30";
      case "error":
        return "bg-rose-500/20 text-rose-400 ring-rose-500/30";
      case "pending":
        return "bg-zinc-950 text-zinc-500 ring-white/5";
    }
  };

  return (
    <div className={"w-full max-w-3xl lg:max-w-4xl mx-auto my-3 font-sans text-zinc-100 " + className}>
      <div className="bg-zinc-900 border border-white/5 shadow-md rounded-2xl overflow-hidden transition-all duration-300">
        <div
          onClick={() => setIsMainExpanded(!isMainExpanded)}
          className={
            "flex items-center justify-between px-4 py-3 cursor-pointer transition-colors select-none " +
            (isMainExpanded ? "bg-zinc-900/90 border-b border-white/5" : "hover:bg-zinc-800/50")
          }
        >
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-5 h-5">
              {hasActive ? (
                <Loader2 className="w-4 h-4 text-sapphire-terracotta animate-spin" />
              ) : allSuccess ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <BrainCircuit className="w-4 h-4 text-zinc-500" />
              )}
            </div>

            <span className="text-text-xs font-semibold text-zinc-200 tracking-tight">
              {title}
            </span>
          </div>

          <div className="flex items-center justify-center w-5 h-5 rounded-md text-zinc-500">
            {isMainExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </div>
        </div>

        {isMainExpanded && (
          <div className="p-4 flex flex-col space-y-1">
            {activeSteps.map((step, index) => {
              const isStepExpanded = expandedSteps[step.id];
              const isLast = index === activeSteps.length - 1;

              return (
                <div
                  key={step.id}
                  className={"relative flex gap-3 " + (step.status === "pending" ? "opacity-40" : "opacity-100")}
                >
                  {!isLast && (
                    <div className="absolute left-[11px] top-6 bottom-[-6px] w-[1px] bg-white/5 z-0" />
                  )}

                  <div className="relative z-10 flex-none w-6 h-6 mt-0.5">
                    <div
                      className={
                        "flex items-center justify-center w-full h-full rounded-full ring-2 transition-colors " +
                        getStatusColor(step.status)
                      }
                    >
                      {step.status === "success" ? (
                        <Check className="w-3 h-3" />
                      ) : step.status === "active" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        step.icon || <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      )}
                    </div>
                  </div>

                  <div className="flex-1 pb-4">
                    <div
                      className={
                        "flex items-center justify-between rounded-xl px-2.5 py-1 transition-colors " +
                        (step.content ? "cursor-pointer hover:bg-zinc-800/40" : "")
                      }
                      onClick={(e) => step.content && toggleStep(step.id, e)}
                    >
                      <span
                        className={
                          "text-text-xs tracking-tight transition-colors " +
                          (step.status === "active"
                            ? "text-sapphire-terracotta font-semibold"
                            : step.status === "error"
                            ? "text-rose-400 font-semibold"
                            : "text-zinc-300 font-medium")
                        }
                      >
                        {step.title}
                      </span>

                      <div className="flex items-center gap-2">
                        {step.duration && (
                          <span className="text-[10px] font-mono text-zinc-500 tabular-nums">
                            {step.duration}
                          </span>
                        )}
                        {step.content && (
                          <div className="text-zinc-500">
                            {isStepExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {step.content && isStepExpanded && (
                      <div className="pt-1 pb-1 pl-2">{step.content}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPlanning;
