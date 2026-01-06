#!/usr/bin/env bash
set -euo pipefail

MEILI_HOST=${MEILI_HOST:-http://localhost:7700}
MEILI_KEY=${MEILI_MASTER_KEY:-change-meili-key}

echo "Indexing sample properties..."
curl -s -X POST "$MEILI_HOST/indexes/properties/documents" \
  -H "Content-Type: application/json" \
  -H "X-Meili-API-Key: $MEILI_KEY" \
  --data-binary @sample-properties.json

echo "Indexed. You can search via: $MEILI_HOST/indexes/properties/search"
