# Sapphire v2 — Prompt Intelligence Feature Strategy

## Status
Strategic implementation specification derived from the authoritative `MASTER_ARCHITECTURE_AND_CODEBASE_AUDIT.md` for repository `sapphire-v2`.

## 1. Feature thesis

Sapphire v2 should introduce a **Prompt Intelligence Mode** inside the existing Sapphire Studio.

The feature does **not** generate an image in its first release. It converts a user's conversational content brief into a platform-aware, brand-aware, model-aware visual production specification and a final image-generation prompt.

The existing Dual-Brain architecture remains the foundation:

- **Brain 1 — Conceptual Reasoning:** understands intent, audience, brand DNA, platform psychology, visual metaphor, composition and creative direction.
- **Brain 2 — Deterministic Geometry:** remains part of the broader platform, but is not executed for Prompt Intelligence Mode because no raster output is requested.

The key strategic decision is therefore:

> Reuse Sapphire's reasoning, Brand Brain, Design Knowledge, canonical archetypes and structured Zod contracts; bypass image-generation, compositing and delivery for `prompt_only` jobs.

Source architecture identifies the Dual-Brain paradigm and the current Mastra/Next.js/Vercel stack as the core architectural foundation. See `MASTER_ARCHITECTURE_AND_CODEBASE_AUDIT.md`, Sections 1 and 4.

---

# 2. What changes in Sapphire

## Current product behavior

The current production flow is a campaign-generation DAG that goes from brand/intent analysis → design knowledge/trends → creative concepts → semantic layout DSL → image generation + deterministic compositing → critic → human approval/delivery.

## New product behavior

Add a second execution intent:

```text
PROMPT_ONLY
```

The user remains inside the existing Studio and conversation model.

```text
Existing Studio
      |
      +--> Generate Creative
      |
      +--> Prompt Intelligence   <-- NEW
```

Prompt Intelligence should use the same workspace, active brand, history and conversational context already available to Sapphire.

---

# 3. V1 scope

## Platforms

Only:

1. Instagram
2. LinkedIn

## Visual format

Only:

```text
Single-image post
```

## Output

The user receives:

- interpreted creative direction
- detected post type
- selected/recommended design archetype
- recommended model family/provider
- image aspect ratio
- reference-image guidance
- final generation prompt
- optional exclusions/negative constraints where supported
- concise rationale explaining the major strategic choices

## Explicitly out of scope for V1

- actual image generation
- background generation
- Satori compilation
- Resvg rasterization
- image-provider fan-out
- image QA against generated pixels
- social auto-posting
- carousel prompt generation
- video prompt generation
- story/reel prompt generation
- automated publishing

---

# 4. Correct domain model

Do not model this as a generic `promptGenerator` utility.

Create a domain concept called:

```text
Prompt Intelligence
```

Its job is to transform:

```text
User Brief
   ↓
Creative Intent
   ↓
Platform Strategy
   ↓
Visual Strategy
   ↓
Model Strategy
   ↓
Prompt Specification
   ↓
Final Prompt
```

This creates a clean seam for future expansion to:

- image generation
- motion/video prompts
- carousel direction
- advertisement creative
- art-direction packages

without rewriting the reasoning layer.

---

# 5. Reuse existing Sapphire assets

The feature should explicitly consume existing production capabilities instead of duplicating them.

## Reuse directly

### Intent Agent

Existing `src/mastra/agents/intent-agent.ts`

Responsibilities for Prompt Intelligence:

- parse the user's brief
- identify event/topic/objective/audience/platform constraints
- identify missing but material context

### Strategist Agent

Existing `src/mastra/agents/strategist-agent.ts`

Responsibilities:

- platform-native strategy
- post-type classification
- visual communication strategy
- platform-specific constraints

### Creative Director Agent

Existing `src/mastra/agents/creative-director-agent.ts`

Responsibilities:

- translate strategic intent into visual concept
- select/distill a visual metaphor or direct visual representation
- decide creative direction
- prevent generic AI visual output

For V1, the A/B concept system should be configurable. Default to one high-confidence direction to reduce cost and latency; allow a future `creative_variants=2` mode.

### Prompt Engineer Agent

Existing `src/mastra/agents/prompt-engineer-agent.ts`

This becomes the principal feature agent for turning the structured visual specification into model-aware prompt syntax.

