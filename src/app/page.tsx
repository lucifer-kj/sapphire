"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Send,
  Image as ImageIcon,
  SlidersHorizontal,
  ChevronDown,
  Layers,
  Search,
  FileText,
  Plus,
  Folder,
  Settings,
  History,
  Clock,
  ChevronRight,
  MessageSquare,
  Sparkle,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  X,
  Download,
  Maximize2,
  Wand2,
  ShieldCheck,
  BrainCircuit,
  Mail,
  CheckCheck,
  Activity,
  RefreshCw,
  AlertCircle,
  Eye,
  Zap,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Sliders,
  BookOpen,
} from "lucide-react";


import { CreativeBrief, ResearchContext, UserIntent, ConceptItem } from "@/lib/schema/campaign";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { CriticResult } from "@/lib/schema/critic";
import { WorkflowLogEntry } from "@/lib/schema/telemetry";
import { LogDrawer } from "@/components/telemetry/log-drawer";
import { WorkspaceOnboardingModal } from "@/components/workspace/workspace-onboarding-modal";
import { PRECONFIGURED_BRANDS } from "@/lib/constants/brands";
import { PromptResult } from "@/modules/prompt-intelligence/domain/prompt-result";
import { PromptResultInspector } from "@/components/ui/prompt-result-inspector";
import { GenerationMode } from "@/modules/prompt-intelligence/domain/prompt-intent";
import { CommandPalette } from "@/components/navigation/command-palette";
import { WorkflowNodeGraph } from "@/components/workflow/workflow-node-graph";
import { KnowledgeBaseModal } from "@/components/settings/knowledge-base-modal";
import { StudioComposer } from "@/components/ui/studio-composer";
import { ReasoningAccordion } from "@/components/ui/reasoning-accordion";



import { BrandBrainDrawer } from "@/components/settings/brand-brain-drawer";

import { BrandProfile, LearnedPreferences } from "@/lib/schema/brand";

import { AgentPlanning, PlanStep } from "@/components/ui/agent-planning";
import { ImageGeneration } from "@/components/ui/image-generation";

