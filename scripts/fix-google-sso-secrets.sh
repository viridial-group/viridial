#!/bin/bash

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧹 Nettoyage des Secrets dans GOOGLE_SSO_SETUP.md           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Backup
echo "1️⃣  Création d'un backup..."
git branch backup-before-google-sso-clean-$(date +%Y%m%d-%H%M%S) || true
echo "   ✅ Backup créé"

# Nettoyer le commit bfd8670d
echo ""
echo "2️⃣  Nettoyage du commit bfd8670d..."

FILTER_BRANCH_SQUELCH_WARNING=1 git filter-branch --force \
  --tree-filter '
    if [ -f services/auth-service/docs/GOOGLE_SSO_SETUP.md ]; then
      sed -i.bak \
        -e "s/991109105818-lllmlebo17hs5nag6k7ep71vg246mj5f\.apps\.googleusercontent\.com/YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com/g" \
        -e "s/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/YOUR_GOOGLE_CLIENT_SECRET_HERE/g" \
        services/auth-service/docs/GOOGLE_SSO_SETUP.md 2>/dev/null || true
      rm -f services/auth-service/docs/GOOGLE_SSO_SETUP.md.bak 2>/dev/null || true
    fi
  ' \
  --prune-empty \
  --tag-name-filter cat \
  -- bfd8670d..HEAD 2>&1 | tail -10

echo ""
echo "3️⃣  Nettoyage des refs..."
git reflog expire --expire=now --all
git gc --prune=now
echo "   ✅ Refs nettoyés"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Nettoyage terminé                                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🔍 Vérification..."
if git show bfd8670d:services/auth-service/docs/GOOGLE_SSO_SETUP.md 2>/dev/null | grep -q "991109105818\|GOCSPX-cPkAA"; then
  echo "   ⚠️  Des secrets sont encore présents"
else
  echo "   ✅ Aucun secret trouvé"
fi
echo ""
echo "📋 Prochaine étape:"
echo "   git push --force-with-lease"