### Critic Agent

Existing `src/mastra/agents/critic-agent.ts`

Repurpose/reconfigure the existing 100-point rubric for prompt quality rather than pixel/image quality when running in Prompt Intelligence Mode.

### Refinement Agent

Existing `src/mastra/agents/refinement-agent.ts`

Used when the user says things such as:

- “make it more premium”
- “less busy”
- “more cinematic”
- “make it feel more LinkedIn-native”
- “keep the concept but change the subject”

### Design Knowledge

Existing `src/services/design-knowledge.ts`

Continue using the hybrid Local KB + pgvector architecture.

### Brand Brain

Existing `src/services/brand-brain.ts`

Inject active Brand DNA into the visual reasoning and prompt construction process.

### Preference Engine

Existing `src/services/preference-engine.ts`

Do not require it for the first prompt-only release, but preserve the integration seam so accepted/refined prompts can eventually influence visual preference vectors.

---

# 6. New Prompt Intelligence module

Use the target DDD structure from the master architecture and introduce a bounded module rather than adding loose files into `lib`.

Recommended structure:

```text
src/modules/prompt-intelligence/
├── domain/
│   ├── prompt-intent.ts
│   ├── visual-strategy.ts
│   ├── model-strategy.ts
│   ├── prompt-spec.ts
│   └── prompt-result.ts
│
├── services/
│   ├── prompt-intelligence-service.ts
│   ├── model-router.ts
│   ├── prompt-validator.ts
│   └── prompt-formatters.ts
│
├── knowledge/
│   ├── platform-rules.ts
│   ├── post-types.ts
│   ├── model-rules.ts
│   └── reference-strategy.ts
│
└── workflow/
    └── prompt-intelligence-workflow.ts
```

The existing `src/mastra/agents` directory should remain the canonical home for Mastra agents in accordance with the current architecture until the broader DDD refactor is intentionally executed. Do not perform unrelated repository-wide refactoring while implementing this feature.

---

# 7. New execution contract

Extend the existing campaign/job domain with an explicit generation mode.

Conceptually:

```ts
type GenerationMode =
  | 'campaign'
  | 'prompt_only';
```

Prefer a discriminated union in the actual Zod schema.

Example conceptual contract:

```ts
const PromptOnlyRequestSchema = z.object({
  mode: z.literal('prompt_only'),
  platform: z.enum(['instagram', 'linkedin']),
  input: z.string().min(1),
  workspaceId: z.string(),
  brandId: z.string().optional(),
});
```

The precise fields must be reconciled with the existing `campaign.ts`, `prompt-engineer.ts`, and API request contracts before implementation.

Do not duplicate user/session/workspace identifiers when existing domain contracts already provide them.

---

# 8. Prompt Intelligence pipeline

The preferred V1 DAG is:

```text
START
  |
  +--> Load Active Workspace / Brand Brain
  |
  +--> Intent Agent
  |
  +--> Retrieve Design Knowledge
  |
  +--> Strategist Agent
  |
  +--> Creative Director Agent
  |
  +--> Model Router
  |
  +--> Prompt Engineer Agent
  |
  +--> Prompt Critic
  |
  +--> Refinement (only when needed)
  |
  +--> Persist result
  |
  +--> Stream result to Studio
END
```

## Important optimization

Do not call agents sequentially when their inputs are independent.

Stage 0 should parallelize:

```text
Brand Brain
Intent Agent
Initial Knowledge Retrieval
```

After intent is known, perform targeted retrieval using the interpreted platform/post type rather than retrieving the entire KB.

This reduces token consumption and keeps context bounded.

---

# 9. Internal Prompt Specification

Do not let the Prompt Engineer operate directly on raw chat history.

Create a typed intermediate representation.

Conceptual shape:

```ts
PromptSpecification {
  platform
  postType
  contentObjective
  audience
  topic
  visualIntent
  creativeConcept
  archetype
  composition
  subject
  environment
  lighting
  camera
  color
  materials
  typographyIntent
  negativeConstraints
  brandConstraints
  referenceStrategy
  modelTarget
  aspectRatio
}
```

This intermediate object is the contract between creative reasoning and prompt rendering.

It is also the main mechanism for code sanity: agents reason about structured fields, and formatters render the final prose.

---

# 10. Instagram V1 strategy

