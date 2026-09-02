"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  Sliders,
  MessageSquare,
  Trash2,
  Zap,
  Plus,
  ArrowLeft,
  Sparkles,
  Images,
  FolderOpen,
} from "lucide-react";
import { BrandProfile } from "@/lib/schema/brand";

interface MobileHistoryPanelProps {
  activeBrandProfile: BrandProfile;
  savedCampaigns: any[];
  campaignId: string | null;
  chatPage: number;
  chatsPerPage: number;
  onSelectCampaign: (c: any) => void;
  onDeleteSession: (e: React.MouseEvent, id: string) => void;
  onSetChatPage: (fn: (p: number) => number) => void;
  quotaInfo: {
    remainingNeurons: number;
    estimatedPostsRemaining: number;
    percentUsed: number;
  } | null;
  onOpenSettings: () => void;
  onNewCampaign: () => void;
}

export function MobileHistoryPanel({
  activeBrandProfile,
  savedCampaigns,
  campaignId,
  chatPage,
  chatsPerPage,
  onSelectCampaign,
  onDeleteSession,
  onSetChatPage,
  quotaInfo,
  onOpenSettings,
  onNewCampaign,
}: MobileHistoryPanelProps) {
  const [activeTab, setActiveTab] = useState<"campaigns" | "gallery">("campaigns");
  const assets = savedCampaigns.filter((c) => c.raw?.brief?.concept_a?.image_url);

  return (
    <div className="flex-1 flex flex-col h-full bg-sapphire-surface text-zinc-100 overflow-y-auto pb-24 select-none">
      {/* 1. Top Workspace Header with Home Button */}
      <div className="h-14 px-3 border-b border-white/5 bg-sapphire-surface/95 backdrop-blur-md flex items-center justify-between shrink-0 sticky top-0 z-20 border-toplit">
        {/* Left: Home / Workspaces Button */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/workspaces"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sapphire-input hover:bg-sapphire-input/80 border border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors press-scale"
            title="Return to Workspaces Portal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-sapphire-terracotta" />
            <Home className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Home</span>
          </Link>

          {/* Active Brand Avatar & Name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sapphire-elevated border border-white/10 flex items-center justify-center font-bold text-[11px] text-zinc-200 shrink-0">
              {activeBrandProfile.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-zinc-200 leading-tight">
                {activeBrandProfile.name}
              </p>
              <span className="text-[10px] text-zinc-400 truncate block">
                {activeBrandProfile.industry}
              </span>
            </div>
          </div>
        </div>

        {/* Right: New Campaign & Settings */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onNewCampaign}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-100 text-zinc-950 hover:bg-white transition-colors press-scale shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
          <button
            onClick={onOpenSettings}
            title="Brand Brain Settings"
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-sapphire-input transition-colors press-scale"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Minimized Segmented Control (Campaigns vs Gallery) */}
      <div className="p-3 pb-1">
        <div className="flex items-center p-1 rounded-xl bg-sapphire-bg border border-white/5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("campaigns")}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all press-scale ${
              activeTab === "campaigns"
                ? "bg-sapphire-elevated text-zinc-100 font-semibold shadow-sm border border-white/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-sapphire-terracotta" />
            <span>Campaigns ({savedCampaigns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all press-scale ${
              activeTab === "gallery"
                ? "bg-sapphire-elevated text-zinc-100 font-semibold shadow-sm border border-white/10"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Images className="w-3.5 h-3.5 text-sapphire-blue" />
            <span>Gallery ({assets.length})</span>
          </button>
        </div>
      </div>

      {/* 3. Main Content Area */}
      <div className="p-3 space-y-3">
        {activeTab === "campaigns" ? (
          <>
            {/* Horizontal Mini Thumbnail Rail (Optional visual quick-picker, takes only ~68px!) */}
            {assets.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 px-1">
                  <span>RECENT ASSETS</span>
                  <span className="font-mono text-[10px] text-zinc-500">Quick view</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
                  {assets.slice(0, 6).map((c) => {
                    const img = c.raw?.brief?.concept_a?.image_url;
                    return (
                      <div
                        key={c.id}
                        onClick={() => onSelectCampaign(c)}
                        title={c.campaign_title}
                        className="w-12 h-15 aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-sapphire-elevated shrink-0 cursor-pointer hover:border-sapphire-terracotta transition-all press-scale"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Compact Campaigns List (Minimized container heights, no endless scroll!) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 px-1">
                <span>ALL SESSIONS</span>
                <span className="font-mono text-[10px] text-zinc-500">
                  {savedCampaigns.length} total
                </span>
              </div>

              {savedCampaigns.length > 0 ? (
                <div className="space-y-1.5">
                  {savedCampaigns
                    .slice((chatPage - 1) * chatsPerPage, chatPage * chatsPerPage)
                    .map((c) => {
                      const isActive = campaignId === c.id;
                      const thumb = c.raw?.brief?.concept_a?.image_url;
                      return (
                        <div
                          key={c.id}
                          onClick={() => onSelectCampaign(c)}
                          className={`w-full flex items-center justify-between gap-2.5 p-2.5 rounded-xl text-left transition-all cursor-pointer press-scale border ${
                            isActive
                              ? "bg-sapphire-elevated text-zinc-100 font-semibold border-sapphire-terracotta/40 shadow-sm"
                              : "text-zinc-400 hover:text-zinc-200 bg-sapphire-elevated/40 border-white/5"
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
                              <div className="w-8 h-10 rounded-md bg-sapphire-input border border-white/5 flex items-center justify-center shrink-0 text-zinc-500">
                                <MessageSquare className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="truncate text-xs text-zinc-200 font-medium leading-tight">
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

                          <button
                            onClick={(e) => onDeleteSession(e, c.id)}
                            title="Delete session"
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0 press-scale"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

                  {/* Pagination Controls */}
                  {savedCampaigns.length > chatsPerPage && (
                    <div className="flex items-center justify-between pt-2 px-1 text-xs text-zinc-400 border-t border-white/5">
                      <button
                        disabled={chatPage === 1}
                        onClick={() => onSetChatPage((p) => Math.max(1, p - 1))}
                        className="px-2.5 py-1 rounded-lg border border-white/5 bg-sapphire-elevated disabled:opacity-40 disabled:pointer-events-none hover:text-zinc-200 press-scale text-xs"
                      >
                        Prev
                      </button>
                      <span className="font-mono text-[11px]">
                        {chatPage} / {Math.ceil(savedCampaigns.length / chatsPerPage)}
                      </span>
                      <button
                        disabled={chatPage >= Math.ceil(savedCampaigns.length / chatsPerPage)}
                        onClick={() => onSetChatPage((p) => p + 1)}
                        className="px-2.5 py-1 rounded-lg border border-white/5 bg-sapphire-elevated disabled:opacity-40 disabled:pointer-events-none hover:text-zinc-200 press-scale text-xs"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-5 text-center text-zinc-500 text-xs border border-white/5 bg-sapphire-elevated/30 rounded-xl space-y-1">
                  <p className="font-medium">No previous campaigns.</p>
                  <p className="text-[10px] text-zinc-500">
                    Submit a prompt in the Studio to create content.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* 3-Column Compact Asset Gallery */
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 px-1">
              <span>ALL VISUAL ASSETS</span>
              <span className="font-mono text-[10px] text-zinc-500">
                {assets.length} items
              </span>
            </div>

            {assets.length > 0 ? (
              <div className="grid grid-cols-3 gap-1.5">
                {assets.map((c) => {
                  const img = c.raw?.brief?.concept_a?.image_url;
                  return (
                    <div
                      key={c.id}
                      onClick={() => onSelectCampaign(c)}
                      className="aspect-[4/5] rounded-xl overflow-hidden border border-white/5 bg-sapphire-elevated cursor-pointer hover:border-sapphire-terracotta active:scale-[0.98] transition-all relative group shadow-xs"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-[10px] font-medium text-white truncate">
                          {c.campaign_title}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-zinc-500 text-xs border border-white/5 bg-sapphire-elevated/30 rounded-xl">
                No visual assets generated yet.
              </div>
            )}
          </div>
        )}

        {/* Minimized Micro-Quota Tracker */}
        <div
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl bg-sapphire-elevated/70 hover:bg-sapphire-input border border-white/5 transition-all press-scale cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-300 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-sapphire-terracotta" />
              <span>
                {quotaInfo ? `${quotaInfo.remainingNeurons.toLocaleString()} Neurons` : "Daily Quota"}
              </span>
            </span>
            <span className="text-[10px] font-mono text-zinc-400">
              {quotaInfo ? `${quotaInfo.estimatedPostsRemaining} left` : "Free Tier"}
            </span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
            <div
              className="bg-sapphire-terracotta h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, quotaInfo?.percentUsed || 16)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
