# View 2 – Tier Ranking Screen

## Purpose

Ranking workspace where users drag selected DJs into tiers S–F, edit entries, and backtrack to selection. Mirrors PRD “Ranking Screen” requirements and `tier_ranking` definition in `design.json` while reflecting the provided reference layout.

## Layout Structure

- **Background**: Solid `backgroundBase` (#0B0F14). No translucent glass panels; tiers appear as matte dark bands inspired by supplied chart.
- **Split Layout**: Queue drawer + tier board.
  - Desktop: `row` split with queue fixed at 320px width left, board filling remaining space.
  - Mobile: Queue collapses into top drawer above board.
- **Spacing**: `md` gap between tiers, `lg` padding around board.

## Components

- **Header Bar**
  - Left: back button labeled “Add more DJs” returning to View 1 while preserving current selections.
  - Center: Title “Rank Your DJs”.
  - Right: optional overflow menu (future share/export placeholder).
  - Background: solid #12161F with drop shadow `glassShadow` but reduced opacity (0.25) to keep matte look.
- **Queue Drawer**
  - Title “Unplaced”.
  - Card list vertical with compact glassless cards using simple dark tiles (#1A1F28).
  - Each card shows circular portrait, name, residency tags, and drag handle icon.
  - Mobile: Drawer collapses into pill labeled “Unplaced (x)” expandable via swipe-down gesture.
- **Tier Board**
  - Horizontal rows for S, A, B, C, D, E, F stacked vertically, matching reference layout proportions.
  - Each row has left label block 88px wide, color-coded per tier:
    - S #FF6B6B
    - A #FFB572
    - B #FFE170
    - C #63E07C
    - D #7CB8FF
    - E #8790FF
    - F #F874F8
  - Row body color alternates between #141820 and #1A1F28 to echo reference dark stripes.
  - Rows support infinite horizontal growth; cards wrap to new line with `md` gaps.
- **DJ Cards (within tiers)**
  - Square ratio 1:1, matte dark tile (#1E2430) with subtle inner shadow.
  - Portrait image circular, 64px diameter, centered top; below show name, residency chips.
  - Status icons (notes, media, links) appear as small monochrome glyphs beneath name.
  - Long-press / double-click opens modal defined in `design.json`.

## Interactions

- Drag from queue to tier row; drop zone highlights row border using tier color.
- Reorder within tier through drag; ghost preview uses 80% opacity.
- Drag card back to queue to remove ranking.
- Tier labels clickable to collapse/expand row (collapsed shows count badge).
- Back button transitions to View 1 without resetting placements; local storage keeps board state.

## States

- **Empty Tier**: Display placeholder text “Drag DJs here” centered with dashed border.
- **Populated Tier**: Show cards left-aligned, wrap as needed. Tier label shows count in parenthesis.
- **Modal Open**: Board dims to 40% opacity; modal anchors center (desktop) or slides up from bottom (mobile).
- **Error Handling**: If drag-drop fails, show toast “Unable to move DJ. Try again.”

## Responsiveness

- Mobile: Tier rows stack with smaller left labels (64px width). Scroll vertically; queue drawer overlays board when expanded.
- Tablet: Two-column presentation optional (queue left, board right). Row padding increases to `lg`.
- Desktop: Board width capped at 1200px for readability; align center.

## Navigation & Persistence

- FAB bottom right “Finish Ranking” reserved for future share/export (disabled for now).
- Auto-save placements locally after each drop and modal save.
- Back navigation confirmation if there are unsaved modal edits.

## Accessibility

- Drag interactions provide keyboard support: focus card, press space to “pick up”, arrow keys move between tiers, enter to drop.
- Tier labels include aria-description summarizing level meaning (Superb → Fallback).
- Color-coded labels complemented with text to avoid reliance on color alone.

## Visual Guidance

- Maintain flat dark aesthetic; avoid blur or translucency.
- Use consistent 200ms ease transitions for hover/focus.
- Tier label typography uses Space Grotesk Bold 20pt; card text uses Inter 14pt.