Instagram should be treated as visual-first and attention-first.

The exact rules should come from researched KB modules, not hard-coded assumptions.

Initial taxonomy to validate through research:

```text
Instagram Single Image
├── Product / Service Promotion
├── Lifestyle / Editorial
├── Educational
├── Announcement
├── Brand Awareness
├── Inspirational
├── Offer / Promotional
└── Story-led Visual
```

The system should infer the post type from the user's brief rather than forcing the user through a long configuration form.

The visual strategy should prioritize:

- immediate subject recognition
- strong scroll-stop composition
- one dominant focal point
- intentional negative space
- brand differentiation
- platform-native framing
- controlled text/image interaction

These are feature hypotheses until confirmed by research.

---

# 11. LinkedIn V1 strategy

LinkedIn should be treated as professional, information-aware, and credibility-oriented rather than simply “Instagram with different dimensions.”

Initial taxonomy to validate:

```text
LinkedIn Single Image
├── Thought Leadership
├── Educational
├── Framework / Mental Model
├── Data / Insight
├── Announcement
├── Case Study
├── Product / Service
├── Company / Culture
├── Industry Commentary
└── Personal Story
```

Candidate visual treatments include:

```text
Conceptual
Editorial
Data-led
Diagrammatic
Documentary
Minimal
Product-centric
Human-centric
```

Again, research must determine the final rule set.

---

# 12. Archetype integration

Sapphire already defines five canonical design archetypes:

1. Editorial Magazine
2. Conceptual Split
3. Comparison Split
4. Vintage Poster
5. SaaS Dotgrid

These remain useful as **visual strategy primitives**.

The Prompt Intelligence feature should not expose all five as mandatory user selections.

Instead:

```text
User Brief
  ↓
Strategist
  ↓
Best-fit Archetype
```

The result UI can show:

```text
Visual Direction
Editorial Magazine
```

and allow a future override:

```text
Change direction
```

This preserves the intelligence of the system while retaining user control.

---

# 13. Model intelligence layer

The model router must be data-driven.

It should not encode vague rules such as:

```text
"Model X is best."
```

Instead maintain structured model knowledge:

```text
ModelProfile
├── provider
├── capabilities
├── strengths
├── weaknesses
├── promptSyntax
├── referenceSupport
├── typographyCapability
├── realismProfile
├── compositionProfile
├── styleProfile
├── aspectRatioSupport
├── negativePromptSupport
└── knownFailureModes
```

For V1, the model database can contain a small researched set.

The model router should return:

```text
recommendedModel
confidence
selectionReason
fallbackModel
```

Do not pretend confidence is scientifically calibrated until an evaluation dataset exists.

Use qualitative confidence or a bounded heuristic score initially.

---

# 14. References strategy

Reference guidance should be part of the output rather than an afterthought.

Classify reference needs:

```text
NONE
STYLE_REFERENCE
SUBJECT_REFERENCE
PRODUCT_REFERENCE
COMPOSITION_REFERENCE
MULTI_REFERENCE
```

The agent should explain what a reference is supposed to control.

Example:

```text
Reference recommended:
Use a visual reference for lighting + editorial styling.
Do not use it as an exact content/template copy.
```

This is more useful than merely attaching “use reference image.”

---

# 15. Image generation must be disabled visibly

Do not silently remove the feature.

The Studio should clearly communicate that the current mode creates a production-ready prompt rather than an image.

Recommended UI treatment:

```text
Generation Mode

[ Prompt Intelligence ]   [ Image Generation ]

Image Generation
Coming soon / currently disabled
```

Alternatively, if the existing app already has an image-generation control, preserve the control but disable its action and provide an explicit status explanation.

Backend enforcement must also exist.

A client must not be able to trigger the image-generation worker simply by manipulating the UI.

The server-side job/workflow router is the authoritative gate.

---

# 16. Existing image generation should be quarantined, not deleted

The current architecture contains:

- `src/services/image-generation.ts`
- `src/app/api/regenerate-image/route.ts`
- image-generation workflow behavior
- Satori/Resvg compositing
- storage behavior for generated PNGs

Prompt-only mode must not invoke them.

Do not remove these systems in this feature branch unless the repository owner explicitly decides to decommission them.

Introduce a hard boundary:

