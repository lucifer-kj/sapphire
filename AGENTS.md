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

- **Design Philosophy:** **Claude Visual Language + Google Flow Spatial Interaction Architecture**.
- **Color Palette (Strict):**
  - Application Background: `#FAF9F5` (`bg-sapphire-bg`)
  - Main Surface / Cards: `#FFFFFF` (`bg-sapphire-surface`)
  - Primary Text & Dark Elements: `#141413` (`text-sapphire-dark`)
  - Secondary Text / Subdued Icons: `#B0AEA5`
  - Subtle Borders / Dividers: `rgba(20, 20, 19, 0.12)` (`0.5px` border width)
  - Primary Accent (Buttons / Focus): `#D97757` (`accent-sapphire-terracotta`)
- **Strict Prohibition (No Generic AI Aesthetics):**
  - **NEVER** use purple/blue background gradients, neon glowing borders, rainbow text, or glassmorphism gradients on Sapphire UI chrome.
- **Layout Surface Boundaries:**
  - Left Panel: Conversational control surface & research log.
  - Right Panel: Spatial creative canvas for comparing A/B concepts, visual ingredients, version history, and contextual editing.

---

## 5. Verification Protocol

- Before marking any task complete:
  1. Inspect modified code and ensure no unused imports or broken contracts.
  2. Run `pnpm typecheck` and ensure **zero** TypeScript compilation errors.
  3. Run `pnpm build` to verify Next.js production build succeeds clean.
