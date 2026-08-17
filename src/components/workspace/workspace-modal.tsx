"use client";
import React, { useState } from "react";
import { BrandProfile } from "@/lib/schema/brand";
import { PRECONFIGURED_BRANDS } from "@/lib/constants/brands";
import { WorkspaceGrid } from "./workspace-grid";
import { X, Sparkles, Plus, Building2, ExternalLink } from "lucide-react";
import Link from "next/link";

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBrand: BrandProfile;
  onSelectBrand: (brand: BrandProfile) => void;
  onOpenOnboarding?: () => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  activeBrand,
  onSelectBrand,
  onOpenOnboarding,
}) => {
  const [brands] = useState<(BrandProfile & { id?: string })[]>(PRECONFIGURED_BRANDS);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sapphire-dark/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-sapphire-bg border border-sapphire-border rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-sapphire-border flex items-center justify-between bg-sapphire-surface/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sapphire-terracotta/10 border border-sapphire-terracotta/20 flex items-center justify-center text-sapphire-terracotta">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-semibold text-text-lg text-sapphire-dark">
                  Select Brand Workspace
                </h2>
                <span className="text-[10px] font-mono bg-sapphire-subtle px-2 py-0.5 rounded text-sapphire-muted">
                  Ctrl+W
                </span>
              </div>
              <p className="text-text-xs text-sapphire-muted">
                Switch client context to automatically inject custom fonts, color harmonies, voice tone, and positioning.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenOnboarding && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="inline-flex items-center gap-1.5 text-text-xs font-semibold text-white bg-sapphire-terracotta hover:bg-sapphire-terracotta/90 px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                + New Workspace
              </button>
            )}
            <Link
              href="/workspaces"
              className="inline-flex items-center gap-1.5 text-text-xs font-semibold text-sapphire-muted hover:text-sapphire-dark px-3 py-1.5 rounded-lg border border-sapphire-border hover:bg-sapphire-surface transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Manage All
            </Link>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-sapphire-muted hover:text-sapphire-dark hover:bg-sapphire-subtle transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Cards */}
        <div className="p-6 overflow-y-auto flex-1 bg-sapphire-bg/50">
          <WorkspaceGrid
            brands={brands}
            activeBrandId={activeBrand.id}
            activeBrandName={activeBrand.name}
            onSelectWorkspace={(b) => {
              onSelectBrand(b);
              onClose();
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sapphire-border bg-sapphire-surface/60 flex items-center justify-between text-[11px] text-sapphire-muted">
          <span>Active Client: <strong className="text-sapphire-dark">{activeBrand.name}</strong></span>
          <span>Tip: You can customize taste affinities in Brand Brain (Ctrl+B)</span>
        </div>
      </div>
    </div>
  );
};
