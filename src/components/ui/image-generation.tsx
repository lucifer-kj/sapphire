"use client";
import React from "react";

export interface ImageGenerationProps {
  prompt?: string;
  resolution?: string;
  className?: string;
}

export function ImageGeneration({
  prompt = "Artisanal espresso with golden hour lighting and clean negative space",
  resolution = "1080 x 1350",
  className = "",
}: ImageGenerationProps) {
  return (
    <div className={"igWrap w-full h-full min-h-[360px] " + className}>
      <div className="igCanvas" role="img" aria-label="Generating image">
        <span className="igDots" aria-hidden />
        <span className="igGlow" aria-hidden />
        <span className="igRes font-mono">{resolution}</span>
      </div>
      <div className="igMeta">
        <div className="flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-sapphire-terracotta animate-pulse" />
          <span className="igLabel font-semibold">Generating Canva-Grade Artwork</span>
        </div>
        <span className="igPrompt">&ldquo;{prompt}&rdquo;</span>
      </div>
    </div>
  );
}

export default ImageGeneration;