```text
GenerationMode.prompt_only
        |
        X image-generation service
        X compositor
        X generated-posts storage
```

This makes reactivation possible later.

---

# 17. UI strategy: modify the existing 3-panel Studio

The master architecture defines the primary Studio as:

- Left: Brand / History / Gallery
- Center: Chat / Composer
- Right: Spatial Canvas / Concept Inspector

Do not create a new standalone page for Prompt Intelligence unless the existing routing architecture requires one.

## Left panel

Add a mode/history representation only where necessary.

Example:

```text
Workspace
  Brand
  History

Recent
  Prompt — LinkedIn
  Prompt — Instagram
  Campaign — ...
```

## Center panel

Keep conversation as the primary interaction.

The user should be able to say:

> “Create a premium LinkedIn visual prompt about AI automation.”

The UI should infer the task.

Platform may be selected as a lightweight control:

```text
[ Instagram ] [ LinkedIn ]
```

## Right panel

Repurpose the existing concept inspector for a prompt result inspector.

Display:

```text
Creative Direction
Post Type
Archetype
Model
Aspect Ratio
Reference Strategy
Prompt Quality
```

Then provide the final prompt as the primary copyable artifact.

---

# 18. Result UX

The result should not look like a raw LLM response.

Recommended presentation:

```text
PROMPT INTELLIGENCE

LinkedIn · Thought Leadership
Editorial / Conceptual

Recommended Model
[Model]

Aspect Ratio
[Ratio]

Reference Strategy
[Type]

────────────────────────
FINAL PROMPT

[production-ready prompt]

[ COPY PROMPT ]
[ REFINE ]

────────────────────────
WHY THIS DIRECTION

3–5 concise strategic reasons
```

Avoid exposing chain-of-thought.

Only show structured, user-useful rationale.

---

# 19. Refinement behavior

Refinement must preserve continuity.

When the user says:

> “Make it more cinematic.”

the system should not restart from raw chat history.

Instead:

```text
Existing PromptResult
      ↓
RefinementInstruction
      ↓
RefinementAgent
      ↓
Updated PromptSpecification
      ↓
Prompt Engineer
      ↓
Prompt Critic
      ↓
New version
```

Persist version history where the existing refinement schema supports it.

Do not mutate the original result in place if the existing domain model expects versioned refinement.

---

# 20. Critic strategy for Prompt Intelligence

The existing critic is based on a 100-point rubric covering brand alignment, visual hierarchy, copywriting punch and platform-native feel.

For Prompt Intelligence, introduce a prompt-specific rubric derived from the same philosophy.

Candidate dimensions:

```text
Intent Fidelity                  20
Platform Native Fit             15
Brand Alignment                 15
Visual Specificity              15
Composition Coherence           10
Model Compatibility              10
Reference Strategy               5
Constraint Clarity               5
Originality / Differentiation    5
```

Total: 100

These weights are proposed design targets, not source-established facts. Final weights should be validated during research and evaluation.

The critic should return:

```text
score
strengths[]
issues[]
requiredChanges[]
pass
```

Do not loop indefinitely.

Maximum refinement attempts should be bounded, preferably 1–2 for V1.

---

# 21. Knowledge Base strategy

The existing KB is already modular and contains:

- core doctrine
- brand-config-schema
- content-pillar-mapping
- layout-patterns
- qwen-prompt-patterns
- theme-library
- worked-examples

Extend the KB with Prompt Intelligence-specific modules rather than embedding massive instructions in agent system prompts.

Recommended:

```text
documents/kb/modules/
├── platform-strategy/
│   ├── instagram-single-image.md
│   └── linkedin-single-image.md
│
├── prompt-engineering/
│   ├── prompt-composition.md
│   ├── model-routing.md
│   ├── references.md
│   ├── negative-constraints.md
│   └── quality-checks.md
│
├── post-types/
│   ├── instagram/
│   └── linkedin/
│
└── model-profiles/
    ├── <researched-model-1>.md
    └── <researched-model-2>.md
```

Every module should have explicit metadata:

```yaml
title:
version:
platform:
contentTypes:
sourceType:
lastReviewed:
confidence:
```

The exact metadata structure should be aligned with the existing KB loader before implementation.

---

# 22. RAG discipline

The agent should never retrieve the entire KB for every request.

Use a two-stage retrieval strategy:

### Stage A — coarse retrieval

