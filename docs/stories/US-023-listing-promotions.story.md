# US-023: Listing Promotions (Monetization)

## Status: Draft

### Story
En tant qu'annonceur, je veux promouvoir mes annonces (boost, featured) contre paiement et recevoir des métriques de performance.

### Acceptance Criteria
- Campaign creation UI: budget, duration, target (geo, property type), creatives.
- Payment integration (Stripe) + invoices in org billing.
- Analytics dashboard with impressions, clicks, CTR, leads.
- Campaign capping and reporting; admin tools to refund/waive.

**Priority:** High (P0)
**Estimation:** 8

### Tasks
- [ ] Campaign model, billing hooks, Stripe integration
- [ ] UI: campaign creation & management
- [ ] Ads delivery & ranking adjustment in search/listings
- [ ] Analytics pipeline & dashboard
- [ ] Tests: billing flows, campaign lifecycle
