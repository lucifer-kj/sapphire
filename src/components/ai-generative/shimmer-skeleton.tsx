"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: "card" | "text" | "line" | "circle";
}

export function ShimmerSkeleton({
  className,
  variant = "line",
  ...props
}: ShimmerSkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-zinc-900/80 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.05] before:to-transparent",
        variant === "circle" && "rounded-full aspect-square",
        variant === "card" && "h-40 w-full rounded-2xl",
        variant === "line" && "h-4 w-full",
        variant === "text" && "h-3.5 w-3/4",
        className
      )}
      {...props}
    />
  );
}
