"use client";

import * as React from "react";

export interface RippleCirclesProps {
  className?: string;
  glowColor?: string;
}

export const RippleCircles: React.FC<RippleCirclesProps> = ({
  className,
}) => {
  return (
    <div className={`relative h-[250px] aspect-square ${className || ""}`}>
      {/* Ripple circles */}
      <span className="absolute inset-[40%] rounded-full border border-sapphire-terracotta/80 dark:border-sapphire-terracotta/80 animate-[ripple_2s_infinite_ease-in-out] bg-gradient-to-tr from-sapphire-terracotta/20 to-sapphire-terracotta/5 backdrop-blur-sm z-[98]" />
      <span className="absolute inset-[30%] rounded-full border border-sapphire-terracotta/60 dark:border-sapphire-terracotta/60 animate-[ripple_2s_infinite_ease-in-out_0.2s] bg-gradient-to-tr from-sapphire-terracotta/20 to-sapphire-terracotta/5 backdrop-blur-sm z-[97]" />
      <span className="absolute inset-[20%] rounded-full border border-sapphire-terracotta/40 dark:border-sapphire-terracotta/40 animate-[ripple_2s_infinite_ease-in-out_0.4s] bg-gradient-to-tr from-sapphire-terracotta/20 to-sapphire-terracotta/5 backdrop-blur-sm z-[96]" />
      <span className="absolute inset-[10%] rounded-full border border-sapphire-terracotta/30 dark:border-sapphire-terracotta/30 animate-[ripple_2s_infinite_ease-in-out_0.6s] bg-gradient-to-tr from-sapphire-terracotta/20 to-sapphire-terracotta/5 backdrop-blur-sm z-[95]" />
      <span className="absolute inset-0 rounded-full border border-sapphire-terracotta/20 dark:border-sapphire-terracotta/20 animate-[ripple_2s_infinite_ease-in-out_0.8s] bg-gradient-to-tr from-sapphire-terracotta/20 to-sapphire-terracotta/5 backdrop-blur-sm z-[94]" />
    </div>
  );
};
