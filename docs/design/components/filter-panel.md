# Component: FilterPanel

Inspired by meetsponsors — vertical, grouped panels with clear apply/reset and saved templates.

Purpose
- Let users narrow discovery results using structured inputs (search, selects, ranges, toggles) and saved templates.

Anatomy
- Root column (left pane)
  - Header: Tabs (`Filters` / `My templates`) and template actions
  - Sections (collapsible panels): Basic filters, Advanced filters, Statistics, Favorites
  - Controls: Search input, multi-selects, dropdowns, numeric ranges, toggles, reset button, create template CTA

Behavior
- Collapsible sections: persist open/closed state per user (local storage)
- Live preview: updates results on change when `autoApply=true`, otherwise `Apply` button visible
- Reset: clears current filters and preserves templates

Accessibility
- All controls keyboard navigable; use semantic form markup
- Labels visible; where space constrained, use `aria-label` + tooltip
- Ensure contrast on input borders and focus ring meets 4.5:1 for text

Spacing & Layout
- Section padding: `space-sm` vertical, `space-md` horizontal
- Control gap: `space-xs`

Props (for dev)
- `filters: FilterState` — current filter values
- `onChange: (FilterState) => void` — called when values change (debounced if live)
- `onReset: () => void`
- `onApply?: () => void` — optional if controlled apply flow
- `templates?: Template[]`

Examples of controls
- Search input (placeholder `Search by name or keyword`)
- `Select` for niches (multi-select chips)
- Language (dropdown)
- Range inputs for subscribers, median views (min/max numeric fields)
- Toggle `Active YouTubers` (on/off)
- Reset button (secondary) and `Create new search template` CTA (primary full width)

Example markup (simplified)
```html
<aside class="filter-panel" aria-label="Filters">
  <div class="filter-panel__tabs">
    <button class="active">Filters</button>
    <button>My templates</button>
  </div>

  <section class="filter-section">
    <label for="search">Search</label>
    <input id="search" type="search" placeholder="Search by name or keyword" />
  </section>

  <section class="filter-section">
    <label>Filter by niches</label>
    <select multiple>...</select>
  </section>

  <div class="filter-actions">
    <button class="btn--secondary" id="reset">Reset</button>
    <button class="btn--primary" id="save-template">Create new search template</button>
  </div>
</aside>
```

Notes
- Prefer progressive disclosure: keep advanced options collapsed by default. Provide clear helper text for complex numeric ranges. When many filters exist, offer `Save template` and template quick chips (top of results) for fast recall.
