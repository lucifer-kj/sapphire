"use client";
import React from "react";
import { BrandProfile } from "@/lib/schema/brand";
import { Check, Sparkles, ArrowRight, Palette, Layers, Globe, Instagram } from "lucide-react";

interface WorkspaceGridProps {
  brands: (BrandProfile & { id?: string })[];
  activeBrandId?: string;
  activeBrandName?: string;
  onSelectWorkspace: (brand: BrandProfile & { id?: string }) => void;
  isNavigating?: boolean;
}

export const WorkspaceGrid: React.FC<WorkspaceGridProps> = ({
  brands,
  activeBrandId,
  activeBrandName,
  onSelectWorkspace,
  isNavigating = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {brands.map((brand) => {
        const isSelected =
          (brand.id && brand.id === activeBrandId) ||
          brand.name === activeBrandName;

        const primaryColors = brand.visual_identity?.primary_colors || ["#141413", "#FAF9F5"];
        const secondaryColors = brand.visual_identity?.secondary_colors || ["#D97757"];
        const allColors = [...primaryColors, ...secondaryColors].slice(0, 5);

        return (
          <div
            key={brand.id || brand.name}
            onClick={() => onSelectWorkspace(brand)}
            className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
              isSelected
                ? "bg-sapphire-surface border-sapphire-terracotta ring-1 ring-sapphire-terracotta/30 shadow-sm"
                : "bg-sapphire-surface/70 border-sapphire-border/80 hover:border-sapphire-dark/20 hover:bg-sapphire-surface hover:shadow-sm"
            }`}
          >
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-semibold text-text-md text-sapphire-dark tracking-tight">
                      {brand.name}
                    </h3>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider text-sapphire-green bg-sapphire-green/10 px-2 py-0.5 rounded-full border border-sapphire-green/20">
                        <Check className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-text-xs text-sapphire-muted font-medium mt-0.5">
                    {brand.industry}
                  </p>
                </div>

                {brand.social_handle && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-sapphire-muted bg-sapphire-subtle px-2 py-1 rounded-md font-mono">
                    <Instagram className="w-3 h-3 text-sapphire-terracotta" />
                    {brand.social_handle}
                  </span>
                )}
              </div>

              {/* Positioning / Description */}
              <p className="text-text-xs text-sapphire-muted line-clamp-2 leading-relaxed">
                {brand.positioning || brand.description}
              </p>

              {/* Color Swatches */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-sapphire-muted flex items-center gap-1">
                  <Palette className="w-3 h-3" /> Palette & Visual Tone
                </span>
                <div className="flex items-center gap-1.5">
                  {allColors.map((color, idx) => (
                    <div
                      key={idx}
                      className="w-5 h-5 rounded-full border border-black/10 shadow-xs transition-transform group-hover:scale-105"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  <span className="text-[11px] text-sapphire-muted ml-2 font-mono truncate max-w-[150px]">
                    {brand.visual_identity?.fonts?.heading || "Inter"} + {brand.visual_identity?.fonts?.serif || "Georgia"}
                  </span>
                </div>
              </div>

              {/* Voice Tags */}
              <div className="flex flex-wrap gap-1 pt-1">
                {brand.voice?.tone?.split(",").slice(0, 3).map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-sapphire-subtle text-sapphire-dark font-medium"
                  >
                    {t.trim()}
                  </span>
                ))}
                {brand.visual_identity?.photography_style && (
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-sapphire-terracotta/10 text-sapphire-terracotta font-medium truncate max-w-[180px]">
                    {brand.visual_identity.photography_style.split(",")[0]}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="mt-4 pt-3 border-t border-sapphire-border/40 flex items-center justify-between">
              <span className="text-[11px] text-sapphire-muted font-medium">
                {brand.target_audience ? brand.target_audience.split(",")[0] : "All Audiences"}
              </span>

              <button
                type="button"
                className={`inline-flex items-center gap-1.5 text-text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  isSelected
                    ? "bg-sapphire-terracotta text-white shadow-xs"
                    : "bg-sapphire-subtle text-sapphire-dark hover:bg-sapphire-dark hover:text-white"
                }`}
              >
                {isSelected ? "Studio Active" : "Launch Studio"}
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
