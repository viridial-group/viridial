#!/usr/bin/env bash
set -euo pipefail

# Initialize Meilisearch index and settings
MEILI_HOST=${MEILI_HOST:-http://localhost:7700}
MEILI_KEY=${MEILI_MASTER_KEY:-change-meili-key}

echo "Using Meili host: $MEILI_HOST"

curl -s -X POST "$MEILI_HOST/indexes" \
  -H "Content-Type: application/json" \
  -H "X-Meili-API-Key: $MEILI_KEY" \
  -d '{"uid":"properties","primaryKey":"id"}' || true

echo "Setting index settings (searchable / filterable / multilingual)..."
curl -s -X POST "$MEILI_HOST/indexes/properties/settings" \
  -H "Content-Type: application/json" \
  -H "X-Meili-API-Key: $MEILI_KEY" \
  -d '{
    "searchableAttributes": ["title","description","address.city","address.country"],
    "filterableAttributes": ["organization_id","agency_id","property_type","status","price"],
    "sortableAttributes": ["price"],
    "attributesForFaceting": ["property_type","status","address.country"]
  }'

echo "Done. You can index sample data with: deploy/meili-init/index-sample.sh"
