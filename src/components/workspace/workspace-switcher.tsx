"use client";

import React, { useState } from "react";
import { BrandProfile } from "@/lib/schema/brand";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Check,
  Plus,
  Layers,
  Search,
  Building2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { matchesBrand, slugify } from "@/lib/utils/workspace-sync";

interface WorkspaceSwitcherProps {
  activeBrand: BrandProfile;
  workspaces: BrandProfile[];
  onSelectWorkspace: (brand: BrandProfile) => void;
  onOpenOnboarding: () => void;
  className?: string;
}

export function WorkspaceSwitcher({
  activeBrand,
  workspaces,
  onSelectWorkspace,
  onOpenOnboarding,
  className,
}: WorkspaceSwitcherProps) {
  const [search, setSearch] = useState("");

  const filtered = workspaces.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.industry.toLowerCase().includes(search.toLowerCase())
  );

  const initialLetter = (activeBrand.name || "S").charAt(0).toUpperCase();
  const primaryColor = activeBrand.visual_identity?.primary_colors?.[0] || "#D97757";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-white/10 hover:border-white/20 transition-all text-left group shadow-sm max-w-[280px]",
            className
          )}
        >
          {/* Avatar Icon / Initial */}
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0 border border-white/15 shadow-xs"
            style={{
              backgroundColor: primaryColor === "#141413" || primaryColor === "#181816" ? "#D97757" : primaryColor,
            }}
          >
            {initialLetter}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-zinc-100 truncate block">
                {activeBrand.name}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 truncate block font-mono">
              {activeBrand.industry || "General"}
            </span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-72 p-2 bg-zinc-950 border border-white/10 shadow-2xl">
        {/* Search Header */}
        <div className="p-1 mb-1">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-xs text-zinc-300">
            <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Find brand workspace..."
              className="bg-transparent border-none outline-none w-full text-xs placeholder:text-zinc-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <DropdownMenuLabel className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 py-1">
          Workspaces ({workspaces.length})
        </DropdownMenuLabel>

        {/* Workspaces Scrollable List */}
        <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1">
          {filtered.map((ws) => {
            const isSelected = matchesBrand(ws, activeBrand.name);
            const letter = (ws.name || "W").charAt(0).toUpperCase();
            const color = ws.visual_identity?.primary_colors?.[0] || "#D97757";

            return (
              <DropdownMenuItem
                key={ws.id || ws.name}
                onClick={() => onSelectWorkspace(ws)}
                className={cn(
                  "flex items-center justify-between p-2 rounded-lg cursor-pointer",
                  isSelected ? "bg-zinc-800/80 text-white font-medium" : "text-zinc-300 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/10"
                    style={{
                      backgroundColor: color === "#141413" || color === "#181816" ? "#D97757" : color,
                    }}
                  >
                    {letter}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs truncate block">{ws.name}</span>
                    <span className="text-[9px] text-zinc-500 truncate block font-mono">
                      {ws.industry}
                    </span>
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-sapphire-terracotta shrink-0" />}
              </DropdownMenuItem>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-3 text-center text-xs text-zinc-500">
              No workspaces matching &ldquo;{search}&rdquo;
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="bg-white/10 my-1" />

        {/* Actions */}
        <DropdownMenuItem
          onClick={onOpenOnboarding}
          className="flex items-center gap-2 p-2 text-xs font-semibold text-sapphire-terracotta hover:text-sapphire-terracotta hover:bg-sapphire-terracotta/10 cursor-pointer rounded-lg"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add New Brand Workspace</span>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/workspaces"
            className="flex items-center gap-2 p-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer rounded-lg"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage All Workspaces (Hub)</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
