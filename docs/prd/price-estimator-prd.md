# PRD: Price Estimator (US-020)

## Purpose
Provide users with an immediate automated valuation (estimate) for any listing to increase engagement, trust, and lead conversion. Start with an MVP rule-based estimator using comparables; iterate to ML.

## Success Metrics
- 20% of listing views open the estimator panel within 3 months
- CTR from estimate to contact increases by 10%
- Estimator confidence presentation reduces returns/uncertainty inquiries by 15%

## MVP Scope
- API `GET /properties/{id}/estimate`
- Rule-based estimator: select comparables within X km / 12 months, compute median price per m², apply adjustments for size, rooms, and condition.
- Return: `estimate.value`, `low`, `high`, `confidence`, `comparables[]` (id, price, m2, distance, date)
- UI: estimate panel in listing page with confidence band and link to export PDF report.
- Caching layer for estimates (Redis) and background recompute job (daily for updated comps).

## Out of MVP
- ML model predictions (post-MVP)
- Full taxonomies for property remodel impact
- Real-time streaming updates

## Data Requirements
- Source of comparables: internal listings (sold if available), public transactions, partner data.
- Fields needed: price, rooms, surface, postal_code, latitude/longitude, transaction_date, property_type, condition.
- If sold price unavailable, use listing price with lower confidence; flag data source per comparable.
- Historical price series per postal code for trend adjustments.

## Functional Design
### Comparable Selection
1. Filter by property_type and same city / postal code.
2. Prefer sold transactions in last 12 months; fallback to listings within 6 months.
3. Radius fallback: start at 500m, expand to 2km, then up to 10km.
4. Minimum N comps = 3 for a valid estimate; otherwise return `insufficient_data`.

### Estimator Rules
- Compute price_per_m2 for each comp: price / surface.
- Median of comps → base_ppm.
- Adjust base_ppm for target property: +/− % based on room count difference and condition mapping (table configurable).
- Estimate value = base_ppm_adj * surface.
- Confidence score derived from number of comps, source quality (sold > listing), and stddev.
- Return low/high as ± 1 stddev or percentile interval.

### API Contract (simplified)
```json
GET /properties/{id}/estimate
{
  "estimate": { "value": 450000, "low": 420000, "high": 480000 },
  "confidence": 0.72,
  "comparables": [ { "id": "1234", "price": 440000, "m2": 50, "distance_m": 300, "date": "2025-07-01", "source": "sold" } ]
}
```

## UX
- Panel near price: prominent estimate value, small confidence badge, "View report" button that opens details and comparables list plus export PDF.
- If insufficient data: show message "Données insuffisantes" + call to action to request a manual appraisal.

## Technical Considerations
- Implementation: backend service in Node/Java (align with infra), cache in Redis.
- Jobs: nightly recompute for all recently changed properties and stale cache keys.
- Telemetry: log estimator call volume, median confidence, user interactions (export/report clicks), and error rates.
- Security & Privacy: do not leak PII in exported reports; follow GDPR for data retention.

## MVP Validation Plan
- Manual spot-check of 200 estimates vs market comps
- Compare estimator dispersion vs known public datasets
- Collect user feedback prompt after export for quality signals

## Future Roadmap
- Replace or augment rule-based with ML regression model using more features
- Integrate partner transaction feeds to improve comp coverage
- A/B test UI language and confidence presentation

*** End PRD
