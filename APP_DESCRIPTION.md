# Sapphire — AI Social Content Operating System (Build Brief v2 Specs)

## App Description & System Architecture

Sapphire is a multi-tenant AI-powered content operating system built for creators, agencies, and brands who need to consistently produce high-quality social media content across multiple client workspaces. It combines strategic framing, multi-LLM draft variant generation, anti-AI editor polishing, structured Gemini image asset creation, human approval workflows, and ready-to-post manual delivery packages.

---

## 🏗 System Architecture (System A / B / C Stack)

| Layer | Hosting & Infrastructure | Tier | Key Responsibilities |
|---|---|---|---|
| **System A: Embedded AI Engine & API** | **Vercel** (Next.js 14 + Mastra) | Hobby (Free) | UI Dashboard, Content Studio, Mastra Strategy/Draft/Editor Agents, Gemini Image Tool, SSE streaming, Route consolidation (≤ 12 routes). |
| **System B: Data, Auth & Cron** | **Supabase** | Free Tier | Postgres multi-tenant database, `auth.uid()` RLS policies, Storage buckets (`post-images`), `pg_cron` + `pg_net` scheduled delivery triggers. |
| **System C: Delivery Worker** | **n8n / API Webhook Worker** | Free / Cloud | Assembles ready-to-post delivery packages, atomic claim locking (`delivering` -> `delivered`), formatting caption copy for mobile paste. |
| **LLM Engine** | **Groq Llama 3.3 70B + Gemini 2.0 Flash + OpenRouter** | Free Tier APIs | Strategic angle framing, fast variant generation (sequential try/catch fallback chain), anti-AI editor pass, 1:1 image prompt building. |

---

## 🧠 The Content Manager "Brain" Architecture (Mastra Embedded)

The intelligent multi-step generation pipeline operates embedded inside Next.js API routes via Mastra:

```
[User Idea Ingest] (POST /api/content/generate)
       │
       ▼
(1. Strategy Agent — Mastra)
   ↳ Analyzes raw idea + Brand Persona + Target Audience
   ↳ Formulates 3 strategic post angles (Controversial, Story-based, Actionable Framework)
       │
       ▼
(2. Draft Generator Agent — Sequential Fallback Chain)
   ↳ Groq (Llama 3.3 70B) → Gemini 2.0 Flash → OpenRouter → Local Fallback
   ↳ Sub-second generation of 3 platform-tailored draft variants
       │
       ▼
(3. Editor & Scorer Agent — Anti-AI Pass)
   ↳ Strips generic AI buzzwords ("delve", "game-changer", "testament", "tapestry")
   ↳ Computes hook & CTA scores reading live `rubric_weights` table from Supabase
       │
       ▼
(4. Direct Persistence to Supabase & SSE Streaming)
   ↳ Writes variants into `drafts` table & streams step progress via Server-Sent Events (SSE)
```

---

## 🛡 Performance & Resource Safeguards

1. **Manual Content Delivery (No Posting Scopes)**: Zero OAuth token storage (`w_member_social`, `instagram_business_content_publish`) in this version. Eliminates token expiration and app review bottlenecks.
2. **Copy-Paste Caption Formatting**: Strips Markdown asterisks/headers (`**Header**` -> `Header`) and formats clean double line breaks so captions copy-paste into LinkedIn/Instagram without text corruption.
3. **Structured Gemini Image Prompts**: Extracts core subject, applies workspace brand style, enforces 1:1 aspect ratio composition, and applies negative constraints (no watermarks, text artifacts, distorted faces).
4. **Vercel 12-Function Route Consolidation**: API endpoints use dynamic catch-all route handlers ([`src/app/api/content/[...action]/route.ts`](file:///c:/Users/USER/Documents/Builds/sapphire/src/app/api/content/[...action]/route.ts)) to remain strictly within Hobby limits.
5. **Database Keep-Alive Ping**: Daily `pg_cron` ping (`SELECT 1;`) prevents Supabase 7-day inactivity pausing.

---

## 🏢 Multi-Tenancy Architecture

```
User (auth.users)
  └── Workspace Member (role: owner | editor | viewer)
        └── Workspace
              ├── Brand Profile (persona, tone, topics, example posts)
              ├── Ideas → Drafts → Posts
              ├── Content Jobs (async workflow SSE tracking)
              └── Rubric Weights (workspace scoring)
```

---

## 🚀 Rebuilt Production Status (Phases 1 - 5)

### Phase 1: Security, Auth & Multi-Tenancy `[COMPLETED]`
- `.env.local` cleanup, `@supabase/ssr` middleware session guard, RLS isolation policies via `is_workspace_member()`, language detection fix, TS strict mode.

### Phase 2: Mastra AI Engine & Supabase Persistence `[COMPLETED]`
- Embedded Mastra agents (Strategy, Draft Generator with `Groq -> Gemini -> OpenRouter` fallback chain, Editor/Scorer Agent).
- Gemini Image Generation tool ([`imageGenerator.ts`](file:///c:/Users/USER/Documents/Builds/sapphire/src/mastra/tools/imageGenerator.ts)) uploading assets to Supabase Storage (`post-images`).
- Consolidated Vercel route with Server-Sent Events (SSE) job streaming.

### Phase 3 & 4: Ready-to-Post Content Delivery & Dashboard UI `[COMPLETED]`
- Delivery Tick handler with atomic claim locking (`status = 'delivering' -> 'delivered'`).
- Publishing Calendar ([`src/app/calendar/page.tsx`](file:///c:/Users/USER/Documents/Builds/sapphire/src/app/calendar/page.tsx)) with week navigation, "Copy Caption" clipboard action, and "Deliver Now" execution.
- Main Dashboard ([`src/app/page.tsx`](file:///c:/Users/USER/Documents/Builds/sapphire/src/app/page.tsx)) with live pipeline counts.

### Phase 5: System Verification & Build `[COMPLETED]`
- `pnpm run typecheck` verified with 0 errors.
- `pnpm run build` compiled successfully across all 27 production routes.
