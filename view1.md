# View 1 – DJ Selection Screen

## Purpose

Primary onboarding surface where users discover and flag DJs for ranking. Aligns with PRD core flow “Launch → Selection Screen” and the `select_djs` screen definition in `design.json`.

## Layout Structure

- **Background**: `backgroundBase` (#0B0F14) full bleed, subtle vignette allowed. Vertical scroll.
- **Safe Area Padding**: `lg` on mobile, `xl` on tablet and desktop.
- **Stack Order**: Header → Search and Filters → DJ Grid → Bottom Sticky Bar.
- **Sticky Elements**: Header collapses to 64px on scroll, search bar remains docked beneath it.

## Components

- **Header (glass variant)**
  - Title: “Select Your Favorite DJs”.
  - Subtitle: “Browse and add DJs to build your ranking list”.
  - Right action: `iconButton` with `help_circle` icon and tooltip “How ranking works”.
- **Search & Filter Band**
  - Search bar width: 100%, pill radius 24px, placeholder “Search DJs by name or genre”.
  - Voice icon button on the right (decorative for V1).
  - Filter chip carousel below search with options seeded from residency and genre metadata.
  - Active chip state uses `accentPrimary` fill and `textPrimary` label.
- **DJ Grid**
  - Responsive columns: 2 (mobile ≤ 414px), 3 (tablet), 4 (desktop).
  - Card ratio 3:4 portrait with circular mask applied to top 80% to echo the SoundCloud reference while retaining straight card edges.
  - Card content: artist image, name, residency badge (text chip), optional genre tags.
  - Add toggle button anchored bottom center, label toggles between “Add” and “Added”. Selected state uses `accentSecondary` background.
  - Added state also displays a small `success` pulse on image border.
- **Bottom Sticky Bar**
  - Left text: `Selected: {count}`.
  - Primary button: “Start Ranking”, disabled until at least one DJ selected.
  - Bar uses `glassPanel` backdrop with blur effect defined by `glassBlur` token.

## States

- **Default**: Full catalog sorted alphabetically by residency prominence (Vegas, LA, NYC).
- **Search Active**: Results update live; empty state shows illustration and message “No DJs match your search. Try another name or adjust filters.” with CTA “Clear filters”.
- **Selected Card**: Toggle in active state, card glow border transitions with 200ms ease-in-out.
- **Loading**: Skeleton shimmer blocks for cards (image circle and two text lines), search disabled until data ready.

## Interactions

- Tap card toggle or drag downward to reveal quick actions (mobile). Desktop supports click.
- Long press (≥350ms) enters multi-select to add several DJs before releasing.
- Chip selection filters instantly; multiple chips allowed with AND logic.
- “Start Ranking” routes to View 2 (`tier_ranking`) carrying selected DJ IDs.
- Top left back chevron (system-provided) dismisses to splash when available.

## Responsiveness

- Mobile: Header occupies 96px max height before collapse; bottom bar rises above system home indicator with extra `sm` padding.
- Tablet: Introduce two-column filter chips and increased grid gutters (`md`).
- Desktop: Header content left-aligned with supporting hero image slot optional on right (placeholder gradient referencing Figma inspiration).

## Accessibility

- Search input labeled, supports voice dictation button with accessible name “Voice search (coming soon)”.
- Chips are toggle buttons with aria-pressed state.
- Card toggle reachable via keyboard tab order; space/enter activates selection.
- Contrast: text over images uses gradient overlay to maintain WCAG AA.

## Data & Content

- Catalog seeded with ≥100 DJs prioritized for Las Vegas, Los Angeles, New York residencies, including Tiësto, Zedd, Diplo, Alesso, The Chainsmokers, Peggy Gou, Black Coffee, HoneyLuv, MK, Fisher.
- Each entry requires high-resolution portrait (minimum 600×800px), residency tags, genre tags, streaming badges.

## Feedback & Guidance

- On first visit, tooltips explain search and filters.
- Microcopy near button: “Add at least one DJ to start ranking.”
- Error alerts (e.g., network failure) appear as toast with `error` color and retry option.
