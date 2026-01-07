# Design Tokens (core)

Source: inspired by meetsponsors — neutral/light surface, strong red CTA, compact cards, soft shadows.

## Colors
- `color-primary`: #0B1220 (very dark navy) — primary text
- `color-accent`: #FF3B30 — primary CTA / accent (meetsponsors-like red)
- `color-neutral-100`: #FFFFFF
- `color-neutral-200`: #F7F7F9
- `color-neutral-300`: #F1F2F4
- `color-neutral-400`: #E6E7EA
- `color-neutral-500`: #D0D2D6
- `color-neutral-700`: #9AA0A6
- `color-success`: #05C46B
- `color-muted`: #6B7280

## Spacing (8px baseline)
- `space-xxs`: 4px
- `space-xs`: 8px
- `space-sm`: 12px
- `space-md`: 16px
- `space-lg`: 24px
- `space-xl`: 32px

## Radii
- `radius-sm`: 6px
- `radius-md`: 8px
- `radius-lg`: 12px

## Typography
- `font-family-base`: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial
- `type-h2`: 22px / 28px — semibold
- `type-h3`: 18px / 24px — semibold
- `type-body`: 14px / 20px — regular
- `type-caption`: 12px / 16px — regular

## Elevation / Shadow
- `shadow-sm`: 0 1px 2px rgba(11,18,32,0.04)
- `shadow-md`: 0 6px 12px rgba(11,18,32,0.06)

## Forms & Controls
- `control-height`: 40px
- `control-radius`: `radius-md`
- `input-border`: 1px solid `color-neutral-400`

Notes: Use semantic tokens (`color-danger`, `color-warning`) in components rather than raw hex values.

Notes: Export these tokens to Figma or JSON for dev handoff. Use semantic token names in code (`--color-accent`) rather than hex literals.
