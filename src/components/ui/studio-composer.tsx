"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Paperclip,
  Image as ImageIcon,
  X,
  Sliders,
  Type,
  Camera,
  ChevronDown,
  CornerDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { BorderBeam } from "./border-beam";
import { cn } from "@/lib/utils";
import { GenerationMode } from "@/modules/prompt-intelligence/domain/prompt-intent";

interface StudioComposerProps {
  prompt: string;
  onChangePrompt: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  platform: "instagram" | "linkedin";
  onChangePlatform: (p: "instagram" | "linkedin") => void;
  generationMode: GenerationMode;
  onChangeGenerationMode: (m: GenerationMode) => void;
  referenceImages: string[];
  onAddReferenceImage: (base64: string) => void;
  onRemoveReferenceImage: (index: number) => void;
}

const QUICK_RECIPE_CHIPS = [
  { label: "Kyoto Golden Hour", prompt: "A traveler walking through Kyoto Fushimi Inari Torii gates at golden hour with volumetric backlight" },
  { label: "Bolder Headline", prompt: "Make headline bold, high-contrast, and provocative for maximum scroll-stopping pattern interrupt" },
  { label: "Executive Minimalist", prompt: "Minimalist composition with 40% upper negative space for editorial typography" },
  { label: "Tactile Luxury", prompt: "Macro tactile detail of handcrafted leather goods on rough slate with diffused soft keylight" },
];

export function StudioComposer({
  prompt,
  onChangePrompt,
  onSubmit,
  isLoading,
  platform,
  onChangePlatform,
  generationMode,
  onChangeGenerationMode,
  referenceImages,
  onAddReferenceImage,
  onRemoveReferenceImage,
}: StudioComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-grow textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && prompt.trim()) {
        onSubmit();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          onAddReferenceImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative rounded-3xl bg-zinc-900 border border-white/10 shadow-2xl transition-all duration-200 focus-within:border-white/20 overflow-hidden">
      {/* Animated Border Beam when submitting */}
      {isLoading && <BorderBeam duration={6} size={250} />}

      {/* Reference Images Stack Shelf */}
      {referenceImages.length > 0 && (
        <div className="p-3 pb-0 flex items-center gap-2 overflow-x-auto">
          {referenceImages.map((img, idx) => (
            <div
              key={idx}
              className="relative w-14 h-14 rounded-xl overflow-hidden border border-white/10 shrink-0 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="Reference" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveReferenceImage(idx)}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <span className="text-[10px] text-zinc-500 font-mono">
            {referenceImages.length}/3 Visual Ingredients
          </span>
        </div>
      )}

      {/* Main Auto-Expanding Textarea */}
      <div className="p-4 pb-2">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Brief your visual concept (e.g. 'A traveler walking through Kyoto Torii gates at golden hour')..."
          rows={2}
          disabled={isLoading}
          className="w-full bg-transparent resize-none outline-none text-xs md:text-sm text-zinc-100 placeholder:text-zinc-500 leading-relaxed max-h-44"
        />
      </div>

      {/* Quick Recipe Chips Bar */}
      <div className="px-4 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {QUICK_RECIPE_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onChangePrompt(chip.prompt)}
            className="px-2.5 py-1 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 border border-white/5 text-[10px] font-medium text-zinc-400 hover:text-zinc-200 shrink-0 transition-colors"
          >
            + {chip.label}
          </button>
        ))}
      </div>

      {/* Bottom Controls Bar */}
      <div className="px-4 py-2.5 border-t border-white/5 bg-zinc-950/40 flex items-center justify-between flex-wrap gap-2">
        {/* Left Pills: Platform + Mode + Visual Attach */}
        <div className="flex items-center gap-1.5">
          {/* Platform Selector Pill */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] gap-1 px-2.5 rounded-lg text-zinc-300 hover:text-zinc-100 bg-zinc-900 border border-white/5"
              >
                <span className="capitalize">{platform}</span>
                <span className="text-[9px] font-mono text-zinc-500">
                  {platform === "instagram" ? "4:5" : "1:1"}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onChangePlatform("instagram")}>
                Instagram (4:5 Portrait Feed)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangePlatform("linkedin")}>
                LinkedIn (1:1 Clean Editorial)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mode Selector Pill */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] gap-1 px-2.5 rounded-lg text-zinc-300 hover:text-zinc-100 bg-zinc-900 border border-white/5"
              >
                {generationMode === "prompt_only" ? (
                  <Type className="w-3 h-3 text-sapphire-terracotta" />
                ) : (
                  <Sparkles className="w-3 h-3 text-blue-400" />
                )}
                <span>
                  {generationMode === "prompt_only"
                    ? "Prompt Intelligence"
                    : "Campaign Generation"}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => onChangeGenerationMode("prompt_only")}>
                <Type className="w-3.5 h-3.5 mr-2 text-sapphire-terracotta" />
                Prompt Intelligence Mode (Post Blueprint)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onChangeGenerationMode("campaign")}>
                <Sparkles className="w-3.5 h-3.5 mr-2 text-blue-400" />
                Full Campaign Mode (A/B Directions)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Visual Ingredient Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Visual Reference Ingredient"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <Paperclip className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Right: Submit Button with Keyboard Directive */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline flex items-center gap-1">
            <span>Press</span>
            <kbd className="px-1.5 py-0.2 rounded bg-zinc-900 text-[9px] border border-white/5">
              Enter ↵
            </kbd>
          </span>

          <Button
            type="button"
            variant="terracotta"
            size="sm"
            disabled={isLoading || !prompt.trim()}
            onClick={onSubmit}
            className="gap-1.5 h-8 px-4"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Formulating...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Generate</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
