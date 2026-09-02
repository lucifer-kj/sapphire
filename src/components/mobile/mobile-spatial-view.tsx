"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { MobileTabBar, MobileTab } from "./mobile-tab-bar";
import { MobileImageLightbox } from "./mobile-image-lightbox";
import { mobilePageVariants } from "@/lib/motion";

interface MobileSpatialViewProps {
  sidebar: React.ReactNode;
  feed: React.ReactNode;
  canvas: React.ReactNode;
  previewImageUrl: string | null;
  previewImageTitle: string;
  onClosePreviewImage: () => void;
  hasUnreadCanvas?: boolean;
}

export type SpatialPanelTab = "history" | "studio" | "canvas";

const TAB_ORDER: SpatialPanelTab[] = ["history", "studio", "canvas"];

export function MobileSpatialView({
  sidebar,
  feed,
  canvas,
  previewImageUrl,
  previewImageTitle,
  onClosePreviewImage,
  hasUnreadCanvas = false,
}: MobileSpatialViewProps) {
  const [activeTab, setActiveTab] = useState<SpatialPanelTab>("studio");
  const [direction, setDirection] = useState<number>(0);

  const switchTab = (nextTab: SpatialPanelTab) => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    const nextIndex = TAB_ORDER.indexOf(nextTab);
    setDirection(nextIndex - currentIndex);
    setActiveTab(nextTab);
  };


  // Drag / swipe handler across horizontal panels
  const handleDragEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 60;
    const velocityThreshold = 400;

    // Swipe Left (Go forward to next panel)
    if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      if (activeTab === "history") switchTab("studio");
      else if (activeTab === "studio") switchTab("canvas");
    }
    // Swipe Right (Go back to previous panel)
    else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      if (activeTab === "canvas") switchTab("studio");
      else if (activeTab === "studio") switchTab("history");
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden flex flex-col bg-sapphire-bg text-zinc-100 select-none">
      {/* Swipeable Viewport Area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={mobilePageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full flex flex-col"
          >
            {activeTab === "history" && sidebar}
            {activeTab === "studio" && feed}
            {activeTab === "canvas" && canvas}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Persistent Floating Bottom Tab Bar */}
      <MobileTabBar
        activeTab={activeTab}
        onChangeTab={switchTab}
        hasUnreadCanvas={hasUnreadCanvas}
      />

      {/* Full-Screen Pinch-to-Zoom Lightbox Overlay */}
      <MobileImageLightbox
        isOpen={Boolean(previewImageUrl)}
        imageUrl={previewImageUrl}
        title={previewImageTitle}
        onClose={onClosePreviewImage}
      />
    </div>
  );
}
