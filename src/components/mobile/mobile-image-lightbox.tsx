"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { overlayVariants } from "@/lib/motion";

interface MobileImageLightboxProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export function MobileImageLightbox({
  isOpen,
  imageUrl,
  title = "Artwork Preview",
  onClose,
}: MobileImageLightboxProps) {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ dist: number; scale: number; x: number; y: number } | null>(null);

  // Reset zoom on open/close or new image
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  const handleDoubleTap = () => {
    if (scale > 1.2) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sapphire_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && imageUrl && (
        <motion.div
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col select-none touch-none"
        >
          {/* Top Control Bar */}
          <div className="h-14 px-4 border-b border-white/10 flex items-center justify-between bg-zinc-950/80 backdrop-blur-md safe-pt z-20">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <span className="text-xs font-semibold text-zinc-100 truncate">
                {title}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                {scale.toFixed(1)}x
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Reset Zoom Button */}
              {scale !== 1 && (
                <button
                  onClick={() => {
                    setScale(1);
                    setPosition({ x: 0, y: 0 });
                  }}
                  title="Reset Zoom"
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors press-scale"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {/* Download Button */}
              <button
                onClick={handleDownload}
                title="Download High-Res Composite"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors press-scale"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                title="Close"
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors press-scale"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Zoomable / Pannable Image Canvas */}
          <div
            ref={containerRef}
            onDoubleClick={handleDoubleTap}
            className="flex-1 overflow-hidden relative flex items-center justify-center p-2 cursor-grab active:cursor-grabbing"
          >
            <motion.div
              animate={{
                scale,
                x: position.x,
                y: position.y,
              }}
              drag={scale > 1}
              dragConstraints={containerRef}
              dragElastic={0.1}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
            >
              <img
                src={imageUrl}
                alt={title}
                className="max-h-[82vh] max-w-[95vw] object-contain rounded-xl shadow-2xl pointer-events-none"
              />
            </motion.div>
          </div>

          {/* Bottom Micro-Hint Bar */}
          <div className="h-10 px-4 border-t border-white/5 flex items-center justify-center text-[11px] text-zinc-400 bg-zinc-950/60 safe-pb">
            Double tap to toggle 2x zoom • Drag to pan
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
