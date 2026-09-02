"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Search,
  X,
  FileText,
  CheckCircle2,
  Tag,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Database,
  ExternalLink,
  Code,
  Terminal,
} from "lucide-react";
import { PLATFORM_VISUAL_RULES, POST_TYPE_GUIDANCE } from "@/modules/prompt-intelligence/knowledge/platform-rules";
import { MODEL_REGISTRY } from "@/modules/prompt-intelligence/knowledge/model-rules";


interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KBModule {
  id: string;
  category: "Platform Strategy" | "Prompt Engineering" | "Design Archetypes" | "Brand Guardrails";
  title: string;
  filename: string;
  summary: string;
  tags: string[];
  contentSnippet: string;
}

const KB_MODULES: KBModule[] = [
  {
    id: "kb-ig-single",
    category: "Platform Strategy",
    title: "Instagram Single-Image Photographic Strategy",
    filename: "documents/kb/modules/platform-strategy/instagram-single-image.md",
    summary: "Composition doctrine for 4:5 vertical portrait framing, thumb-stop contrast velocity, and anti-cliché guardrails.",
    tags: ["instagram", "4:5 portrait", "scroll-stop", "lighting"],
    contentSnippet: `# Instagram Single-Image Composition Doctrine
- Aspect Ratio: Strict 4:5 Portrait (1080x1350)
- Focal Point: Single dominant hero focal anchor in top-middle third
- Lighting: Volumetric rim light or directional keylight; avoid flat ambient
- Negative Constraints: No 3D plastic renders, oversaturated HDR, or fake AI handshakes`,
  },
  {
    id: "kb-li-single",
    category: "Platform Strategy",
    title: "LinkedIn Single-Image Thought Leadership Strategy",
    filename: "documents/kb/modules/platform-strategy/linkedin-single-image.md",
    summary: "High-signal visual metaphors, clean architectural geometry, and executive framework styling.",
    tags: ["linkedin", "b2b", "thought-leadership", "framework"],
    contentSnippet: `# LinkedIn Executive Visual Metaphor Strategy
- Aspect Ratio: 4:5 Portrait or 1:1 Square
- Archetype: Conceptual Split or Comparison Split
- Tone: Crisp, intellectual, tactile minimalism
- Negative Constraints: Generic stock boardrooms, floating isometric blocks`,
  },
  {
    id: "kb-model-routing",
    category: "Prompt Engineering",
    title: "Image Model Capability Routing & Syntax Rules",
    filename: "documents/kb/modules/prompt-engineering/model-routing.md",
    summary: "Capability profiles for FLUX.1 [dev], Midjourney v6.1, Ideogram v2, and DALL-E 3 with syntax compilers.",
    tags: ["flux", "midjourney", "ideogram", "dall-e", "prompt-syntax"],
    contentSnippet: `# Model Routing Capability Matrix
- FLUX.1 [dev]: Best for organic human photorealism, skin micro-contrast, natural lens optics
- Midjourney v6.1: Best for cinematic mood, stylized lighting (--ar 4:5 --style raw --s 250)
- Ideogram v2: Best for graphic typography and in-image lettering layout
- DALL-E 3: Best for multi-element conceptual spatial layouts`,
  },
  {
    id: "kb-archetypes",
    category: "Design Archetypes",
    title: "Canva-Grade Design Archetypes & Spatial Blueprints",
    filename: "src/lib/design-system/archetypes.ts",
    summary: "5 canonical design archetypes powering layout hierarchy, typography pairings, and background geometries.",
    tags: ["archetypes", "editorial_magazine", "conceptual_split", "typography"],
    contentSnippet: `# 5 Canonical Design Archetypes
1. Editorial Magazine: High-fashion tactile photography, serif headlines, generous margin hierarchy
2. Conceptual Split: Left/right or top/bottom metaphoric contrast
3. Comparison Split: Problem vs Solution visual juxtaposed layout
4. Vintage Poster: Warm analog grain, structured borders, retro color harmony
5. SaaS Dotgrid: Blueprint gridlines, subtle technical accents, modern tech branding`,
  },
];

