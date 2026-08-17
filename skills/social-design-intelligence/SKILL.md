---
name: social-design-intelligence
description: Human-level graphic design intelligence for social media post composition. Codifies 5 visual design archetypes, typography pairing formulas, negative space budgeting, and Satori JSX layout rules for Canva-grade post generation.
---

# Social Design Intelligence Skill

This skill defines the operational visual design standards for generating Canva-quality, high-converting social media posts (1080×1350 Instagram 4:5 vertical portrait and 1080×1080 square).

---

## 1. The 5 Core Visual Design Archetypes

Every social media post must be classified into one of these 5 archetypes:

### Archetype 1: `editorial_magazine`
- **Aesthetic:** High-end culinary, hospitality, luxury lifestyle, and cafe editorial aesthetics.
- **Photography:** Shallow depth-of-field, warm ambient side-lighting, creamy background bokeh.
- **Typography Pairing:**
  - Accent Words (Italic Serif / Script): `Playfair Display Italic` or `Cormorant Garamond` (48–56px)
  - Heavy Display Words (Ultra-Bold Sans): `Plus Jakarta Sans ExtraBold` or `Inter Bold` (64–72px)
  - Subtext: Clean sans (22–26px) with generous line-height (`1.4`)
- **Spatial Rule:** Upper 40% reserved as uncluttered darker/ambient negative space for headline typography.

### Archetype 2: `conceptual_split`
- **Aesthetic:** B2B strategy, creator insights, thought leadership, marketing advice.
- **Photography:** High-concept visual metaphor on clean off-white / light studio backdrop anchored to the left 50%.
- **Typography Pairing:**
  - Modern Grotesk Sans (`Inter` / `Plus Jakarta Sans`)
  - Two-Tone Keyword Highlight: Black primary copy (`#141413`) + vibrant brand accent highlight (`#0052FF` or `#D97757`).
  - Slide CTA: Bottom-right navigation pill (`➔`).
- **Spatial Rule:** Asymmetric 50/50 — Subject on left 50%, vertical text column on right 50%.

### Archetype 3: `comparison_split`
- **Aesthetic:** Transformations, feature showdowns, SEO results, Before vs. After.
- **Photography:** Dual contrasting subjects split down the vertical center line (e.g., slow tortoise vs. sprinting ninja).
- **Chrome & Badges:**
  - Dual pill badges at top of each column (e.g., neutral gray `Business` vs. active blue `Business`).
  - Comparative headlines (`Without [X]` vs. `With [X]`).
  - Bottom summary anchor with brand domain.
- **Spatial Rule:** Precise 50/50 vertical division with a subtle 1px center divider.

### Archetype 4: `vintage_poster`
- **Aesthetic:** Neo-vintage organic, clean food, craft beverages, sustainable goods, heritage brands.
- **Photography:** Top-down or 45-degree clean studio shot on warm cream canvas (`#FAF7EE`).
- **Typography & Vectors:**
  - Display Title: Heavy compressed display sans in deep forest green or espresso (`#1E4D2B` / `#2B160E`).
  - Subtitle: Cursive retro script flanked by horizontal speed lines (`≡`) or circles (`⚯`).
  - Decorative Stamps: `EST [Year]` pill stamp, starbursts (`✻`), corner club tags (`REAL FOOD CLUB`).
- **Spatial Rule:** Central isolated subject with balanced corner stamps.

### Archetype 5: `saas_dotgrid`
- **Aesthetic:** SaaS feature drops, sales workflows, tech productivity, developer tools.
- **Photography / Asset:** Layered 3D document card stack or app UI cards with soft ambient drop shadows.
- **Background Texture:** Micro dot-grid matrix on light tint (`#F8F9FD`).
- **UI Micro-Chrome:**
  - Top-Left: Brand name capsule.
  - Top-Right: Minimalist pill arrow button (`(→)`).
  - Bottom-Left: Category capsule (`SALES TOOLS`).
  - Bottom-Right: Carousel index badge (`01/05`).
- **Spatial Rule:** Text left-aligned in top half, card stack overlapping bottom-right.

---

## 2. Negative Space Budgeting Rules

When prompting AI image models (Cloudflare FLUX 1 Schnell / Pollinations), **never fill the entire canvas edge-to-edge**. Always condition the image with explicit spatial constraints:
1. `editorial_magazine`: *"Subject positioned in lower-center third, leaving upper 40% clean and uncluttered with dark ambient bokeh for typography."*
2. `conceptual_split`: *"Subject placed strictly on the left 50% on a clean seamless off-white backdrop, leaving the right 50% completely empty for text."*
3. `comparison_split`: *"Split composition with two contrasting subjects on left and right halves on neutral seamless background."*
4. `vintage_poster`: *"Top-down product shot centered with generous 150px clean cream borders on all sides."*
5. `saas_dotgrid`: *"Product UI cards angled in the bottom-right quadrant with clean open space on the top-left."*

---

## 3. Typography & Scrim Architecture

1. **Contrast Gradient Scrims:** Always place a directional gradient between the photo and typography (`rgba(20,10,5,0.65)` to `transparent`) so text is 100% readable over any photo.
2. **Font Hierarchy:**
   - Display Hook: 48–72px, `fontWeight: 700`
   - Subheadline / Body: 22–28px, `fontWeight: 500-600`
   - Micro-Chrome (Pills, Handles, Pagination): 14–18px, `fontWeight: 700`, uppercase, `letterSpacing: 2px`
3. **Brand Palette Application:** Always integrate the brand's primary accent (e.g. `#D97757` terracotta) into CTA buttons and category pills.
