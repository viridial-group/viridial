# 3-Sprint Roadmap (Proposed)

## Assumptions
- Sprints are 3 weeks each.
- Team: 2 backend devs, 2 frontend devs, 1 QA, 1 product/PO, 1 infra/DevOps (owners are suggested).

---

## Sprint 1 — Foundation & MVP (Weeks 1–3)
Owner: Backend Lead / PO

Goals:
- Stabilize core flows, enable property management, and basic geo/search.

Planned work:
- US-007 Properties CRUD (finish editor, media upload, publish flow) — Backend/Frontend
- US-019 Geolocation core: provider adapter, caching, single geocode endpoint — Backend
- US-009 Search MVP: basic text + geo index (Meilisearch) + autocomplete — Backend/Frontend
- US-016 CI/CD + basic observability (deploy pipeline + logs) — Infra
- US-018 Backups & DR (db snapshot & restore test) — Infra/Backend

Deliverables:
- Deployable staging with publish → search flow.
- Geocode cache working and sample data imported.

---

## Sprint 2 — Search & Consumer features (Weeks 4–6)
Owner: Frontend Lead / Data

Goals:
- Improve discovery experience and add estimator PoC.

Planned work:
- US-009 Geo search enhancements: radius, distance sort, map clustering — Backend/Frontend
- US-020 Price Estimator (MVP rule-based) — Data/Backend + UI panel (read-only)
- US-021 Neighborhood Insights (basic provider integration & UI) — Backend/Frontend
- US-010 SEO improvements: JSON-LD and server rendered meta for listing pages — Backend
- Image optimization pipeline (upload resizing & WebP) — Backend/Infra

Deliverables:
- Price estimate visible on sample listings; geo search richer UX; SEO-ready listing pages.

---

## Sprint 3 — Monetization & Pro tooling (Weeks 7–9)
Owner: Product / Growth

Goals:
- Launch monetization loops and lead flows for agents.

Planned work:
- US-023 Listing Promotions (campaign UI, Stripe integration) — Backend/Frontend
- US-024 Lead Scoring & CRM Sync (basic scoring rules + HubSpot connector) — Backend
- US-022 Virtual Tours PoC (viewer + ingestion) — Frontend/Backend
- US-025 Agent Marketplace (v1 listing + onboarding) — Frontend/Backend
- Polish moderation/workflows and compliance (GDPR + CMP) — Backend/Product

Deliverables:
- Campaigns purchasable in sandbox; leads flow into sample CRM; marketplace listing browse.

---

## Notes & Risks
- Price estimator accuracy depends on data quality; plan for tuning and A/B before public trust.
- Geo provider quotas must be monitored; ensure caching and batch processing for imports.
- Monetization requires legal and billing reviews (tax/VAT). Plan for stubbed billing in sprint 3.

## Next steps
- Assign owners to each task and create detailed sprint backlog with story points.
- Start data work to collect comps and open data sources for neighborhood insights.

*** End Roadmap
