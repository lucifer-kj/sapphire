"use client";

import { useState, useEffect } from "react";

/**
 * SSR-safe media query hook.
 * Returns false during initial server-side hydration to avoid layout flashes.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Convenience hooks matching Sapphire's spatial breakpoints:
 * - Mobile: < 1024px (phone + portrait tablet)
 * - Tablet: 768px - 1023px
 * - Desktop: >= 1024px
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 1023px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}
