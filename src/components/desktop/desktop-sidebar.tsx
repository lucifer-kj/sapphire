"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PanelLeftClose,
  Sliders,
  MessageSquare,
  Trash2,
  Zap,
} from "lucide-react";
import { BrandProfile } from "@/lib/schema/brand";
import { SPRING } from "@/lib/motion";

export interface DesktopSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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
  onNewCampaign?: () => void;
}


export function DesktopSidebar({
  isOpen,
  onClose,
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
}: DesktopSidebarProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 270, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={SPRING.snappy}
          className="border-r border-toplit bg-sapphire-surface flex flex-col shrink-0 select-none overflow-hidden h-full z-10"
        >
          <div className="w-[270px] flex flex-col h-full">
            {/* Unified Top Header: Active Workspace Brand Profile & Actions */}
            <div className="h-14 px-3.5 border-b border-white/5 bg-sapphire-surface flex items-center justify-between">
              <Link
                href="/workspaces"
                className="flex items-center gap-2.5 min-w-0 group"
                title="Manage Workspaces / Switch Brand"
              >
                <div className="w-7 h-7 rounded-xl bg-sapphire-input border border-white/5 flex items-center justify-center font-bold text-xs text-zinc-200 shrink-0 group-hover:border-sapphire-terracotta transition-colors">
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
                  onClick={onOpenSettings}
                  title="Brand Brain Settings"
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-sapphire-input transition-colors press-scale"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onClose}
                  title="Collapse Left Panel (Ctrl+B)"
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-sapphire-input transition-colors press-scale"
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
                            onClick={() => onSelectCampaign(c)}
                            title={c.campaign_title}
                            className="aspect-[4/5] rounded-lg overflow-hidden border border-white/5 bg-sapphire-elevated cursor-pointer hover:border-sapphire-terracotta transition-all relative group"
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
                        .slice((chatPage - 1) * chatsPerPage, chatPage * chatsPerPage)
                        .map((c) => {
                          const isActive = campaignId === c.id;
                          const thumb = c.raw?.brief?.concept_a?.image_url;
                          return (
                            <div
                              key={c.id}
                              onClick={() => onSelectCampaign(c)}
                              className={`w-full flex items-center justify-between gap-2 p-2 rounded-xl text-left transition-all cursor-pointer group ${
                                isActive
                                  ? "bg-sapphire-elevated text-zinc-100 font-semibold border border-white/10 shadow-sm"
                                  : "text-zinc-400 hover:text-zinc-200 hover:bg-sapphire-elevated/70 border border-transparent"
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

                              {/* Hover Delete Button */}
                              <button
                                onClick={(e) => onDeleteSession(e, c.id)}
                                title="Delete session history"
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-all shrink-0 press-scale"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {savedCampaigns.length > chatsPerPage && (
                      <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-zinc-500 border-t border-white/5">
                        <button
                          disabled={chatPage === 1}
                          onClick={() => onSetChatPage((p) => Math.max(1, p - 1))}
                          className="px-2 py-0.5 rounded border border-white/5 bg-sapphire-elevated disabled:opacity-40 disabled:pointer-events-none hover:text-zinc-200 press-scale"
                        >
                          Prev
                        </button>
                        <span className="font-mono text-[10px]">
                          {chatPage} / {Math.ceil(savedCampaigns.length / chatsPerPage)}
                        </span>
                        <button
                          disabled={chatPage >= Math.ceil(savedCampaigns.length / chatsPerPage)}
                          onClick={() => onSetChatPage((p) => p + 1)}
                          className="px-2 py-0.5 rounded border border-white/5 bg-sapphire-elevated disabled:opacity-40 disabled:pointer-events-none hover:text-zinc-200 press-scale"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-4 text-center text-zinc-500 text-text-xs border border-white/5 bg-sapphire-elevated/30 rounded-xl">
                    <p className="font-medium">No previous campaigns.</p>
                    <p className="text-[10px] pt-1 text-zinc-500">
                      Submit a prompt to create artwork.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Minimalist Bottom Footer: Micro-Quota Tracker */}
            <div className="p-3 border-t border-white/5 bg-sapphire-surface/80 space-y-2">
              <div
                onClick={onOpenSettings}
                className="group cursor-pointer p-2.5 rounded-xl bg-sapphire-elevated hover:bg-sapphire-input border border-white/5 transition-all press-scale"
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
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
