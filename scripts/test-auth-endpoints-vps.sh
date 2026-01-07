#!/bin/bash
# Script de test des endpoints auth-service sur VPS
# Usage: ./scripts/test-auth-endpoints-vps.sh [VPS_IP]

set -e

# IP du VPS (par défaut depuis la doc)
VPS_IP="${1:-148.230.112.148}"
BASE_URL="http://${VPS_IP}:8080"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧪 Tests des Endpoints Auth-Service sur VPS                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 VPS IP: ${VPS_IP}"
echo "🌐 Base URL: ${BASE_URL}"
echo ""

# Couleurs pour les résultats
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester un endpoint
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected_status="${5:-200}"
  
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🧪 Test: ${name}"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "   Method: ${method}"
  echo "   Endpoint: ${endpoint}"
  if [ -n "$data" ]; then
    echo "   Body: ${data}"
  fi
  echo ""
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}" || echo -e "\n000")
  else
    response=$(curl -s -w "\n%{http_code}" -X "${method}" \
      -H "Content-Type: application/json" \
      -d "${data}" \
      "${BASE_URL}${endpoint}" || echo -e "\n000")
  fi
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" = "$expected_status" ]; then
    echo -e "   ${GREEN}✅ SUCCESS${NC} (HTTP ${http_code})"
    echo "   Response:"
    echo "$body" | jq . 2>/dev/null || echo "$body" | head -20
  else
    echo -e "   ${RED}❌ FAILED${NC} (HTTP ${http_code}, expected ${expected_status})"
    echo "   Response:"
    echo "$body" | head -20
  fi
  echo ""
}

# 1. Health Check
test_endpoint "Health Check" "GET" "/auth/health" "" "200"

# 2. Test Signup (créer un nouvel utilisateur)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Test Signup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Test1234!"
echo "   Email de test: ${TEST_EMAIL}"
echo ""

test_endpoint "Signup - Nouvel utilisateur" "POST" "/auth/signup" \
  "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"confirmPassword\":\"${TEST_PASSWORD}\"}" \
  "201"

# Test signup avec email existant (devrait échouer)
test_endpoint "Signup - Email existant (devrait échouer)" "POST" "/auth/signup" \
  "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"confirmPassword\":\"${TEST_PASSWORD}\"}" \
  "409"

# Test signup avec mots de passe différents (devrait échouer)
test_endpoint "Signup - Mots de passe différents (devrait échouer)" "POST" "/auth/signup" \
  "{\"email\":\"test2-$(date +%s)@example.com\",\"password\":\"Test1234!\",\"confirmPassword\":\"Different123!\"}" \
  "400"

# Test signup avec mot de passe faible (devrait échouer)
test_endpoint "Signup - Mot de passe faible (devrait échouer)" "POST" "/auth/signup" \
  "{\"email\":\"test3-$(date +%s)@example.com\",\"password\":\"weak\",\"confirmPassword\":\"weak\"}" \
  "400"

# 3. Test Login avec le compte créé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Test Login"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}" \
  "${BASE_URL}/auth/login" || echo "")

if [ -n "$LOGIN_RESPONSE" ] && echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
  echo -e "   ${GREEN}✅ Login réussi${NC}"
  ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken' 2>/dev/null || echo "")
  REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken' 2>/dev/null || echo "")
  echo "   Access Token: ${ACCESS_TOKEN:0:50}..."
  echo "   Refresh Token: ${REFRESH_TOKEN:0:50}..."
else
  echo -e "   ${RED}❌ Login échoué${NC}"
  echo "   Response: $LOGIN_RESPONSE"
  ACCESS_TOKEN=""
  REFRESH_TOKEN=""
fi
echo ""

# 4. Test Forgot Password
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Test Forgot Password"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_endpoint "Forgot Password - Email existant" "POST" "/auth/forgot-password" \
  "{\"email\":\"${TEST_EMAIL}\"}" \
  "200"

# Test avec email inexistant (devrait retourner le même message pour sécurité)
test_endpoint "Forgot Password - Email inexistant" "POST" "/auth/forgot-password" \
  "{\"email\":\"nonexistent-$(date +%s)@example.com\"}" \
  "200"

# Note: Pour tester reset-password, il faudrait récupérer le token depuis l'email
# Pour l'instant, on teste juste que l'endpoint existe et valide le token
echo ""
echo -e "${YELLOW}⚠️  Note: Pour tester reset-password, il faut:${NC}"
echo "   1. Vérifier l'email envoyé (dans la boîte de réception)"
echo "   2. Extraire le token du lien"
echo "   3. Tester POST /auth/reset-password avec le token"
echo ""

# 5. Test Reset Password (simulation avec token invalide)
test_endpoint "Reset Password - Token invalide (devrait échouer)" "POST" "/auth/reset-password" \
  "{\"token\":\"invalid-token-12345\",\"newPassword\":\"NewPass1234!\",\"confirmPassword\":\"NewPass1234!\"}" \
  "401"

# Résumé
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  📊 Résumé des Tests                                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ Endpoints testés:"
echo "   - GET  /auth/health"
echo "   - POST /auth/signup"
echo "   - POST /auth/login"
echo "   - POST /auth/forgot-password"
echo "   - POST /auth/reset-password"
echo ""
echo "📋 Compte de test créé:"
echo "   Email: ${TEST_EMAIL}"
echo "   Password: ${TEST_PASSWORD}"
echo ""
echo "💡 Pour tester reset-password complètement:"
echo "   1. Vérifier l'email envoyé à ${TEST_EMAIL}"
echo "   2. Extraire le token du lien de réinitialisation"
echo "   3. Tester: curl -X POST ${BASE_URL}/auth/reset-password \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"token\":\"TOKEN_FROM_EMAIL\",\"newPassword\":\"NewPass1234!\",\"confirmPassword\":\"NewPass1234!\"}'"
echo ""