Retrieve only platform + task-level rules.

### Stage B — targeted retrieval

Retrieve:

- selected post type
- selected archetype
- selected model
- reference requirements
- brand-specific constraints

This prevents context bloat.

Retrieved knowledge should be injected as bounded context, not copied into persistent agent state.

---

# 23. Agent responsibilities — strict boundaries

## Intent Agent

Owns:

- meaning
- objective
- audience
- explicit constraints

Does not own:

- final prompt wording
- model selection

## Strategist

Owns:

- platform strategy
- post type
- visual communication strategy
- constraints

Does not own:

- final model-specific syntax

## Creative Director

Owns:

- concept
- visual metaphor
- scene direction
- creative differentiation

Does not own:

- provider-specific formatting

## Model Router

Owns:

- capability matching
- model recommendation
- fallback model

Does not own:

- creative concept

## Prompt Engineer

Owns:

- prompt construction
- provider syntax
- technical visual descriptors

Does not own:

- strategic intent

## Critic

Owns:

- evaluation
- defects
- pass/fail decision

Does not own:

- replacing the whole strategy unless explicitly asked by the workflow

---

# 24. Cost and token strategy

This is critical for Antigravity and production use.

## Never send full repository context into agents

Agents should receive only:

- relevant schema
- active brand summary
- normalized user intent
- targeted KB snippets
- current prompt specification

## Prefer structured output

Agent responses should be Zod-validated JSON where possible.

Do not ask an agent to produce JSON plus explanations plus final prose in one response.

## Keep prompts composable

Use small system prompts plus retrieved domain rules.

Do not create 5 massive system prompts containing the entire product manual.

## Avoid redundant calls

A request should not call both Strategist and Creative Director again merely because the Prompt Engineer is being refined.

Refinement should start from the persisted `PromptSpecification`.

## Cache stable knowledge

Platform/model/archetype rules change much slower than user prompts.

Cache them at the service layer where safe.

---

# 25. Code hygiene and architectural guardrails

Antigravity must operate under the following rules.

### Rule 1 — `pnpm` only

The master architecture explicitly defines pnpm as the package manager.

### Rule 2 — TypeScript strictness

No `any` unless justified and isolated.

### Rule 3 — Zod at boundaries

Validate all external and agent-generated structured data.

### Rule 4 — Thin API routes

Routes should authenticate/validate/dispatch, then delegate to domain services/workflows.

### Rule 5 — No agent logic in React

UI components render state; they do not invoke Mastra agents directly.

### Rule 6 — No direct provider calls from components

Provider interactions stay server-side.

### Rule 7 — No duplicate schemas

One canonical schema per domain entity.

### Rule 8 — No silent fallback behavior

Fallbacks must be logged with reason and selected path.

### Rule 9 — No dead imports / dead feature flags

Every flag must have a tested path.

### Rule 10 — No broad refactor while implementing the feature

Only refactor adjacent code when necessary to establish a clean domain boundary.

The master verification protocol explicitly requires zero TypeScript errors and a clean production build before release.

---

# 26. Feature flags

Introduce a server-enforced configuration model similar to:

```text
PROMPT_INTELLIGENCE_ENABLED=true
IMAGE_GENERATION_ENABLED=false
```

Rules:

- `PROMPT_INTELLIGENCE_ENABLED` gates the feature.
- `IMAGE_GENERATION_ENABLED=false` is the V1 production default.
- The backend rejects image-generation execution while disabled.
- The UI mirrors the state but is not trusted as the security boundary.

If feature flags already exist in the repository, extend them instead of inventing a second flag system.

---

# 27. Persistence model

Prompt results should be persistent enough to support history and refinement.

Recommended conceptual entity:

```text
PromptGeneration
├── id
├── workspaceId
├── brandId
├── platform
├── mode
├── userInput
├── promptSpecification
├── recommendedModel
├── finalPrompt
├── references
├── qualityScore
├── version
├── parentVersionId
├── status
├── telemetry
├── createdAt
└── updatedAt
```

Before adding a new table, inspect the existing Supabase campaign/post schemas and determine whether the current domain can represent Prompt Intelligence without damaging existing invariants.

Do not duplicate campaign storage if the existing model can cleanly support a prompt-only artifact.

---

# 28. Observability

The existing system already has workflow telemetry and logs.

