"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Sparkles, Layers, Clock } from "lucide-react";
import { SPRING } from "@/lib/motion";

export type MobileTab = "home" | "studio" | "canvas" | "history";

interface MobileTabBarProps {
  activeTab: "history" | "studio" | "canvas";
  onChangeTab: (tab: "history" | "studio" | "canvas") => void;
  hasUnreadCanvas?: boolean;
}

export function MobileTabBar({
  activeTab,
  onChangeTab,
  hasUnreadCanvas = false,
}: MobileTabBarProps) {
  const router = useRouter();

  const tabs: Array<{
    id: MobileTab;
    label: string;
    icon: React.ElementType;
    isExternal?: boolean;
  }> = [
    { id: "home", label: "Home", icon: Home, isExternal: true },
    { id: "studio", label: "Studio", icon: Sparkles },
    { id: "canvas", label: "Canvas", icon: Layers },
    { id: "history", label: "Campaigns", icon: Clock },
  ];

  const handleTabClick = (tabId: MobileTab, isExternal?: boolean) => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }

    if (isExternal && tabId === "home") {
      router.push("/workspaces");
      return;
    }

    onChangeTab(tabId as "history" | "studio" | "canvas");
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-3 inset-x-3 max-w-sm mx-auto h-14 rounded-full bg-sapphire-surface/90 backdrop-blur-xl border border-white/10 px-1.5 flex items-center justify-between z-40 shadow-2xl safe-bottom border-toplit select-none"
    >
      {tabs.map((tab) => {
        const isActive = !tab.isExternal && activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id, tab.isExternal)}
            className="relative flex-1 py-1.5 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors group press-scale"
          >
            {isActive && (
              <motion.div
                layoutId="activeTabBadge"
                className="absolute inset-x-1 inset-y-0.5 bg-sapphire-terracotta/15 border border-sapphire-terracotta/40 rounded-full shadow-inner"
                transition={SPRING.snappy}
              />
            )}
            <div className="relative z-10 flex items-center justify-center">
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive
                    ? "text-sapphire-terracotta"
                    : "text-zinc-400 group-hover:text-zinc-200"
                }`}
              />
              {tab.id === "canvas" && hasUnreadCanvas && !isActive && (
                <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-sapphire-terracotta animate-pulse" />
              )}
            </div>
            <span
              className={`relative z-10 text-[10px] font-medium tracking-tight transition-colors ${
                isActive
                  ? "text-zinc-100 font-semibold"
                  : "text-zinc-400 group-hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
