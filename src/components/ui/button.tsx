"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-medium ring-offset-zinc-950 transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sapphire-terracotta disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 shadow-sm",
        terracotta:
          "bg-sapphire-terracotta text-white hover:bg-sapphire-terracotta/90 shadow-md",
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
        outline:
          "border border-white/10 bg-zinc-950 hover:bg-zinc-900 text-zinc-200 hover:text-zinc-100",
        secondary:
          "bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-white/5",
        ghost:
          "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900",
        link:
          "text-sapphire-terracotta underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 rounded-lg px-2.5 text-[11px]",
        lg: "h-11 rounded-2xl px-6 text-sm",
        icon: "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
