# Designer Brief — Inspiration: provided site & images

Objectif
- Fournir des directives claires pour créer les maquettes UI/UX basées sur les images et le site fournis en pièces jointes.

Contexte
- Référence visuelle: site "meetsponsors" (pièces jointes). Principes: layout en panneaux, filtres à gauche, résultat central/droite, cartes compactes, typos larges et boutons d'action rouge vif.

Directives principales
- Grid & Layout: utiliser un layout 3‑volets pour les vues listées (filtres / résultats / détails). Prévoir version mobile en one‑column.
- Palette: neutre/light — accents en rouge (#FF3B30 ou équivalent) pour CTA; nuances de gris pour surfaces et separators.
- Cards: image thumbnail gauche, meta (title, tags) + actions (favoris, share). Utiliser border radius 8px et subtle shadow.
- Filters: collapsible panels, inputs propres, boutons d'action primaires arrondis.
- Typography: titres semi‑bold 18–22px, body 14px, labels 12px.
- Accessibility: alt text obligatoire, contrast ratios >= 4.5:1, keyboard nav pour lists/filters.

Deliverables
- 3 maquettes: Listing (desktop), Listing (mobile), Media Kit detail (desktop)
- Tokens: couleur, spacing, radii, typographie
- A short spec page for each component (props/state) to hand to devs

Notes
- Regardez les images fournies pour le comportement des filtres (templates), badges tags et previews PDF/Media.

## Designer Profile

- **Name / Role:** Lead Product Designer — provides visual direction, interaction patterns and handoff-ready specs.
- **Style & Strengths:** Systems-first, component-driven, accessible-by-default. Favors clear hierarchy, compact cards, and strong CTA affordances.
- **Working conventions:** deliver tokens first (colors, spacing, radii, typography), then annotated mocks, then a lightweight interactive prototype. All artifacts include accessibility notes and implementation props.

## Design Kickoff Plan (quick start)

1. Align: confirm target screens & priority (Listing desktop, Listing mobile, Media Kit detail).
2. Tokens: define color, spacing, radii, typography, shadows.
3. Components: card, filter panel, tags, CTAs, header, mobile navigation.
4. Mocks: desktop listing → mobile listing → media kit detail (annotated).
5. Prototype & A11y: basic clickable prototype + contrast/keyboard checks.
6. Handoff: spec page for each component (props/state), assets, and code-ready tokens.

### Quick Acceptance Criteria (design)
- Three annotated mocks delivered (desktop listing, mobile listing, media kit detail).
- Token set (colors, spacing, radii, typography) exported in a single file.
- Component spec pages for `Card`, `FilterPanel`, `Tag`, `PrimaryButton` with props and accessibility notes.
- Simple clickable prototype (Figma/HTML) demonstrating filter interactions and card actions.

### Next steps
- I'll create a short todo checklist and a draft story to track design implementation and handoff.
