# AI Social Content OS - Implementation Plan

Derived from AI_Social_Content_OS_PRD.md. Organized into phases matching the PRD's §19 build sequence.

## Phase Status Summary

| Phase | Name | Status |
|---|---|---|
| 1 | Foundations | ✅ Complete (local setup) |
| 2 | Data Layer | ✅ Complete |
| 3 | Draft Generation | ✅ Complete |
| 4 | Scoring (Standalone CLI) | ✅ Complete |
| 5 | Full Workflow (No UI) | ⏳ Next |
| 6 | LinkedIn OAuth + Manual Publish | ⏳ Pending |
| 7 | Scheduler Tick | ⏳ Pending |
| 8 | Engagement Pull-Back Tick | ⏳ Pending |
| 9 | Feedback Loop | ⏳ Pending |
| 10 | Frontend | ⏳ Pending |
| 11 | Redundant Trigger + Alerting | ⏳ Pending |
| 12 | Production Soak | ⏳ Pending |

---

## Phase 1: Foundations ✅ COMPLETE

**Goal:** Empty Next.js app deployed, all accounts provisioned, /api/health returning 200.

### Completed:
- [x] Next.js project structure created
- [x] package.json with dependencies (pnpm)
- [x] next.config.js configured
- [x] Environment file (.env.local) with Supabase credentials

### Pending (Human Action Required):
- [ ] Vercel project creation
- [ ] Upstash Redis instance
- [ ] LinkedIn Developer App
- [ ] Anthropic/OpenAI API keys
- [ ] QStash configuration
- [ ] All env vars configured in Vercel
- [ ] /api/health endpoint deployed and verified

---

## Phase 2: Data Layer ✅ COMPLETE

**Goal:** Schema created in Supabase with RLS enabled; CLI script can insert/read/update rows independently of any API route.

### Completed:
- [x] supabase/migrations/001_init.sql - Complete schema with all 8 tables
- [x] Row-Level Security enabled on all tables
- [x] 11 CHECK constraints + 4 foreign keys
- [x] Cold-start seed data in rubric_weights table
- [x] Timestamp update triggers
- [x] scripts/test-db.js - CRUD operations test
- [x] scripts/setup-db.js - Schema validation + test data
- [x] verify-phase2.js - Verification script (passed)

### Tables Created (PRD §10):
- ideas (id, raw_content, normalized_content, language, status, created_at, updated_at)
- workflow_runs (id, idea_id, mastra_run_id, state, suspended_at, created_at)
- drafts (id, idea_id, variant_index, text, score, score_breakdown, policy_flags, model_used, created_at)
- posts (id, draft_id, final_text, status, scheduled_for, published_at, linkedin_post_urn, retry_count, last_error, version, created_at, updated_at)
- accounts (id, user_id, linkedin_access_token, linkedin_refresh_token, token_expires_at, scopes)
- engagement_snapshots (id, post_id, likes, comments, reposts, fetched_at)
- voice_profiles (user_id, summary, updated_at)
- rubric_weights (factor_name, weight, updated_at)

### Milestone M2: ✅ VERIFIED
Database schema complete and verified via CLI script.

---

## Phase 3: Draft Generation (Standalone CLI) ✅ COMPLETE

**Goal:** draftAgent callable from terminal, producing 3 variants for a hardcoded idea string. No workflow, no DB.

### Completed:
- [x] src/mastra/agents/curatorAgent.js - Idea normalization and validation
- [x] src/mastra/agents/draftAgent.js - 3 parallel variant generation with voice profile
- [x] src/mastra/agents/rankingAgent.js - Scoring with detailed breakdowns
- [x] scripts/test-draft.js - CLI test (passed)
- [x] scripts/test-score.js - Scoring test (passed)

### Features Implemented:
- curatorAgent: Language detection, length validation, content warning detection
- draftAgent: 3 parallel variant generation, voice profile integration
- rankingAgent: Heuristic rubric scoring (4 weighted factors), cold-start support

### Milestone M3: ✅ VERIFIED
`node scripts/test-draft.js` prints 3 scored variants for a hardcoded idea.

### Milestone M4: ✅ VERIFIED
`node scripts/test-score.js` prints legible, defensible score breakdowns.

---

