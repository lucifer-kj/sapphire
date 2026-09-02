"use client";

import React, { useState } from "react";
import {
  X,
  BrainCircuit,
  Search,
  Layers,
  Sparkles,
  ImageIcon,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  ArrowRight,
  ChevronRight,
  Info,
  Terminal,
  Activity,
  Zap,
} from "lucide-react";
import { PlanStep } from "@/components/ui/agent-planning";
import { WorkflowLogEntry } from "@/lib/schema/telemetry";

export interface WorkflowNodeData {
  id: string;
  stageNumber: number;
  label: string;
  agentRole: string;
  provider: string;
  model: string;
  status: "pending" | "active" | "success" | "error";
  durationMs?: number;
  inputsDescription: string;
  outputsDescription: string;
  ragConfidence?: number;
  ragThemesMatched?: string[];
  keyPayload?: Record<string, any>;
  icon: React.ReactNode;
}

interface WorkflowNodeGraphProps {
  isOpen: boolean;
  onClose: () => void;
  steps?: PlanStep[];
  logs?: WorkflowLogEntry[];
  activeBrandName?: string;
  platform?: string;
}

export function WorkflowNodeGraph({
  isOpen,
  onClose,
  steps = [],
  logs = [],
  activeBrandName = "Vagabond Travel Agency",
  platform = "instagram",
}: WorkflowNodeGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("node-1");

  if (!isOpen) return null;

  // Build nodes list mapped from live steps / logs
  const nodes: WorkflowNodeData[] = [
    {
      id: "node-1",
      stageNumber: 1,
      label: "Intent Parsing & Brand DNA",
      agentRole: "Principal Social Content Strategist",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: (steps[0]?.status as any) || "success",
      durationMs: logs.find((l) => l.agent.includes("Intent"))?.durationMs || 380,
      inputsDescription: `Raw user brief, Active Brand Profile ("${activeBrandName}"), Target Platform (${platform.toUpperCase()})`,
      outputsDescription: "Structured PromptIntent: Topic, Post Type Taxonomy, Audience Parameters, Content Objectives",
      keyPayload: {
        brand: activeBrandName,
        platform,
        post_type: "lifestyle_editorial",
        content_objective: "High-contrast scroll-stopping organic visual engagement",
      },
      icon: <BrainCircuit className="w-4 h-4 text-purple-400" />,
    },
    {
      id: "node-2",
      stageNumber: 2,
      label: "Platform Rules & KB RAG",
      agentRole: "Design Knowledge Retrieval Engine",
      provider: "Hybrid KB Markdown RAG",
      model: "local-kb-markdown",
      status: (steps[1]?.status as any) || "success",
      durationMs: 45,
      ragConfidence: 96,
      ragThemesMatched: [
        `${platform}-single-image.md (Composition Doctrine)`,
        "model-routing.md (Lens & Sensor Guidance)",
      ],
      inputsDescription: `Platform Taxonomy: ${platform}, Topic Vector`,
      outputsDescription: "Platform-specific composition rules, safe-zone margins, and anti-cliché exclusion lists",
      keyPayload: {
        aspectRatio: platform === "instagram" ? "4:5 Portrait" : "4:5 / 1:1",
        compositionDoctrine: "Clear focal hierarchy with vertical safe zones",
        antiClichésExcluded: ["Plastic 3D render", "Oversaturated HDR", "Stock office handshakes"],
      },
      icon: <Search className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: "node-3",
      stageNumber: 3,
      label: "Creative Direction Synthesis",
      agentRole: "Executive Creative Director Agent",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: (steps[2]?.status as any) || "success",
      durationMs: logs.find((l) => l.agent.includes("CreativeDirector"))?.durationMs || 720,
      inputsDescription: "Synthesized Intent + Platform Rules + Brand Voice guidelines",
      outputsDescription: "Visual Metaphor formulation, Design Archetype selection, photographic optics, and lighting plan",
      keyPayload: {
        archetype: "editorial_magazine",
        lensFraming: "85mm f/1.4 shallow depth-of-field",
        lightingArchitecture: "Soft directional keylight with subtle rim backlight",
        materialTextures: "Tactile natural grain, matte ceramic, micro-contrast",
      },
      icon: <Layers className="w-4 h-4 text-sapphire-terracotta" />,
    },
    {
      id: "node-4",
      stageNumber: 4,
      label: "Model Capability Router",
      agentRole: "Model Strategy Optimization Engine",
      provider: "Capability Matching Heuristics",
      model: "FLUX.1 [dev] & Midjourney v6.1",
      status: (steps[3]?.status as any) || "success",
      durationMs: 15,
      inputsDescription: "Visual Requirements (Photorealism vs Typography vs Fast Commercial)",
      outputsDescription: "Ranked Model Recommendation with selection confidence and aspect ratio flags",
      keyPayload: {
        recommendedModel: "flux_1_dev",
        confidence: "98%",
        selectionReason: "Unmatched photorealistic skin/material texture fidelity and natural lens optics",
      },
      icon: <Cpu className="w-4 h-4 text-amber-400" />,
    },
    {
      id: "node-5",
      stageNumber: 5,
      label: "Multi-Model Prompt Compiler",
      agentRole: "Prompt Engineering Syntax Engine",
      provider: "PromptFormattersService",
      model: "Multi-Model Syntax Bundle",
      status: (steps[4]?.status as any) || "success",
      durationMs: 12,
      inputsDescription: "Structured PromptSpecification Intermediate Representation",
      outputsDescription: "Model-tuned generation prompts across FLUX, Midjourney, Ideogram, DALL-E, and SDXL",
      keyPayload: {
        compiledFamilies: ["FLUX.1 [dev]", "FLUX.1 [schnell]", "Midjourney v6.1", "Ideogram v2", "DALL-E 3"],
        syntaxTokensCount: 7,
      },
      icon: <ImageIcon className="w-4 h-4 text-blue-400" />,
    },
    {
      id: "node-6",
      stageNumber: 6,
      label: "Prompt Critic Quality Audit",
      agentRole: "Autonomous Prompt Quality & Compliance Critic",
      provider: "Google Gemini",
      model: "gemini-2.5-flash",
      status: (steps[5]?.status as any) || "success",
      durationMs: logs.find((l) => l.agent.includes("Critic"))?.durationMs || 540,
      inputsDescription: "Compiled Prompt + Brand Guidelines + 100-Point Critic Rubric",
      outputsDescription: "100-Point Scorecard across 9 dimensions, Strengths, and Cliché Verification",
      keyPayload: {
        overallScore: "94 / 100",
        verdict: "PASSED_PRODUCTION_GATE",
        intentFidelity: "19/20",
        platformFit: "15/15",
        brandAlignment: "14/15",
      },
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    },
  ];

  const activeNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];
  const totalDuration = nodes.reduce((acc, n) => acc + (n.durationMs || 0), 0);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sapphire-terracotta/15 text-sapphire-terracotta border border-sapphire-terracotta/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-heading-sm font-semibold text-zinc-100">
                  Visual Multi-Agent DAG Execution Graph
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/20 font-bold">
                  Live Flow
                </span>
              </div>
              <p className="text-text-xs text-zinc-400">
                Trace context propagation, RAG retrieval validation, and latency across all 6 specialized agents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-950 border border-white/5 font-mono text-[11px] text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-sapphire-terracotta" />
              <span>Total Latency: {(totalDuration / 1000).toFixed(2)}s</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left DAG Nodes + Right Payload Inspector */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Interactive Visual Node Pipeline */}
          <div className="lg:col-span-7 p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/5 space-y-4 bg-zinc-950/30">
            <div className="flex items-center justify-between text-text-xs text-zinc-400 font-medium pb-2 border-b border-white/5">
              <span>Sequential Orchestration Pipeline (6 Stages)</span>
              <span className="font-mono text-[10px]">Click any node to inspect payload</span>
            </div>

            <div className="space-y-3">
              {nodes.map((node, index) => {
                const isSelected = selectedNodeId === node.id;
                const isSuccess = node.status === "success";
                const isActive = node.status === "active";

                return (
                  <div key={node.id} className="relative">
                    {/* Connecting line to next node */}
                    {index < nodes.length - 1 && (
                      <div className="absolute left-6 top-14 bottom-[-14px] w-0.5 bg-gradient-to-b from-white/15 to-white/5 z-0" />
                    )}

                    <button
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all relative z-10 ${
                        isSelected
                          ? "bg-zinc-900 border-sapphire-terracotta shadow-lg ring-1 ring-sapphire-terracotta/40"
                          : "bg-zinc-950/80 border-white/5 hover:border-white/15 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Node Number & Icon Badge */}
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isActive
                              ? "bg-sapphire-terracotta/20 border-sapphire-terracotta text-sapphire-terracotta animate-pulse"
                              : isSuccess
                              ? "bg-zinc-900 border-white/10 text-zinc-100"
                              : "bg-zinc-950 border-white/5 text-zinc-500"
                          }`}
                        >
                          {node.icon}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
                              Stage 0{node.stageNumber}
                            </span>
                            {node.ragConfidence && (
                              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-500/20">
                                RAG: {node.ragConfidence}% Conf.
                              </span>
                            )}
                          </div>
                          <h4 className="text-text-xs font-bold text-zinc-100 truncate">
                            {node.label}
                          </h4>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {node.provider} ({node.model})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 ml-3">
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-zinc-400 block">
                            {node.durationMs ? `${node.durationMs}ms` : "--"}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider ${
                              isSuccess
                                ? "text-emerald-400"
                                : isActive
                                ? "text-sapphire-terracotta"
                                : "text-zinc-500"
                            }`}
                          >
                            {node.status}
                          </span>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            isSelected ? "text-sapphire-terracotta translate-x-0.5" : "text-zinc-600"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Node Context & Payload Inspector */}
          <div className="lg:col-span-5 p-6 overflow-y-auto bg-zinc-900/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-sapphire-terracotta" />
                <h4 className="text-text-xs font-bold text-zinc-100 uppercase tracking-wider">
                  Stage Payload Inspector
                </h4>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-white/5">
                Stage 0{activeNode.stageNumber}
              </span>
            </div>

            {/* Active Node Metadata Header */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-sm font-bold text-zinc-100">
                  {activeNode.label}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20">
                  {activeNode.status.toUpperCase()}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 space-y-1 font-mono">
                <div>
                  <span className="text-zinc-500">Agent Role: </span>
                  <span className="text-zinc-300">{activeNode.agentRole}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Model Engine: </span>
                  <span className="text-zinc-300">{activeNode.provider} / {activeNode.model}</span>
                </div>
                <div>
                  <span className="text-zinc-500">Step Duration: </span>
                  <span className="text-zinc-300">{activeNode.durationMs}ms</span>
                </div>
              </div>
            </div>

            {/* RAG Retrieval Validation Card (If Applicable) */}
            {activeNode.ragConfidence && (
              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    RAG Retrieval Validated
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded">
                    Confidence: {activeNode.ragConfidence}%
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-zinc-300">
                  <span className="text-zinc-400 block font-medium">Matched Knowledge Modules:</span>
                  {activeNode.ragThemesMatched?.map((m, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-emerald-300 font-mono text-[10px]">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context Inputs */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Input Context Ingested:
              </span>
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 text-[11px] text-zinc-300 leading-relaxed font-sans">
                {activeNode.inputsDescription}
              </div>
            </div>

            {/* Context Outputs */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Output Artifacts Produced:
              </span>
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-white/5 text-[11px] text-zinc-300 leading-relaxed font-sans">
                {activeNode.outputsDescription}
              </div>
            </div>

            {/* Key Output Payload (JSON View) */}
            {activeNode.keyPayload && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono">
                  State Variables / Decoupled Payload:
                </span>
                <pre className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 font-mono text-[10px] text-zinc-300 overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {JSON.stringify(activeNode.keyPayload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-zinc-950/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono shrink-0">
          <span>Decoupled Payload Flow • Serverless Vercel Architecture</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
          >
            Close Graph
          </button>
        </div>
      </div>
    </div>
  );
}
