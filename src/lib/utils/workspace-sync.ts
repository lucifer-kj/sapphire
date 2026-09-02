import { BrandProfile } from "@/lib/schema/brand";
import { PRECONFIGURED_BRANDS } from "@/lib/constants/brands";

export const STORAGE_KEY = "sapphire_user_workspaces";
export const ACTIVE_WORKSPACE_KEY = "sapphire_active_workspace_id";

/**
 * Creates a normalized slug from a string (e.g. "Café Vagabond & Roastery" -> "cafe-vagabond-roastery")
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Checks whether a target ID, slug, or name matches a given BrandProfile
 */
export function matchesBrand(brand: BrandProfile, query: string): boolean {
  if (!query) return false;
  const cleanQuery = slugify(query);
  const brandSlug = brand.id ? slugify(brand.id) : "";
  const nameSlug = slugify(brand.name);

  return (
    brand.id === query ||
    brandSlug === cleanQuery ||
    brand.name.toLowerCase() === query.toLowerCase() ||
    nameSlug === cleanQuery ||
    nameSlug.includes(cleanQuery) ||
    cleanQuery.includes(nameSlug)
  );
}

/**
 * Finds a brand in a list by ID, slug, or name
 */
export function findBrand(brands: BrandProfile[], query: string): BrandProfile | undefined {
  return brands.find((b) => matchesBrand(b, query));
}

/**
 * Merges local and server workspaces without EVER wiping out user-created workspaces.
 */
export function mergeWorkspaces(
  localWorkspaces: BrandProfile[],
  serverWorkspaces: BrandProfile[]
): BrandProfile[] {
  const map = new Map<string, BrandProfile>();

  // 1. Seed with preconfigured brands
  for (const b of PRECONFIGURED_BRANDS) {
    const key = slugify(b.name);
    map.set(key, b);
  }

  // 2. Merge server workspaces
  for (const b of serverWorkspaces) {
    const key = slugify(b.name);
    map.set(key, b);
  }

  // 3. Merge local workspaces (user created take precedence)
  for (const b of localWorkspaces) {
    const key = slugify(b.name);
    map.set(key, b);
  }

  return Array.from(map.values());
}

/**
 * Gets cached workspaces safely from localStorage
 */
export function getLocalWorkspaces(): BrandProfile[] {
  if (typeof window === "undefined") return PRECONFIGURED_BRANDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return PRECONFIGURED_BRANDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return mergeWorkspaces(parsed, []);
    }
  } catch (err) {
    console.warn("Could not read local workspaces:", err);
  }
  return PRECONFIGURED_BRANDS;
}

/**
 * Saves or updates a workspace in localStorage safely
 */
export function saveLocalWorkspace(brand: BrandProfile): BrandProfile[] {
  if (typeof window === "undefined") return [brand];
  try {
    const current = getLocalWorkspaces();
    const updated = [brand, ...current.filter((b) => !matchesBrand(b, brand.name))];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (brand.id) {
      localStorage.setItem(ACTIVE_WORKSPACE_KEY, brand.id);
    }
    return updated;
  } catch (err) {
    console.warn("Could not save workspace locally:", err);
    return [brand];
  }
}