## Phase 4: Scoring (Standalone CLI) ✅ COMPLETE

**Goal:** rankingAgent callable from terminal, scoring the Phase 3 output with the cold-start heuristic rubric.

### Completed:
- [x] Heuristic rubric with weighted factors (hook_strength: 0.4, length_band: 0.2, cta_presence: 0.2, historical_topic_performance: 0.2)
- [x] Cold-start behavior (heuristic-only label)
- [x] Detailed score breakdowns
- [x] Best variant identification

### Milestone M4: ✅ VERIFIED
`node scripts/test-score.js` produces legible, defensible score breakdowns.

---

## Phase 5: Full Workflow (No UI) ⏳ NEXT

**Goal:** Mastra workflow (§9.2) wired end-to-end including suspend/resume, driven entirely via curl.

### Tasks:
- [ ] Implement /api/ideas POST (create idea, kick off workflow)
- [ ] Implement /api/workflows/:runId/resume POST
- [ ] Wire Mastra workflow: ingestIdea → generateDrafts → scoreDrafts → policyCheck → awaitApproval
- [ ] Wire resume handlers: approve → create scheduled Post; regenerate → loop to generateDrafts; reject → mark idea discarded
- [ ] Persist workflow runs in Supabase via Mastra storage adapter
- [ ] Write scripts/test-workflow.sh

### Milestone M5:
bash scripts/test-workflow.sh creates an idea, drives it through the full workflow via curl, and confirms a post row reaches scheduled status.

---

## Phase 6: LinkedIn OAuth + Manual Publish ⏳ PENDING

**Goal:** OAuth flow implemented; a curl-triggered "publish now" posts a real item to the connected LinkedIn profile.

### Tasks:
- [ ] Implement /api/auth/linkedin/callback (OAuth, state-param CSRF check)
- [ ] Implement token encryption at rest
- [ ] Implement publisherTool as Mastra tool (idempotent LinkedIn publish)
- [ ] Implement "publish now" endpoint
- [ ] Verify real post appears on LinkedIn profile
- [ ] Handle token refresh proactively

### Milestone M6:
curl triggers a real LinkedIn post from a scheduled post row; post appears on the founder's profile; token is encrypted at rest.

---

## Phase 7: Scheduler Tick (Reliability Core) ⏳ PENDING

**Goal:** /api/cron/publish-tick built with full three-layer idempotency; a post scheduled 2 minutes out publishes itself with zero manual trigger.

### Tasks:
- [ ] Implement /api/cron/publish-tick (POST, shared secret header)
- [ ] Layer 1: Redis distributed lock (SETNX post-lock:{post_id}, 60s TTL)
- [ ] Layer 2: DB status-flip (scheduled → publishing in same transaction)
- [ ] Layer 3: Pre-publish existence check (linkedin_post_urn already set)
- [ ] Implement exponential backoff + jitter retry (base 1 min, cap 30 min, max 5 attempts)
- [ ] Implement terminal vs retryable failure distinction
- [ ] Configure Upstash QStash recurring trigger (every 5 min)
- [ ] Set up redundant pinger (cron-job.org, optional)
- [ ] Write scripts/test-scheduler.sh
- [ ] Deliberately test duplicate-tick and missed-tick scenarios

### Milestone M7:
A post scheduled 2 minutes in the future publishes itself via the scheduler tick with zero manual intervention. Duplicate ticks and missed ticks are both safe.

---

## Phase 8: Engagement Pull-Back Tick ⏳ PENDING

**Goal:** Same idempotent-tick pattern for engagement data, lower frequency.

### Tasks:
- [ ] Implement /api/cron/engagement-tick (POST, shared secret)
- [ ] Implement engagementWorkflow: list published posts → fetch LinkedIn stats → append EngagementSnapshot
- [ ] Rate-limit awareness (LinkedIn 100/day counter in Redis)
- [ ] Write scripts/test-engagement.sh
- [ ] Verify eventual-consistency handling

### Milestone M8:
Engagement data is pulled back and stored as append-only snapshots; rate limits are respected; eventual consistency is handled gracefully.

---

## Phase 9: Feedback Loop ⏳ PENDING

**Goal:** feedbackAgent reconciliation script run manually against accumulated engagement data; rubric weight changes inspected before being put on a schedule.