const createInitialPlanningSteps = (mode: GenerationMode = "prompt_only"): PlanStep[] => {
  if (mode === "prompt_only") {
    return [
      {
        id: "1",
        title: "1. Intent Parsing & Brand DNA Extraction (Gemini 2.5 Flash)",
        status: "pending",
        icon: <BrainCircuit className="w-3.5 h-3.5" />,
      },
      {
        id: "2",
        title: "2. Platform Rules & Visual Knowledge Retrieval (Hybrid KB RAG)",
        status: "pending",
        icon: <Search className="w-3.5 h-3.5" />,
      },
      {
        id: "3",
        title: "3. Creative Direction & Metaphor Formulation (Creative Director)",
        status: "pending",
        icon: <Layers className="w-3.5 h-3.5" />,
      },
      {
        id: "4",
        title: "4. Model Capability Routing & Prompt Spec Assembly",
        status: "pending",
        icon: <Sparkles className="w-3.5 h-3.5" />,
      },
      {
        id: "5",
        title: "5. Model-Aware Prompt Engineering & Syntax Formatting",
        status: "pending",
        icon: <ImageIcon className="w-3.5 h-3.5" />,
      },
      {
        id: "6",
        title: "6. Prompt Critic Quality & Compliance Audit (100-pt Rubric)",
        status: "pending",
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
      },
    ];
  }

  return [
    {
      id: "1",
      title: "1. Intent Parsing & Brand DNA Extraction (Gemini 2.5 Flash)",
      status: "pending",
      icon: <BrainCircuit className="w-3.5 h-3.5" />,
    },
    {
      id: "2",
      title: "2. Multimodal Visual Reference & Web Trends (Gemini 2.5 Flash)",
      status: "pending",
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      id: "3",
      title: "3. Creative Direction & A/B Archetype Formulation (Mastra)",
      status: "pending",
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: "4",
      title: "4. Spatial Prompt Engineering & Satori Blueprint",
      status: "pending",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: "5",
      title: "5. FLUX Photorealistic Generation & Compositing (1080×1350)",
      status: "pending",
      icon: <ImageIcon className="w-3.5 h-3.5" />,
    },
    {
      id: "6",
      title: "6. Critic Agent Brand Voice & Compliance Audit (100-pt Score)",
      status: "pending",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
  ];
};

interface ConceptVersionHistory {
  versionNumber: number;
  conceptItem: ConceptItem;
  userInstruction?: string;
}

export default function SapphireWorkspace() {
  const [generationMode, setGenerationMode] = useState<GenerationMode>("prompt_only");
  const [promptResult, setPromptResult] = useState<PromptResult | null>(null);
  const [promptVersionHistory, setPromptVersionHistory] = useState<PromptResult[]>([]);
  const [isRefiningPrompt, setIsRefiningPrompt] = useState(false);


  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [activeBrandProfile, setActiveBrandProfile] = useState<BrandProfile>(PRECONFIGURED_BRANDS[0]);
  const [activeBrand, setActiveBrand] = useState("Vagabond Travel Agency");
  const [isLoading, setIsLoading] = useState(false);
  const [planningSteps, setPlanningSteps] = useState<PlanStep[]>(createInitialPlanningSteps("prompt_only"));

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [chatPage, setChatPage] = useState(1);
  const CHATS_PER_PAGE = 5;

  // Platform Switcher State
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<"instagram" | "linkedin">("instagram");
  const [learningToast, setLearningToast] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"ab" | "focus">("ab");


  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSavedCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (campaignId === id) {
      setBrief(null);
      setCampaignId(null);
    }
    setLearningToast("Session removed from history. Creative assets preserved.");
    setTimeout(() => setLearningToast(null), 3500);
  };



  // Supabase Saved Campaigns
  const [savedCampaigns, setSavedCampaigns] = useState<
    Array<{ id: string; campaign_title: string; event: string; created_at: string; raw: any }>
  >([]);

  // Dedicated Telemetry Logs State
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowLogEntry[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Dedicated UX Optimization Modals State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNodeGraphOpen, setIsNodeGraphOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);

  // Global Ctrl+K / Cmd+K Keyboard Shortcut Listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Image load error & retry states

  const [imageErrorA, setImageErrorA] = useState(false);
  const [imageErrorB, setImageErrorB] = useState(false);
  const [isRegeneratingA, setIsRegeneratingA] = useState(false);
  const [isRegeneratingB, setIsRegeneratingB] = useState(false);

  // Multi-Asset Visual Ingredient Stacking State (up to 3 references)
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const agentTreeEndRef = useRef<HTMLDivElement>(null);


  // Lightbox Modal State
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  // Active Campaign Agent Output State
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [intent, setIntent] = useState<UserIntent | null>(null);
  const [research, setResearch] = useState<ResearchContext | null>(null);
  const [referenceAnalysis, setReferenceAnalysis] = useState<ReferenceImageAnalysis | null>(null);
  const [brief, setBrief] = useState<CreativeBrief | null>(null);
  const [critiqueA, setCritiqueA] = useState<CriticResult | null>(null);
  const [critiqueB, setCritiqueB] = useState<CriticResult | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<"A" | "B" | null>(null);
  const [preferenceSaved, setPreferenceSaved] = useState<boolean>(false);

  // Concept Refinement & Version History State
  const [isRefining, setIsRefining] = useState<"A" | "B" | null>(null);
  const [refinementInput, setRefinementInput] = useState("");
  const [isRefinementLoading, setIsRefinementLoading] = useState(false);

  const [historyConceptA, setHistoryConceptA] = useState<ConceptVersionHistory[]>([]);
  const [historyConceptB, setHistoryConceptB] = useState<ConceptVersionHistory[]>([]);
  const [activeVersionA, setActiveVersionA] = useState<number>(1);
  const [activeVersionB, setActiveVersionB] = useState<number>(1);

  // Human Approval & Resend Email Delivery State
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliverySuccess, setDeliverySuccess] = useState<string | null>(null);

  // Chat conversation history feed
  const [messages, setMessages] = useState<
    { role: "user" | "assistant" | "system"; content: string; timestamp: string }[]
  >([
    {
      role: "system",
      content:
        "Welcome to Sapphire. Provide an Instagram post direction (e.g. 'Create an artisanal breakfast ritual post for Vagabond Travel'). Attach an optional reference image for visual art direction. Sapphire generates Canva-grade 1080×1350 Instagram artwork with custom typography overlays, audits brand voice, and delivers the package to your email upon approval.",
      timestamp: "Just now",
    },
  ]);

  // Fetch Saved Campaigns from Supabase
  const fetchSavedCampaigns = async () => {
    try {
      const res = await fetch("/api/campaigns");
      const data = await res.json();
      if (data.campaigns && Array.isArray(data.campaigns)) {
        setSavedCampaigns(
          data.campaigns.map((c: any) => ({
            id: c.id,
            campaign_title: c.campaign_title || c.topic || "Instagram Post",
            event: c.event || "Instagram Campaign",
            created_at: c.created_at,
            raw: c,
          }))
        );
      }
    } catch (err) {
      console.warn("Failed to fetch campaigns:", err);
    }
  };

  useEffect(() => {
    fetchSavedCampaigns();
  }, []);

  // Cloudflare Workers AI Daily Quota Tracking State
  const [quotaInfo, setQuotaInfo] = useState<{
    configured: boolean;
    totalNeurons: number;
    limit: number;
    remainingNeurons: number;
    estimatedPostsRemaining: number;
    requestsToday: number;
    percentUsed: number;
    resetsIn: string;
    provider: string;
  } | null>(null);
  const [isRefreshingQuota, setIsRefreshingQuota] = useState(false);

  const fetchQuota = async () => {
    try {
      setIsRefreshingQuota(true);
      const res = await fetch("/api/quota");
      const data = await res.json();
      if (data.success && data.quota) {
        setQuotaInfo(data.quota);
      }
    } catch (err) {
      console.warn("Failed to fetch quota:", err);
    } finally {
      setIsRefreshingQuota(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  // Handle New Conversation / Reset Workspace
  const handleNewConversation = () => {
    setPrompt("");
    setIntent(null);
    setResearch(null);
    setReferenceAnalysis(null);
    setBrief(null);
    setCritiqueA(null);
    setCritiqueB(null);
    setSelectedConcept(null);
    setPreferenceSaved(false);
    setDeliverySuccess(null);
    setHistoryConceptA([]);
    setHistoryConceptB([]);
    setImageErrorA(false);
    setImageErrorB(false);
    setReferenceImages([]);
    setWorkflowLogs([]);

    setMessages([
      {
        role: "system",
        content: `Ready for a new Instagram campaign with ${activeBrand}. Describe your post direction or attach a reference image to begin.`,
        timestamp: "Just now",
      },
    ]);
  };

  // Hydrate Past Campaign onto Canvas
  const handleSelectCampaign = (c: any) => {
    const raw = c.raw;
    if (!raw) return;

    setCampaignId(raw.id);
    if (raw.intent) setIntent(raw.intent);
    if (raw.research_context) setResearch(raw.research_context);
    if (raw.reference_image_analysis) setReferenceAnalysis(raw.reference_image_analysis);

    if (raw.concepts && Array.isArray(raw.concepts) && raw.concepts.length >= 2) {
      const cA = raw.concepts[0];
      const cB = raw.concepts[1];
      const reconstructedBrief: CreativeBrief = {
        campaign_title: raw.campaign_title || c.campaign_title,
        concept_a: {
          label: cA.label || "Concept A",
          creative_direction: cA.creative_direction || "Instagram Creative Direction",
          visual_style: cA.visual_style || "editorial_magazine",
          composition: cA.composition || "4:5 Portrait Editorial",
          lighting: cA.lighting || "Golden hour warm ambient",
          color_palette: cA.color_palette || ["#181816", "#FAF9F5", "#D97757"],
          image_prompt: cA.image_prompt || "",
          image_url: cA.image_url,
          caption_instagram: cA.caption_instagram || "",
          caption_linkedin: cA.caption_linkedin || "",
          design_blueprint: cA.design_blueprint,
        },
        concept_b: {
          label: cB.label || "Concept B",
          creative_direction: cB.creative_direction || "Instagram Creative Direction",
          visual_style: cB.visual_style || "conceptual_split",
          composition: cB.composition || "50/50 Studio Split",
          lighting: cB.lighting || "Clean studio neutral lighting",
          color_palette: cB.color_palette || ["#181816", "#FAF9F5", "#D97757"],
          image_prompt: cB.image_prompt || "",
          image_url: cB.image_url,
          caption_instagram: cB.caption_instagram || "",
          caption_linkedin: cB.caption_linkedin || "",
          design_blueprint: cB.design_blueprint,
        },
      };
      setBrief(reconstructedBrief);
      setHistoryConceptA([{ versionNumber: 1, conceptItem: reconstructedBrief.concept_a }]);
      setHistoryConceptB([{ versionNumber: 1, conceptItem: reconstructedBrief.concept_b }]);
      setSelectedConcept("A");
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Loaded past campaign "${c.campaign_title}" onto the canvas.`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Load workspace globally from API & URL parameter (?workspace=...) or localStorage
  useEffect(() => {
    let isMounted = true;

    async function initWorkspace() {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);
      const wsParam = params.get("workspace");

      let loadedWorkspaces: BrandProfile[] = [];

      // 1. Initial fast local cache read
      try {
        const raw = localStorage.getItem("sapphire_user_workspaces");
        if (raw) {
          loadedWorkspaces = JSON.parse(raw);
        }
      } catch (err) {
        console.warn("Could not load user workspaces:", err);
      }

      // 2. Fetch global workspaces from API
      try {
        const res = await fetch("/api/workspaces");
        if (res.ok) {
          const data = await res.json();
          if (data.workspaces && Array.isArray(data.workspaces) && data.workspaces.length > 0) {
            loadedWorkspaces = data.workspaces;
            localStorage.setItem("sapphire_user_workspaces", JSON.stringify(data.workspaces));
          }
        }
      } catch (apiErr) {
        console.warn("Could not fetch global workspaces in studio:", apiErr);
      }

      if (!isMounted) return;

      if (wsParam && loadedWorkspaces.length > 0) {
        const found = loadedWorkspaces.find(
          (b) => b.id === wsParam || b.name.toLowerCase() === wsParam.toLowerCase()
        );
        if (found) {
          setActiveBrandProfile(found);
          setActiveBrand(found.name);
          return;
        }
      }

      if (loadedWorkspaces.length > 0) {
        setActiveBrandProfile(loadedWorkspaces[0]);
        setActiveBrand(loadedWorkspaces[0].name);
      }
    }

    initWorkspace();
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard shortcut listener: Ctrl+B (Left Panel), Ctrl+Alt+B (Right Panel), Ctrl+N (New Campaign), Ctrl+W (Workspaces Portal)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (isCtrlOrCmd && key === "b") {
        e.preventDefault();
        if (e.altKey) {
          setIsRightOpen((prev) => !prev);
        } else {
          setIsLeftOpen((prev) => !prev);
        }
      }

      if (isCtrlOrCmd && key === "w") {
        e.preventDefault();
        window.location.href = "/workspaces";
      }

      if (isCtrlOrCmd && key === "n") {
        e.preventDefault();
        handleNewConversation();
      }
    };


    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBrand]);

  // Auto-scroll down smoothly to the active agent execution tree
  useEffect(() => {
    if (isLoading || planningSteps.some((s) => s.status === "active")) {
      agentTreeEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [planningSteps, isLoading, messages.length]);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files)
        .slice(0, 3 - referenceImages.length)
        .forEach((file) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              setReferenceImages((prev) => (prev.length < 3 ? [...prev, reader.result as string] : prev));
            }
          };
          reader.readAsDataURL(file);
        });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeReferenceImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };


  const handleRegenerateImage = async (conceptType: "A" | "B") => {
    if (!brief) return;
    const targetConcept = conceptType === "A" ? brief.concept_a : brief.concept_b;
    if (conceptType === "A") setIsRegeneratingA(true);
    else setIsRegeneratingB(true);

    try {
      const res = await fetch("/api/regenerate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: targetConcept.optimized_image_prompt || targetConcept.image_prompt,
          styleOverride: referenceAnalysis ? referenceAnalysis.photography_style : undefined,
          designBlueprint: targetConcept.design_blueprint,
          referenceImage: referenceImages[0] || null,
        }),

      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        if (conceptType === "A") {
          setImageErrorA(false);
          setBrief((prev) =>
            prev ? { ...prev, concept_a: { ...prev.concept_a, image_url: data.imageUrl } } : prev
          );
        } else {
          setImageErrorB(false);
          setBrief((prev) =>
            prev ? { ...prev, concept_b: { ...prev.concept_b, image_url: data.imageUrl } } : prev
          );
        }

        if (data.meta) {
          setWorkflowLogs((prev) => [
            ...prev,
            {
              id: `log-regen-${Date.now()}`,
              timestamp: new Date().toISOString(),
              agent: `ImageGenerationService (Concept ${conceptType} Retry)`,
              provider: data.meta.provider,
              model: data.meta.model,
              status: data.meta.status,
              durationMs: data.meta.durationMs,
              summary: `Regenerated Concept ${conceptType} artwork via ${data.meta.provider} (${data.meta.model}).`,
              details: data.meta,
            },
          ]);
        }
      }
    } catch (err) {
      console.error("Error regenerating artwork:", err);
    } finally {
      if (conceptType === "A") setIsRegeneratingA(false);
      else setIsRegeneratingB(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isLoading) return;


    const userMessage = prompt.trim();
    const currentRefImages = referenceImages;
    setPrompt("");
    setReferenceImages([]);
    setIsLoading(true);
    setPreferenceSaved(false);
    setDeliverySuccess(null);
    setImageErrorA(false);
    setImageErrorB(false);


    // Reset planning steps to active state
    const initialSteps = createInitialPlanningSteps(generationMode);
    initialSteps[0].status = "active";
    setPlanningSteps(initialSteps);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date().toLocaleTimeString() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          brandId: activeBrandProfile.id,
          platform: activePlatform,
          mode: generationMode,
          referenceImage: currentRefImages.length === 1 ? currentRefImages[0] : currentRefImages.length > 1 ? currentRefImages : null,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Failed to reach agent workflow.`);
      }

      if (!res.body) {
        throw new Error("ReadableStream not supported by browser environment.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      let streamCompleted = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const trimmed = part.trim();
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const payload = JSON.parse(trimmed.slice(6));

            if (payload.logs && Array.isArray(payload.logs)) {
              setWorkflowLogs(payload.logs);
            }

            if (payload.type === "progress") {
              if (payload.brief) {
                setBrief(payload.brief);
                setIsRightOpen(true);
              }
              if (payload.imageUrlA || payload.imageUrlB) {
                setBrief((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    concept_a: payload.imageUrlA ? { ...prev.concept_a, image_url: payload.imageUrlA } : prev.concept_a,
                    concept_b: payload.imageUrlB ? { ...prev.concept_b, image_url: payload.imageUrlB } : prev.concept_b,
                  };
                });
              }

              setPlanningSteps((prev) =>
                prev.map((step, idx) => {
                  if (idx === payload.step) {
                    return {
                      ...step,
                      status: payload.status,
                      duration: payload.durationMs
                        ? `${(payload.durationMs / 1000).toFixed(1)}s`
                        : undefined,
                      content: (
                        <div className="space-y-1 font-mono text-[11px] text-sapphire-muted mt-1 p-2.5 rounded-xl bg-sapphire-bg/70 border border-sapphire-border">
                          <p className="text-sapphire-dark font-medium leading-relaxed">
                            {payload.summary}
                          </p>
                        </div>
                      ),
                    };
                  } else if (idx < payload.step) {
                    return { ...step, status: "success" };
                  } else if (idx === payload.step + 1 && payload.status === "success") {
                    return { ...step, status: "active" };
                  }
                  return step;
                })
              );
            } else if (payload.type === "prompt_complete") {
              streamCompleted = true;
              setPromptResult(payload.promptResult);
              setPromptVersionHistory([payload.promptResult]);
              setIsRightOpen(true);


              setPlanningSteps((prev) =>
                prev.map((step) => ({ ...step, status: "success" }))
              );

              const pr: PromptResult = payload.promptResult;
              const headline = pr.typography_layout?.headline || pr.specification?.typography_layout?.headline;
              const cta = pr.typography_layout?.cta_text || pr.specification?.typography_layout?.cta_text;

              let assistantMsg = `✨ **Social Post & Prompt Intelligence Complete for ${pr.platform.toUpperCase()} (${pr.post_type.replace(/_/g, " ")})**\n\n`;
              if (headline) assistantMsg += `- **Headline:** "${headline}"\n`;
              if (cta) assistantMsg += `- **Call To Action:** ${cta}\n`;
              assistantMsg += `- **Creative Concept:** ${pr.interpreted_direction}\n- **Recommended Model:** ${pr.model_recommendation.displayName} (${pr.aspect_ratio})\n- **Prompt Critic Score:** ${pr.critic_evaluation.score}/100 (Passed)\n\nBoth the **Graphic Poster Prompt (In-Image Text)** and **Clean Photographic Canvas Prompt** plus the complete **Post Typography & Caption Blueprint** have been rendered in the Inspector Canvas on the right.`;


              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: assistantMsg,
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);
            } else if (payload.type === "complete") {
              streamCompleted = true;
              setCampaignId(payload.campaignId);
              setIntent(payload.intent);
              setResearch(payload.research);
              setReferenceAnalysis(payload.referenceAnalysis || null);
              setBrief(payload.brief);
              setCritiqueA(payload.critiqueA || null);
              setCritiqueB(payload.critiqueB || null);

              if (payload.logs && Array.isArray(payload.logs)) {
                setWorkflowLogs(payload.logs);
              }

              setHistoryConceptA([
                { versionNumber: 1, conceptItem: payload.brief.concept_a, userInstruction: "Initial Generation" },
              ]);
              setHistoryConceptB([
                { versionNumber: 1, conceptItem: payload.brief.concept_b, userInstruction: "Initial Generation" },
              ]);
              setActiveVersionA(1);
              setActiveVersionB(1);

              setPlanningSteps((prev) =>
                prev.map((step) => ({ ...step, status: "success" }))
              );

              let assistantMsg = `I've analyzed your request for "${payload.intent.event}" (${payload.intent.industry}). Brand context loaded for ${activeBrandProfile.name}.`;
              if (payload.referenceAnalysis) {
                assistantMsg += ` Gemini analyzed your reference image (Mood: ${payload.referenceAnalysis.mood}).`;
              }
              assistantMsg += ` Research synthesis complete. Critic Agent audited brand alignment. Select a concept on the Canvas to refine or approve for email delivery.`;

              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: assistantMsg,
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);
            } else if (payload.type === "error") {
              streamCompleted = true;
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: `Agent Workflow Error: ${payload.error || payload.message}`,
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);
            }
          } catch (jsonErr) {
            console.warn("Error parsing SSE JSON chunk:", jsonErr, trimmed);
          }
        }
      }


      if (!streamCompleted && !brief) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `The workflow execution was interrupted. Click "Telemetry Logs" at the top right to inspect step traces.`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Connection error: ${err.message || "Failed to reach agent API."}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      fetchSavedCampaigns();
    }
  };

  const handlePromptRefine = async (instruction: string) => {
    if (!promptResult || isRefiningPrompt) return;
    setIsRefiningPrompt(true);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: `Refine prompt: "${instruction}"`, timestamp: new Date().toLocaleTimeString() },
    ]);

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "prompt_only",
          promptResult,
          userInstruction: instruction,
          brandId: activeBrandProfile.id,
        }),
      });

      if (!res.ok) {
        throw new Error(`Refinement error: HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.promptResult) {
        setPromptResult(data.promptResult);
        setPromptVersionHistory((prev) => [...prev, data.promptResult]);
        setLearningToast(`Prompt refined to v${data.promptResult.version}. Rationale updated.`);

        setTimeout(() => setLearningToast(null), 3500);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `✨ **Prompt Refined (v${data.promptResult.version})**\n\n${data.promptResult.rationale.creative_direction_reason}\n\nThe updated prompt specification is now active on the right Inspector panel.`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Refinement Error: ${err.message || "Failed to refine prompt."}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setIsRefiningPrompt(false);
    }
  };

  const handleRefineSubmit = async (conceptKey: "A" | "B") => {

    if (!refinementInput.trim() || !brief || isRefinementLoading) return;

    const currentConceptItem =
      conceptKey === "A" ? brief.concept_a : brief.concept_b;
    const currentVersionNumber =
      conceptKey === "A" ? activeVersionA : activeVersionB;

    const userInstruction = refinementInput.trim();
    setRefinementInput("");
    setIsRefinementLoading(true);

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptLabel: conceptKey === "A" ? "Concept A" : "Concept B",
          currentVersionNumber,
          userInstruction,
          currentConcept: currentConceptItem,
        }),
      });

      const data = await res.json();

      if (data.success && data.updatedConcept) {
        const updatedItem: ConceptItem = data.updatedConcept;
        const newVersionNumber = data.versionNumber;

        if (conceptKey === "A") {
          setBrief((prev) => (prev ? { ...prev, concept_a: updatedItem } : null));
          setHistoryConceptA((prev) => [
            ...prev,
            { versionNumber: newVersionNumber, conceptItem: updatedItem, userInstruction },
          ]);
          setActiveVersionA(newVersionNumber);
        } else {
          setBrief((prev) => (prev ? { ...prev, concept_b: updatedItem } : null));
          setHistoryConceptB((prev) => [
            ...prev,
            { versionNumber: newVersionNumber, conceptItem: updatedItem, userInstruction },
          ]);
          setActiveVersionB(newVersionNumber);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Refinement applied to Concept ${conceptKey} (Version ${newVersionNumber}): "${userInstruction}". Modified aspects: ${data.refinement.modified_aspects.join(", ")}.`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);

        setIsRefining(null);
      }
    } catch (err: any) {
      console.error("Refinement error:", err);
    } finally {
      setIsRefinementLoading(false);
    }
  };

  const handleConceptSelect = async (conceptKey: "A" | "B") => {
    setSelectedConcept(conceptKey);
    if (!brief) return;

    const selected = conceptKey === "A" ? brief.concept_a : brief.concept_b;
    const unselected = conceptKey === "A" ? brief.concept_b : brief.concept_a;

    try {
      await fetch("/api/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedConcept: selected,
          unselectedConcept: unselected,
        }),
      });
      setPreferenceSaved(true);
      const archetype = selected.design_blueprint?.archetype?.replace(/_/g, " ") || "Editorial Layout";
      setLearningToast(`🧠 Brand Brain Updated: +15% affinity for ${archetype}`);
      setTimeout(() => setLearningToast(null), 4500);
    } catch (err) {
      console.warn("Preference recording error:", err);
    }

  };

  // Human Approval & Resend Email Delivery Handler
  const handleDeliverPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConcept || !brief || isDelivering) return;

    const chosenConcept =
      selectedConcept === "A" ? brief.concept_a : brief.concept_b;

    setIsDelivering(true);

    try {
      const res = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          conceptLabel: chosenConcept.label,
          campaignTitle: brief.campaign_title,
          imageUrl: chosenConcept.image_url,
          captionInstagram: chosenConcept.caption_instagram,
          captionLinkedin: chosenConcept.caption_linkedin,
          recipientEmail: recipientEmail.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setDeliverySuccess(
          `Approved Creative Package delivered to ${recipientEmail || "your inbox"}!`
        );
        setShowApprovalModal(false);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Human approval confirmed. Final creative package (${chosenConcept.label}) has been emailed to ${
              recipientEmail || "your inbox"
            } via Resend. No automatic social posting performed.`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      } else {
        alert(`Delivery error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Email error: ${err.message}`);
    } finally {
      setIsDelivering(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-sapphire-bg text-sapphire-dark selection:bg-sapphire-subtle">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Lightbox Preview Modal */}
      {activeImageModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-12 px-5 border-b border-white/5 flex items-center justify-between bg-zinc-900/90 select-none">
              <span className="text-text-xs font-semibold text-zinc-100">
                High Resolution Artwork Preview
              </span>
              <button
                onClick={() => setActiveImageModal(null)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImageModal}
                alt="Enlarged Artwork Preview"
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Human Approval & Instagram Delivery Modal (100% Instagram-First) */}
      {showApprovalModal && selectedConcept && brief && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-sapphire-terracotta" />
                <h3 className="font-semibold text-text-sm text-zinc-100">
                  Human Approval & Instagram Delivery
                </h3>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-text-xs text-zinc-400 leading-relaxed">
              <p>
                You are approving{" "}
                <strong className="font-semibold text-zinc-100">
                  {selectedConcept === "A" ? brief.concept_a.label : brief.concept_b.label}
                </strong>
                .
              </p>
              <p>
                Sapphire will package the 1080×1350 Canva-grade composite, typography layers, and formatted Instagram copy and deliver it to your email.
              </p>
            </div>

            <form onSubmit={handleDeliverPackage} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-text-xs font-semibold text-zinc-200">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Leave empty to use .env.local RESEND_TO_EMAIL"
                  className="w-full p-2.5 text-text-xs rounded-xl border border-white/10 bg-zinc-950 outline-none focus:border-white/30 text-zinc-100 placeholder:text-zinc-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-white/10 text-text-xs font-medium bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDelivering}
                  className="px-4 py-2 rounded-xl bg-sapphire-terracotta text-white font-medium text-text-xs hover:bg-opacity-90 disabled:opacity-40 flex items-center gap-1.5 shadow-sm transition-all"
                >
                  {isDelivering ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <CheckCheck className="w-4 h-4" />
                      <span>Approve & Deliver Package</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Main Top Application Header Bar */}
      <header className="h-12 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-3">
          <Link href="/workspaces" className="flex items-center gap-2.5 group" title="Sapphire Workspaces">
            <div className="w-6 h-6 rounded-md overflow-hidden border border-white/10 bg-zinc-900 flex items-center justify-center p-0.5 shadow-sm group-hover:border-sapphire-terracotta transition-colors">
              <img src="/logo.png" alt="Sapphire" className="w-full h-full object-contain" />
            </div>
            <span className="font-semibold text-text-sm tracking-tight text-zinc-100">
              Sapphire
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">

          {(isLoading || isRefinementLoading || isDelivering) && (
            <div className="flex items-center gap-1.5 text-text-xs text-sapphire-terracotta bg-sapphire-terracotta/10 px-2.5 py-1 rounded-md border border-sapphire-terracotta/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-sapphire-terracotta" />
              <span className="hidden sm:inline font-medium">
                {isLoading
                  ? "Generating Concepts..."
                  : isRefinementLoading
                  ? "Refining Concept..."
                  : "Delivering Package..."}
              </span>
            </div>
          )}

          <button
            onClick={() => setIsLogsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-text-xs font-medium bg-zinc-900/60 hover:bg-zinc-900 transition-colors border border-white/5 text-zinc-300 hover:text-zinc-100"
            title="Open Live Agent Telemetry & Logs"
          >
            <Activity className="w-3.5 h-3.5 text-sapphire-terracotta" />
            <span className="hidden sm:inline">Telemetry Logs</span>
            {workflowLogs.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-sapphire-terracotta text-white font-semibold">
                {workflowLogs.length}
              </span>
            )}
          </button>

          <div className="h-4 w-[1px] bg-white/5" />

          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-white transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </header>

      {/* 2. Main 3-Pane Spatial Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Floating Cognitive Learning Toast */}
        {learningToast && (
          <div className="absolute top-4 right-4 z-40 bg-zinc-900 border border-sapphire-terracotta/30 text-zinc-100 px-4 py-2.5 rounded-2xl shadow-xl animate-fade-in flex items-center gap-2 text-text-xs font-medium">
            <Sparkles className="w-4 h-4 text-sapphire-terracotta shrink-0" />
            <span>{learningToast}</span>
          </div>
        )}

        {/* LEFT PANEL: Navigation, Asset Gallery & History */}
        <aside
          className={`border-r border-white/5 bg-zinc-950 flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
            isLeftOpen ? "w-[270px] opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none border-r-0"
          }`}
        >
          <div className="w-[270px] flex flex-col h-full">
            {/* Unified Top Header: Active Workspace Brand Profile & Actions */}
            <div className="h-14 px-3.5 border-b border-white/5 bg-zinc-950 flex items-center justify-between">
              <Link href="/workspaces" className="flex items-center gap-2.5 min-w-0 group" title="Manage Workspaces / Switch Brand">
                <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center font-bold text-xs text-zinc-200 shrink-0 group-hover:border-sapphire-terracotta transition-colors">
                  {activeBrandProfile.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-text-xs font-semibold text-zinc-200 group-hover:text-zinc-100 leading-tight">
                    {activeBrandProfile.name}
                  </p>
                  <span className="text-[10px] text-zinc-400 truncate block">
                    {activeBrandProfile.industry}
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  title="Brand Brain Settings"
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsLeftOpen(false)}
                  title="Collapse Left Panel (Ctrl+B)"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Gallery & Chronological History */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-text-xs">
              {/* Workspace Gallery Section */}
              {savedCampaigns.some((c) => c.raw?.brief?.concept_a?.image_url) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 px-1">
                    <span>CREATIVE GALLERY</span>
                    <span className="font-mono text-[10px]">
                      {savedCampaigns.filter((c) => c.raw?.brief?.concept_a?.image_url).length} Assets
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {savedCampaigns
                      .filter((c) => c.raw?.brief?.concept_a?.image_url)
                      .slice(0, 6)
                      .map((c) => {
                        const img = c.raw?.brief?.concept_a?.image_url;
                        return (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCampaign(c)}
                            title={c.campaign_title}
                            className="aspect-[4/5] rounded-lg overflow-hidden border border-white/5 bg-zinc-900 cursor-pointer hover:border-sapphire-terracotta transition-all relative group"
                          >
                            <img
                              src={img}
                              alt={c.campaign_title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Chronological Campaign Stream with Thumbnails & Pagination & Delete Action */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 px-1">
                  <span>RECENT SESSIONS</span>
                  <span className="font-mono text-[10px]">
                    {savedCampaigns.length} total
                  </span>
                </div>

                {savedCampaigns.length > 0 ? (
                  <>
                    <div className="space-y-1">
                      {savedCampaigns
                        .slice((chatPage - 1) * CHATS_PER_PAGE, chatPage * CHATS_PER_PAGE)
                        .map((c) => {
                          const isActive = campaignId === c.id;
                          const thumb = c.raw?.brief?.concept_a?.image_url;
                          return (
                            <div
                              key={c.id}
                              onClick={() => handleSelectCampaign(c)}
                              className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl text-left transition-all cursor-pointer group ${
                                isActive
                                  ? "bg-zinc-900 text-zinc-100 font-semibold border border-white/10 shadow-sm"
                                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/70 border border-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                {thumb ? (
                                  <img
                                    src={thumb}
                                    alt=""
                                    className="w-8 h-10 rounded-md object-cover border border-white/5 shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-10 rounded-md bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0 text-zinc-500">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="truncate text-text-xs text-zinc-200 font-medium leading-tight">
                                    {c.campaign_title}
                                  </p>
                                  <span className="text-[10px] text-zinc-500 block pt-0.5">
                                    {new Date(c.created_at).toLocaleDateString(undefined, {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                              </div>

                              {/* Hover Delete Button (Deletes Session History Only) */}
                              <button
                                onClick={(e) => handleDeleteSession(e, c.id)}
                                title="Delete session history (preserves gallery assets)"
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-all shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {savedCampaigns.length > CHATS_PER_PAGE && (
                      <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-zinc-500 border-t border-white/5">
                        <button
                          disabled={chatPage === 1}
                          onClick={() => setChatPage((p) => Math.max(1, p - 1))}
                          className="px-2 py-0.5 rounded border border-white/5 bg-zinc-900 disabled:opacity-40 disabled:pointer-events-none hover:text-zinc-200"
                        >
                          Prev
                        </button>
                        <span className="font-mono text-[10px]">
                          {chatPage} / {Math.ceil(savedCampaigns.length / CHATS_PER_PAGE)}
                        </span>
                        <button
                          disabled={chatPage >= Math.ceil(savedCampaigns.length / CHATS_PER_PAGE)}
                          onClick={() => setChatPage((p) => p + 1)}
                          className="px-2 py-0.5 rounded border border-white/5 bg-zinc-900 disabled:opacity-40 disabled:pointer-events-none hover:text-zinc-200"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-zinc-500 text-text-xs border border-white/5 bg-zinc-900/30 rounded-xl">
                    <p className="font-medium">No previous campaigns.</p>
                    <p className="text-[10px] pt-1 text-zinc-500">
                      Submit a prompt to create artwork.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Minimalist Bottom Footer: Micro-Quota Tracker */}
            <div className="p-3 border-t border-white/5 bg-zinc-950/50 space-y-2">
              <div
                onClick={() => setIsSettingsOpen(true)}
                className="group cursor-pointer p-2.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-900 border border-white/5 transition-all"
                title="Click to manage Brand Brain & Quotas"
              >
                <div className="flex items-center justify-between text-[11px] font-medium text-zinc-200 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-sapphire-terracotta" />
                    <span>
                      {quotaInfo ? `${quotaInfo.remainingNeurons.toLocaleString()} Neurons` : "Daily Quota"}
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-300">
                    {quotaInfo ? `${quotaInfo.estimatedPostsRemaining} left` : "Free Tier"}
                  </span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-sapphire-terracotta h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, quotaInfo?.percentUsed || 16)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>




        {/* CENTER PANEL: Conversational Workspace */}
        <main className="flex-1 flex flex-col bg-sapphire-bg overflow-hidden min-w-0 relative">
          {/* Top Global Navigation Bar & Command Palette Trigger */}
          <div className="h-12 px-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-2">
              {!isLeftOpen && (
                <button
                  onClick={() => setIsLeftOpen(true)}
                  title="Expand Left Panel (Ctrl+B)"
                  className="p-1.5 rounded-lg text-text-xs text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-white/5 transition-colors shadow-sm"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              )}
              <span className="text-[11px] font-medium text-zinc-400 hidden sm:inline">
                Active Brand: <strong className="text-zinc-200">{activeBrandProfile.name}</strong>
              </span>
            </div>

            {/* Center Command Palette Quick Search Button */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-[11px] text-zinc-400 hover:text-zinc-200 transition-all shadow-xs"
            >
              <Search className="w-3.5 h-3.5 text-sapphire-terracotta" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="px-1.5 py-0.2 rounded bg-zinc-950 text-[9px] font-mono text-zinc-400 border border-white/5">
                ⌘K
              </kbd>
            </button>

            {/* Right Tools: Node Graph, KB, Telemetry (Icon-Only) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsNodeGraphOpen(true)}
                title="Visual Multi-Agent DAG Node Graph"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition-colors"
              >
                <Layers className="w-4 h-4 text-amber-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsKnowledgeBaseOpen(true)}
                title="Knowledge Base & Strategy Rules"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-900 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
              </button>

              <button
                type="button"
                onClick={() => setIsLogsOpen(true)}
                title="Telemetry Traces & Workflow Telemetry"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-400 hover:bg-zinc-900 transition-colors"
              >
                <Activity className="w-4 h-4 text-sapphire-blue" />
              </button>


              {!isRightOpen && (
                <button
                  onClick={() => setIsRightOpen(true)}
                  title="Expand Right Canvas (Ctrl+Alt+B)"
                  className="p-1.5 rounded-lg text-text-xs text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-white/5 transition-colors shadow-sm ml-1"
                >
                  <PanelRightOpen className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>


          {/* Centered Conversation Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-2xl transition-all ${
                    msg.role === "user"
                      ? "bg-zinc-900/70 border border-white/5 ml-6 md:ml-16 text-zinc-300 shadow-sm"
                      : msg.role === "system"
                      ? "bg-zinc-900/40 border border-white/5 text-zinc-400 text-text-xs"
                      : "bg-zinc-900/85 bg-gradient-to-br from-sapphire-terracotta/[0.03] to-transparent border border-white/5 mr-6 md:mr-16 shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium mb-2">
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
                      {msg.role === "user" ? (
                        "You"
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-sapphire-terracotta" />
                          Sapphire Creative Director
                        </>
                      )}
                    </span>
                    <span className="text-zinc-500">{msg.timestamp}</span>
                  </div>
                  <p className="text-[13px] md:text-text-sm text-zinc-200 leading-relaxed md:leading-7 whitespace-pre-wrap font-sans">
                    {msg.content}
                  </p>
                </div>
              ))}

              {/* Multimodal Visual Blueprint Manifest Card */}
              {referenceAnalysis && (
                <div className="border border-white/5 rounded-2xl p-5 bg-zinc-900/80 space-y-3.5 shadow-md animate-fade-in">
                  <div className="flex items-center justify-between text-text-xs font-medium text-zinc-400 border-b border-white/5 pb-2.5">
                    <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                      <Layers className="w-3.5 h-3.5 text-sapphire-terracotta" />
                      Visual Blueprint Manifest
                    </span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Synthesized
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-text-xs">
                    <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Camera & Optics
                      </span>
                      <p className="text-zinc-200 font-medium text-[11px] leading-relaxed">
                        {referenceAnalysis.camera_optics || referenceAnalysis.photography_style}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Lighting Vector
                      </span>
                      <p className="text-zinc-200 font-medium text-[11px] leading-relaxed">
                        {referenceAnalysis.lighting_vector || referenceAnalysis.lighting}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Negative Space Budget
                      </span>
                      <p className="text-zinc-200 font-medium text-[11px] leading-relaxed">
                        {referenceAnalysis.spatial_negative_space_plan || referenceAnalysis.negative_space_zone || "Upper 40% reserved for headline typography"}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">
                        Palette Anchors
                      </span>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        {(referenceAnalysis.color_palette_anchors || referenceAnalysis.color_palette).slice(0, 4).map((c, i) => (
                          <div key={i} className="flex items-center gap-1 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">
                            <div className="w-2.5 h-2.5 rounded-full border border-white/10 shadow-xs" style={{ backgroundColor: c }} />
                            <span className="font-mono text-[9px] text-zinc-300">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {research && (
                <div className="border border-white/5 rounded-2xl p-5 bg-zinc-900/80 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between text-text-xs font-medium text-zinc-400">
                    <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                      <Search className="w-3.5 h-3.5 text-sapphire-blue" />
                      Research Synthesis
                    </span>
                    <span className="text-emerald-400 font-medium flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </span>
                  </div>
                  <p className="text-text-xs text-zinc-300 leading-relaxed md:leading-6">{research.summary}</p>
                </div>
              )}

              {/* Reasoning Accordion (Prompt-Kit / DeepSeek R1 UI) */}
              {isLoading && (
                <ReasoningAccordion
                  isThinking={true}
                  thoughtContent="Deconstructing brief into brand tokens, retrieving platform rules, formulating visual metaphor, and routing optimal model..."
                  modelName="Gemini 2.5 Flash"
                />
              )}

              {/* Dynamic Live Multi-Agent Planning & Orchestration Timeline */}
              {(isLoading || brief || planningSteps.some((s) => s.status === "success" || s.status === "active" || s.status === "error")) && (
                <AgentPlanning
                  title={
                    generationMode === "prompt_only"
                      ? "Prompt Intelligence DAG Execution (Serverless)"
                      : "Multi-Agent Pipeline Step Traces"
                  }
                  steps={planningSteps}
                  className="animate-in fade-in duration-300"
                />
              )}

              {/* Auto-scroll target anchor */}
              <div ref={agentTreeEndRef} className="h-4 pointer-events-none" />
            </div>
          </div>



          {/* Centered Composer Input (21st.dev / Claude Elevated Studio Composer) */}
          <div className="p-4 border-t border-white/5 bg-zinc-950/80 backdrop-blur-md">
            <div className="max-w-3xl lg:max-w-4xl w-full mx-auto">
              <StudioComposer
                prompt={prompt}
                onChangePrompt={setPrompt}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                platform={activePlatform}
                onChangePlatform={(p) => {
                  setActivePlatform(p);
                  setLearningToast(`Platform target set to ${p.toUpperCase()}`);
                  setTimeout(() => setLearningToast(null), 3000);
                }}
                generationMode={generationMode}
                onChangeGenerationMode={(m) => {
                  setGenerationMode(m);
                  setPlanningSteps(createInitialPlanningSteps(m));
                }}
                referenceImages={referenceImages}
                onAddReferenceImage={(base64) => {
                  setReferenceImages((prev) => [...prev, base64].slice(0, 3));
                }}
                onRemoveReferenceImage={(idx) => {
                  removeReferenceImage(idx);
                }}
              />
            </div>
          </div>
        </main>


        {/* RIGHT PANEL: Spatial Creative Canvas & Prompt Result Inspector */}
        <aside
          className={`border-l border-white/5 bg-zinc-950 flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
            isRightOpen ? "flex-1 min-w-[340px] opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none border-l-0"
          }`}
        >
          <div className="flex flex-col h-full min-w-[340px]">
            <div className="h-12 px-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/80 shrink-0">
              <div className="flex items-center gap-2">
                {generationMode === "prompt_only" ? (
                  <Sparkles className="w-4 h-4 text-sapphire-terracotta" />
                ) : (
                  <Layers className="w-4 h-4 text-zinc-400" />
                )}
                <h2 className="text-text-sm font-semibold text-zinc-100">
                  {generationMode === "prompt_only"
                    ? `Prompt Intelligence Studio (${activePlatform === "instagram" ? "Instagram 4:5" : "LinkedIn"})`
                    : `Spatial Creative Canvas (${activePlatform === "instagram" ? "Instagram 4:5" : "LinkedIn"})`}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {generationMode === "campaign" && (
                  <button
                    onClick={() => setViewMode((prev) => (prev === "ab" ? "focus" : "ab"))}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-text-xs font-medium border transition-colors ${
                      viewMode === "focus"
                        ? "bg-sapphire-terracotta text-white border-sapphire-terracotta"
                        : "border-white/5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
                    }`}
                    title="Toggle between A/B Dual Grid and Studio Focus View"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>{viewMode === "ab" ? "Vertical Feed View" : "Studio Focus View"}</span>
                  </button>
                )}
                <button
                  onClick={() => setIsRightOpen(false)}
                  title="Collapse Right Canvas (Ctrl+Alt+B)"
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Spatial Canvas / Prompt Inspector Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* Branch A: Prompt Intelligence Mode Active */}
                {generationMode === "prompt_only" ? (
                  promptResult ? (
                    <PromptResultInspector
                      result={promptResult}
                      onRefine={handlePromptRefine}
                      isRefining={isRefiningPrompt}
                      versionHistory={promptVersionHistory}
                      onSelectVersion={(v) => setPromptResult(v)}
                      onUpdateResult={(updated) => setPromptResult(updated)}
                    />

                  ) : (

                    <div className="p-8 rounded-3xl bg-zinc-900/60 border border-white/5 text-center space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-sapphire-terracotta/10 border border-sapphire-terracotta/20 flex items-center justify-center mx-auto text-sapphire-terracotta">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-heading-sm font-semibold text-zinc-100">
                          Prompt Intelligence Ready
                        </h3>
                        <p className="text-text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                          Enter a content idea in the composer. Sapphire will interpret your Brand DNA, apply platform psychology, select the optimal image model (FLUX, Midjourney, Ideogram), and engineer a production-ready prompt audited by a 100-point critic.
                        </p>
                      </div>

                      <div className="pt-3 flex flex-wrap justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPrompt(`Luxury boutique hotel retreat in Kyoto, Japan during autumn with traditional architecture and serene zen garden atmosphere`)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-[11px] text-zinc-300 transition-colors text-left"
                        >
                          💡 Hotel Retreat in Kyoto (Editorial)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPrompt(`Why 90% of B2B AI startups fail to build a defensible data flywheel — executive framework`)}
                          className="px-3 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-[11px] text-zinc-300 transition-colors text-left"
                        >
                          💡 AI Startup Flywheel (LinkedIn Framework)
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <>
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div>
                        <h3 className="text-heading-md font-semibold text-zinc-100">
                          {viewMode === "ab" ? "Instagram Creative Directions (Vertical Feed)" : "Studio Focus Inspector"}
                        </h3>
                        <p className="text-text-xs text-zinc-400">
                          {brief
                            ? "1080×1350 Canva-grade visual compositions stacked with generous inspection space."
                            : "Generated visual artwork will render here stacked vertically upon prompt submission."}
                        </p>
                      </div>
                    </div>

                    {/* View Mode 1: Vertical Stack Feed Layout */}
                    {viewMode === "ab" ? (
                      <div className="flex flex-col space-y-10">
                        {/* Concept A Card */}
                        <div
                          className={`border rounded-3xl bg-zinc-900/80 p-6 space-y-4 shadow-xl transition-all ${
                            selectedConcept === "A"
                              ? "border-sapphire-terracotta ring-1 ring-sapphire-terracotta/40"
                              : "border-white/5 hover:border-white/15"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-text-sm font-semibold px-3 py-1 rounded-xl bg-zinc-950 border border-white/5 text-zinc-100 truncate max-w-[280px]">
                              {brief ? brief.concept_a.label : "Concept A — Emotional Journey"}
                            </span>
                            <span className="text-[10px] font-semibold text-sapphire-blue bg-sapphire-blue/10 px-2.5 py-0.5 rounded-full border border-sapphire-blue/20">
                              {selectedConcept === "A" ? "Active Selection" : "Direction A"}
                            </span>
                          </div>


                      {/* Plain-Language Founder Summary */}
                      {brief?.concept_a.design_blueprint?.founder_summary && (
                        <p className="text-[12px] text-zinc-300 bg-zinc-950/60 border border-white/5 rounded-xl px-3 py-2 leading-relaxed">
                          {brief.concept_a.design_blueprint.founder_summary}
                        </p>
                      )}

                      {/* Brand Compliance Scorecard (Critic Agent) */}
                      {critiqueA && (
                        <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1.5 text-text-xs">
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-1.5 text-zinc-200">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              Brand Alignment Score
                            </span>
                            <span className="text-emerald-400 font-bold text-text-xs">
                              {critiqueA.brand_alignment_score}/100
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-tight">
                            {critiqueA.critique_notes[0] || "Passed brand voice & visual compliance audit."}
                          </p>
                        </div>
                      )}

                      {/* Version History Strip */}
                      {historyConceptA.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                          <span className="text-[10px] text-zinc-500 font-medium">Versions:</span>
                          {historyConceptA.map((v) => (
                            <button
                              key={v.versionNumber}
                              onClick={() => {
                                setActiveVersionA(v.versionNumber);
                                setBrief((prev) => (prev ? { ...prev, concept_a: v.conceptItem } : null));
                              }}
                              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                                activeVersionA === v.versionNumber
                                  ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                                  : "bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-zinc-400"
                              }`}
                            >
                              v{v.versionNumber}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Image Preview Container with Live Loading Animation */}
                      <div className="relative aspect-[4/5] rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden group shadow-inner flex items-center justify-center">
                        {isRegeneratingA || (isLoading && !brief?.concept_a.image_url) ? (
                          <ImageGeneration
                            prompt={brief?.concept_a.image_prompt || prompt || "Artisanal espresso with golden hour lighting"}
                            resolution="1080 × 1350"
                          />
                        ) : brief?.concept_a.image_url && !imageErrorA ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={brief.concept_a.image_url}
                              alt="Concept A AI Generated Visual"
                              onError={() => setImageErrorA(true)}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                              <button
                                onClick={() => setActiveImageModal(brief.concept_a.image_url!)}
                                className="p-2.5 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors border border-white/10"
                                title="Enlarge Image Preview"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRegenerateImage("A")}
                                disabled={isRegeneratingA}
                                className="p-2.5 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors border border-white/10"
                                title="Regenerate Artwork"
                              >
                                <RefreshCw className={`w-4 h-4 ${isRegeneratingA ? "animate-spin" : ""}`} />
                              </button>
                              <a
                                href={brief.concept_a.image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors border border-white/10"
                                title="Open High Res Image"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </>
                        ) : imageErrorA ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2.5">
                            <AlertCircle className="w-8 h-8 text-rose-400 stroke-1" />
                            <p className="text-text-xs font-semibold text-rose-300">
                              Artwork Rendering Timeout
                            </p>
                            <p className="text-[11px] text-rose-400/80 max-w-[200px] leading-tight">
                              API returned an unrendered state or rate limit.
                            </p>
                            <button
                              onClick={() => handleRegenerateImage("A")}
                              disabled={isRegeneratingA}
                              className="px-3 py-1.5 bg-sapphire-terracotta text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm hover:bg-opacity-90 transition-opacity"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingA ? "animate-spin" : ""}`} />
                              <span>{isRegeneratingA ? "Regenerating..." : "Retry Image Generation"}</span>
                            </button>
                          </div>
                        ) : brief ? (
                          <ImageGeneration
                            prompt={brief.concept_a.image_prompt}
                            resolution="1080 × 1350"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500 space-y-2">
                            <FileText className="w-8 h-8 stroke-1 text-zinc-600" />
                            <p className="text-text-xs font-semibold text-zinc-300">
                              Concept A Visual Preview
                            </p>
                            <p className="text-text-xs text-zinc-500 max-w-[220px]">
                              Submit a prompt to generate AI social media artwork.
                            </p>
                          </div>
                        )}
                      </div>

                      {brief && (
                        <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 text-[11px] space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-zinc-200">Instagram Caption Draft:</p>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {brief.concept_a.caption_instagram.length} chars
                            </span>
                          </div>
                          <p className="text-zinc-300 leading-relaxed line-clamp-3 whitespace-pre-line font-sans">
                            {brief.concept_a.caption_instagram}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(brief.concept_a.caption_instagram, "cap-a")
                            }
                            className="flex items-center gap-1 text-sapphire-terracotta hover:underline font-medium pt-1"
                          >
                            {copiedId === "cap-a" ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy Instagram Caption</span>
                          </button>
                        </div>
                      )}

                      {/* Refinement Overlay Form */}
                      {isRefining === "A" ? (
                        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-sapphire-terracotta/40 space-y-2">
                          <div className="flex items-center justify-between text-text-xs font-semibold text-zinc-200">
                            <span className="flex items-center gap-1">
                              <Wand2 className="w-3.5 h-3.5 text-sapphire-terracotta" />
                              Refine Concept A (v{activeVersionA})
                            </span>
                            <button
                              onClick={() => setIsRefining(null)}
                              className="p-0.5 text-zinc-400 hover:text-zinc-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={refinementInput}
                            onChange={(e) => setRefinementInput(e.target.value)}
                            placeholder="e.g. Make lighting warmer & caption punchier..."
                            className="w-full p-2.5 text-text-xs rounded-xl border border-white/10 bg-zinc-900 outline-none focus:border-white/30 text-zinc-100"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setIsRefining(null)}
                              className="px-3 py-1 rounded-xl text-text-xs font-medium border border-white/10 hover:bg-zinc-800 text-zinc-300"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRefineSubmit("A")}
                              disabled={!refinementInput.trim() || isRefinementLoading}
                              className="px-3 py-1 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-medium hover:bg-opacity-90 disabled:opacity-40 flex items-center gap-1"
                            >
                              {isRefinementLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Apply Edit"
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleConceptSelect("A")}
                              className={`flex-1 py-2.5 rounded-xl text-text-xs font-medium transition-all ${
                                selectedConcept === "A"
                                  ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                                  : "border border-white/5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
                              }`}
                            >
                              {selectedConcept === "A" ? "Concept A Selected" : "Select Concept A"}
                            </button>
                            {brief && (
                              <button
                                onClick={() => setIsRefining("A")}
                                className="p-2.5 rounded-xl border border-white/5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-text-xs font-medium flex items-center gap-1"
                                title="Refine Concept A"
                              >
                                <Wand2 className="w-3.5 h-3.5 text-sapphire-terracotta" />
                                <span>Refine</span>
                              </button>
                            )}
                          </div>

                          {selectedConcept === "A" && brief && (
                            <button
                              onClick={() => setShowApprovalModal(true)}
                              className="w-full py-2.5 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Approve & Send Instagram Package</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Concept B Card */}
                    <div
                      className={`border rounded-3xl bg-zinc-900/80 p-6 space-y-4 shadow-xl transition-all ${
                        selectedConcept === "B"
                          ? "border-sapphire-terracotta ring-1 ring-sapphire-terracotta/40"
                          : "border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-text-sm font-semibold px-3 py-1 rounded-xl bg-zinc-950 border border-white/5 text-zinc-100 truncate max-w-[280px]">
                          {brief ? brief.concept_b.label : "Concept B — Editorial India"}
                        </span>
                        <span className="text-[10px] font-semibold text-sapphire-blue bg-sapphire-blue/10 px-2.5 py-0.5 rounded-full border border-sapphire-blue/20">
                          {selectedConcept === "B" ? "Active Selection" : "Direction B"}
                        </span>
                      </div>

                      {/* Plain-Language Founder Summary */}
                      {brief?.concept_b.design_blueprint?.founder_summary && (
                        <p className="text-[12px] text-zinc-300 bg-zinc-950/60 border border-white/5 rounded-xl px-3 py-2 leading-relaxed">
                          {brief.concept_b.design_blueprint.founder_summary}
                        </p>
                      )}

                      {/* Brand Compliance Scorecard (Critic Agent) */}
                      {critiqueB && (
                        <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-1.5 text-text-xs">
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-1.5 text-zinc-200">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              Brand Alignment Score
                            </span>
                            <span className="text-emerald-400 font-bold text-text-xs">
                              {critiqueB.brand_alignment_score}/100
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-tight">
                            {critiqueB.critique_notes[0] || "Passed brand voice & visual compliance audit."}
                          </p>
                        </div>
                      )}

                      {/* Version History Strip */}
                      {historyConceptB.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                          <span className="text-[10px] text-zinc-500 font-medium">Versions:</span>
                          {historyConceptB.map((v) => (
                            <button
                              key={v.versionNumber}
                              onClick={() => {
                                setActiveVersionB(v.versionNumber);
                                setBrief((prev) => (prev ? { ...prev, concept_b: v.conceptItem } : null));
                              }}
                              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-medium transition-colors ${
                                activeVersionB === v.versionNumber
                                  ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                                  : "bg-zinc-950 hover:bg-zinc-800 border border-white/5 text-zinc-400"
                              }`}
                            >
                              v{v.versionNumber}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Image Preview Container with Live Loading Animation */}
                      <div className="relative aspect-[4/5] rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden group shadow-inner flex items-center justify-center">
                        {isRegeneratingB || (isLoading && !brief?.concept_b.image_url) ? (
                          <ImageGeneration
                            prompt={brief?.concept_b.image_prompt || prompt || "Editorial photography with bold typography"}
                            resolution="1080 × 1350"
                          />
                        ) : brief?.concept_b.image_url && !imageErrorB ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={brief.concept_b.image_url}
                              alt="Concept B AI Generated Visual"
                              onError={() => setImageErrorB(true)}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                              <button
                                onClick={() => setActiveImageModal(brief.concept_b.image_url!)}
                                className="p-2.5 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors border border-white/10"
                                title="Enlarge Image Preview"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRegenerateImage("B")}
                                disabled={isRegeneratingB}
                                className="p-2.5 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors border border-white/10"
                                title="Regenerate Artwork"
                              >
                                <RefreshCw className={`w-4 h-4 ${isRegeneratingB ? "animate-spin" : ""}`} />
                              </button>
                              <a
                                href={brief.concept_b.image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors border border-white/10"
                                title="Open High Res Image"
                              >
                                <Download className="w-4 h-4" />
                              </a>
                            </div>
                          </>
                        ) : imageErrorB ? (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-2.5">
                            <AlertCircle className="w-8 h-8 text-rose-400 stroke-1" />
                            <p className="text-text-xs font-semibold text-rose-300">
                              Artwork Rendering Timeout
                            </p>
                            <p className="text-[11px] text-rose-400/80 max-w-[200px] leading-tight">
                              API returned an unrendered state or rate limit.
                            </p>
                            <button
                              onClick={() => handleRegenerateImage("B")}
                              disabled={isRegeneratingB}
                              className="px-3 py-1.5 bg-sapphire-terracotta text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm hover:bg-opacity-90 transition-opacity"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingB ? "animate-spin" : ""}`} />
                              <span>{isRegeneratingB ? "Regenerating..." : "Retry Image Generation"}</span>
                            </button>
                          </div>
                        ) : brief ? (
                          <ImageGeneration
                            prompt={brief.concept_b.image_prompt}
                            resolution="1080 × 1350"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500 space-y-2">
                            <FileText className="w-8 h-8 stroke-1 text-zinc-600" />
                            <p className="text-text-xs font-semibold text-zinc-300">
                              Concept B Visual Preview
                            </p>
                            <p className="text-text-xs text-zinc-500 max-w-[220px]">
                              Submit a prompt to generate AI social media artwork.
                            </p>
                          </div>
                        )}
                      </div>

                      {brief && (
                        <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/5 text-[11px] space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-zinc-200">Instagram Caption Draft:</p>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              {brief.concept_b.caption_instagram.length} chars
                            </span>
                          </div>
                          <p className="text-zinc-300 leading-relaxed line-clamp-3 whitespace-pre-line font-sans">
                            {brief.concept_b.caption_instagram}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(brief.concept_b.caption_instagram, "cap-b")
                            }
                            className="flex items-center gap-1 text-sapphire-terracotta hover:underline font-medium pt-1"
                          >
                            {copiedId === "cap-b" ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy Instagram Caption</span>
                          </button>
                        </div>
                      )}

                      {/* Refinement Overlay Form */}
                      {isRefining === "B" ? (
                        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-sapphire-terracotta/40 space-y-2">
                          <div className="flex items-center justify-between text-text-xs font-semibold text-zinc-200">
                            <span className="flex items-center gap-1">
                              <Wand2 className="w-3.5 h-3.5 text-sapphire-terracotta" />
                              Refine Concept B (v{activeVersionB})
                            </span>
                            <button
                              onClick={() => setIsRefining(null)}
                              className="p-0.5 text-zinc-400 hover:text-zinc-200"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={refinementInput}
                            onChange={(e) => setRefinementInput(e.target.value)}
                            placeholder="e.g. Make lighting warmer & caption punchier..."
                            className="w-full p-2.5 text-text-xs rounded-xl border border-white/10 bg-zinc-900 outline-none focus:border-white/30 text-zinc-100"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setIsRefining(null)}
                              className="px-3 py-1 rounded-xl text-text-xs font-medium border border-white/10 hover:bg-zinc-800 text-zinc-300"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRefineSubmit("B")}
                              disabled={!refinementInput.trim() || isRefinementLoading}
                              className="px-3 py-1 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-medium hover:bg-opacity-90 disabled:opacity-40 flex items-center gap-1"
                            >
                              {isRefinementLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Apply Edit"
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleConceptSelect("B")}
                              className={`flex-1 py-2.5 rounded-xl text-text-xs font-medium transition-all ${
                                selectedConcept === "B"
                                  ? "bg-zinc-100 text-zinc-950 font-semibold shadow-sm"
                                  : "border border-white/5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
                              }`}
                            >
                              {selectedConcept === "B" ? "Concept B Selected" : "Select Concept B"}
                            </button>
                            {brief && (
                              <button
                                onClick={() => setIsRefining("B")}
                                className="p-2.5 rounded-xl border border-white/5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-text-xs font-medium flex items-center gap-1"
                                title="Refine Concept B"
                              >
                                <Wand2 className="w-3.5 h-3.5 text-sapphire-terracotta" />
                                <span>Refine</span>
                              </button>
                            )}
                          </div>

                          {selectedConcept === "B" && brief && (
                            <button
                              onClick={() => setShowApprovalModal(true)}
                              className="w-full py-2.5 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Mail className="w-3.5 h-3.5" />
                              <span>Approve & Send Instagram Package</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* View Mode 2: Studio Focus View (Hero inspection with side-by-side thumbnail switcher) */
                  <div className="space-y-6">
                    {/* Focus Concept Switcher Segmented Tab */}
                    <div className="flex items-center justify-center gap-3 p-1.5 rounded-2xl bg-zinc-900 border border-white/5 max-w-sm mx-auto shadow-inner">
                      <button
                        onClick={() => setSelectedConcept("A")}
                        className={`flex-1 py-2 rounded-xl text-text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                          (selectedConcept === "A" || !selectedConcept)
                            ? "bg-zinc-800 text-zinc-100 shadow-sm border border-white/5"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-sapphire-blue" />
                        <span>Direction A ({brief ? brief.concept_a.label.slice(0, 16) : "Concept A"}...)</span>
                      </button>
                      <button
                        onClick={() => setSelectedConcept("B")}
                        className={`flex-1 py-2 rounded-xl text-text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                          selectedConcept === "B"
                            ? "bg-zinc-800 text-zinc-100 shadow-sm border border-white/5"
                            : "text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-sapphire-terracotta" />
                        <span>Direction B ({brief ? brief.concept_b.label.slice(0, 16) : "Concept B"}...)</span>
                      </button>
                    </div>

                    {/* Active Hero Concept Focus Inspector Card */}
                    {(() => {
                      const activeHeroKey = selectedConcept === "B" ? "B" : "A";
                      const activeHeroConcept = activeHeroKey === "B" ? brief?.concept_b : brief?.concept_a;
                      const activeHeroCritique = activeHeroKey === "B" ? critiqueB : critiqueA;
                      const activeHeroHistory = activeHeroKey === "B" ? historyConceptB : historyConceptA;
                      const activeHeroVersion = activeHeroKey === "B" ? activeVersionB : activeVersionA;
                      const activeHeroIsRegenerating = activeHeroKey === "B" ? isRegeneratingB : isRegeneratingA;
                      const activeHeroImageError = activeHeroKey === "B" ? imageErrorB : imageErrorA;

                      return (
                        <div className="border border-white/5 rounded-3xl bg-zinc-900/90 p-6 space-y-6 shadow-2xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="w-3 h-3 rounded-full bg-sapphire-terracotta" />
                              <span className="font-bold text-text-sm text-zinc-100">
                                {activeHeroConcept ? activeHeroConcept.label : `Concept ${activeHeroKey}`}
                              </span>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                              Focus Inspector Active
                            </span>
                          </div>

                          {/* Hero 1080x1350 Canvas Stage */}
                          <div className="relative aspect-[4/5] rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden group shadow-2xl flex items-center justify-center max-w-lg mx-auto">
                            {activeHeroIsRegenerating || (isLoading && !activeHeroConcept?.image_url) ? (
                              <ImageGeneration
                                prompt={activeHeroConcept?.image_prompt || prompt || "Editorial photography with bold typography"}
                                resolution="1080 × 1350"
                              />
                            ) : activeHeroConcept?.image_url && !activeHeroImageError ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={activeHeroConcept.image_url}
                                  alt={`Concept ${activeHeroKey} Focus Preview`}
                                  onError={() => {
                                    if (activeHeroKey === "A") setImageErrorA(true);
                                    else setImageErrorB(true);
                                  }}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                                  <button
                                    onClick={() => setActiveImageModal(activeHeroConcept.image_url!)}
                                    className="p-3 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors border border-white/10"
                                    title="Enlarge Image Preview"
                                  >
                                    <Maximize2 className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleRegenerateImage(activeHeroKey)}
                                    disabled={activeHeroIsRegenerating}
                                    className="p-3 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors border border-white/10"
                                    title="Regenerate Artwork"
                                  >
                                    <RefreshCw className={`w-5 h-5 ${activeHeroIsRegenerating ? "animate-spin" : ""}`} />
                                  </button>
                                  <a
                                    href={activeHeroConcept.image_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 rounded-xl bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors border border-white/10"
                                    title="Open High Res Image"
                                  >
                                    <Download className="w-5 h-5" />
                                  </a>
                                </div>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500 space-y-2">
                                <FileText className="w-8 h-8 stroke-1 text-zinc-600" />
                                <p className="text-text-xs font-semibold text-zinc-300">
                                  Focus Visual Canvas
                                </p>
                                <p className="text-text-xs text-zinc-500 max-w-[220px]">
                                  Submit a prompt to inspect artwork in Focus Mode.
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Hero Metadata & Critic Breakdown */}
                          <div className="space-y-4 max-w-lg mx-auto">
                            {activeHeroCritique && (
                              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-2 text-text-xs">
                                <div className="flex items-center justify-between font-semibold">
                                  <span className="flex items-center gap-1.5 text-zinc-200">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    Brand Alignment & Readability Score
                                  </span>
                                  <span className="text-emerald-400 font-bold text-text-xs">
                                    {activeHeroCritique.brand_alignment_score}/100
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] text-zinc-400">
                                  <div>
                                    <span className="text-zinc-500">Visual Quality:</span>{" "}
                                    <span className="font-semibold text-zinc-200">{activeHeroCritique.visual_score}/100</span>
                                  </div>
                                  <div>
                                    <span className="text-zinc-500">Voice Tone:</span>{" "}
                                    <span className="font-semibold text-emerald-400">
                                      {activeHeroCritique.voice_compliance ? "100% Compliant" : "Flagged"}
                                    </span>
                                  </div>
                                </div>
                                {activeHeroCritique.critique_notes[0] && (
                                  <p className="text-[11px] text-zinc-400 pt-1 border-t border-white/5 leading-relaxed">
                                    {activeHeroCritique.critique_notes[0]}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Instagram Caption Draft */}
                            {activeHeroConcept && (
                              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-white/5 space-y-2 text-text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-zinc-200">
                                    Instagram Caption & Hashtags
                                  </span>
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    {activeHeroConcept.caption_instagram.length} chars
                                  </span>
                                </div>
                                <p className="text-[11px] text-zinc-300 leading-relaxed whitespace-pre-line line-clamp-5 font-sans">
                                  {activeHeroConcept.caption_instagram}
                                </p>
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      activeHeroConcept.caption_instagram,
                                      `cap-hero-${activeHeroKey}`
                                    )
                                  }
                                  className="flex items-center gap-1 text-sapphire-terracotta hover:underline font-medium text-[11px] pt-1"
                                >
                                  {copiedId === `cap-hero-${activeHeroKey}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>Copy Instagram Caption</span>
                                </button>
                              </div>
                            )}

                            {/* Action Bar */}
                            {brief && (
                              <div className="flex items-center gap-3 pt-2">
                                <button
                                  onClick={() => setIsRefining(activeHeroKey)}
                                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 text-text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <Wand2 className="w-3.5 h-3.5 text-sapphire-terracotta" />
                                  <span>Refine Direction {activeHeroKey}</span>
                                </button>
                                <button
                                  onClick={() => setShowApprovalModal(true)}
                                  className="flex-1 py-2.5 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>Approve Direction {activeHeroKey}</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
              </div>
            </div>
          </div>
        </aside>

      </div>



      {/* Dual Personal & Client OpenBrand Onboarding Modal */}
      <WorkspaceOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onComplete={async (newBrand) => {
          const brandWithId: BrandProfile = {
            ...newBrand,
            id: newBrand.id || newBrand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          };
          setActiveBrandProfile(brandWithId);
          setActiveBrand(brandWithId.name);
          setIsOnboardingModalOpen(false);

          // 1. Sync to local storage
          try {
            const raw = localStorage.getItem("sapphire_user_workspaces");
            const existing: BrandProfile[] = raw ? JSON.parse(raw) : [];
            const updated = [brandWithId, ...existing.filter((b) => b.id !== brandWithId.id)];
            localStorage.setItem("sapphire_user_workspaces", JSON.stringify(updated));
          } catch (e) {
            console.warn("Error caching workspace:", e);
          }

          // 2. Persist to server API
          try {
            await fetch("/api/workspaces", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(brandWithId),
            });
          } catch (apiErr) {
            console.warn("Error persisting workspace to server:", apiErr);
          }

          // 3. Update URL search param seamlessly
          if (typeof window !== "undefined" && brandWithId.id) {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set("workspace", brandWithId.id);
            window.history.pushState({}, "", newUrl.toString());
          }


          setLearningToast(`🎉 Workspace "${brandWithId.name}" saved & activated!`);
          setTimeout(() => setLearningToast(null), 5000);
        }}
      />




      {/* Brand Brain & Settings Drawer */}
      <BrandBrainDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        brand={activeBrandProfile}
        quotaInfo={quotaInfo}
        onRefreshQuota={fetchQuota}
        isRefreshingQuota={isRefreshingQuota}
        onSavePreferences={(prefs, email) => {
          setActiveBrandProfile((prev) => ({
            ...prev,
            learned_preferences: prefs,
          }));
          if (email) setRecipientEmail(email);
        }}
      />


      {/* Dedicated Agent Telemetry & Logs Drawer */}
      <LogDrawer
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={workflowLogs}
      />

      {/* Global Command Palette (Ctrl+K / Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        activeBrand={activeBrand}
        onSelectBrand={(newBrand) => {
          setActiveBrandProfile(newBrand);
          setActiveBrand(newBrand.name);
          setLearningToast(`Switched brand to "${newBrand.name}"`);
          setTimeout(() => setLearningToast(null), 3000);
        }}
        generationMode={generationMode}
        onSetGenerationMode={(newMode) => {
          setGenerationMode(newMode);
          setPlanningSteps(createInitialPlanningSteps(newMode));
          setLearningToast(`Switched mode to ${newMode === "prompt_only" ? "Prompt Intelligence" : "Campaign Generation"}`);
          setTimeout(() => setLearningToast(null), 3000);
        }}
        activePlatform={activePlatform}
        onSetPlatform={(newPlatform) => {
          setActivePlatform(newPlatform);
          setLearningToast(`Platform target set to ${newPlatform.toUpperCase()}`);
          setTimeout(() => setLearningToast(null), 3000);
        }}
        onOpenNodeGraph={() => setIsNodeGraphOpen(true)}
        onOpenKnowledgeBase={() => setIsKnowledgeBaseOpen(true)}
        onOpenBrandBrain={() => setIsSettingsOpen(true)}
        onOpenTelemetry={() => setIsLogsOpen(true)}
        onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        onSelectTemplate={(templateText) => {
          setPrompt(templateText);
          setLearningToast("Template brief loaded into composer");
          setTimeout(() => setLearningToast(null), 3000);
        }}
      />

      {/* Visual Multi-Agent DAG Execution Graph Modal */}
      <WorkflowNodeGraph
        isOpen={isNodeGraphOpen}
        onClose={() => setIsNodeGraphOpen(false)}
        steps={planningSteps}
        logs={workflowLogs}
        activeBrandName={activeBrandProfile.name}
        platform={activePlatform}
      />

      {/* Knowledge Base & Strategy Strategy Rules Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
      />
    </div>
  );
}


// Helper to resolve hero critique in Focus View
function selectedHeroKey(
  selected: "A" | "B" | null,
  critiqueA: CriticResult | null,
  critiqueB: CriticResult | null
): CriticResult | null {
  if (selected === "B") return critiqueB;
  return critiqueA;
}