Prompt Intelligence should use those same systems.

Each run should expose:

```text
workflowId
jobId
workspaceId
mode
platform
agentsExecuted
knowledgeModulesRetrieved
modelSelected
latencyPerStage
tokenUsagePerStage (when available)
retryCount
criticScore
finalStatus
errorCode
```

The user-facing telemetry drawer should show high-level steps, not hidden reasoning.

Example:

```text
✓ Understanding brief
✓ Applying LinkedIn strategy
✓ Building visual direction
✓ Selecting model
✓ Engineering prompt
✓ Quality check
```

---

# 29. Failure strategy

Failures must be classified.

```text
USER_ERROR
KNOWLEDGE_ERROR
MODEL_PROVIDER_ERROR
SCHEMA_ERROR
WORKFLOW_ERROR
CONFIGURATION_ERROR
```

A malformed model response is not the same thing as a provider outage.

Retry only transient failures.

Do not endlessly retry validation or schema failures.

If final generation fails but the reasoning artifacts exist, persist a partial diagnostic state rather than discarding everything.

---

# 30. Antigravity implementation phases

The feature must be built in phases with a verification gate after each phase.

## Phase 0 — Repository reconnaissance

Objective:

Understand actual code before editing.

Inspect:

- `AGENTS.md`
- `documents/blueprint.md`
- `documents/Sapphire_Agentic_Development_Operating_Manual.md`
- `documents/Sapphire_PRD_and_System_Context.md`
- existing Zod schemas
- Mastra agents
- campaign workflow
- chat API
- generate-post API
- Studio components
- KB loader
- telemetry

Output:

`documents/prompt-intelligence/recon.md`

Gate:

No implementation until the actual contracts are mapped.

---

## Phase 1 — Domain contract

Create the smallest possible typed/Zod contracts for:

- `GenerationMode`
- PromptOnlyRequest
- PromptSpecification
- PromptResult
- CriticResult

Gate:

`pnpm typecheck`

No UI work yet.

---

## Phase 2 — Knowledge layer

Create only the initial platform/post-type knowledge needed for:

- Instagram single image
- LinkedIn single image

Do not attempt full model coverage yet.

Gate:

Local KB loader tests + deterministic retrieval tests.

---

## Phase 3 — Prompt workflow

Implement:

```text
Intent → Strategy → Creative Direction → Model Routing → Prompt Engineering → Critic
```

Use mocked/fixed knowledge inputs where needed before connecting every external dependency.

Gate:

Workflow test with deterministic fixtures.

---

## Phase 4 — API integration

Add the prompt-only execution path to the existing API orchestration.

Do not create a competing chat system.

Gate:

End-to-end API request produces validated PromptResult.

---

## Phase 5 — Disable image generation

Implement server-side guardrails around all known generation entry points.

Verify:

- Prompt-only never calls image generation.
- Image generation cannot execute when disabled.
- UI reports disabled state accurately.

Gate:

Integration tests proving the generation provider is not reached.

---

## Phase 6 — Studio UI

Modify the existing 3-panel workspace.

Implement:

- mode indicator
- prompt input interaction
- streaming/progress state
- result inspector
- copy prompt
- refine
- history persistence

Gate:

Desktop + mobile responsive verification.

---

## Phase 7 — Refinement

Wire conversational refinement against persisted PromptSpecification.

Gate:

Three or more refinement scenarios with version integrity.

---

## Phase 8 — Evaluation harness

Create a fixture suite containing representative Instagram and LinkedIn briefs.

Evaluate:

- intent fidelity
- platform fit
- visual quality
- brand alignment
- model compatibility
- output schema validity
- critic score

Gate:

No regression against baseline fixtures.

---

## Phase 9 — Cleanup and hardening

Audit:

- unused imports
- dead code
- duplicate schemas
- unnecessary dependencies
- feature flags
- error paths
- logs
- env validation
- security boundary

Run all repository verification commands.

---

## Phase 10 — Production readiness

Required checks:

```bash
pnpm typecheck
pnpm build
pnpm lint
```

Also execute the repository's documented workflow/e2e tests.

Production release only when all gates pass.

---

# 31. Antigravity custom skills to create

Antigravity should not be given one giant generic skill.

Create focused skills.

## Skill: sapphire-recon

Purpose:

