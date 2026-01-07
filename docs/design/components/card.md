# Component: Card

Inspired by meetsponsors — compact, information-dense, actionable.

Purpose
- Present creator/media/sponsor entries in list/grid with thumbnail, key metadata and quick actions (favorite, share, details).

Anatomy
- Container (card)
  - Thumbnail (left) — 72x72 / 56x56 on compact rows
  - Meta block (center) — Title (H3), subtitle/tags, short description
  - Actions (right) — Favorite (heart), Quick menu (ellipsis), more (chevron)

States
- default: subtle shadow (`shadow-sm`), 1px border `color-neutral-400`
- hovered: lift to `shadow-md`, border accent subtle
- selected: left accent bar 4px `color-accent` or soft highlight

Spacing & Layout
- Padding: `space-md` (16px)
- Gap between thumbnail and meta: `space-sm` (12px)

Accessibility
- Thumbnail: `alt` required, fallback aria-label on container if image missing
- Focusable actions: all controls keyboard-focusable with visible outline (2px `color-accent` ring)
- Read order: Title -> Subtitle/Tags -> Description -> Actions

Props (for dev)
- `title: string` — required
- `subtitle?: string`
- `tags?: string[]`
- `thumbnailUrl?: string`
- `description?: string`
- `favorited?: boolean`
- `onFavoriteToggle?: (id) => void`
- `onOpenDetails?: (id) => void`

Example markup
```html
<article class="card" role="article" tabindex="0">
  <img src="..." alt="Creator avatar" class="card__thumb"/>
  <div class="card__meta">
    <h3 class="card__title">Benjamin Code</h3>
    <div class="card__tags">Software Development • FR</div>
    <p class="card__desc">Short description or metrics summary.</p>
  </div>
  <div class="card__actions">
    <button aria-label="favorite">♡</button>
    <button aria-label="share">⤴</button>
  </div>
</article>
```

Notes
- Use `aria-pressed` for favorite toggle; persist state server-side. Keep card compact for dense lists, but allow large variant for media-kit detail views.
