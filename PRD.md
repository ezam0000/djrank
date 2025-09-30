# DJRank PRD

## Overview

Mobile-first interactive web application that lets users drag-and-drop DJs into performance tiers and annotate their choices. Experience must honor a liquid glass dark-mode aesthetic based on the shared Figma inspiration.

## Objectives

1. Enable quick discovery and selection of DJs with rich visuals and metadata.
2. Allow intuitive tier ranking with drag-and-drop interactions across tiers S–F.
3. Capture user reasoning, supplementary media, and music links per DJ via a modal.
4. Ensure parity across mobile and desktop with emphasis on one-handed mobile use.

## Success Metrics

- Time to first ranked DJ ≤ 60 seconds for new users.
- ≥ 90% of testers complete a full tier list (at least one DJ in each tier) without assistance.
- Modal submission errors < 2% across supported media types.
- All interactive elements pass manual WCAG 2.1 AA color contrast checks in dark mode.

## Primary Personas

- **Club Enthusiast**: Builds tier lists for social sharing. Needs recognizable visuals and quick filtering.
- **Event Promoter**: Evaluates lineups. Requires high information density and exportable reasoning.

## Core User Stories

- As a user, I search and pick DJs from a master list with images to start ranking.
- As a user, I drag a DJ card into a tier lane to assign a ranking.
- As a user, I tap a ranked DJ to explain my placement, attach media, and add streaming links.
- As a user, I revisit tiers to reorder or remove DJs.

## User Flows

1. **Launch → Selection Screen**
   - Onboarding tooltip highlights search input and filter chips.
   - User scrolls the DJ grid, taps a card to flag for ranking (card shows “Added” state) and optional multi-select.
2. **Selection → Ranking Screen**
   - CTA “Start Ranking” moves user to tier graph with selected DJs queued.
   - Queue sits left (desktop) or collapsible drawer (mobile).
3. **Ranking Interaction**
   - Drag from queue into tier lane; placement snap points ensure even spacing.
   - Long-press (mobile) or double-click (desktop) opens modal for details.
4. **Modal Interaction**
   - Modal slides up (mobile) or centers (desktop).
   - Inputs: free-text rationale, image upload, video upload, link fields for Spotify, Apple Music, SoundCloud.
   - Save closes modal and updates DJ card with status icon.
5. **Review & Sharing (future phase)**
   - Deferred; note for backlog.

## Functional Requirements

### DJ Catalog

- Populate master list with ≥ 100 DJs focused on Las Vegas, Los Angeles, New York scenes.
- Each listing: artist name, portrait image URL, genres, residency tags, streaming badges.
- Provide search (name/genre) and filter chips (location, genre, residency).

### Selection Screen

- Display DJs in masonry or responsive grid with glass cards, portrait, name, labels, add toggle.
- Persistent search bar with voice input icon (non-functional placeholder allowed for V1).
- Filter drawer with chips; chips show active state.
- Selected count badge and “Start Ranking” CTA fixed bottom (mobile) / top-right (desktop).

### Ranking Screen

- Tier graph layout with horizontal rows labelled S–F, brightest glass panel for S tier descending to subtle opacity for F.
- Queue of unplaced DJs accessible via drawer/list.
- Drag-and-drop with touch support, reorder within tier, move between tiers, remove (drag back to queue or tap remove).
- Tier rows auto-expand height to accommodate cards; maintain minimum card spacing.

### DJ Card

- Displays portrait, name, residency tags, streaming icons, and modal access action.
- Status indicators: plain (no notes), note icon (text added), media icon (media attached), external-link icon (links added).

### Modal

- Fields: text area (minimum 280 characters capacity), optional image upload (1 file, 5 MB limit, preview), optional video upload (1 file, 50 MB limit or URL fallback), text fields for Spotify, Apple Music, SoundCloud URLs (validate format), optional tags.
- Actions: Save, Cancel, Delete Entry (if data exists).
- Show upload progress and error messaging inline.

## Non-Functional Requirements

- Responsive from 360px wide mobile up to 1440px desktop.
- Client-side data persistence via local storage for unsaved changes.
- Accessibility: keyboard navigation for drag (arrow + enter), ARIA roles, focus outlining.
- Performance: initial load under 3 seconds on 4G for optimized asset sizes.

## Content Requirements

- Example DJ list must include mainstream Vegas/LA/NYC performers (e.g., Tiësto, Zedd, Diplo) plus diverse emerging artists.
- Provide default placeholder media for testing.

## Visual & Motion Guidelines

- Dark glassmorphism palette using #0B0F14 base, glass panels with blur/radiant borders inspired by referenced Figma.
- Gradients use subtle blues/purples, no neon.
- Typography: sans-serif pairing (e.g., Inter for body, Space Grotesk for headings).
- Motion: 200ms ease-in-out for drags, 250ms fade/scale for modal.

## Risks & Assumptions

- Assumes art assets and streaming links supplied prior to content seeding.
- Drag-and-drop libraries must support touch and pointer events uniformly.
- Video uploads stored client-side or via later integrations (out of scope for MVP).

## Open Questions

- Should there be social sharing/export in this release?
- Preferred hosting for uploaded media?
- Are there licensing constraints for artist imagery?
