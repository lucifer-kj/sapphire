"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-1 focus:ring-sapphire-terracotta",
  {
    variants: {
      variant: {
        default:
          "border border-white/10 bg-zinc-800 text-zinc-200",
        terracotta:
          "border border-sapphire-terracotta/30 bg-sapphire-terracotta/15 text-sapphire-terracotta",
        secondary:
          "border border-white/5 bg-zinc-900 text-zinc-400",
        destructive:
          "border border-red-500/20 bg-red-500/10 text-red-400",
        outline:
          "border border-white/15 text-zinc-300",
        success:
          "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        model:
          "border border-purple-500/20 bg-purple-500/10 text-purple-300 font-mono",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
