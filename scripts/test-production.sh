#!/bin/bash
# Script de test automatisé pour la production
# Usage: ./scripts/test-production.sh [DOMAIN]

set -e

DOMAIN="${1:-viridial.com}"
BASE_URL="https://${DOMAIN}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_EMAIL="test-production-${TIMESTAMP}@example.com"
TEST_PASSWORD="Test1234!"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧪 Tests de Production - Viridial                           ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Domain: ${DOMAIN}"
echo "🔗 Base URL: ${BASE_URL}"
echo "📧 Test Email: ${TEST_EMAIL}"
echo ""

# Compteurs
PASSED=0
FAILED=0
WARNINGS=0

# Fonction pour afficher les résultats
print_result() {
  local status=$1
  local message=$2
  if [ "$status" = "PASS" ]; then
    echo "   ✅ ${message}"
    ((PASSED++))
  elif [ "$status" = "FAIL" ]; then
    echo "   ❌ ${message}"
    ((FAILED++))
  elif [ "$status" = "WARN" ]; then
    echo "   ⚠️  ${message}"
    ((WARNINGS++))
  fi
}

# Test 1: HTTPS Access
echo "1️⃣  Test HTTPS Access..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}" --max-time 10)
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "301" ]; then
  print_result "PASS" "HTTPS accessible (HTTP $HTTP_CODE)"
else
  print_result "FAIL" "HTTPS non accessible (HTTP $HTTP_CODE)"
fi
echo ""

# Test 2: HTTP to HTTPS Redirect
echo "2️⃣  Test HTTP → HTTPS Redirect..."
REDIRECT_URL=$(curl -s -o /dev/null -w "%{redirect_url}" "http://${DOMAIN}" --max-time 10)
if [[ "$REDIRECT_URL" == *"https://"* ]]; then
  print_result "PASS" "Redirection HTTP → HTTPS fonctionne"
else
  print_result "WARN" "Redirection HTTP → HTTPS peut ne pas fonctionner"
fi
echo ""

# Test 3: Auth Service Health Check
echo "3️⃣  Test Auth Service Health..."
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/auth/health" --max-time 10)
if echo "$HEALTH_RESPONSE" | grep -q "ok\|status"; then
  print_result "PASS" "Auth service health check OK"
else
  print_result "FAIL" "Auth service health check failed"
  echo "      Response: $HEALTH_RESPONSE"
fi
echo ""

# Test 4: Signup
echo "4️⃣  Test Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"confirmPassword\": \"${TEST_PASSWORD}\"
  }" \
  --max-time 10)

if echo "$SIGNUP_RESPONSE" | grep -q "accessToken\|message\|success"; then
  print_result "PASS" "Signup réussi"
  # Extraire l'access token si présent
  ACCESS_TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4 || echo "")
else
  print_result "FAIL" "Signup échoué"
  echo "      Response: $SIGNUP_RESPONSE"
fi
echo ""

# Test 5: Login (si signup réussi)
if [ -n "$ACCESS_TOKEN" ] || echo "$SIGNUP_RESPONSE" | grep -q "accessToken"; then
  echo "5️⃣  Test Login..."
  LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"${TEST_EMAIL}\",
      \"password\": \"${TEST_PASSWORD}\"
    }" \
    --max-time 10)

  if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
    print_result "PASS" "Login réussi"
    ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4 || echo "")
  else
    print_result "FAIL" "Login échoué"
    echo "      Response: $LOGIN_RESPONSE"
  fi
else
  echo "5️⃣  Test Login (SKIP - signup échoué)"
  print_result "WARN" "Login non testé (signup échoué)"
fi
echo ""

# Test 6: CORS Headers
echo "6️⃣  Test CORS Headers..."
CORS_ORIGIN=$(curl -s -I -X OPTIONS "${BASE_URL}/auth/login" \
  -H "Origin: ${BASE_URL}" \
  -H "Access-Control-Request-Method: POST" \
  --max-time 10 | grep -i "access-control-allow-origin" || echo "")

if [ -n "$CORS_ORIGIN" ]; then
  print_result "PASS" "CORS headers présents"
else
  print_result "WARN" "CORS headers non détectés (peut être normal selon la configuration)"
fi
echo ""

# Test 7: Rate Limiting (tentatives échouées)
echo "7️⃣  Test Rate Limiting..."
RATE_LIMIT_TESTED=false
for i in {1..3}; do
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email": "nonexistent@example.com", "password": "wrong"}' \
    --max-time 10)
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  if [ "$HTTP_CODE" = "401" ]; then
    continue
  elif [ "$HTTP_CODE" = "429" ]; then
    print_result "PASS" "Rate limiting actif (tentative $i retourne 429)"
    RATE_LIMIT_TESTED=true
    break
  fi
  sleep 0.5
done

if [ "$RATE_LIMIT_TESTED" = false ]; then
  print_result "WARN" "Rate limiting non détecté (peut nécessiter plus de tentatives)"
fi
echo ""

# Test 8: Security Headers
echo "8️⃣  Test Security Headers..."
HEADERS=$(curl -s -I "${BASE_URL}" --max-time 10)
HAS_HSTS=false
HAS_XFRAME=false

if echo "$HEADERS" | grep -qi "strict-transport-security"; then
  HAS_HSTS=true
fi
if echo "$HEADERS" | grep -qi "x-frame-options"; then
  HAS_XFRAME=true
fi

if [ "$HAS_HSTS" = true ] && [ "$HAS_XFRAME" = true ]; then
  print_result "PASS" "Security headers présents (HSTS, X-Frame-Options)"
elif [ "$HAS_HSTS" = true ] || [ "$HAS_XFRAME" = true ]; then
  print_result "WARN" "Quelques security headers présents"
else
  print_result "WARN" "Security headers non détectés"
fi
echo ""

# Test 9: Performance (Temps de réponse)
echo "9️⃣  Test Performance..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "${BASE_URL}/auth/health" --max-time 10)
RESPONSE_TIME_MS=$(echo "$RESPONSE_TIME * 1000" | bc | cut -d'.' -f1)

if [ "$RESPONSE_TIME_MS" -lt 500 ]; then
  print_result "PASS" "Temps de réponse excellent (${RESPONSE_TIME_MS}ms)"
elif [ "$RESPONSE_TIME_MS" -lt 2000 ]; then
  print_result "PASS" "Temps de réponse acceptable (${RESPONSE_TIME_MS}ms)"
else
  print_result "WARN" "Temps de réponse élevé (${RESPONSE_TIME_MS}ms)"
fi
echo ""

# Résumé
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  📊 Résumé des Tests                                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "   ✅ Tests réussis: ${PASSED}"
echo "   ❌ Tests échoués: ${FAILED}"
echo "   ⚠️  Avertissements: ${WARNINGS}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "   🎉 Tous les tests critiques sont passés !"
  echo ""
  echo "   💡 Prochaines étapes:"
  echo "      1. Tester manuellement le flux complet d'inscription → vérification → connexion"
  echo "      2. Vérifier que les emails sont bien reçus"
  echo "      3. Consulter les logs pour détecter d'éventuels warnings"
  exit 0
else
  echo "   ⚠️  Certains tests ont échoué. Veuillez vérifier la configuration."
  exit 1
fi

