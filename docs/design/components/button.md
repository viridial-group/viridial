# Component: Button

Comprehensive Button spec covering: Light Buttons, Default Buttons, Outline Buttons, Disabled state (including anchor tags), Icon Buttons (sizes), and Social Buttons.

Tokens
- Uses tokens from `docs/design/tokens.css` (semantic colors: `--color-accent`, `--color-secondary`, `--color-success`, `--color-danger`, `--color-warning`, `--color-info`, `--color-purple`, `--color-teal`, `--color-orange`).

Anatomy
- Label (text) — required
- Icon (optional) — placed before or after label
- Container — clickable element (`button` or `a[role="button"]`)

Behavior & Accessibility
- Use native `<button>` where possible. For anchors, include `role="button"` and `aria-disabled="true"` when disabled.
- Focus order: visible focus ring (use `--color-accent` or `--color-secondary`).
- Disabled: `disabled` attribute for `<button>`; for anchors set `aria-disabled="true"` and prevent default click in JS.

Variants

1) Light Buttons
- Background: `--color-neutral-100` or transparent
- Border: `1px solid var(--color-neutral-400)`
- Text: `--color-primary`
- Use for subtle in-toolbar controls, tags, secondary actions.

2) Default / Primary Buttons
- Primary: `btn--primary` uses `--color-accent` background + white text
- Secondary: `btn--secondary` uses `--color-secondary` background + white text
- Success / Danger / Warning / Info map to respective semantic colors

3) Outline Buttons
- Transparent background, 1px solid semantic color (e.g., `--color-accent`), text color same as border.
- Hover: fill with 8% overlay of border color.

4) Disabled state (buttons and anchors)
- Buttons: `disabled` attribute, reduced opacity (0.5), `cursor: not-allowed`.
- Anchors: `aria-disabled="true"`, add `.is-disabled` class; ensure keyboard events are ignored.

5) Icon Buttons
- Icon only: circular, centered icon. Sizes:
  - `sm`: 32px
  - `md`: 40px (default)
  - `lg`: 48px
- Icons should be semantic `svg` with `aria-hidden="true"` and surrounding `button` has accessible `aria-label`.

6) Social Buttons
- Preset brand backgrounds with white text; include `btn--social--facebook`, `btn--social--twitter`, `btn--social--linkedin`.
- Also support `btn--social--ghost` (white background + colored icon + border).

Usage examples (HTML)
```html
<!-- Default primary -->
<button class="btn btn--default btn--md">Get started</button>

<!-- Outline danger -->
<button class="btn btn--outline btn--danger btn--md">Delete</button>

<!-- Disabled anchor -->
<a href="#" class="btn btn--default" role="button" aria-disabled="true">Disabled link</a>

<!-- Icon button -->
<button class="btn btn--icon btn--md" aria-label="Close">
  <!-- svg icon here -->
</button>

<!-- Social -->
<button class="btn btn--social--facebook btn--md">Share</button>
```

Design notes
- Keep buttons to a small set of semantic roles — `primary`, `secondary`, `danger`, `success`, `warning`, `info`.
- Prefer solid primary buttons for critical CTAs and outline/light for secondary actions.
- Ensure high touch targets on mobile: minimum 44x44px for tappable buttons.

Developer notes
- Import `docs/design/tokens.css` in global styles and use classes described in `tokens.css` (e.g., `.btn--outline`).
- For React/Vue, create a `Button` component that maps props (`variant`, `size`, `icon`, `as='a'|'button'`) to classes and handles disabled semantics.
