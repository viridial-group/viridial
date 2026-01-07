#!/bin/bash

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  👤 Création Utilisateur de Test                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Variables par défaut
EMAIL="${AUTH_TEST_EMAIL:-user@example.com}"
PASSWORD="${AUTH_TEST_PASSWORD:-Passw0rd!}"
ROLE="${AUTH_TEST_ROLE:-admin}"

echo "📧 Email: ${EMAIL}"
echo "🔑 Password: ${PASSWORD}"
echo "👤 Role: ${ROLE}"
echo ""

# Générer le hash bcrypt
echo "1️⃣  Génération du hash bcrypt..."

# Méthode 1: Utiliser le conteneur auth-service s'il a bcrypt installé
HASH=$(docker exec viridial-auth-service node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('${PASSWORD}', 10));" 2>/dev/null || echo "")

# Méthode 2: Utiliser le script Node.js local si disponible
if [ -z "$HASH" ] && [ -f "$(dirname "$0")/generate-hash.js" ]; then
  HASH=$(cd "$(dirname "$0")" && node generate-hash.js "${PASSWORD}" 2>/dev/null || echo "")
fi

# Méthode 3: Demander à l'utilisateur de générer manuellement
if [ -z "$HASH" ]; then
  echo "   ⚠️  Impossible de générer le hash automatiquement"
  echo "   → Génère le hash manuellement:"
  echo ""
  echo "   Depuis ton Mac:"
  echo "   cd services/auth-service"
  echo "   node -e \"const bcrypt = require('bcrypt'); bcrypt.hash('${PASSWORD}', 10).then(h => console.log(h));\""
  echo ""
  read -p "   Colle le hash généré ici: " HASH
fi

if [ -z "$HASH" ]; then
  echo "   ❌ Hash vide, arrêt"
  exit 1
fi

echo "   ✅ Hash généré: ${HASH:0:20}..."
echo ""

# Vérifier que Postgres est accessible
echo "2️⃣  Vérification connexion Postgres..."
if ! docker exec viridial-postgres pg_isready -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" >/dev/null 2>&1; then
  echo "   ❌ Postgres n'est pas accessible"
  exit 1
fi
echo "   ✅ Postgres accessible"
echo ""

# Créer la table si elle n'existe pas
echo "3️⃣  Initialisation de la table users..."
docker exec -i viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" < "$(dirname "$0")/init-auth-db.sql" 2>/dev/null || echo "   ⚠️  Table peut-être déjà créée"
echo "   ✅ Table initialisée"
echo ""

# Insérer l'utilisateur
echo "4️⃣  Insertion de l'utilisateur..."
SQL="INSERT INTO users (email, password_hash, role, is_active) 
VALUES ('${EMAIL}', '${HASH}', '${ROLE}', true)
ON CONFLICT (email) 
DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = now();"

if docker exec -i viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" -c "$SQL" >/dev/null 2>&1; then
  echo "   ✅ Utilisateur créé/mis à jour"
else
  echo "   ❌ Erreur lors de l'insertion"
  exit 1
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Utilisateur créé avec succès                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Informations de connexion:"
echo "   Email: ${EMAIL}"
echo "   Password: ${PASSWORD}"
echo ""
echo "🧪 Test avec Postman:"
echo "   POST http://VOTRE_IP:8080/auth/login"
echo "   Body: { \"email\": \"${EMAIL}\", \"password\": \"${PASSWORD}\" }"
echo ""