### Tasks:
- [ ] Implement feedbackAgent (reconciles EngagementSnapshot rows into rubric weights)
- [ ] Implement weight update logic (nudge, not retrain)
- [ ] Implement sanity-check output
- [ ] Write scripts/test-feedback.sh
- [ ] Schedule feedbackAgent on low-frequency cadence (daily)

### Milestone M9:
feedbackAgent produces inspectable rubric weight adjustments from real engagement data; weights are updated in the DB after manual approval.

---

## Phase 10: Frontend (Built Over Verified Plumbing) ⏳ PENDING

**Goal:** UI screens wired to already-proven endpoints, following the state matrix in §17.2.

### Tasks:
- [ ] Idea capture screen
- [ ] Approval Gate screen (3-variant comparison view with score breakdown + inline edit + regenerate + reject)
- [ ] Calendar / pipeline view
- [ ] Post detail screen
- [ ] Voice profile / settings screen
- [ ] Apply design system (§17.1)
- [ ] Destructive action confirmations

### Milestone M10:
Full frontend operational; all screens wired to proven backend endpoints; every state from §17.2 explicitly handled.

---

## Phase 11: Redundant Scheduler Trigger + Alerting ⏳ PENDING

**Goal:** Second free pinger added; terminal-failure alerting wired and manually triggered to confirm it fires.

### Tasks:
- [ ] Configure cron-job.org (or equivalent) as redundant pinger
- [ ] Implement terminal-failure alert (email or Slack/Discord webhook)
- [ ] Implement spend ceiling approaching alert
- [ ] Verify redundant trigger is harmless (idempotent, §13.2)

### Milestone M11:
Redundant scheduler trigger active; terminal-failure and spend-ceiling alerts confirmed firing.

---

## Phase 12: Production Soak ⏳ PENDING

**Goal:** Founder uses the system for real daily LinkedIn content; the edge-case matrix (§16) is exercised in practice.

### Tasks:
- [ ] Use system daily for real LinkedIn content
- [ ] Monitor for any §16 scenario occurring in practice
- [ ] Update edge-case matrix as needed
- [ ] Verify zero duplicate publishes and zero silent failures
- [ ] Verify no manual server intervention required

### Milestone M12:
10+ real posts published end-to-end with zero duplicates and zero silent failures; no server intervention needed.

---

## Definition of Done (Overall)

- [ ] All 12 phases in §19 complete, each with CLI verification before the next phase began.
- [ ] At least 10 real posts published end-to-end through the full pipeline.
- [ ] Every scenario in the §16 edge-case matrix deliberately exercised at least once.
- [ ] No manual server intervention required at any point.
- [ ] All env vars documented in §22; all secrets encrypted at rest.
- [ ] RLS enabled on all tables; no token or secret exposed client-side.

---

## Dependency Graph

```
Phase 1 (Foundations)
  │
  └──▶ Phase 2 (Data Layer) ✅ COMPLETE
        │
        └──▶ Phase 3 (Draft Generation) ✅ COMPLETE
              │
              └──▶ Phase 4 (Scoring) ✅ COMPLETE
                    │
                    └──▶ Phase 5 (Full Workflow) ⏳ NEXT
                          │
                          ▊
                    Phase 12 (Production Soak)
```

Phases 7 and 8 can partially overlap (they use the same tick pattern), but Phase 7 must be fully proven before Phase 8 begins.

---

## File Structure (Current)

```
sapphire/
├── AI_Social_Content_OS_PRD.md
├── IMPLEMENTATION_PLAN.md
├── PROGRESS.md
├── package.json
├── next.config.js
├── .env.local
├── supabase/
│   └── migrations/
│       └── 001_init.sql
├── scripts/
│   ├── test-db.js
│   ├── setup-db.js
│   ├── test-draft.js
│   └── test-score.js
├── src/
│   └── mastra/
│       ├── agents/
│       │   ├── curatorAgent.js
│       │   ├── draftAgent.js
│       │   └── rankingAgent.js
│       ├── workflows/
│       └── lib/
└── public/
```

---

*Plan generated from PRD analysis. All phase numbers and task references correspond to sections in AI_Social_Content_OS_PRD.md.*