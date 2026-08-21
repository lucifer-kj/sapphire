import fs from "fs";
import path from "path";

export interface KBModule {
  filePath: string;
  fileName: string;
  tag: string;
  pillar_fit?: string[];
  theme_name?: string;
  placement?: string;
  mood?: string[];
  complexity?: string[];
  title: string;
  content: string;
  rawMarkdown: string;
  frontmatter: Record<string, any>;
}

let cachedModules: KBModule[] | null = null;
let cachedCoreDoctrine: string | null = null;

/**
 * Lightweight parser for YAML frontmatter in KB markdown files.
 */
function parseFrontmatter(raw: string): { frontmatter: Record<string, any>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {}, content: raw.trim() };
  }

  const yamlBlock = match[1];
  const content = match[2].trim();
  const frontmatter: Record<string, any> = {};

  for (const line of yamlBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colonIdx = trimmed.indexOf(":");
    if (colonIdx !== -1) {
      const key = trimmed.slice(0, colonIdx).trim();
      let val = trimmed.slice(colonIdx + 1).trim();

      // Parse arrays like [item1, item2]
      if (val.startsWith("[") && val.endsWith("]")) {
        frontmatter[key] = val
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
      } else {
        frontmatter[key] = val.replace(/^['"]|['"]$/g, "");
      }
    }
  }

  return { frontmatter, content };
}

/**
 * Recursively scans directory for .md files.
 */
function getMarkdownFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getMarkdownFiles(fullPath));
    } else if (file.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

export class KnowledgeBaseService {
  /**
   * Loads Tier 1 Core Doctrine (00-core-doctrine.md) as the baseline in-context system prompt.
   */
  static getCoreDoctrine(): string {
    if (cachedCoreDoctrine) return cachedCoreDoctrine;

    const doctrinePath = path.resolve(process.cwd(), "documents", "kb", "00-core-doctrine.md");
    if (fs.existsSync(doctrinePath)) {
      cachedCoreDoctrine = fs.readFileSync(doctrinePath, "utf-8");
      return cachedCoreDoctrine;
    }

    return "Senior Social Media Art Director producing Instagram content. Enforce 4:5 vertical framing, thumbnail legibility, and exact quoted typography.";
  }

  /**
   * Loads all Tier 2 modules from `documents/kb/modules/`.
   */
  static getAllModules(): KBModule[] {
    if (cachedModules && cachedModules.length > 0) {
      return cachedModules;
    }

    const modulesDir = path.resolve(process.cwd(), "documents", "kb", "modules");
    const filePaths = getMarkdownFiles(modulesDir);
    const modules: KBModule[] = [];

    for (const fp of filePaths) {
      try {
        const raw = fs.readFileSync(fp, "utf-8");
        const { frontmatter, content } = parseFrontmatter(raw);
        const fileName = path.basename(fp);

        // Extract title from first heading
        const titleMatch = content.match(/^#+\s*(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : fileName.replace(".md", "");

        modules.push({
          filePath: fp,
          fileName,
          tag: frontmatter.tag || "general",
          pillar_fit: frontmatter.pillar_fit || (frontmatter.pillar ? [frontmatter.pillar] : undefined),
          theme_name: frontmatter.theme_name || frontmatter.theme,
          placement: frontmatter.placement,
          mood: frontmatter.mood,
          complexity: frontmatter.complexity,
          title,
          content,
          rawMarkdown: raw,
          frontmatter,
        });
      } catch (err) {
        console.warn(`Failed to parse KB file ${fp}:`, err);
      }
    }

    cachedModules = modules;
    return modules;
  }

  /**
   * Multi-dimensional retrieval over the Knowledge Base:
   * Filters by content pillar, theme archetype, placement, and semantic keywords.
   */
  static retrieveContext(options: {
    tag?: string;
    pillar?: string;
    theme?: string;
    placement?: string;
    query?: string;
    limit?: number;
  }): KBModule[] {
    const all = this.getAllModules();
    const limit = options.limit || 3;

    let filtered = all.filter((mod) => {
      if (options.tag && mod.tag !== options.tag) {
        return false;
      }
      if (options.pillar && mod.pillar_fit && !mod.pillar_fit.includes(options.pillar.toLowerCase())) {
        return false;
      }
      if (options.theme && mod.theme_name && mod.theme_name.toLowerCase() !== options.theme.toLowerCase()) {
        return false;
      }
      if (options.placement && mod.placement && mod.placement !== options.placement) {
        return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      filtered = all;
    }

    if (!options.query) {
      return filtered.slice(0, limit);
    }

    // Rank by keyword similarity if query is given
    const qTerms = options.query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const scored = filtered.map((mod) => {
      let score = 0;
      const fullText = (mod.title + " " + mod.content + " " + (mod.mood?.join(" ") || "")).toLowerCase();
      for (const term of qTerms) {
        if (fullText.includes(term)) score += 2;
        if (mod.title.toLowerCase().includes(term)) score += 5;
        if (mod.theme_name && mod.theme_name.toLowerCase().includes(term)) score += 6;
      }
      return { mod, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map((s) => s.mod).slice(0, limit);
  }

  /**
   * Retrieves the specific Qwen Prompt Patterns technical module.
   */
  static getQwenPromptPatterns(): string {
    const patterns = this.getAllModules().find((m) => m.tag === "qwen-prompt-patterns");
    return patterns ? patterns.content : "Format prompt in standard 9-part order, quote exact text, keep text concise.";
  }

  /**
   * Retrieves relevant Worked Examples for anchor reference.
   */
  static getWorkedExamples(theme?: string, pillar?: string): KBModule[] {
    return this.getAllModules().filter((m) => {
      if (m.tag !== "worked-examples") return false;
      if (theme && m.theme_name && m.theme_name.toLowerCase() === theme.toLowerCase()) return true;
      if (pillar && m.pillar_fit && m.pillar_fit.includes(pillar.toLowerCase())) return true;
      return true;
    });
  }
}
