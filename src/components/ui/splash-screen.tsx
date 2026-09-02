"use client";

import React, { useState, useEffect } from "react";

interface SplashScreenProps {
  /**
   * Total duration in milliseconds before the splash screen dissolves away.
   * Default: 2600ms (2.6s)
   */
  durationMs?: number;
}

export function SplashScreen({ durationMs = 2600 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Check if the splash screen has already been shown in this session
    const hasSeen = sessionStorage.getItem("sapphire_splash_seen");
    if (hasSeen) {
      return;
    }

    // Mount the splash screen
    setIsVisible(true);

    // Fade out 600ms before unmounting
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, Math.max(durationMs - 600, 1000));

    // Complete dismissal
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("sapphire_splash_seen", "true");
    }, durationMs);

    // Allow user to dismiss with Escape or Space key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        setIsVisible(false);
        sessionStorage.setItem("sapphire_splash_seen", "true");
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [durationMs]);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => {
        setIsVisible(false);
        sessionStorage.setItem("sapphire_splash_seen", "true");
      }}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090b] select-none cursor-pointer transition-opacity duration-700 ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      title="Click or press Esc to skip"
    >
      {/* Ambient radial glow in Sapphire Terracotta tone */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-sapphire-terracotta/10 blur-[120px] pointer-events-none" />

      {/* Sapphire Animated GIF Asset */}
      <div className="relative z-10 max-w-[280px] sm:max-w-[340px] px-4 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/splash.gif"
          alt="Sapphire Splash"
          className="w-full h-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        />

        {/* Ambient status indicator */}
        <div className="mt-6 flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/60 border border-white/5 backdrop-blur text-[11px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-sapphire-terracotta animate-pulse" />
          <span>Initializing Sapphire Brand Brain...</span>
        </div>

        {/* Skip hint */}
        <span className="mt-3 text-[10px] text-zinc-600 font-mono">
          Click or press Esc to skip
        </span>
      </div>
    </div>
  );
}