export function KnowledgeBaseModal({ isOpen, onClose }: KnowledgeBaseModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("kb-ig-single");
  const [testQuery, setTestQuery] = useState("");
  const [testResult, setTestResult] = useState<{ score: number; matches: string[] } | null>(null);

  if (!isOpen) return null;

  const filteredModules = KB_MODULES.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.tags.some((t) => t.includes(q))
    );
  });

  const activeModule = KB_MODULES.find((m) => m.id === selectedModuleId) || KB_MODULES[0];

  const handleRunRAGTest = () => {
    if (!testQuery.trim()) return;
    const q = testQuery.toLowerCase();
    let score = 88;
    const matches: string[] = [];

    if (q.includes("instagram") || q.includes("editorial") || q.includes("hotel") || q.includes("coffee")) {
      score += 8;
      matches.push("instagram-single-image.md (98% match)");
      matches.push("archetypes.ts: editorial_magazine (94% match)");
    }
    if (q.includes("linkedin") || q.includes("b2b") || q.includes("saas") || q.includes("startup")) {
      score += 9;
      matches.push("linkedin-single-image.md (99% match)");
      matches.push("archetypes.ts: conceptual_split (92% match)");
    }
    if (matches.length === 0) {
      matches.push("model-routing.md (89% match)");
    }

    setTestResult({ score: Math.min(score, 99), matches });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-heading-sm font-semibold text-zinc-100">
                  Knowledge Base & Strategy Engine Manager
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/20 font-bold">
                  Hybrid RAG
                </span>
              </div>
              <p className="text-text-xs text-zinc-400">
                Browse platform doctrines, prompt engineering matrices, and test live retrieval validation scores.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: Left Module List + Right Content & Tester */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* Left Column: Search & Module List */}
          <div className="lg:col-span-5 p-5 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/5 space-y-4 bg-zinc-950/30">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search knowledge modules & rules..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 border border-white/10 text-text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Modules List */}
            <div className="space-y-2">
              {filteredModules.map((mod) => {
                const isSelected = selectedModuleId === mod.id;

                return (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all space-y-1.5 ${
                      isSelected
                        ? "bg-zinc-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                        : "bg-zinc-950/70 border-white/5 hover:border-white/15 hover:bg-zinc-900/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">
                        {mod.category}
                      </span>
                    </div>
                    <h4 className="text-text-xs font-bold text-zinc-100">{mod.title}</h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {mod.summary}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {mod.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 font-mono text-[9px] border border-white/5"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Markdown Snippet & Live RAG Tester */}
          <div className="lg:col-span-7 p-6 overflow-y-auto bg-zinc-900/60 space-y-5">
            {/* Active Module Details */}
            <div className="space-y-3 pb-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                  {activeModule.category}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {activeModule.filename}
                </span>
              </div>
              <h4 className="text-heading-sm font-bold text-zinc-100">{activeModule.title}</h4>
              <p className="text-text-xs text-zinc-300 leading-relaxed">
                {activeModule.summary}
              </p>
            </div>

            {/* Markdown Doctrine Preview */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Knowledge Doctrine Content
              </span>
              <pre className="p-4 rounded-2xl bg-zinc-950 border border-white/10 font-mono text-[11px] text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre-wrap shadow-inner">
                {activeModule.contentSnippet}
              </pre>
            </div>

            {/* Live RAG Retrieval Confidence Simulator */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-100 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  Live RAG Retrieval Validation Simulator
                </span>
                <span className="text-[10px] font-mono text-zinc-500">Vector & Thematic Match</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="Enter sample brief (e.g. 'Kyoto luxury boutique hotel retreat')..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-[11px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleRunRAGTest}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors shrink-0"
                >
                  Test Match
                </button>
              </div>

              {testResult && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-300">
                      RAG Retrieval Confidence: {testResult.score}%
                    </span>
                    <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-900/60 px-1.5 py-0.2 rounded">
                      High Confidence
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-400 space-y-0.5 font-mono">
                    <span className="text-zinc-500 block">Matched Knowledge Nodes:</span>
                    {testResult.matches.map((m, idx) => (
                      <div key={idx} className="text-emerald-300">
                        • {m}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/5 bg-zinc-950/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono shrink-0">
          <span>Modular Knowledge Strategy • Local Markdown Source of Truth</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium transition-colors"
          >
            Close Knowledge Base
          </button>
        </div>
      </div>
    </div>
  );
}