Read repository architecture/contracts before making changes.

Must output:

- relevant files
- existing contracts
- likely integration points
- risks
- files that must not be changed

## Skill: sapphire-schema-guard

Purpose:

Create/modify Zod contracts and TypeScript types without duplication or unsafe drift.

## Skill: sapphire-kb-author

Purpose:

Create/update modular KB documents with metadata and consistent structure.

## Skill: sapphire-mastra-agent

Purpose:

Create or modify a bounded Mastra agent with explicit input/output schema, retry behavior and telemetry hooks.

## Skill: sapphire-workflow-builder

Purpose:

Modify Mastra DAG/workflow orchestration without leaking UI/provider concerns into workflow logic.

## Skill: sapphire-ui-integrator

Purpose:

Modify the existing three-panel Studio while preserving design-system consistency and responsive behavior.

## Skill: sapphire-feature-gate

Purpose:

Implement server-side feature flags and prove disabled paths cannot execute.

## Skill: sapphire-verification

Purpose:

Run targeted tests, type checking, linting and build verification after each phase.

## Skill: sapphire-context-budget

Purpose:

Keep Antigravity context small by loading only files relevant to the current phase and summarizing completed work into durable implementation notes.

---

# 32. Antigravity operating protocol

Each task should follow:

```text
READ
 ↓
UNDERSTAND
 ↓
PLAN SMALL CHANGE
 ↓
IMPLEMENT
 ↓
TEST
 ↓
REVIEW DIFF
 ↓
UPDATE IMPLEMENTATION LOG
 ↓
NEXT PHASE
```

Never allow:

```text
Read half repo → modify everything → hope build passes
```

At the start of every phase, load:

1. `AGENTS.md`
2. the relevant architecture section
3. the relevant schema/module files
4. the phase-specific design note

At the end of each phase, write:

```text
documents/prompt-intelligence/progress/phase-XX.md
```

containing:

- changed files
- decisions made
- tests executed
- failures
- unresolved issues
- next-phase prerequisites

This becomes Antigravity's durable memory rather than repeatedly consuming the whole repository context.

---

# 33. What should be researched before final prompt rules are written

The implementation structure can be built first, but these content rules require evidence.

Research separately:

### Instagram

- current single-image dimensions and recommendations
- visual patterns that are native to current feeds
- text density norms
- image-first composition patterns
- brand/product/lifestyle visual conventions

### LinkedIn

- current single-image dimensions
- professional visual conventions
- native post behavior
- text/image relationship
- thought-leadership visual patterns
- data/framework visual conventions

### Image models

For each supported model:

- official prompt guidance
- reference-image support
- text rendering behavior
- negative prompt behavior
- supported aspect ratios
- model-specific prompt syntax
- known limitations

### Creative evaluation

Build a human-evaluated test set before claiming “high probability” or “best model.”

The system can optimize against a rubric, but a score only becomes meaningful after benchmark data exists.

---

# 34. Strategic end state

Sapphire should eventually be able to move between:

```text
                SAPPHIRE
                    |
          ┌─────────┴─────────┐
          |                   |
   PROMPT INTELLIGENCE   CREATIVE GENERATION
          |                   |
   model-ready prompt    actual visual asset
          |                   |
          └─────────┬─────────┘
                    |
             SAME CREATIVE DNA
```

The prompt engine therefore becomes the **front half of Sapphire's visual intelligence**, not a replacement for the existing design engine.

That separation is strategically valuable: creative reasoning can improve independently from rendering technology, and future image/video providers can be swapped without rebuilding the conceptual system.

---

# 35. Non-negotiable implementation principles

1. Use the existing Sapphire v2 architecture as the source of truth.
2. Add Prompt Intelligence as a bounded domain capability.
3. Reuse existing Brand Brain, Design Knowledge, Mastra agents, schemas, telemetry, Studio and refinement machinery.
4. Do not create a parallel application or second orchestration framework.
5. Do not delete image-generation infrastructure; quarantine it behind a server-side feature boundary.
6. Generate structured PromptSpecifications before rendering final prompt text.
7. Keep platform/model knowledge in the KB, not giant agent prompts.
8. Keep agent responsibilities narrow.
9. Keep Antigravity implementation phase-based with a verification gate after every phase.
10. Build the evaluation harness before making claims about prompt quality or model-selection probability.
