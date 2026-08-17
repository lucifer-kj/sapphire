"use client";
import React from "react";
import { BrandProfile } from "@/lib/schema/brand";
import { PRECONFIGURED_BRANDS } from "@/lib/constants/brands";
import { WorkspaceModal } from "@/components/workspace/workspace-modal";

export { PRECONFIGURED_BRANDS };

interface BrandSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBrandName: string;
  onSelectBrand: (brand: BrandProfile) => void;
}

export const BrandSwitcherModal: React.FC<BrandSwitcherModalProps> = ({
  isOpen,
  onClose,
  activeBrandName,
  onSelectBrand,
}) => {
  const activeBrand =
    PRECONFIGURED_BRANDS.find((b) => b.name === activeBrandName) ||
    PRECONFIGURED_BRANDS[0];

  return (
    <WorkspaceModal
      isOpen={isOpen}
      onClose={onClose}
      activeBrand={activeBrand}
      onSelectBrand={onSelectBrand}
    />
  );
};
