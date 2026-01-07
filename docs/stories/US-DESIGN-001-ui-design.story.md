# US-DESIGN-001: UI System & Three Key Mockups

Status: Draft

Story
As a product team,
I want a coherent UI system and three annotated mockups (Listing desktop, Listing mobile, Media Kit detail),
so that development can implement accessible, consistent interfaces matching the provided visual references.

Context Source
- Designer brief: docs/communication/designer-brief.md
- Visual references: attachments (meetsponsors screenshots)

Acceptance Criteria
1. Token file created (colors, spacing, radii, typography, shadows) and committed.
2. Deliver three annotated mockups: Listing (desktop), Listing (mobile), Media Kit detail (desktop).
3. Component spec pages for `Card`, `FilterPanel`, `Tag`, `PrimaryButton` with props, states, and accessibility notes.
4. Clickable prototype showing filter interactions and card actions.
5. Accessibility checks: contrast >= 4.5:1, keyboard nav verified for lists/filters, alt text guidance included.

Dev Notes
- Use layout: 3‑pane desktop (filters / results / details), mobile one-column.
- CTA color: red accent (#FF3B30 equivalent). Ensure semantic tokens (primary, accent, neutral-100..900).
- Card: thumbnail left, meta center, actions right — border-radius 8px, subtle shadow.
- Filters: collapsible panels, grouped controls, clear apply/reset actions.
- Typography: H2 22px semi-bold, H3 18px semi-bold, body 14px, caption 12px.

Tasks / Subtasks
- [ ] Confirm priority screens with PO and PM (AC:1)
- [ ] Create tokens file (`/design/tokens.json` or Figma tokens) (AC:1)
- [ ] Design `Card` component spec (AC:3)
- [ ] Design `FilterPanel` component spec (AC:3)
- [ ] Produce Desktop Listing mockup (AC:2)
- [ ] Produce Mobile Listing mockup (AC:2)
- [ ] Produce Media Kit Detail mockup (AC:2)
- [ ] Build a simple clickable prototype (AC:4)
- [ ] Run accessibility checklist and record results (AC:5)
- [x] Design `Card` component spec (AC:3) (docs/design/components/card.md)
- [x] Design `FilterPanel` component spec (AC:3) (docs/design/components/filter-panel.md)

File List
- docs/communication/designer-brief.md (updated)
- docs/communication/designer-brief.todo.md (new)
- docs/stories/US-DESIGN-001-ui-design.story.md (this file)
- docs/design/tokens.md (new)
- docs/design/components/card.md (new)
- docs/design/components/filter-panel.md (new)
- docs/design/prototype/desktop-sample.html (new)

Change Log
- 2026-01-07: Draft created and initial tasks listed.
