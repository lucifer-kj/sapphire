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
} from "lucide-react";
import { CreativeBrief, ResearchContext, UserIntent, ConceptItem } from "@/lib/schema/campaign";
import { ReferenceImageAnalysis } from "@/lib/schema/reference";
import { CriticResult } from "@/lib/schema/critic";
import { WorkflowLogEntry } from "@/lib/schema/telemetry";
import { LogDrawer } from "@/components/telemetry/log-drawer";

interface ConceptVersionHistory {
  versionNumber: number;
  conceptItem: ConceptItem;
  userInstruction?: string;
}

export default function SapphireWorkspace() {
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [activeBrand, setActiveBrand] = useState("Vagabond Travel Agency");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
        "Welcome to Sapphire. Provide a short idea or direction (e.g. 'Create an Independence Day post for Vagabond Travel'). Attach an optional reference image to guide the visual aesthetic. Sapphire will analyze your reference image, research trends, generate distinct A/B visual directions & artwork, and deliver the final approved package to your email.",
      timestamp: "Just now",
    },
  ]);

  // Keyboard shortcut listener: Ctrl+B (Left Panel), Ctrl+Alt+B (Right Panel)
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
          prompt: targetConcept.image_prompt,
          styleOverride: referenceAnalysis ? referenceAnalysis.photography_style : undefined,
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
          referenceImage: currentRefImage,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCampaignId(data.campaignId);
        setIntent(data.intent);
        setResearch(data.research);
        setReferenceAnalysis(data.referenceAnalysis || null);
        setBrief(data.brief);
        setCritiqueA(data.critiqueA || null);
        setCritiqueB(data.critiqueB || null);

        if (data.logs && Array.isArray(data.logs)) {
          setWorkflowLogs(data.logs);
        }

        setHistoryConceptA([
          { versionNumber: 1, conceptItem: data.brief.concept_a, userInstruction: "Initial Generation" },
        ]);
        setHistoryConceptB([
          { versionNumber: 1, conceptItem: data.brief.concept_b, userInstruction: "Initial Generation" },
        ]);
        setActiveVersionA(1);
        setActiveVersionB(1);

        let assistantMsg = `I've analyzed your request for "${data.intent.event}" (${data.intent.industry}). Brand context loaded for ${activeBrand}.`;
        if (data.referenceAnalysis) {
          assistantMsg += ` Gemini analyzed your reference image (Mood: ${data.referenceAnalysis.mood}).`;
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
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Error: ${data.error || "Failed to process request."}`,
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
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-sapphire-surface rounded-xl overflow-hidden shadow-2xl flex flex-col">
            <div className="h-10 px-4 border-b border-sapphire-border flex items-center justify-between bg-sapphire-surface select-none">
              <span className="text-text-xs font-semibold text-sapphire-dark">
                High Resolution Asset Preview
              </span>
              <button
                onClick={() => setActiveImageModal(null)}
                className="p-1 rounded hover:bg-sapphire-bg text-sapphire-muted hover:text-sapphire-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-sapphire-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImageModal}
                alt="Enlarged Artwork Preview"
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-hairline"
              />
            </div>
          </div>
        </div>
      )}

      {/* Human Approval & Email Delivery Modal */}
      {showApprovalModal && selectedConcept && brief && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-sapphire-surface border border-sapphire-border rounded-xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-sapphire-border pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-sapphire-terracotta" />
                <h3 className="font-semibold text-text-sm text-sapphire-dark">
                  Human Approval & Email Delivery
                </h3>
              </div>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="p-1 rounded text-sapphire-muted hover:text-sapphire-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-text-xs text-sapphire-dark/80">
              <p>
                You are approving{" "}
                <strong className="font-semibold text-sapphire-dark">
                  {selectedConcept === "A" ? brief.concept_a.label : brief.concept_b.label}
                </strong>
                .
              </p>
              <p>
                Sapphire will package the high-resolution AI artwork, Instagram captions, and LinkedIn captions and send them to your email.
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
                  className="w-full p-2.5 text-text-xs rounded-md border border-sapphire-border bg-sapphire-bg outline-none focus:border-sapphire-dark text-sapphire-dark"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalModal(false)}
                  className="px-3 py-2 rounded-md border border-sapphire-border text-text-xs font-medium hover:bg-sapphire-bg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDelivering}
                  className="px-4 py-2 rounded-md bg-sapphire-terracotta text-white font-medium text-text-xs hover:bg-opacity-90 disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
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
            <span className="h-5 w-5 rounded-md bg-sapphire-dark text-sapphire-surface flex items-center justify-center font-bold text-xs tracking-wider">
              S
            </span>
            <span className="font-semibold text-text-sm tracking-tight text-sapphire-dark">
              Sapphire
            </span>
          </div>

          <div className="h-4 w-[0.5px] bg-sapphire-border" />

          <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-text-xs font-medium bg-sapphire-bg hover:bg-sapphire-subtle transition-colors border border-sapphire-border">
            <span className="w-2 h-2 rounded-full bg-sapphire-green" />
            <span className="max-w-[160px] truncate">{activeBrand}</span>
            <ChevronDown className="w-3.5 h-3.5 text-sapphire-muted" />
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-text-xs text-sapphire-muted">
          <span>{intent ? intent.event : "Active Campaign"}</span>
          <ChevronRight className="w-3 h-3 text-sapphire-muted/60" />
          <span className="text-sapphire-dark font-medium">
            {brief ? brief.campaign_title : "Concept Direction A/B"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-text-xs text-sapphire-muted">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isLoading || isRefinementLoading || isDelivering
                  ? "bg-sapphire-terracotta animate-ping"
                  : "bg-sapphire-green animate-pulse"
              }`}
            />
            <span className="hidden sm:inline">
              {isLoading
                ? "Critic & Image Agents running..."
                : isRefinementLoading
                ? "Refining Concept..."
                : isDelivering
                ? "Delivering Email Package..."
                : "Orchestrator Ready"}
            </span>
          </div>

          <button
            onClick={() => setIsLogsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-text-xs font-medium bg-sapphire-bg hover:bg-sapphire-subtle transition-colors border border-sapphire-border text-sapphire-dark"
            title="Open Live Agent Telemetry & Logs"
          >
            <Activity className="w-3.5 h-3.5 text-sapphire-terracotta" />
            <span className="hidden sm:inline">Telemetry Logs</span>
            {workflowLogs.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-sapphire-dark text-sapphire-surface font-semibold">
                {workflowLogs.length}
              </span>
            )}
          </button>

          <div className="h-4 w-[0.5px] bg-sapphire-border" />

          <button
            onClick={() => {
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
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-text-xs font-medium bg-sapphire-dark text-sapphire-surface hover:bg-opacity-90 transition-colors"
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
            isLeftOpen ? "w-[280px] opacity-100" : "w-0 opacity-0 overflow-hidden pointer-events-none border-r-0"
          }`}
        >
          <div className="w-[280px] flex flex-col h-full">
            <div className="h-10 px-3 border-b border-sapphire-border flex items-center justify-between bg-sapphire-surface">
              <span className="text-heading-xs font-semibold uppercase tracking-wider text-sapphire-muted">
                Navigation
              </span>
              <button
                onClick={() => setIsLeftOpen(false)}
                title="Collapse Left Panel (Ctrl+B)"
                className="p-1 rounded-md text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle transition-colors border border-transparent hover:border-sapphire-border"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-sapphire-border">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-md bg-sapphire-bg hover:bg-sapphire-subtle border border-sapphire-border text-text-xs font-medium text-sapphire-dark transition-colors">
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-sapphire-terracotta" />
                  <span>New Conversation</span>
                </span>
                <span className="text-[10px] text-sapphire-muted bg-sapphire-surface px-1.5 py-0.5 rounded border border-sapphire-border">
                  Ctrl+N
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sapphire-muted font-medium px-2 py-1 uppercase text-[11px] tracking-wider">
                  <span>Active Campaigns</span>
                  <Folder className="w-3.5 h-3.5" />
                </div>
                <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-sapphire-subtle/70 text-sapphire-dark font-medium text-left">
                  <MessageSquare className="w-3.5 h-3.5 text-sapphire-terracotta shrink-0" />
                  <span className="truncate">
                    {intent ? `${intent.event} Post` : "Independence Day Post"}
                  </span>
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sapphire-muted font-medium px-2 py-1 uppercase text-[11px] tracking-wider">
                  <span>Learned Brand Memory</span>
                  <BrainCircuit className="w-3.5 h-3.5 text-sapphire-terracotta" />
                </div>
                <div className="p-2.5 rounded-md border border-sapphire-border bg-sapphire-bg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sapphire-dark">Vagabond Travel</span>
                    <span className="text-[10px] text-sapphire-green font-medium">95% Match</span>
                  </div>
                  <p className="text-sapphire-muted leading-tight text-[11px]">
                    Editorial photography, golden hour lighting, subtle logo placement.
                  </p>
                  {preferenceSaved && (
                    <div className="pt-1 flex items-center gap-1 text-[10px] text-sapphire-green font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Taste preference updated</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-sapphire-border bg-sapphire-surface flex items-center justify-between text-text-xs text-sapphire-muted">
              <button className="flex items-center gap-2 hover:text-sapphire-dark transition-colors">
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
              <span className="text-[10px] bg-sapphire-bg px-1.5 py-0.5 rounded border border-sapphire-border">
                Ctrl+B
              </span>
            </div>
          </div>
        </aside>

        {/* CENTER PANEL: Conversational Workspace */}
        <main className="flex-1 flex flex-col bg-sapphire-surface overflow-hidden min-w-0">
          <div className="h-10 px-4 border-b border-sapphire-border flex items-center justify-between bg-sapphire-surface shrink-0 select-none">
            <div className="flex items-center gap-2">
              {!isLeftOpen && (
                <button
                  onClick={() => setIsLeftOpen(true)}
                  title="Expand Left Panel (Ctrl+B)"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-text-xs font-medium text-sapphire-terracotta bg-sapphire-bg hover:bg-sapphire-subtle border border-sapphire-border transition-colors"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Show Sidebar</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sapphire-terracotta" />
                <h2 className="text-heading-xs font-semibold text-sapphire-dark uppercase tracking-wider">
                  Creative Conversation
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-text-xs text-sapphire-muted hidden md:inline">
                Groq + Gemini + Resend API
              </span>
              {!isRightOpen && (
                <button
                  onClick={() => setIsRightOpen(true)}
                  title="Expand Right Canvas (Ctrl+Alt+B)"
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md text-text-xs font-medium text-sapphire-terracotta bg-sapphire-bg hover:bg-sapphire-subtle border border-sapphire-border transition-colors"
                >
                  <PanelRightOpen className="w-4 h-4" />
                  <span className="hidden sm:inline">Show Canvas</span>
                </button>
              )}
            </div>
          </div>

          {/* Centered Conversation Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl w-full mx-auto px-4 md:px-6 py-6 space-y-6">
              {/* Delivery Success Notification Banner */}
              {deliverySuccess && (
                <div className="p-4 rounded-xl bg-sapphire-green/10 border border-sapphire-green/30 text-sapphire-dark text-text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-sapphire-green" />
                    <span className="font-semibold">{deliverySuccess}</span>
                  </div>
                  <button
                    onClick={() => setDeliverySuccess(null)}
                    className="p-1 rounded hover:bg-sapphire-bg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border border-sapphire-border space-y-2 shadow-hairline ${
                    msg.role === "user"
                      ? "bg-sapphire-surface text-sapphire-dark border-sapphire-dark/20 ml-8"
                      : "bg-sapphire-bg text-sapphire-dark"
                  }`}
                >
                  <div className="flex items-center justify-between text-text-xs text-sapphire-muted">
                    <span className="font-semibold text-sapphire-dark flex items-center gap-1.5">
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
                  <p className="text-text-xs text-sapphire-dark leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              ))}

              {referenceAnalysis && (
                <div className="border border-sapphire-border rounded-xl p-4 bg-sapphire-surface space-y-2 shadow-hairline">
                  <div className="flex items-center justify-between text-text-xs font-medium text-sapphire-muted">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-sapphire-terracotta" />
                      Gemini Visual Reference Breakdown
                    </span>
                    <span className="text-sapphire-green font-medium">Analyzed</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-text-xs pt-1">
                    <div>
                      <span className="text-sapphire-muted font-medium">Mood:</span>{" "}
                      <span className="text-sapphire-dark font-medium">{referenceAnalysis.mood}</span>
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
                <div className="border border-sapphire-border rounded-xl p-4 bg-sapphire-surface space-y-2.5 shadow-hairline">
                  <div className="flex items-center justify-between text-text-xs font-medium text-sapphire-muted">
                    <span className="flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-sapphire-blue" />
                      Research Synthesis
                    </span>
                    <span className="text-sapphire-green font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </span>
                  </div>
                  <p className="text-text-xs text-sapphire-dark">{research.summary}</p>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center p-6 border border-sapphire-border rounded-xl bg-sapphire-bg space-x-2 text-text-xs text-sapphire-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-sapphire-terracotta" />
                  <span>
                    Critic Agent auditing brand alignment & generating assets...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Centered Composer Input */}
          <div className="p-4 border-t border-sapphire-border bg-sapphire-surface">
            <div className="max-w-3xl w-full mx-auto">
              <form onSubmit={handleSubmit} className="space-y-2">
                {referenceImage && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-sapphire-bg border border-sapphire-border text-text-xs">
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

                <div className="relative border border-sapphire-border rounded-xl bg-sapphire-bg focus-within:border-sapphire-dark transition-colors p-3 shadow-hairline">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your social media post request or upload a reference image..."
                    rows={3}
                    className="w-full bg-transparent border-none outline-none resize-none text-text-sm text-sapphire-dark placeholder:text-sapphire-muted"
                  />
                  <div className="flex items-center justify-between pt-2.5 border-t border-sapphire-border/60">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-1.5 rounded-md transition-colors flex items-center gap-1.5 text-text-xs ${
                        referenceImage
                          ? "bg-sapphire-terracotta/10 text-sapphire-terracotta border border-sapphire-terracotta/30"
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
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-sapphire-terracotta text-white font-medium text-text-xs hover:bg-opacity-90 disabled:opacity-40 transition-colors shadow-sm"
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Generate Concepts</span>
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
                  Spatial Creative Canvas
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-2 py-1 rounded-md text-text-xs font-medium border border-sapphire-border bg-sapphire-surface hover:bg-sapphire-bg text-sapphire-dark transition-colors">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-sapphire-muted" />
                  <span>A/B View</span>
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

            {/* Spatial Canvas Content Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <div className="max-w-4xl mx-auto space-y-5">
                <div className="flex items-center justify-between border-b border-sapphire-border pb-3">
                  <div>
                    <h3 className="text-heading-md font-semibold text-sapphire-dark">
                      A / B Creative Directions
                    </h3>
                    <p className="text-text-xs text-sapphire-muted">
                      {brief
                        ? "Select a concept to refine captions or approve for email delivery."
                        : "Generated visual artwork will render here side-by-side upon prompt submission."}
                    </p>
                  </div>
                </div>

                {/* Concept Cards Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  {/* Concept A Card */}
                  <div
                    className={`border rounded-xl bg-sapphire-surface p-4 space-y-3 shadow-hairline transition-all ${
                      selectedConcept === "A"
                        ? "border-sapphire-terracotta ring-1 ring-sapphire-terracotta/50"
                        : "border-sapphire-border hover:border-sapphire-dark/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text-xs font-semibold px-2 py-0.5 rounded-md bg-sapphire-bg border border-sapphire-border text-sapphire-dark">
                        {brief ? brief.concept_a.label : "Concept A — Emotional Journey"}
                      </span>
                      <span className="text-[10px] font-medium text-sapphire-blue bg-sapphire-bg px-2 py-0.5 rounded border border-sapphire-border">
                        {selectedConcept === "A" ? "Selected" : "Draft"}
                      </span>
                    </div>

                    {/* Brand Compliance Scorecard (Critic Agent) */}
                    {critiqueA && (
                      <div className="p-2.5 rounded-lg bg-sapphire-bg border border-sapphire-border space-y-1.5 text-text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center gap-1.5 text-sapphire-dark">
                            <ShieldCheck className="w-3.5 h-3.5 text-sapphire-green" />
                            Brand Alignment
                          </span>
                          <span className="text-sapphire-green font-bold">
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
                                ? "bg-sapphire-dark text-sapphire-surface font-semibold"
                                : "bg-sapphire-bg hover:bg-sapphire-subtle border border-sapphire-border text-sapphire-muted"
                            }`}
                          >
                            v{v.versionNumber}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Image Preview Container */}
                    <div className="relative aspect-[4/5] rounded-lg bg-sapphire-bg border border-sapphire-border overflow-hidden group">
                      {brief?.concept_a.image_url && !imageErrorA ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={brief.concept_a.image_url}
                            alt="Concept A AI Generated Visual"
                            onError={() => setImageErrorA(true)}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => setActiveImageModal(brief.concept_a.image_url!)}
                              className="p-2 rounded-lg bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-bg transition-colors"
                              title="Enlarge Image Preview"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRegenerateImage("A")}
                              disabled={isRegeneratingA}
                              className="p-2 rounded-lg bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-bg transition-colors"
                              title="Regenerate Artwork"
                            >
                              <RefreshCw className={`w-4 h-4 ${isRegeneratingA ? "animate-spin" : ""}`} />
                            </button>
                            <a
                              href={brief.concept_a.image_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-bg transition-colors"
                              title="Open High Res Image"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </>
                      ) : imageErrorA ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-rose-50/50 border border-rose-200 rounded-lg space-y-2.5">
                          <AlertCircle className="w-8 h-8 text-rose-500 stroke-1" />
                          <p className="text-text-xs font-semibold text-rose-900">
                            Artwork Rendering Timeout
                          </p>
                          <p className="text-[11px] text-rose-700/80 max-w-[200px] leading-tight">
                            Image provider timed out or returned an unrendered state.
                          </p>
                          <button
                            onClick={() => handleRegenerateImage("A")}
                            disabled={isRegeneratingA}
                            className="px-3 py-1.5 bg-sapphire-terracotta text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-sm hover:bg-opacity-90 transition-opacity"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingA ? "animate-spin" : ""}`} />
                            <span>{isRegeneratingA ? "Regenerating..." : "Retry Image Generation"}</span>
                          </button>
                        </div>
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
                      <div className="p-3 rounded-lg bg-sapphire-bg border border-sapphire-border text-[11px] space-y-2">
                        <p className="font-semibold text-sapphire-dark">Instagram Caption Draft:</p>
                        <p className="text-sapphire-dark/90 leading-relaxed line-clamp-3">
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
                          <span>Copy Caption</span>
                        </button>
                      </div>
                    )}

                    {/* Refinement Overlay Form */}
                    {isRefining === "A" ? (
                      <div className="p-3 rounded-lg bg-sapphire-bg border border-sapphire-dark/30 space-y-2">
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
                          className="w-full p-2 text-text-xs rounded border border-sapphire-border bg-sapphire-surface outline-none focus:border-sapphire-dark text-sapphire-dark"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsRefining(null)}
                            className="px-2.5 py-1 rounded text-text-xs font-medium border border-sapphire-border hover:bg-sapphire-subtle"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRefineSubmit("A")}
                            disabled={!refinementInput.trim() || isRefinementLoading}
                            className="px-3 py-1 rounded bg-sapphire-terracotta text-white text-text-xs font-medium hover:bg-opacity-90 disabled:opacity-40 flex items-center gap-1"
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
                            className={`flex-1 py-2 rounded-md text-text-xs font-medium transition-colors ${
                              selectedConcept === "A"
                                ? "bg-sapphire-dark text-sapphire-surface"
                                : "border border-sapphire-border bg-sapphire-surface hover:bg-sapphire-bg text-sapphire-dark"
                            }`}
                          >
                            {selectedConcept === "A" ? "Concept A Selected" : "Select Concept A"}
                          </button>
                          {brief && (
                            <button
                              onClick={() => setIsRefining("A")}
                              className="p-2 rounded-md border border-sapphire-border bg-sapphire-surface hover:bg-sapphire-bg text-sapphire-dark text-text-xs font-medium flex items-center gap-1"
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
                            className="w-full py-2 rounded-md bg-sapphire-terracotta text-white text-text-xs font-semibold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Approve & Send Email Package</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Concept B Card */}
                  <div
                    className={`border rounded-xl bg-sapphire-surface p-4 space-y-3 shadow-hairline transition-all ${
                      selectedConcept === "B"
                        ? "border-sapphire-terracotta ring-1 ring-sapphire-terracotta/50"
                        : "border-sapphire-border hover:border-sapphire-dark/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-text-xs font-semibold px-2 py-0.5 rounded-md bg-sapphire-bg border border-sapphire-border text-sapphire-dark">
                        {brief ? brief.concept_b.label : "Concept B — Editorial India"}
                      </span>
                      <span className="text-[10px] font-medium text-sapphire-blue bg-sapphire-bg px-2 py-0.5 rounded border border-sapphire-border">
                        {selectedConcept === "B" ? "Selected" : "Draft"}
                      </span>
                    </div>

                    {/* Brand Compliance Scorecard (Critic Agent) */}
                    {critiqueB && (
                      <div className="p-2.5 rounded-lg bg-sapphire-bg border border-sapphire-border space-y-1.5 text-text-xs">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center gap-1.5 text-sapphire-dark">
                            <ShieldCheck className="w-3.5 h-3.5 text-sapphire-green" />
                            Brand Alignment
                          </span>
                          <span className="text-sapphire-green font-bold">
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
                                ? "bg-sapphire-dark text-sapphire-surface font-semibold"
                                : "bg-sapphire-bg hover:bg-sapphire-subtle border border-sapphire-border text-sapphire-muted"
                            }`}
                          >
                            v{v.versionNumber}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Image Preview Container */}
                    <div className="relative aspect-[4/5] rounded-lg bg-sapphire-bg border border-sapphire-border overflow-hidden group">
                      {brief?.concept_b.image_url && !imageErrorB ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={brief.concept_b.image_url}
                            alt="Concept B AI Generated Visual"
                            onError={() => setImageErrorB(true)}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => setActiveImageModal(brief.concept_b.image_url!)}
                              className="p-2 rounded-lg bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-bg transition-colors"
                              title="Enlarge Image Preview"
                            >
                              <Maximize2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRegenerateImage("B")}
                              disabled={isRegeneratingB}
                              className="p-2 rounded-lg bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-bg transition-colors"
                              title="Regenerate Artwork"
                            >
                              <RefreshCw className={`w-4 h-4 ${isRegeneratingB ? "animate-spin" : ""}`} />
                            </button>
                            <a
                              href={brief.concept_b.image_url}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-lg bg-sapphire-surface text-sapphire-dark hover:bg-sapphire-bg transition-colors"
                              title="Open High Res Image"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        </>
                      ) : imageErrorB ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-rose-50/50 border border-rose-200 rounded-lg space-y-2.5">
                          <AlertCircle className="w-8 h-8 text-rose-500 stroke-1" />
                          <p className="text-text-xs font-semibold text-rose-900">
                            Artwork Rendering Timeout
                          </p>
                          <p className="text-[11px] text-rose-700/80 max-w-[200px] leading-tight">
                            Image provider timed out or returned an unrendered state.
                          </p>
                          <button
                            onClick={() => handleRegenerateImage("B")}
                            disabled={isRegeneratingB}
                            className="px-3 py-1.5 bg-sapphire-terracotta text-white rounded-md text-xs font-medium flex items-center gap-1.5 shadow-sm hover:bg-opacity-90 transition-opacity"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRegeneratingB ? "animate-spin" : ""}`} />
                            <span>{isRegeneratingB ? "Regenerating..." : "Retry Image Generation"}</span>
                          </button>
                        </div>
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
                      <div className="p-3 rounded-lg bg-sapphire-bg border border-sapphire-border text-[11px] space-y-2">
                        <p className="font-semibold text-sapphire-dark">Instagram Caption Draft:</p>
                        <p className="text-sapphire-dark/90 leading-relaxed line-clamp-3">
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
                          <span>Copy Caption</span>
                        </button>
                      </div>
                    )}

                    {/* Refinement Overlay Form */}
                    {isRefining === "B" ? (
                      <div className="p-3 rounded-lg bg-sapphire-bg border border-sapphire-dark/30 space-y-2">
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
                          className="w-full p-2 text-text-xs rounded border border-sapphire-border bg-sapphire-surface outline-none focus:border-sapphire-dark text-sapphire-dark"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setIsRefining(null)}
                            className="px-2.5 py-1 rounded text-text-xs font-medium border border-sapphire-border hover:bg-sapphire-subtle"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleRefineSubmit("B")}
                            disabled={!refinementInput.trim() || isRefinementLoading}
                            className="px-3 py-1 rounded bg-sapphire-terracotta text-white text-text-xs font-medium hover:bg-opacity-90 disabled:opacity-40 flex items-center gap-1"
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
                            className={`flex-1 py-2 rounded-md text-text-xs font-medium transition-colors ${
                              selectedConcept === "B"
                                ? "bg-sapphire-dark text-sapphire-surface"
                                : "border border-sapphire-border bg-sapphire-surface hover:bg-sapphire-bg text-sapphire-dark"
                            }`}
                          >
                            {selectedConcept === "B" ? "Concept B Selected" : "Select Concept B"}
                          </button>
                          {brief && (
                            <button
                              onClick={() => setIsRefining("B")}
                              className="p-2 rounded-md border border-sapphire-border bg-sapphire-surface hover:bg-sapphire-bg text-sapphire-dark text-text-xs font-medium flex items-center gap-1"
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
                            className="w-full py-2 rounded-md bg-sapphire-terracotta text-white text-text-xs font-semibold hover:bg-opacity-90 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Approve & Send Email Package</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Dedicated Agent Telemetry & Logs Drawer */}
      <LogDrawer
        isOpen={isLogsOpen}
        onClose={() => setIsLogsOpen(false)}
        logs={workflowLogs}
      />
    </div>
  );
}
