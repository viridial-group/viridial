#!/bin/bash

# Script pour insérer des données de test dans la base de données Viridial
# Usage: ./scripts/insert-test-data.sh

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📝 Insertion des données de test - Viridial                ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier que Docker est en cours d'exécution
if ! docker info >/dev/null 2>&1; then
  echo -e "${RED}❌ Docker n'est pas démarré.${NC}"
  exit 1
fi

# Charger les variables d'environnement
cd infrastructure/docker-compose
if [ -f ".env" ]; then
  set -a
  source .env
  set +a
fi

# Vérifier que Postgres est accessible
echo -e "${BLUE}🔍 Vérification de Postgres...${NC}"
if ! docker exec viridial-postgres pg_isready -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" >/dev/null 2>&1; then
  echo -e "${RED}❌ Postgres n'est pas accessible. Veuillez démarrer les services d'abord:${NC}"
  echo -e "   ${BLUE}./scripts/start-local-services.sh${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Postgres accessible${NC}"

# Récupérer l'ID du premier utilisateur (ou créer un utilisateur de test)
echo ""
echo -e "${BLUE}👤 Récupération/Création d'un utilisateur de test...${NC}"
USER_EMAIL="${AUTH_TEST_EMAIL:-test@viridial.com}"

# Vérifier si l'utilisateur existe
USER_ID=$(docker exec viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" -t -c "SELECT id FROM users WHERE email = '${USER_EMAIL}' LIMIT 1;" 2>/dev/null | xargs || echo "")

if [ -z "$USER_ID" ]; then
  echo -e "${YELLOW}⚠️  Utilisateur ${USER_EMAIL} n'existe pas. Création en cours...${NC}"
  if [ -f "create-test-user.sh" ]; then
    AUTH_TEST_EMAIL="${USER_EMAIL}" AUTH_TEST_PASSWORD="    " ./create-test-user.sh >/dev/null 2>&1
    USER_ID=$(docker exec viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" -t -c "SELECT id FROM users WHERE email = '${USER_EMAIL}' LIMIT 1;" 2>/dev/null | xargs)
  else
    echo -e "${RED}❌ Impossible de créer l'utilisateur. Script create-test-user.sh introuvable.${NC}"
    exit 1
  fi
fi

if [ -z "$USER_ID" ]; then
  echo -e "${RED}❌ Impossible de récupérer/créer l'utilisateur.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Utilisateur trouvé: ${USER_ID}${NC}"

# Initialiser les tables Property si elles n'existent pas
echo ""
echo -e "${BLUE}🗄️  Initialisation des tables Property...${NC}"
if [ -f "../../services/property-service/src/migrations/create-properties-tables.sql" ]; then
  docker exec -i viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" < ../../services/property-service/src/migrations/create-properties-tables.sql 2>/dev/null || echo -e "${YELLOW}⚠️  Tables Property peut-être déjà initialisées${NC}"
  echo -e "${GREEN}✅ Tables Property initialisées${NC}"
else
  echo -e "${YELLOW}⚠️  Fichier de migration non trouvé. Les tables doivent être créées manuellement.${NC}"
fi

# Créer un fichier SQL temporaire avec les données de test
echo ""
echo -e "${BLUE}📝 Génération des données de test...${NC}"

SQL_FILE=$(mktemp)
cat > "$SQL_FILE" << EOF
-- Supprimer les propriétés existantes pour cet utilisateur (optionnel)
-- DELETE FROM property_translations WHERE property_id IN (SELECT id FROM properties WHERE user_id = '${USER_ID}');
-- DELETE FROM properties WHERE user_id = '${USER_ID}';

-- Insertion des propriétés de test (25 propriétés détaillées)
INSERT INTO properties (id, user_id, status, type, price, currency, latitude, longitude, street, postal_code, city, region, country, media_urls, created_at, updated_at, published_at) VALUES
-- Propriété 1: Appartement luxueux à Paris
(gen_random_uuid(), '${USER_ID}', 'listed', 'apartment', 850000, 'EUR', 48.8566, 2.3522, '10 Rue de Rivoli', '75001', 'Paris', 'Île-de-France', 'France', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 2: Maison familiale à Lyon
(gen_random_uuid(), '${USER_ID}', 'listed', 'house', 520000, 'EUR', 45.7640, 4.8357, '45 Rue de la République', '69002', 'Lyon', 'Auvergne-Rhône-Alpes', 'France', '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 3: Villa de prestige à Nice
(gen_random_uuid(), '${USER_ID}', 'listed', 'villa', 1850000, 'EUR', 43.7102, 7.2620, '15 Promenade des Anglais', '06000', 'Nice', 'Provence-Alpes-Côte d''Azur', 'France', '["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 4: Terrain constructible à Bordeaux
(gen_random_uuid(), '${USER_ID}', 'listed', 'land', 250000, 'EUR', 44.8378, -0.5792, '50 Cours de la Libération', '33000', 'Bordeaux', 'Nouvelle-Aquitaine', 'France', '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 5: Appartement à Marseille
(gen_random_uuid(), '${USER_ID}', 'draft', 'apartment', 380000, 'EUR', 43.2965, 5.3698, '30 La Canebière', '13001', 'Marseille', 'Provence-Alpes-Côte d''Azur', 'France', '["https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]'::jsonb, NOW(), NOW(), NULL),

-- Propriété 6: Maison ancienne à Toulouse
(gen_random_uuid(), '${USER_ID}', 'listed', 'house', 480000, 'EUR', 43.6047, 1.4442, '12 Place du Capitole', '31000', 'Toulouse', 'Occitanie', 'France', '["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 7: Local commercial à Lille
(gen_random_uuid(), '${USER_ID}', 'listed', 'commercial', 750000, 'EUR', 50.6292, 3.0573, '5 Rue de la République', '59000', 'Lille', 'Hauts-de-France', 'France', '["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800", "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 8: Appartement à Nantes
(gen_random_uuid(), '${USER_ID}', 'review', 'apartment', 390000, 'EUR', 47.2184, -1.5536, '20 Cours des 50 Otages', '44000', 'Nantes', 'Pays de la Loire', 'France', '["https://images.unsplash.com/photo-1556912173-6714228b9a3d?w=800"]'::jsonb, NOW(), NOW(), NULL),

-- Propriété 9: Villa moderne à Cannes
(gen_random_uuid(), '${USER_ID}', 'listed', 'villa', 3200000, 'EUR', 43.5528, 7.0174, '25 Boulevard de la Croisette', '06400', 'Cannes', 'Provence-Alpes-Côte d''Azur', 'France', '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800", "https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800", "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 10: Studio cosy à Paris
(gen_random_uuid(), '${USER_ID}', 'listed', 'apartment', 220000, 'EUR', 48.8630, 2.3444, '18 Rue de la Sorbonne', '75005', 'Paris', 'Île-de-France', 'France', '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 11: Maison avec piscine à Avignon
(gen_random_uuid(), '${USER_ID}', 'listed', 'house', 680000, 'EUR', 43.9481, 4.8084, '28 Rue de la République', '84000', 'Avignon', 'Provence-Alpes-Côte d''Azur', 'France', '["https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800", "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 12: Appartement duplex à Strasbourg
(gen_random_uuid(), '${USER_ID}', 'listed', 'apartment', 420000, 'EUR', 48.5734, 7.7521, '15 Place Kléber', '67000', 'Strasbourg', 'Grand Est', 'France', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 13: Villa de charme à Montpellier
(gen_random_uuid(), '${USER_ID}', 'listed', 'villa', 920000, 'EUR', 43.6108, 3.8767, '22 Avenue du Pirée', '34000', 'Montpellier', 'Occitanie', 'France', '["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 14: Local commercial à Rennes
(gen_random_uuid(), '${USER_ID}', 'listed', 'commercial', 480000, 'EUR', 48.1173, -1.6778, '8 Rue de la Monnaie', '35000', 'Rennes', 'Bretagne', 'France', '["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 15: Maison bourgeoise à Reims
(gen_random_uuid(), '${USER_ID}', 'listed', 'house', 580000, 'EUR', 49.2583, 4.0317, '35 Rue de Vesle', '51100', 'Reims', 'Grand Est', 'France', '["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 16: Appartement vue mer à La Rochelle
(gen_random_uuid(), '${USER_ID}', 'listed', 'apartment', 450000, 'EUR', 46.1603, -1.1511, '12 Quai Duperré', '17000', 'La Rochelle', 'Nouvelle-Aquitaine', 'France', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 17: Terrain avec vue à Annecy
(gen_random_uuid(), '${USER_ID}', 'listed', 'land', 380000, 'EUR', 45.8992, 6.1294, '40 Avenue d''Albigny', '74000', 'Annecy', 'Auvergne-Rhône-Alpes', 'France', '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 18: Maison contemporaine à Grenoble
(gen_random_uuid(), '${USER_ID}', 'listed', 'house', 520000, 'EUR', 45.1885, 5.7245, '25 Cours Jean Jaurès', '38000', 'Grenoble', 'Auvergne-Rhône-Alpes', 'France', '["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 19: Appartement rénové à Dijon
(gen_random_uuid(), '${USER_ID}', 'listed', 'apartment', 280000, 'EUR', 47.3220, 5.0415, '18 Rue de la Liberté', '21000', 'Dijon', 'Bourgogne-Franche-Comté', 'France', '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 20: Villa avec dépendances à Aix-en-Provence
(gen_random_uuid(), '${USER_ID}', 'listed', 'villa', 1250000, 'EUR', 43.5297, 5.4474, '30 Cours Mirabeau', '13100', 'Aix-en-Provence', 'Provence-Alpes-Côte d''Azur', 'France', '["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800", "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 21: T3 lumineux à Angers
(gen_random_uuid(), '${USER_ID}', 'listed', 'apartment', 320000, 'EUR', 47.4739, -0.5518, '15 Boulevard du Roi René', '49000', 'Angers', 'Pays de la Loire', 'France', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 22: Maison de maître à Nancy
(gen_random_uuid(), '${USER_ID}', 'listed', 'house', 680000, 'EUR', 48.6921, 6.1844, '42 Rue Stanislas', '54000', 'Nancy', 'Grand Est', 'France', '["https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 23: Bureau commercial à Clermont-Ferrand
(gen_random_uuid(), '${USER_ID}', 'listed', 'commercial', 420000, 'EUR', 45.7772, 3.0870, '10 Place de la Victoire', '63000', 'Clermont-Ferrand', 'Auvergne-Rhône-Alpes', 'France', '["https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"]'::jsonb, NOW(), NOW(), NOW()),

-- Propriété 24: Appartement standing à Tours
(gen_random_uuid(), '${USER_ID}', 'draft', 'apartment', 380000, 'EUR', 47.3941, 0.6848, '22 Rue Nationale', '37000', 'Tours', 'Centre-Val de Loire', 'France', '["https://images.unsplash.com/photo-1556912173-6714228b9a3d?w=800"]'::jsonb, NOW(), NOW(), NULL),

-- Propriété 25: Maison avec jardin à Poitiers
(gen_random_uuid(), '${USER_ID}', 'listed', 'house', 420000, 'EUR', 46.5802, 0.3404, '35 Place du Maréchal Leclerc', '86000', 'Poitiers', 'Nouvelle-Aquitaine', 'France', '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"]'::jsonb, NOW(), NOW(), NOW())

ON CONFLICT (id) DO NOTHING;

-- Insérer les traductions détaillées pour chaque propriété
DO \$\$
DECLARE
    prop_id UUID;
BEGIN
    -- Propriété 1: Appartement luxueux Paris
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '10 Rue de Rivoli' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Appartement haut standing au cœur de Paris', 'Magnifique appartement de 125m² avec vue panoramique sur la Seine et les monuments historiques. Superbe T4 avec 3 chambres spacieuses, 2 salles de bain complètes, grand salon de 35m², cuisine moderne équipée, balcon de 12m², parquet en chêne massif, cheminée, double vitrage, ascenseur. Idéalement situé dans le 1er arrondissement, à 5 minutes à pied du Louvre, des Halles, et des jardins des Tuileries. Métro Châtelet-Les Halles à 3 minutes. Charges copropriété: 250€/mois. Exposition sud-ouest, très lumineux toute la journée. Rénovation complète en 2022. Classe énergétique B.'),
        (gen_random_uuid(), prop_id, 'en', 'Luxury apartment in the heart of Paris', 'Magnificent 125m² apartment with panoramic Seine views and historic monuments. Beautiful T4 with 3 spacious bedrooms, 2 full bathrooms, large 35m² living room, modern fitted kitchen, 12m² balcony, solid oak parquet, fireplace, double glazing, elevator. Ideally located in the 1st arrondissement, 5 minutes walk from the Louvre, Les Halles, and Tuileries Gardens. Metro Châtelet-Les Halles 3 minutes away. Co-ownership charges: 250€/month. South-west exposure, very bright all day. Complete renovation in 2022. Energy class B.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 2: Maison familiale Lyon
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '45 Rue de la République' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Maison familiale avec jardin et garage à Lyon', 'Charmante maison de 185m² habitables sur un terrain de 350m² avec jardin paysager. Superbe T5 avec 4 chambres dont une suite parentale, 3 salles de bain, grand séjour de 45m² avec cheminée, cuisine équipée ouverte, bureau, cellier, double garage de 40m², terrasse de 30m², piscine hors-sol. Quartier calme et résidentiel de Gerland, proche du parc de Gerland et des écoles. Commerces et transports à 5 minutes. Double vitrage, isolation thermique renforcée, chauffage gaz central. Parking privé. Classe énergétique C.'),
        (gen_random_uuid(), prop_id, 'en', 'Family house with garden and garage in Lyon', 'Charming 185m² house on a 350m² plot with landscaped garden. Beautiful T5 with 4 bedrooms including master suite, 3 bathrooms, large 45m² living room with fireplace, open fitted kitchen, office, pantry, double 40m² garage, 30m² terrace, above-ground pool. Quiet residential Gerland neighborhood, close to Gerland park and schools. Shops and transport 5 minutes away. Double glazing, enhanced thermal insulation, central gas heating. Private parking. Energy class C.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 3: Villa de prestige Nice
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '15 Promenade des Anglais' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Villa exceptionnelle face à la mer à Nice', 'Prestigieuse villa de 320m² sur 3 niveaux avec vue panoramique à 180° sur la Méditerranée. Magnifique villa de 6 chambres, 5 salles de bain, 2 suites parentales, grand salon de 60m² avec baies vitrées, cuisine professionnelle équipée Gaggenau, bureau, salle de sport, piscine à débordement de 12x5m avec système de nage à contre-courant, spa extérieur, terrasse panoramique de 200m², jardin paysager avec éclairage LED, système domotique complet, climatisation réversible, alarme, vidéosurveillance, portail électrique. Idéale pour résidence principale ou investissement locatif de prestige. Garage pour 3 voitures. Classe énergétique A.'),
        (gen_random_uuid(), prop_id, 'en', 'Exceptional sea-front villa in Nice', 'Prestigious 320m² 3-level villa with 180° panoramic Mediterranean views. Magnificent 6-bedroom villa, 5 bathrooms, 2 master suites, large 60m² living room with bay windows, professional Gaggenau fitted kitchen, office, gym, 12x5m infinity pool with counter-current swimming system, outdoor spa, 200m² panoramic terrace, landscaped garden with LED lighting, complete home automation system, reversible air conditioning, alarm, video surveillance, electric gate. Ideal for main residence or luxury rental investment. Garage for 3 cars. Energy class A.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 4: Terrain constructible Bordeaux
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '50 Cours de la Libération' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Terrain viabilisé constructible 800m² à Bordeaux', 'Superbe terrain constructible de 800m² avec accès direct route goudronnée. Terrain rectangulaire, plat, bien orienté sud-est, viabilisé (eau potable, électricité 63A, gaz naturel, fibre optique, tout-à-l''égout). PLU constructible, possibilité de construire maison individuelle jusqu''à 200m² de surface de plancher. Proche commerces, écoles, transports en commun. Établissement scolaire à 500m, centre commercial à 1km. Parfait pour construction maison neuve ou investissement. Clôture partielle existante. Viabilisation complète réalisée en 2023.'),
        (gen_random_uuid(), prop_id, 'en', '800m² serviced buildable land in Bordeaux', 'Beautiful 800m² buildable land with direct access to paved road. Rectangular, flat, well-oriented south-east plot, serviced (drinking water, 63A electricity, natural gas, fiber optic, sewer). Buildable zoning, possibility to build individual house up to 200m² floor area. Close to shops, schools, public transport. School 500m away, shopping center 1km. Perfect for new construction or investment. Partial fence existing. Complete servicing completed in 2023.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 5: Appartement Marseille
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '30 La Canebière' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Appartement en rénovation - Marseille centre', 'Appartement de 85m² en cours de rénovation complète dans quartier historique. T3 avec 2 chambres, séjour, cuisine à refaire, salle de bain moderne. Rénovation prévue: isolation complète, électricité refaite, plomberie neuve, sols et peintures. Exposition sud, balcon de 8m². Proche Vieux-Port, commerces, métro. Disponible dans 3 mois. Opportunité d''investissement ou résidence principale. Travaux à prévoir: environ 35 000€.'),
        (gen_random_uuid(), prop_id, 'en', 'Apartment under renovation - Marseille center', '85m² apartment under complete renovation in historic neighborhood. T3 with 2 bedrooms, living room, kitchen to renovate, modern bathroom. Planned renovation: complete insulation, rewired electricity, new plumbing, floors and paint. South exposure, 8m² balcony. Close to Old Port, shops, metro. Available in 3 months. Investment opportunity or main residence. Work to plan: approximately 35,000€.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 6: Maison ancienne Toulouse
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '12 Place du Capitole' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Maison de maître rénovée au centre historique de Toulouse', 'Superbe maison bourgeoise de 220m² rénovée avec soin en 2021, alliant charme d''époque et confort moderne. Maison sur 3 niveaux avec 4 chambres, 2 salles de bain, 2 WC, grand séjour de 50m² avec poutres apparentes et cheminée, cuisine équipée de 20m², bureau, cellier, cave, jardin privatif de 80m² avec terrasse et pergola, garage. Caractéristiques: parquet en chêne, carrelages anciens restaurés, moulures, volets roulants électriques, double vitrage, isolation renforcée, chauffage gaz, climatisation réversible. Situation exceptionnelle en hypercentre, à 2 minutes de la place du Capitole. Classe énergétique B.'),
        (gen_random_uuid(), prop_id, 'en', 'Renovated master house in historic Toulouse center', 'Beautiful 220m² bourgeois house carefully renovated in 2021, combining period charm and modern comfort. 3-level house with 4 bedrooms, 2 bathrooms, 2 WC, large 50m² living room with exposed beams and fireplace, 20m² fitted kitchen, office, pantry, cellar, 80m² private garden with terrace and pergola, garage. Features: oak parquet, restored old tiles, moldings, electric roller shutters, double glazing, enhanced insulation, gas heating, reversible air conditioning. Exceptional location in hypercenter, 2 minutes from Place du Capitole. Energy class B.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 7: Commercial Lille
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '5 Rue de la République' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Local commercial prestigieux en zone piétonne - Lille', 'Local commercial de 95m² avec vitrine de 12m de façade en zone piétonne très fréquentée. Surface principale 95m², réserve 15m², bureau 12m². Façade moderne rénovée en 2023, devanture vitrée avec éclairage LED, enseigne pré-installée. Idéal pour commerce de détail, boutique de mode, restaurant, salon de beauté, ou bureau. Forte visibilité, passage quotidien estimé à 8000 personnes. Loyer estimé: 2500€/mois. Charges: 350€/mois. Bail commercial de 9 ans. Emplacement stratégique près de la gare et du centre commercial Euralille.'),
        (gen_random_uuid(), prop_id, 'en', 'Prestigious commercial space in pedestrian zone - Lille', '95m² commercial space with 12m shop front in busy pedestrian zone. Main area 95m², storage 15m², office 12m². Modern façade renovated in 2023, glazed frontage with LED lighting, pre-installed sign. Ideal for retail, fashion boutique, restaurant, beauty salon, or office. High visibility, estimated daily footfall 8000 people. Estimated rent: 2500€/month. Charges: 350€/month. 9-year commercial lease. Strategic location near train station and Euralille shopping center.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 8: Appartement Nantes
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '20 Cours des 50 Otages' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Appartement T3 en attente de validation - Nantes', 'Appartement de 75m² bien situé, en cours de validation par notre équipe qualité. T3 avec 2 chambres, séjour, cuisine équipée, salle de bain, WC séparé, balcon. Proche centre-ville et transports. Vérification en cours des diagnostics, de la conformité, et des équipements. Disponibilité prévue sous 15 jours.'),
        (gen_random_uuid(), prop_id, 'en', 'T3 apartment pending validation - Nantes', 'Well-located 75m² apartment under validation by our quality team. T3 with 2 bedrooms, living room, fitted kitchen, bathroom, separate WC, balcony. Close to city center and transport. Verification in progress for diagnostics, compliance, and equipment. Expected availability within 15 days.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 9: Villa moderne Cannes
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '25 Boulevard de la Croisette' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Villa contemporaine de luxe avec piscine à Cannes', 'Villa moderne de 450m² sur terrain de 1200m² avec piscine chauffée et vue mer. Architecture contemporaine signée, 5 suites, 6 salles de bain, grand salon de 80m² avec vue panoramique, cuisine professionnelle équipée, bureau, salle de cinéma, cave à vin, spa, piscine 15x6m avec terrasse, jardin paysager avec éclairage, système domotique, climatisation, alarme, vidéosurveillance. Idéale pour résidence principale de prestige ou location saisonnière haut de gamme. Garage 4 places, portail sécurisé. Classe énergétique A+.'),
        (gen_random_uuid(), prop_id, 'en', 'Contemporary luxury villa with pool in Cannes', 'Modern 450m² villa on 1200m² plot with heated pool and sea view. Contemporary signed architecture, 5 suites, 6 bathrooms, large 80m² living room with panoramic views, professional fitted kitchen, office, cinema room, wine cellar, spa, 15x6m pool with terrace, landscaped garden with lighting, home automation, air conditioning, alarm, video surveillance. Ideal for prestigious main residence or high-end seasonal rental. 4-car garage, secure gate. Energy class A+.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 10: Studio cosy Paris
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '18 Rue de la Sorbonne' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Studio cosy rénové - Quartier Latin Paris', 'Studio de 28m² entièrement rénové en 2023, idéal pour étudiant ou jeune actif. Mezzanine avec lit double, espace jour optimisé avec coin cuisine équipée, salle d''eau moderne avec douche à l''italienne, WC séparé. Double vitrage, isolation phonique, parquet flottant, éclairage LED, volets roulants. Proche Sorbonne, commerces, métro. Charges: 120€/mois. Excellent rapport qualité/prix. Exposition est, calme.'),
        (gen_random_uuid(), prop_id, 'en', 'Cozy renovated studio - Latin Quarter Paris', 'Fully renovated 28m² studio in 2023, ideal for student or young professional. Mezzanine with double bed, optimized day space with fitted kitchen corner, modern bathroom with Italian shower, separate WC. Double glazing, sound insulation, floating parquet, LED lighting, roller shutters. Close to Sorbonne, shops, metro. Charges: 120€/month. Excellent value for money. East exposure, quiet.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 11: Maison avec piscine Avignon
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '28 Rue de la République' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Maison provençale avec piscine chauffée et spa - Avignon', 'Belle maison provençale de 240m² avec piscine chauffée et spa extérieur. Terrain de 800m² avec jardin paysager, oliviers centenaires, pergola. Maison sur 2 niveaux: 4 chambres, 3 salles de bain, séjour de 55m² avec cheminée, cuisine équipée, bureau, cave, garage double, piscine 10x5m avec terrasse et bar de pool, spa pour 6 personnes, système d''arrosage automatique. Climatisation réversible, pompe à chaleur pour piscine, système de sécurité. Proche centre historique d''Avignon, écoles, commerces. Idéale pour famille ou résidence secondaire. Classe énergétique B.'),
        (gen_random_uuid(), prop_id, 'en', 'Provencal house with heated pool and spa - Avignon', 'Beautiful 240m² Provencal house with heated pool and outdoor spa. 800m² plot with landscaped garden, century-old olive trees, pergola. 2-level house: 4 bedrooms, 3 bathrooms, 55m² living room with fireplace, fitted kitchen, office, cellar, double garage, 10x5m pool with terrace and pool bar, 6-person spa, automatic irrigation system. Reversible air conditioning, heat pump for pool, security system. Close to historic Avignon center, schools, shops. Ideal for family or second home. Energy class B.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 12: Appartement duplex Strasbourg
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '15 Place Kléber' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Duplex exceptionnel avec terrasse - Strasbourg centre', 'Superbe duplex de 110m² en duplex au cœur de Strasbourg, à 50m de la place Kléber. RDC avec entrée, séjour de 40m² avec terrasse de 25m², cuisine équipée ouverte, WC. Étage avec 2 chambres, salle de bain, bureau. Parquet massif, poutres apparentes, hauteurs sous plafond 3m, double vitrage, volets roulants électriques, système de VMC double flux. Exposition sud avec vue dégagée. Ascenseur. Proche cathédrale, commerces, tram. Charges: 280€/mois. Classe énergétique B.'),
        (gen_random_uuid(), prop_id, 'en', 'Exceptional duplex with terrace - Strasbourg center', 'Beautiful 110m² duplex in the heart of Strasbourg, 50m from Place Kléber. Ground floor with entrance, 40m² living room with 25m² terrace, open fitted kitchen, WC. Upper floor with 2 bedrooms, bathroom, office. Solid parquet, exposed beams, 3m ceiling heights, double glazing, electric roller shutters, double-flow VMC system. South exposure with clear views. Elevator. Close to cathedral, shops, tram. Charges: 280€/month. Energy class B.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 13: Villa de charme Montpellier
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '22 Avenue du Pirée' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Villa de charme avec jardin et piscine - Montpellier', 'Charmante villa de 280m² avec piscine et jardin paysager de 600m². Villa provençale rénovée avec 5 chambres, 3 salles de bain, séjour de 60m² avec cheminée, cuisine équipée, bureau, véranda, piscine 8x4m avec terrasse, pergola, système d''arrosage, portail automatique, garage double. Carrelages anciens, poutres, double vitrage, climatisation, alarme. Quartier résidentiel calme proche centre-ville, écoles, transports. Idéale pour famille. Classe énergétique C.'),
        (gen_random_uuid(), prop_id, 'en', 'Charming villa with garden and pool - Montpellier', 'Charming 280m² villa with pool and 600m² landscaped garden. Renovated Provencal villa with 5 bedrooms, 3 bathrooms, 60m² living room with fireplace, fitted kitchen, office, veranda, 8x4m pool with terrace, pergola, irrigation system, automatic gate, double garage. Old tiles, beams, double glazing, air conditioning, alarm. Quiet residential neighborhood close to city center, schools, transport. Ideal for family. Energy class C.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 14: Local commercial Rennes
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '8 Rue de la Monnaie' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Local commercial avec vitrine - Centre-ville Rennes', 'Local commercial de 75m² en rez-de-chaussée avec vitrine de 8m, idéal pour commerce ou bureau. Surface principale 60m², réserve 15m². Façade rénovée, éclairage moderne, enseigne possible. Forte visibilité, passage important. Proche place de la République, commerces, parking public. Loyer estimé: 1800€/mois. Charges: 250€/mois. Bail 3/6/9.'),
        (gen_random_uuid(), prop_id, 'en', 'Commercial space with shop front - Rennes city center', '75m² ground-floor commercial space with 8m shop front, ideal for shop or office. Main area 60m², storage 15m². Renovated façade, modern lighting, sign possible. High visibility, significant footfall. Close to Place de la République, shops, public parking. Estimated rent: 1800€/month. Charges: 250€/month. 3/6/9 lease.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 15: Maison bourgeoise Reims
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '35 Rue de Vesle' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Maison de caractère rénovée - Reims centre', 'Superbe maison bourgeoise de 200m² rénovée avec goût, alliant charme d''antan et modernité. 4 chambres, 2 salles de bain, séjour de 45m² avec parquet et cheminée, cuisine équipée, bureau, cave, jardin clos de 120m² avec terrasse, garage. Parquet ancien restauré, moulures, hautes fenêtres, double vitrage, isolation renforcée, chauffage gaz. Proche cathédrale, commerces, écoles. Classe énergétique B.'),
        (gen_random_uuid(), prop_id, 'en', 'Renovated character house - Reims center', 'Beautiful 200m² bourgeois house tastefully renovated, combining period charm and modernity. 4 bedrooms, 2 bathrooms, 45m² living room with parquet and fireplace, fitted kitchen, office, cellar, 120m² enclosed garden with terrace, garage. Restored old parquet, moldings, tall windows, double glazing, enhanced insulation, gas heating. Close to cathedral, shops, schools. Energy class B.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 16: Appartement vue mer La Rochelle
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '12 Quai Duperré' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Appartement vue mer avec terrasse - La Rochelle', 'Magnifique appartement de 95m² avec vue directe sur le Vieux-Port et l''océan. T3 de standing avec 2 chambres, salle de bain, WC séparé, séjour de 35m² avec baies vitrées, cuisine équipée, terrasse de 15m² face à la mer, balcon. Parquet, double vitrage, volets roulants, ascenseur. Rez-de-chaussée avec accès direct. Proche port, plages, commerces. Idéal résidence principale ou location saisonnière. Charges: 320€/mois. Classe énergétique B.'),
        (gen_random_uuid(), prop_id, 'en', 'Sea-view apartment with terrace - La Rochelle', 'Magnificent 95m² apartment with direct views of Old Port and ocean. Quality T3 with 2 bedrooms, bathroom, separate WC, 35m² living room with bay windows, fitted kitchen, 15m² sea-facing terrace, balcony. Parquet, double glazing, roller shutters, elevator. Ground floor with direct access. Close to port, beaches, shops. Ideal main residence or seasonal rental. Charges: 320€/month. Energy class B.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 17: Terrain avec vue Annecy
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '40 Avenue d''Albigny' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Terrain constructible avec vue lac - Annecy', 'Exceptionnel terrain de 1000m² avec vue panoramique sur le lac d''Annecy et les montagnes. Terrain plat, bien exposé sud, viabilisé complet (eau, électricité, gaz, fibre, tout-à-l''égout). PLU constructible, autorisation de construire maison jusqu''à 250m². Accès direct route. Vue imprenable, calme absolu. Proche lac, commerces, écoles. Opportunité rare pour construire villa de prestige. Viabilisation 2023.'),
        (gen_random_uuid(), prop_id, 'en', 'Buildable land with lake view - Annecy', 'Exceptional 1000m² plot with panoramic views of Lake Annecy and mountains. Flat, well-oriented south plot, fully serviced (water, electricity, gas, fiber, sewer). Buildable zoning, permit to build house up to 250m². Direct road access. Stunning views, absolute calm. Close to lake, shops, schools. Rare opportunity to build prestigious villa. Servicing 2023.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 18: Maison contemporaine Grenoble
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '25 Cours Jean Jaurès' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Maison moderne avec jardin - Grenoble', 'Maison contemporaine de 180m² construite en 2020 avec jardin de 400m². Architecture moderne avec 4 chambres, 3 salles de bain, séjour ouvert de 55m², cuisine équipée moderne, bureau, garage, terrasse. Isolation BBC, pompe à chaleur, VMC double flux, panneaux photovoltaïques, domotique. Proche centre-ville, universités, transports. Classe énergétique A.'),
        (gen_random_uuid(), prop_id, 'en', 'Modern house with garden - Grenoble', 'Contemporary 180m² house built in 2020 with 400m² garden. Modern architecture with 4 bedrooms, 3 bathrooms, open 55m² living room, modern fitted kitchen, office, garage, terrace. BBC insulation, heat pump, double-flow VMC, photovoltaic panels, home automation. Close to city center, universities, transport. Energy class A.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 19: Appartement rénové Dijon
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '18 Rue de la Liberté' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Appartement rénové proche centre historique - Dijon', 'Appartement de 68m² entièrement rénové en 2023 dans quartier historique. T2 avec chambre, séjour, cuisine équipée neuve, salle de bain moderne, WC, balcon. Parquet flottant, peintures neuves, électricité refaite, plomberie neuve, double vitrage. Proche centre historique, commerces, gare. Charges: 150€/mois. Parfait premier achat. Classe énergétique B.'),
        (gen_random_uuid(), prop_id, 'en', 'Renovated apartment near historic center - Dijon', 'Fully renovated 68m² apartment in 2023 in historic neighborhood. T2 with bedroom, living room, brand new fitted kitchen, modern bathroom, WC, balcony. Floating parquet, new paint, rewired electricity, new plumbing, double glazing. Close to historic center, shops, station. Charges: 150€/month. Perfect first purchase. Energy class B.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 20: Villa avec dépendances Aix-en-Provence
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '30 Cours Mirabeau' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Villa de prestige avec dépendances et piscine - Aix-en-Provence', 'Prestigieuse villa de 380m² avec dépendances et piscine sur terrain de 1500m². Villa de standing avec 6 chambres, 4 salles de bain, 2 suites, grand séjour de 70m², cuisine professionnelle, bureau, bibliothèque, cave à vin, dépendances de 80m² aménageable, piscine 12x6m avec terrasse, jardin paysager, oliviers, système d''irrigation, portail automatique, garage 3 voitures. Domotique complète, climatisation, alarme, vidéosurveillance. Proche centre-ville historique. Idéale résidence principale ou investissement locatif. Classe énergétique A.'),
        (gen_random_uuid(), prop_id, 'en', 'Prestigious villa with outbuildings and pool - Aix-en-Provence', 'Prestigious 380m² villa with outbuildings and pool on 1500m² plot. Quality villa with 6 bedrooms, 4 bathrooms, 2 suites, large 70m² living room, professional kitchen, office, library, wine cellar, 80m² convertible outbuildings, 12x6m pool with terrace, landscaped garden, olive trees, irrigation system, automatic gate, 3-car garage. Complete home automation, air conditioning, alarm, video surveillance. Close to historic city center. Ideal main residence or rental investment. Energy class A.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 21: T3 lumineux Angers
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '15 Boulevard du Roi René' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'T3 lumineux avec balcon - Angers centre', 'Appartement de 78m² très lumineux avec balcon de 10m². T3 avec 2 chambres, séjour, cuisine équipée, salle de bain, WC séparé. Parquet, double vitrage, exposition sud-ouest, calme. Proche centre-ville, université, commerces. Charges: 180€/mois. Classe énergétique C.'),
        (gen_random_uuid(), prop_id, 'en', 'Bright T3 with balcony - Angers center', 'Very bright 78m² apartment with 10m² balcony. T3 with 2 bedrooms, living room, fitted kitchen, bathroom, separate WC. Parquet, double glazing, south-west exposure, quiet. Close to city center, university, shops. Charges: 180€/month. Energy class C.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 22: Maison de maître Nancy
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '42 Rue Stanislas' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Maison de maître rénovée - Nancy centre historique', 'Superbe maison de maître de 260m² rénovée avec soin en 2022. 5 chambres, 3 salles de bain, séjour de 60m² avec cheminée, cuisine équipée, bureau, cave, jardin clos de 150m², garage. Caractère d''époque préservé: parquet, moulures, cheminées, hautes fenêtres. Modernités: double vitrage, isolation, chauffage gaz, climatisation. Proche place Stanislas, commerces, écoles. Classe énergétique B.'),
        (gen_random_uuid(), prop_id, 'en', 'Renovated master house - Nancy historic center', 'Beautiful 260m² master house carefully renovated in 2022. 5 bedrooms, 3 bathrooms, 60m² living room with fireplace, fitted kitchen, office, cellar, 150m² enclosed garden, garage. Period character preserved: parquet, moldings, fireplaces, tall windows. Modern features: double glazing, insulation, gas heating, air conditioning. Close to Place Stanislas, shops, schools. Energy class B.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 23: Bureau commercial Clermont-Ferrand
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '10 Place de la Victoire' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Bureau commercial en centre-ville - Clermont-Ferrand', 'Bureau commercial de 110m² au 2ème étage avec ascenseur. Surface principale 85m², 3 bureaux, accueil, réserve 25m². Climatisation, éclairage LED, aménagement moderne. Proche place de la Victoire, commerces, parking. Idéal cabinet, agence, ou bureau. Loyer estimé: 2200€/mois. Charges: 380€/mois.'),
        (gen_random_uuid(), prop_id, 'en', 'Commercial office in city center - Clermont-Ferrand', '110m² commercial office on 2nd floor with elevator. Main area 85m², 3 offices, reception, 25m² storage. Air conditioning, LED lighting, modern layout. Close to Place de la Victoire, shops, parking. Ideal for practice, agency, or office. Estimated rent: 2200€/month. Charges: 380€/month.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 24: Appartement standing Tours
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '22 Rue Nationale' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Appartement standing en préparation - Tours', 'Appartement de 92m² en cours de rénovation dans immeuble de standing. T4 avec 3 chambres, séjour, cuisine équipée, 2 salles de bain, balcon. Rénovation complète prévue: isolation, électricité, plomberie, sols, peintures. Disponible dans 2 mois. Proche centre historique, gare, commerces.'),
        (gen_random_uuid(), prop_id, 'en', 'Quality apartment under preparation - Tours', '92m² apartment under renovation in quality building. T4 with 3 bedrooms, living room, fitted kitchen, 2 bathrooms, balcony. Complete renovation planned: insulation, electricity, plumbing, floors, paint. Available in 2 months. Close to historic center, station, shops.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;

    -- Propriété 25: Maison avec jardin Poitiers
    SELECT id INTO prop_id FROM properties WHERE user_id = '${USER_ID}' AND street = '35 Place du Maréchal Leclerc' LIMIT 1;
    IF prop_id IS NOT NULL THEN
        INSERT INTO property_translations (id, property_id, language, title, description) VALUES
        (gen_random_uuid(), prop_id, 'fr', 'Maison avec jardin clos - Poitiers centre', 'Charmante maison de 165m² avec jardin clos de 300m². T4 avec 3 chambres, 2 salles de bain, séjour de 45m² avec cheminée, cuisine équipée, bureau, garage, terrasse. Parquet, double vitrage, chauffage gaz, isolation renforcée. Jardin paysager avec terrasse et coin repas. Proche centre-ville, université, commerces. Idéale famille. Classe énergétique C.'),
        (gen_random_uuid(), prop_id, 'en', 'House with enclosed garden - Poitiers center', 'Charming 165m² house with 300m² enclosed garden. T4 with 3 bedrooms, 2 bathrooms, 45m² living room with fireplace, fitted kitchen, office, garage, terrace. Parquet, double glazing, gas heating, enhanced insulation. Landscaped garden with terrace and dining area. Close to city center, university, shops. Ideal for family. Energy class C.')
        ON CONFLICT (property_id, language) DO NOTHING;
    END IF;
END \$\$;

-- Afficher le nombre de propriétés insérées
SELECT COUNT(*) as total_properties FROM properties WHERE user_id = '${USER_ID}';
SELECT COUNT(*) as total_translations FROM property_translations WHERE property_id IN (SELECT id FROM properties WHERE user_id = '${USER_ID}');
EOF

# Exécuter le script SQL
echo -e "${BLUE}💾 Insertion des données dans la base...${NC}"
docker exec -i viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" < "$SQL_FILE"

# Nettoyer
rm "$SQL_FILE"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Données de test insérées avec succès                   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Résumé:${NC}"
echo -e "   👤 Utilisateur: ${USER_EMAIL} (${USER_ID})"
echo -e "   🏠 Propriétés créées: 25"
echo -e "   📝 Traductions créées: 50 (25 propriétés × 2 langues)"
echo ""
echo -e "${YELLOW}💡 Pour tester l'API Property Service:${NC}"
echo -e "   ${BLUE}curl http://localhost:3001/properties?userId=${USER_ID}${NC}"
echo ""
echo -e "${YELLOW}💡 Pour indexer dans Meilisearch:${NC}"
echo -e "   ${BLUE}curl -X POST http://localhost:3001/properties/{property-id}/publish${NC}"
echo ""

