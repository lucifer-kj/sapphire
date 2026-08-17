"use client";

import React, { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

import { CreativeBrief, ResearchContext, UserIntent, ConceptItem } from "@/lib/schema/campaign";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { CriticResult } from "@/lib/schema/critic";
import { WorkflowLogEntry } from "@/lib/schema/telemetry";
import { LogDrawer } from "@/components/telemetry/log-drawer";
import { BrandSwitcherModal, PRECONFIGURED_BRANDS } from "@/components/brand/brand-switcher-modal";
import { BrandBrainDrawer } from "@/components/settings/brand-brain-drawer";
import { BrandProfile, LearnedPreferences } from "@/lib/schema/brand";
import { AgentPlanning, PlanStep } from "@/components/ui/agent-planning";
import { ImageGeneration } from "@/components/ui/image-generation";

const createInitialPlanningSteps = (): PlanStep[] => [
  {
    id: "1",
    title: "1. Intent Parsing & Brand DNA Extraction (Groq Llama 3.3)",
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

interface ConceptVersionHistory {
  versionNumber: number;
  conceptItem: ConceptItem;
  userInstruction?: string;
}

export default function SapphireWorkspace() {
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [activeBrandProfile, setActiveBrandProfile] = useState<BrandProfile>(PRECONFIGURED_BRANDS[0]);
  const [activeBrand, setActiveBrand] = useState("Vagabond Travel Agency");
  const [isLoading, setIsLoading] = useState(false);
  const [planningSteps, setPlanningSteps] = useState<PlanStep[]>(createInitialPlanningSteps());

  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Brand Switcher & Settings State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"ab" | "focus">("ab");

  // Supabase Saved Campaigns
  const [savedCampaigns, setSavedCampaigns] = useState<
    Array<{ id: string; campaign_title: string; event: string; created_at: string; raw: any }>
  >([]);

  // Dedicated Telemetry Logs State
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowLogEntry[]>([]);
  const [isLogsOpen, setIsLogsOpen] = useState(false);

  // Image load error & retry states
  const [imageErrorA, setImageErrorA] = useState(false);
  const [imageErrorB, setImageErrorB] = useState(false);
  const [isRegeneratingA, setIsRegeneratingA] = useState(false);
  const [isRegeneratingB, setIsRegeneratingB] = useState(false);

  // Reference Image Upload State
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setReferenceImage(null);
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

  // Keyboard shortcut listener: Ctrl+B (Settings), Ctrl+Alt+B (Right Panel), Ctrl+N (New Conversation)
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

      if (isCtrlOrCmd && key === "n") {
        e.preventDefault();
        handleNewConversation();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBrand]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
          referenceImage: referenceImage,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = prompt.trim();
    const currentRefImage = referenceImage;
    setPrompt("");
    setReferenceImage(null);
    setIsLoading(true);
    setPreferenceSaved(false);
    setDeliverySuccess(null);
    setImageErrorA(false);
    setImageErrorB(false);

    // Reset planning steps to active state
    const initialSteps = createInitialPlanningSteps();
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
          referenceImage: currentRefImage,
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

            if (payload.type === "progress") {
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
            } else if (payload.type === "complete") {
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
              setMessages((prev) => [
                ...prev,
                {
                  role: "assistant",
                  content: `Agent Workflow Error: ${payload.error}`,
                  timestamp: new Date().toLocaleTimeString(),
                },
              ]);
            }
          } catch (jsonErr) {
            console.warn("Error parsing SSE JSON chunk:", jsonErr, trimmed);
          }
        }
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-sapphire-surface border border-sapphire-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-10 px-4 border-b border-sapphire-border flex items-center justify-between bg-sapphire-surface select-none">
              <span className="text-text-xs font-semibold text-sapphire-dark">
                High Resolution Artwork Preview
              </span>
              <button
                onClick={() => setActiveImageModal(null)}
                className="p-1 rounded hover:bg-sapphire-subtle text-sapphire-muted hover:text-sapphire-dark transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-sapphire-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImageModal}
                alt="Enlarged Artwork Preview"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Human Approval & Instagram Delivery Modal (100% Instagram-First) */}
      {showApprovalModal && selectedConcept && brief && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-sapphire-surface border border-sapphire-border rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sapphire-border pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-sapphire-terracotta" />
                <h3 className="font-semibold text-text-sm text-sapphire-dark">
                  Human Approval & Instagram Delivery
                </h3>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-1 rounded text-sapphire-muted hover:text-sapphire-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-text-xs text-sapphire-muted">
              <p>
                You are approving{" "}
                <strong className="font-semibold text-sapphire-dark">
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
                <label className="text-text-xs font-semibold text-sapphire-dark">
                  Recipient Email Address
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="Leave empty to use .env.local RESEND_TO_EMAIL"
                  className="w-full p-2.5 text-text-xs rounded-lg border border-sapphire-border bg-sapphire-bg outline-none focus:border-white/30 text-sapphire-dark placeholder:text-sapphire-muted/60"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-3 py-2 rounded-lg border border-sapphire-border text-text-xs font-medium bg-sapphire-bg hover:bg-sapphire-subtle text-sapphire-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDelivering}
                  className="px-4 py-2 rounded-lg bg-sapphire-terracotta text-white font-medium text-text-xs hover:bg-opacity-90 disabled:opacity-40 flex items-center gap-1.5 shadow-sm transition-all"
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
      <header className="h-12 border-b border-sapphire-border bg-sapphire-surface px-4 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-md bg-sapphire-terracotta text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-sm">
              S
            </span>
            <span className="font-semibold text-text-sm tracking-tight text-sapphire-dark">
              Sapphire
            </span>
          </div>

          <div className="h-4 w-[0.5px] bg-sapphire-border" />

          {/* Interactive Brand Switcher Button */}
          <button
            onClick={() => setIsBrandModalOpen(true)}
            title="Switch Brand Profile"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-text-xs font-medium bg-sapphire-bg hover:bg-sapphire-subtle transition-all border border-sapphire-border text-sapphire-dark shadow-hairline"
          >
            <span className="w-2 h-2 rounded-full bg-sapphire-green animate-pulse" />
            <span className="max-w-[170px] truncate">{activeBrand}</span>
            <ChevronDown className="w-3.5 h-3.5 text-sapphire-muted" />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-text-xs text-sapphire-muted">
          <span>{intent ? intent.event : "Instagram Studio"}</span>
          <ChevronRight className="w-3 h-3 text-sapphire-muted/60" />
          <span className="text-sapphire-dark font-medium truncate max-w-[240px]">
            {brief ? brief.campaign_title : "Concept Direction A/B"}
          </span>
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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-text-xs font-medium bg-sapphire-bg hover:bg-sapphire-subtle transition-colors border border-sapphire-border text-sapphire-dark"
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

          <div className="h-4 w-[0.5px] bg-sapphire-border" />

          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-text-xs font-medium bg-sapphire-dark text-sapphire-bg hover:bg-white hover:text-black transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </header>

      {/* 2. Main 3-Pane Spatial Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT PANEL: Navigation & Brand Context */}
        <aside
          className={`border-r border-sapphire-border bg-sapphire-surface flex flex-col transition-all duration-300 ease-in-out shrink-0 select-none ${
            isLeftOpen ? "w-[260px] opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none border-r-0"
          }`}
        >
          <div className="w-[260px] flex flex-col h-full">
            {/* Minimalist Top Header */}
            <div className="h-10 px-3 border-b border-sapphire-border flex items-center justify-between bg-sapphire-surface">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-sapphire-muted">
                Campaigns
              </span>
              <button
                onClick={() => setIsLeftOpen(false)}
                title="Collapse Left Panel (Ctrl+B)"
                className="p-1 rounded-md text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle transition-colors border border-transparent hover:border-sapphire-border"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Clean + New Campaign Button */}
            <div className="p-3 border-b border-sapphire-border">
              <button
                onClick={handleNewConversation}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-sapphire-bg hover:bg-sapphire-subtle border border-sapphire-border text-text-xs font-medium text-sapphire-dark transition-colors shadow-hairline"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-sapphire-terracotta" />
                  <span>New Campaign</span>
                </span>
                <span className="text-[10px] text-sapphire-muted bg-sapphire-surface px-1.5 py-0.5 rounded border border-sapphire-border">
                  Ctrl+N
                </span>
              </button>
            </div>

            {/* Spacious Minimalist Recent Campaigns List */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-1 text-text-xs">
              {savedCampaigns.length > 0 ? (
                savedCampaigns.map((c) => {
                  const isActive = campaignId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectCampaign(c)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                        isActive
                          ? "bg-sapphire-subtle text-sapphire-dark font-semibold border border-sapphire-border shadow-hairline"
                          : "text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle/60 border border-transparent"
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-sapphire-terracotta/80 shrink-0" />
                      <span className="truncate text-text-xs">{c.campaign_title}</span>
                    </button>
                  );
                })
              ) : (
                <div className="p-3 text-center text-sapphire-muted text-text-xs">
                  <p>No previous campaigns.</p>
                  <p className="text-[10px] pt-1 text-sapphire-muted/70">Submit a prompt to begin.</p>
                </div>
              )}
            </div>

            {/* Minimalist Bottom Footer: Brand Brain & Settings */}
            <div className="p-3 border-t border-sapphire-border bg-sapphire-surface flex items-center justify-between text-text-xs text-sapphire-muted">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 hover:text-sapphire-dark transition-colors font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-sapphire-terracotta" />
                <span>Brand Brain & Quotas</span>
              </button>
              <span className="text-[10px] bg-sapphire-bg px-1.5 py-0.5 rounded border border-sapphire-border">
                Ctrl+B
              </span>
            </div>
          </div>
        </aside>

        {/* CENTER PANEL: Conversational Workspace */}
        <main className="flex-1 flex flex-col bg-sapphire-bg overflow-hidden min-w-0 relative">
          {/* Subtle panel toggle controls if sidebars are collapsed */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            {!isLeftOpen && (
              <button
                onClick={() => setIsLeftOpen(true)}
                title="Expand Left Panel (Ctrl+B)"
                className="p-1.5 rounded-md text-text-xs text-sapphire-muted hover:text-sapphire-dark bg-sapphire-surface/80 backdrop-blur hover:bg-sapphire-surface border border-sapphire-border transition-colors shadow-sm"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
            {!isRightOpen && (
              <button
                onClick={() => setIsRightOpen(true)}
                title="Expand Right Canvas (Ctrl+Alt+B)"
                className="p-1.5 rounded-md text-text-xs text-sapphire-muted hover:text-sapphire-dark bg-sapphire-surface/80 backdrop-blur hover:bg-sapphire-surface border border-sapphire-border transition-colors shadow-sm"
              >
                <PanelRightOpen className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Centered Conversation Area */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-2xl mx-auto space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    msg.role === "user"
                      ? "bg-sapphire-surface border-sapphire-border ml-8 shadow-sm"
                      : msg.role === "system"
                      ? "bg-sapphire-surface/60 border-sapphire-border text-sapphire-muted text-text-xs"
                      : "bg-sapphire-surface border-sapphire-border mr-8 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] text-sapphire-muted font-medium mb-1.5">
                    <span className="flex items-center gap-1.5 font-semibold text-sapphire-dark">
                      {msg.role === "user" ? (
                        "You"
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-sapphire-terracotta" />
                          Sapphire Creative Director
                        </>
                      )}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="text-text-sm text-sapphire-dark/95 leading-relaxed whitespace-pre-wrap font-sans">
                    {msg.content}
                  </p>
                </div>
              ))}

              {/* Reference Analysis Synthesis Card */}
              {referenceAnalysis && (
                <div className="border border-sapphire-border rounded-2xl p-4 bg-sapphire-surface space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-text-xs font-medium text-sapphire-muted">
                    <span className="flex items-center gap-1.5 text-sapphire-dark font-semibold">
                      <Eye className="w-3.5 h-3.5 text-sapphire-terracotta" />
                      Multimodal Reference Analysis
                    </span>
                    <span className="text-sapphire-green font-medium flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Processed
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-xs text-sapphire-muted">
                    <div>
                      <span className="text-sapphire-muted font-medium">Mood:</span>{" "}
                      <span className="text-sapphire-dark font-medium">
                        {referenceAnalysis.mood}
                      </span>
                    </div>
                    <div>
                      <span className="text-sapphire-muted font-medium">Style:</span>{" "}
                      <span className="text-sapphire-dark font-medium">
                        {referenceAnalysis.photography_style}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {research && (
                <div className="border border-sapphire-border rounded-2xl p-4 bg-sapphire-surface space-y-2.5 shadow-sm">
                  <div className="flex items-center justify-between text-text-xs font-medium text-sapphire-muted">
                    <span className="flex items-center gap-1.5 text-sapphire-dark font-semibold">
                      <Search className="w-3.5 h-3.5 text-sapphire-blue" />
                      Research Synthesis
                    </span>
                    <span className="text-sapphire-green font-medium flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </span>
                  </div>
                  <p className="text-text-xs text-sapphire-dark/90 leading-relaxed">{research.summary}</p>
                </div>
              )}

              {/* Dynamic Live Multi-Agent Planning & Orchestration Timeline */}
              {(isLoading || brief) && (
                <AgentPlanning
                  title={
                    isLoading
                      ? "Multi-Agent Pipeline Active • Streaming Mastra Agents..."
                      : "Multi-Agent Generation Complete • 1080×1350 Assets Ready"
                  }
                  steps={planningSteps}
                  className="animate-in fade-in duration-300"
                />
              )}
            </div>
          </div>

          {/* Centered Composer Input (Claude Minimalist Style) */}
          <div className="p-4 border-t border-sapphire-border bg-sapphire-bg/90 backdrop-blur-md">
            <div className="max-w-2xl w-full mx-auto">
              <form onSubmit={handleSubmit} className="space-y-2">
                {referenceImage && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-sapphire-surface border border-sapphire-border text-text-xs">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={referenceImage}
                        alt="Reference Attachment"
                        className="w-7 h-7 object-cover rounded border border-sapphire-border"
                      />
                      <span className="font-medium text-sapphire-dark">Reference Image Attached</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReferenceImage(null)}
                      className="p-1 text-sapphire-muted hover:text-sapphire-dark rounded hover:bg-sapphire-subtle"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="relative border border-sapphire-border rounded-2xl bg-sapphire-surface focus-within:border-white/20 transition-all p-3.5 shadow-md">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your Instagram post request (e.g. Artisanal breakfast pour-over ritual) or upload a reference image..."
                    rows={3}
                    className="w-full bg-transparent border-none outline-none resize-none text-text-sm text-sapphire-dark placeholder:text-sapphire-muted font-sans"
                  />
                  <div className="flex items-center justify-between pt-2 border-t border-sapphire-border/50">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-text-xs ${
                        referenceImage
                          ? "bg-sapphire-terracotta/20 text-sapphire-terracotta border border-sapphire-terracotta/30"
                          : "text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle"
                      }`}
                      title="Attach reference image"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span className="hidden sm:inline font-medium">
                        {referenceImage ? "Image Attached" : "Reference Image"}
                      </span>
                    </button>
                    <button
                      type="submit"
                      disabled={!prompt.trim() || isLoading}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sapphire-terracotta text-white font-medium text-text-xs hover:bg-opacity-90 disabled:opacity-40 transition-all shadow-sm"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Generate Instagram Concepts</span>
                          <Send className="w-3 h-3" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* RIGHT PANEL: Spatial Creative Canvas & A/B Concepts */}
        <aside
          className={`border-l border-sapphire-border bg-sapphire-bg flex flex-col transition-all duration-300 ease-in-out shrink-0 ${
            isRightOpen ? "flex-1 min-w-[340px] opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none border-l-0"
          }`}
        >
          <div className="flex flex-col h-full min-w-[340px]">
            <div className="h-10 px-4 border-b border-sapphire-border flex items-center justify-between bg-sapphire-surface shrink-0">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sapphire-muted" />
                <h2 className="text-text-sm font-semibold text-sapphire-dark">
                  Spatial Creative Canvas (Instagram 4:5)
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode((prev) => (prev === "ab" ? "focus" : "ab"))}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-text-xs font-medium border transition-colors ${
                    viewMode === "focus"
                      ? "bg-sapphire-terracotta text-white border-sapphire-terracotta"
                      : "border-sapphire-border bg-sapphire-surface hover:bg-sapphire-subtle text-sapphire-dark"
                  }`}
                  title="Toggle between A/B Dual Grid and Studio Focus View"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{viewMode === "ab" ? "Vertical Feed View" : "Studio Focus View"}</span>
                </button>
                <button
                  onClick={() => setIsRightOpen(false)}
                  title="Collapse Right Canvas (Ctrl+Alt+B)"
                  className="p-1 rounded-md text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle transition-colors border border-transparent hover:border-sapphire-border"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Spatial Canvas Content Area (Vertical Stack Layout with Generous Spacing) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center justify-between border-b border-sapphire-border pb-3">
                  <div>
                    <h3 className="text-heading-md font-semibold text-sapphire-dark">
                      {viewMode === "ab" ? "Instagram Creative Directions (Vertical Feed)" : "Studio Focus Inspector"}
                    </h3>
                    <p className="text-text-xs text-sapphire-muted">
                      {brief
                        ? "1080×1350 Canva-grade visual compositions stacked with generous inspection space."
                        : "Generated visual artwork will render here stacked vertically upon prompt submission."}
                    </p>
                  </div>
                </div>

                {/* View Mode 1: Vertical Stack Feed Layout (One below another with generous spacing) */}
                {viewMode === "ab" ? (
                  <div className="flex flex-col space-y-10">
                    {/* Concept A Card */}
                    <div
                      className={`border rounded-2xl bg-sapphire-surface p-5 space-y-4 shadow-lg transition-all ${
                        selectedConcept === "A"
                          ? "border-sapphire-terracotta ring-2 ring-sapphire-terracotta/40"
                          : "border-sapphire-border hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-text-sm font-semibold px-3 py-1 rounded-lg bg-sapphire-bg border border-sapphire-border text-sapphire-dark truncate max-w-[280px]">
                          {brief ? brief.concept_a.label : "Concept A — Emotional Journey"}
                        </span>
                        <span className="text-[10px] font-semibold text-sapphire-blue bg-sapphire-blue/10 px-2.5 py-0.5 rounded-full border border-sapphire-blue/20">
                          {selectedConcept === "A" ? "Active Selection" : "Direction A"}
                        </span>
                      </div>

                      {/* Brand Compliance Scorecard (Critic Agent) */}
                      {critiqueA && (
                        <div className="p-3 rounded-xl bg-sapphire-bg border border-sapphire-border space-y-1.5 text-text-xs">
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-1.5 text-sapphire-dark">
                              <ShieldCheck className="w-4 h-4 text-sapphire-green" />
                              Brand Alignment Score
                            </span>
                            <span className="text-sapphire-green font-bold text-text-xs">
                              {critiqueA.brand_alignment_score}/100
                            </span>
                          </div>
                          <p className="text-[11px] text-sapphire-muted leading-tight">
                            {critiqueA.critique_notes[0] || "Passed brand voice & visual compliance audit."}
                          </p>
                        </div>
                      )}

                      {/* Version History Strip */}
                      {historyConceptA.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                          <span className="text-[10px] text-sapphire-muted font-medium">Versions:</span>
                          {historyConceptA.map((v) => (
                            <button
                              key={v.versionNumber}
                              onClick={() => {
                                setActiveVersionA(v.versionNumber);
                                setBrief((prev) => (prev ? { ...prev, concept_a: v.conceptItem } : null));
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                activeVersionA === v.versionNumber
                                  ? "bg-sapphire-dark text-sapphire-bg font-semibold"
                                  : "bg-sapphire-bg hover:bg-sapphire-subtle border border-sapphire-border text-sapphire-muted"
                              }`}
                            >
                              v{v.versionNumber}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Image Preview Container with Live Loading Animation */}
                      <div className="relative aspect-[4/5] rounded-2xl bg-sapphire-bg border border-sapphire-border overflow-hidden group shadow-inner flex items-center justify-center">
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
                                className="p-2.5 rounded-xl bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-subtle transition-colors border border-sapphire-border"
                                title="Enlarge Image Preview"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRegenerateImage("A")}
                                disabled={isRegeneratingA}
                                className="p-2.5 rounded-xl bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-subtle transition-colors border border-sapphire-border"
                                title="Regenerate Artwork"
                              >
                                <RefreshCw className={`w-4 h-4 ${isRegeneratingA ? "animate-spin" : ""}`} />
                              </button>
                              <a
                                href={brief.concept_a.image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-xl bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-subtle transition-colors border border-sapphire-border"
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
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-sapphire-muted space-y-2">
                            <FileText className="w-8 h-8 stroke-1 text-sapphire-muted" />
                            <p className="text-text-xs font-semibold text-sapphire-dark">
                              Concept A Visual Preview
                            </p>
                            <p className="text-text-xs text-sapphire-muted max-w-[220px]">
                              Submit a prompt to generate AI social media artwork.
                            </p>
                          </div>
                        )}
                      </div>

                      {brief && (
                        <div className="p-3.5 rounded-xl bg-sapphire-bg border border-sapphire-border text-[11px] space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sapphire-dark">Instagram Caption Draft:</p>
                            <span className="text-[10px] text-sapphire-muted font-mono">
                              {brief.concept_a.caption_instagram.length} chars
                            </span>
                          </div>
                          <p className="text-sapphire-dark/90 leading-relaxed line-clamp-3 whitespace-pre-line font-sans">
                            {brief.concept_a.caption_instagram}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(brief.concept_a.caption_instagram, "cap-a")
                            }
                            className="flex items-center gap-1 text-sapphire-terracotta hover:underline font-medium pt-1"
                          >
                            {copiedId === "cap-a" ? (
                              <Check className="w-3 h-3 text-sapphire-green" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy Instagram Caption</span>
                          </button>
                        </div>
                      )}

                      {/* Refinement Overlay Form */}
                      {isRefining === "A" ? (
                        <div className="p-3.5 rounded-xl bg-sapphire-bg border border-sapphire-terracotta/40 space-y-2">
                          <div className="flex items-center justify-between text-text-xs font-semibold text-sapphire-dark">
                            <span className="flex items-center gap-1">
                              <Wand2 className="w-3.5 h-3.5 text-sapphire-terracotta" />
                              Refine Concept A (v{activeVersionA})
                            </span>
                            <button
                              onClick={() => setIsRefining(null)}
                              className="p-0.5 text-sapphire-muted hover:text-sapphire-dark"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={refinementInput}
                            onChange={(e) => setRefinementInput(e.target.value)}
                            placeholder="e.g. Make lighting warmer & caption punchier..."
                            className="w-full p-2 text-text-xs rounded-lg border border-sapphire-border bg-sapphire-surface outline-none focus:border-white/30 text-sapphire-dark"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setIsRefining(null)}
                              className="px-2.5 py-1 rounded-lg text-text-xs font-medium border border-sapphire-border hover:bg-sapphire-subtle"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRefineSubmit("A")}
                              disabled={!refinementInput.trim() || isRefinementLoading}
                              className="px-3 py-1 rounded-lg bg-sapphire-terracotta text-white text-text-xs font-medium hover:bg-opacity-90 disabled:opacity-40 flex items-center gap-1"
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
                                  ? "bg-sapphire-dark text-sapphire-bg font-semibold shadow-sm"
                                  : "border border-sapphire-border bg-sapphire-subtle/50 hover:bg-sapphire-subtle text-sapphire-dark"
                              }`}
                            >
                              {selectedConcept === "A" ? "Concept A Selected" : "Select Concept A"}
                            </button>
                            {brief && (
                              <button
                                onClick={() => setIsRefining("A")}
                                className="p-2.5 rounded-xl border border-sapphire-border bg-sapphire-subtle/50 hover:bg-sapphire-subtle text-sapphire-dark text-text-xs font-medium flex items-center gap-1"
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
                      className={`border rounded-2xl bg-sapphire-surface p-5 space-y-4 shadow-lg transition-all ${
                        selectedConcept === "B"
                          ? "border-sapphire-terracotta ring-2 ring-sapphire-terracotta/40"
                          : "border-sapphire-border hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-text-sm font-semibold px-3 py-1 rounded-lg bg-sapphire-bg border border-sapphire-border text-sapphire-dark truncate max-w-[280px]">
                          {brief ? brief.concept_b.label : "Concept B — Editorial India"}
                        </span>
                        <span className="text-[10px] font-semibold text-sapphire-blue bg-sapphire-blue/10 px-2.5 py-0.5 rounded-full border border-sapphire-blue/20">
                          {selectedConcept === "B" ? "Active Selection" : "Direction B"}
                        </span>
                      </div>

                      {/* Brand Compliance Scorecard (Critic Agent) */}
                      {critiqueB && (
                        <div className="p-3 rounded-xl bg-sapphire-bg border border-sapphire-border space-y-1.5 text-text-xs">
                          <div className="flex items-center justify-between font-semibold">
                            <span className="flex items-center gap-1.5 text-sapphire-dark">
                              <ShieldCheck className="w-4 h-4 text-sapphire-green" />
                              Brand Alignment Score
                            </span>
                            <span className="text-sapphire-green font-bold text-text-xs">
                              {critiqueB.brand_alignment_score}/100
                            </span>
                          </div>
                          <p className="text-[11px] text-sapphire-muted leading-tight">
                            {critiqueB.critique_notes[0] || "Passed brand voice & visual compliance audit."}
                          </p>
                        </div>
                      )}

                      {/* Version History Strip */}
                      {historyConceptB.length > 0 && (
                        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                          <span className="text-[10px] text-sapphire-muted font-medium">Versions:</span>
                          {historyConceptB.map((v) => (
                            <button
                              key={v.versionNumber}
                              onClick={() => {
                                setActiveVersionB(v.versionNumber);
                                setBrief((prev) => (prev ? { ...prev, concept_b: v.conceptItem } : null));
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                                activeVersionB === v.versionNumber
                                  ? "bg-sapphire-dark text-sapphire-bg font-semibold"
                                  : "bg-sapphire-bg hover:bg-sapphire-subtle border border-sapphire-border text-sapphire-muted"
                              }`}
                            >
                              v{v.versionNumber}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Image Preview Container with Live Loading Animation */}
                      <div className="relative aspect-[4/5] rounded-2xl bg-sapphire-bg border border-sapphire-border overflow-hidden group shadow-inner flex items-center justify-center">
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
                                className="p-2.5 rounded-xl bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-subtle transition-colors border border-sapphire-border"
                                title="Enlarge Image Preview"
                              >
                                <Maximize2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRegenerateImage("B")}
                                disabled={isRegeneratingB}
                                className="p-2.5 rounded-xl bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-subtle transition-colors border border-sapphire-border"
                                title="Regenerate Artwork"
                              >
                                <RefreshCw className={`w-4 h-4 ${isRegeneratingB ? "animate-spin" : ""}`} />
                              </button>
                              <a
                                href={brief.concept_b.image_url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2.5 rounded-xl bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-subtle transition-colors border border-sapphire-border"
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
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-sapphire-muted space-y-2">
                            <FileText className="w-8 h-8 stroke-1 text-sapphire-muted" />
                            <p className="text-text-xs font-semibold text-sapphire-dark">
                              Concept B Visual Preview
                            </p>
                            <p className="text-text-xs text-sapphire-muted max-w-[220px]">
                              Submit a prompt to generate AI social media artwork.
                            </p>
                          </div>
                        )}
                      </div>

                      {brief && (
                        <div className="p-3.5 rounded-xl bg-sapphire-bg border border-sapphire-border text-[11px] space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sapphire-dark">Instagram Caption Draft:</p>
                            <span className="text-[10px] text-sapphire-muted font-mono">
                              {brief.concept_b.caption_instagram.length} chars
                            </span>
                          </div>
                          <p className="text-sapphire-dark/90 leading-relaxed line-clamp-3 whitespace-pre-line font-sans">
                            {brief.concept_b.caption_instagram}
                          </p>
                          <button
                            onClick={() =>
                              copyToClipboard(brief.concept_b.caption_instagram, "cap-b")
                            }
                            className="flex items-center gap-1 text-sapphire-terracotta hover:underline font-medium pt-1"
                          >
                            {copiedId === "cap-b" ? (
                              <Check className="w-3 h-3 text-sapphire-green" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>Copy Instagram Caption</span>
                          </button>
                        </div>
                      )}

                      {/* Refinement Overlay Form */}
                      {isRefining === "B" ? (
                        <div className="p-3.5 rounded-xl bg-sapphire-bg border border-sapphire-terracotta/40 space-y-2">
                          <div className="flex items-center justify-between text-text-xs font-semibold text-sapphire-dark">
                            <span className="flex items-center gap-1">
                              <Wand2 className="w-3.5 h-3.5 text-sapphire-terracotta" />
                              Refine Concept B (v{activeVersionB})
                            </span>
                            <button
                              onClick={() => setIsRefining(null)}
                              className="p-0.5 text-sapphire-muted hover:text-sapphire-dark"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={refinementInput}
                            onChange={(e) => setRefinementInput(e.target.value)}
                            placeholder="e.g. Make composition more dramatic & captions punchier..."
                            className="w-full p-2 text-text-xs rounded-lg border border-sapphire-border bg-sapphire-surface outline-none focus:border-white/30 text-sapphire-dark"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setIsRefining(null)}
                              className="px-2.5 py-1 rounded-lg text-text-xs font-medium border border-sapphire-border hover:bg-sapphire-subtle"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleRefineSubmit("B")}
                              disabled={!refinementInput.trim() || isRefinementLoading}
                              className="px-3 py-1 rounded-lg bg-sapphire-terracotta text-white text-text-xs font-medium hover:bg-opacity-90 disabled:opacity-40 flex items-center gap-1"
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
                                  ? "bg-sapphire-dark text-sapphire-bg font-semibold shadow-sm"
                                  : "border border-sapphire-border bg-sapphire-subtle/50 hover:bg-sapphire-subtle text-sapphire-dark"
                              }`}
                            >
                              {selectedConcept === "B" ? "Concept B Selected" : "Select Concept B"}
                            </button>
                            {brief && (
                              <button
                                onClick={() => setIsRefining("B")}
                                className="p-2.5 rounded-xl border border-sapphire-border bg-sapphire-subtle/50 hover:bg-sapphire-subtle text-sapphire-dark text-text-xs font-medium flex items-center gap-1"
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

                  /* View Mode 2: Studio Focus Inspector (Single Concept Hero View) */
                  (() => {
                    const activeHeroConcept =
                      selectedConcept === "B"
                        ? brief?.concept_b
                        : brief?.concept_a;
                    const activeHeroKey = selectedConcept === "B" ? "B" : "A";
                    const activeHeroCritique =
                      selectedHeroKey(selectedConcept, critiqueA, critiqueB);
                    const bp = activeHeroConcept?.design_blueprint;

                    return (
                      <div className="space-y-5">
                        {/* Hero Card */}
                        <div className="border border-sapphire-border rounded-2xl bg-sapphire-surface p-6 shadow-md space-y-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-text-sm font-semibold text-sapphire-dark">
                                {activeHeroConcept ? activeHeroConcept.label : "Instagram Hero Direction"}
                              </span>
                              <span className="text-[10px] text-sapphire-terracotta bg-sapphire-terracotta/10 px-2.5 py-0.5 rounded-full border border-sapphire-terracotta/20 font-mono">
                                Concept {activeHeroKey}
                              </span>
                            </div>

                            {/* Switch Concept in Focus View */}
                            {brief && (
                              <div className="flex items-center gap-1 bg-sapphire-bg p-1 rounded-xl border border-sapphire-border text-text-xs">
                                <button
                                  onClick={() => handleConceptSelect("A")}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                                    selectedConcept !== "B"
                                      ? "bg-sapphire-surface text-sapphire-dark shadow-sm"
                                      : "text-sapphire-muted hover:text-sapphire-dark"
                                  }`}
                                >
                                  Concept A
                                </button>
                                <button
                                  onClick={() => handleConceptSelect("B")}
                                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                                    selectedConcept === "B"
                                      ? "bg-sapphire-surface text-sapphire-dark shadow-sm"
                                      : "text-sapphire-muted hover:text-sapphire-dark"
                                  }`}
                                >
                                  Concept B
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Artwork Preview */}
                            <div className="relative aspect-[4/5] rounded-2xl bg-sapphire-bg border border-sapphire-border overflow-hidden group shadow-md">
                              {activeHeroConcept?.image_url ? (
                                <>
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={activeHeroConcept.image_url}
                                    alt="Hero Instagram Visual"
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => setActiveImageModal(activeHeroConcept.image_url!)}
                                      className="p-2.5 rounded-xl bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-subtle transition-colors"
                                      title="Enlarge Asset"
                                    >
                                      <Maximize2 className="w-4 h-4" />
                                    </button>
                                    <a
                                      href={activeHeroConcept.image_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-2.5 rounded-xl bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-subtle transition-colors"
                                      title="Download High Res"
                                    >
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-sapphire-muted space-y-2">
                                  <FileText className="w-8 h-8 stroke-1" />
                                  <p className="text-text-xs font-medium">No artwork generated yet.</p>
                                </div>
                              )}
                            </div>

                            {/* Design Blueprint Inspector & Copy */}
                            <div className="space-y-4">
                              {/* Design Blueprint Matrix */}
                              <div className="p-3.5 rounded-xl bg-sapphire-bg border border-sapphire-border space-y-2.5 text-text-xs">
                                <span className="font-semibold text-sapphire-dark uppercase tracking-wider text-[10px]">
                                  Design Intelligence Blueprint
                                </span>
                                <div className="grid grid-cols-2 gap-2 text-[11px]">
                                  <div>
                                    <span className="text-sapphire-muted">Hook Font:</span>{" "}
                                    <span className="font-mono text-sapphire-dark font-medium">
                                      {bp?.font_family_hook || "Playfair Display"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-sapphire-muted">Body Font:</span>{" "}
                                    <span className="font-mono text-sapphire-dark font-medium">
                                      {bp?.font_family_body || "Plus Jakarta Sans"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-sapphire-muted">Archetype:</span>{" "}
                                    <span className="text-sapphire-terracotta font-medium">
                                      {bp?.archetype?.replace("_", " ") || "Editorial Magazine"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-sapphire-muted">Contrast Scrim:</span>{" "}
                                    <span className="text-sapphire-dark font-medium">
                                      {bp?.scrim_intensity || "Medium"}
                                    </span>
                                  </div>
                                </div>
                                {bp?.negative_space_directive && (
                                  <p className="text-[10px] text-sapphire-muted pt-1 border-t border-sapphire-border/50">
                                    <strong className="text-sapphire-dark">Spatial Void:</strong>{" "}
                                    {bp.negative_space_directive}
                                  </p>
                                )}
                              </div>

                              {/* Instagram Caption Draft */}
                              {activeHeroConcept && (
                                <div className="p-3.5 rounded-xl bg-sapphire-bg border border-sapphire-border space-y-2 text-text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-sapphire-dark">
                                      Instagram Caption & Hashtags
                                    </span>
                                    <span className="text-[10px] text-sapphire-muted font-mono">
                                      {activeHeroConcept.caption_instagram.length} chars
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-sapphire-dark/90 leading-relaxed whitespace-pre-line line-clamp-5 font-sans">
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
                                      <Check className="w-3 h-3 text-sapphire-green" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                    <span>Copy Instagram Caption</span>
                                  </button>
                                </div>
                              )}

                              {/* Approval Action */}
                              {brief && (
                                <button
                                  onClick={() => setShowApprovalModal(true)}
                                  className="w-full py-2.5 rounded-xl bg-sapphire-terracotta text-white text-text-xs font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>Approve & Deliver Package ({activeHeroConcept?.label})</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Brand Switcher Modal */}
      <BrandSwitcherModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        activeBrandName={activeBrand}
        onSelectBrand={(b) => {
          setActiveBrand(b.name);
          setActiveBrandProfile(b);
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
