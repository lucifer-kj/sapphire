# Sapphire — Agent Execution Rules & Operational Constitution

This document defines the core operational constraints and rules for all AI coding agents working on the Sapphire codebase.

---

## 1. Tooling & Environment Constraints

- **Package Manager:** `pnpm` is **mandatory**. Never use `npm`, `yarn`, or `bun`.
  - Install dependencies: `pnpm add <package>`
  - Execute scripts: `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm typecheck`
- **TypeScript:** Strict mode is enabled and enforced. No implicit `any`, no ignoring type errors with unsafe casting.
- **Node & Next.js:** Built for Next.js App Router (React 19 / Server & Client Components).

---

## 2. Architectural Principles

- **State Over Process (Serverless Compatibility):**
  - Sapphire runs on the Vercel Free Tier.
  - Never rely on long-running background daemons, process memory, module globals, or local filesystem persistence.
  - Every step in an agentic workflow must persist state to the durable database layer so execution can safely suspend and resume.
- **Human Approval Boundary:**
  - Sapphire generates and critiques creative content autonomously.
  - Final delivery is via email **only after explicit human approval**.
  - Sapphire **never** automatically posts to Instagram, LinkedIn, or any social platform.

---

## 3. AI & Orchestration Standards

- **Schema-First AI:**
  - All AI model inputs and outputs must be validated using structured schemas (Zod / Mastra schemas).
  - Never rely on raw unparsed LLM text responses for critical control flow logic.
- **Model Routing Rules:**
  - **Groq:** Use for high-speed, cost-effective structured tasks (intent parsing, classification, summarization, draft copy generation, preference extraction).
  - **Gemini:** Use for multimodal tasks (reference image analysis, visual concept direction, image generation, complex creative critiques).
- **Bounded Agents:**
  - Every agent in Mastra must have explicit input/output schemas, model assignments, tool permissions, retry limits, and token budgets.

---

## 4. UI / UX & Design System Guidelines

- **Design Philosophy:** **Claude Subtractive Dark Theme + Google Flow Spatial Interaction Architecture**.
- **Color Palette (Strict Dark Neutral Hierarchy):**
  - Application Background (Base Canvas): `#09090b` (`bg-zinc-950` / `bg-sapphire-bg`)
  - Main Surface / Cards / Elevated Panels: `#18181b` (`bg-zinc-900` / `bg-sapphire-surface`)
  - Secondary Elevated / Active Inputs: `#27272a` (`bg-zinc-800` / `bg-sapphire-subtle`)
  - Primary Text & Prominent Elements: `#f4f4f5` (`text-zinc-100` / `text-sapphire-dark`)
  - Secondary Text / Subdued Metadata: `#a1a1aa` (`text-zinc-400` / `text-sapphire-muted`)
  - Subtle Micro-Borders / Dividers: `rgba(255, 255, 255, 0.05)` to `rgba(255, 255, 255, 0.10)` (`border-white/5` / `border-white/10`)
  - Primary Accent (Buttons / Active States / Focal CTAs): `#D97757` (`accent-sapphire-terracotta`)
- **Strict Prohibition (No Generic AI Aesthetics):**
  - **NEVER** use purple/blue background gradients, neon glowing borders, rainbow text, or glassmorphism gradients on Sapphire UI chrome.
- **Layout Surface Boundaries:**
  - **Dedicated Workspace Portal (`/workspaces`):** Central launchpad for choosing between Personal Creator Onboarding and Client OpenBrand Autonomous Extraction.
  - **Left Panel (Sidebar):** Unified workspace identity header, Creative Gallery asset stack, Brand Brain settings, and paginated session history with isolated history deletion.
  - **Center Panel (Conversation Feed):** Centered (`max-w-3xl lg:max-w-4xl mx-auto`), relaxed line-height conversation feed with elevated diffuse-shadow composer (`Add Visual`, `Generate`).
  - **Right Panel (Spatial Creative Canvas):** Dynamic spatial workspace supporting Vertical Stack Feed and Studio Focus Inspector for inspecting 1080×1350 Canva-grade composites, typography layers, version history, and Bayesian alignment scores.

---

## 5. Verification Protocol

- Before marking any task complete:
  1. Inspect modified code and ensure no unused imports or broken contracts.
  2. Run `pnpm typecheck` and ensure **zero** TypeScript compilation errors.
  3. Run `pnpm build` to verify Next.js production build succeeds clean.
