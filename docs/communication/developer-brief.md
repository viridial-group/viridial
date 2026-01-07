# Developer Brief — Implementation notes & API contracts

Objectif
- Fournir aux développeurs les spécifications minimales pour implémenter les UI/UX inspirés des images/site fournis.

Frontend Tech Guidance
- Framework: React + TypeScript (suggested). Storybook for components.
- CSS: TailwindCSS or design tokens system; provide tokens JSON from design team.
- Image handling: provide `srcset` outputs, lazy loading, and `picture` element for webp fallback.

API Contracts (examples)
- Documents
  - GET /api/documents?listingId={id}&page=1
  - POST /api/documents (multipart/form-data) -> returns upload job id
  - GET /api/documents/{id}/preview -> redirects to signed URL or streams PDF
  - DELETE /api/documents/{id}

- Images
  - POST /api/images (multipart) -> returns image id, variants
  - GET /api/images/{id}?variant=webp&size=400
  - PATCH /api/images/{id} (metadata)

Performance & CDN
- Serve images via CDN. Transformations computed at upload (thumbs, webp). Provide `Cache-Control` headers.

Testing
- Unit tests for components (React Testing Library). Snapshot for cards.
- E2E: Cypress critical flows for upload/preview/share.

Accessibility
- Ensure aria labels for controls and roles; keyboard nav for filter panels.

Deliverables
- Minimal component list with props (for Storybook)
- API contract stubs (OpenAPI YAML if possible)
- README with local run steps and mock server instructions
