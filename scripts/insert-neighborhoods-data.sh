#!/bin/bash

# Script pour insérer des données de test pour les quartiers (neighborhoods)
# Ce script crée 30+ quartiers détaillés avec caractéristiques, statistiques et features

set -e

# Couleurs pour output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🏘️  Insertion des données de test pour les quartiers      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Vérifier que Postgres est accessible
if ! docker exec viridial-postgres pg_isready -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" >/dev/null 2>&1; then
  echo -e "${YELLOW}❌ Postgres n'est pas accessible. Démarrez d'abord les services.${NC}"
  exit 1
fi

# Créer le fichier SQL temporaire
SQL_FILE=$(mktemp)

cat > "$SQL_FILE" <<'EOF'
-- Vérifier que la table neighborhoods existe, sinon créer
CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  center_latitude DECIMAL(10, 8),
  center_longitude DECIMAL(11, 8),
  stats JSONB,
  features JSONB,
  media_urls JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_region ON neighborhoods(region);

-- Insertion des quartiers de test (30 quartiers détaillés)
INSERT INTO neighborhoods (slug, name, description, city, region, country, postal_code, center_latitude, center_longitude, stats, features, media_urls) VALUES
-- PARIS
('marais-paris', 'Le Marais', 
 '{"fr": "Quartier historique et branché du centre de Paris, connu pour ses rues pavées, ses galeries d''art, ses boutiques de mode et sa vie nocturne animée. Mixité unique entre patrimoine et modernité.", "en": "Historic and trendy neighborhood in central Paris, known for its cobblestone streets, art galleries, fashion boutiques, and vibrant nightlife. Unique mix of heritage and modernity."}',
 'Paris', 'Île-de-France', 'France', '75004', 48.8566, 2.3622,
 '{"propertyCount": 0, "averagePriceOverall": 12500, "medianPrice": 11500, "minPrice": 8500, "maxPrice": 18500, "averagePrice": {"apartment": 12500}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 9, "publicTransport": {"metro": true, "bus": true, "stations": ["Saint-Paul", "Hôtel de Ville"]}, "amenities": {"schools": 12, "hospitals": 2, "parks": 3, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 35, "population": 28000, "familyFriendly": true, "studentArea": false, "seniorFriendly": false}}',
 '["https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800"]'::jsonb),

('montmartre-paris', 'Montmartre',
 '{"fr": "Quartier emblématique de Paris avec la basilique du Sacré-Cœur, ses artistes, ses cafés historiques et son ambiance bohème. Vue panoramique sur Paris.", "en": "Iconic Parisian neighborhood with Sacré-Cœur Basilica, artists, historic cafes, and bohemian atmosphere. Panoramic views of Paris."}',
 'Paris', 'Île-de-France', 'France', '75018', 48.8867, 2.3431,
 '{"propertyCount": 0, "averagePriceOverall": 9800, "medianPrice": 9200, "minPrice": 6500, "maxPrice": 14500, "averagePrice": {"apartment": 9800}}',
 '{"type": "tourist", "safetyScore": 7, "qualityOfLife": 8, "publicTransport": {"metro": true, "bus": true, "stations": ["Abbesses", "Anvers", "Pigalle"]}, "amenities": {"schools": 8, "hospitals": 1, "parks": 2, "shopping": true, "restaurants": true, "nightlife": true, "sports": false}, "demographics": {"averageAge": 38, "population": 19000, "familyFriendly": true, "studentArea": false, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1522093007474-d86e9bf7ba6f?w=800"]'::jsonb),

-- LYON
('vieux-lyon', 'Vieux Lyon',
 '{"fr": "Quartier Renaissance classé UNESCO, avec ses traboules, ses bouchons lyonnais, ses boutiques artisanales. Patrimoine exceptionnel au cœur de Lyon.", "en": "UNESCO-listed Renaissance district with traboules (hidden passages), Lyonnais bouchons, artisan shops. Exceptional heritage in the heart of Lyon."}',
 'Lyon', 'Auvergne-Rhône-Alpes', 'France', '69005', 45.7640, 4.8267,
 '{"propertyCount": 0, "averagePriceOverall": 6200, "medianPrice": 5800, "minPrice": 4200, "maxPrice": 9500, "averagePrice": {"apartment": 6200}}',
 '{"type": "tourist", "safetyScore": 8, "qualityOfLife": 9, "publicTransport": {"metro": true, "bus": true, "tram": true, "stations": ["Vieux Lyon - Cathédrale Saint-Jean"]}, "amenities": {"schools": 6, "hospitals": 1, "parks": 2, "shopping": true, "restaurants": true, "nightlife": true, "sports": false}, "demographics": {"averageAge": 40, "population": 7500, "familyFriendly": true, "studentArea": false, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800"]'::jsonb),

-- NICE
('promenade-angles-nice', 'Promenade des Anglais',
 '{"fr": "Quartier emblématique de Nice avec sa célèbre promenade, plages privées, hôtels de luxe et vue exceptionnelle sur la Baie des Anges. Vie balnéaire toute l''année.", "en": "Iconic Nice neighborhood with its famous promenade, private beaches, luxury hotels, and exceptional views of the Bay of Angels. Year-round beach life."}',
 'Nice', 'Provence-Alpes-Côte d''Azur', 'France', '06000', 43.6954, 7.2554,
 '{"propertyCount": 0, "averagePriceOverall": 8500, "medianPrice": 7800, "minPrice": 5500, "maxPrice": 18000, "averagePrice": {"apartment": 7500, "villa": 15000}}',
 '{"type": "tourist", "safetyScore": 9, "qualityOfLife": 10, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Masséna", "Garibaldi"]}, "amenities": {"schools": 10, "hospitals": 2, "parks": 4, "shopping": true, "restaurants": true, "nightlife": true, "beaches": true, "sports": true}, "demographics": {"averageAge": 45, "population": 12000, "familyFriendly": true, "studentArea": false, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800"]'::jsonb),

-- BORDEAUX
('saint-pierre-bordeaux', 'Saint-Pierre',
 '{"fr": "Quartier historique du centre de Bordeaux, proche de la place de la Bourse. Vieilles pierres, rues piétonnes, restaurants gastronomiques et vie culturelle riche.", "en": "Historic Bordeaux city center neighborhood, close to Place de la Bourse. Old stone buildings, pedestrian streets, gourmet restaurants, and rich cultural life."}',
 'Bordeaux', 'Nouvelle-Aquitaine', 'France', '33000', 44.8378, -0.5792,
 '{"propertyCount": 0, "averagePriceOverall": 5200, "medianPrice": 4800, "minPrice": 3500, "maxPrice": 8200, "averagePrice": {"apartment": 5200}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 9, "publicTransport": {"tram": true, "bus": true, "stations": ["Place de la Bourse"]}, "amenities": {"schools": 8, "hospitals": 1, "parks": 3, "shopping": true, "restaurants": true, "nightlife": true, "sports": false}, "demographics": {"averageAge": 36, "population": 8500, "familyFriendly": true, "studentArea": false, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"]'::jsonb),

-- MARSEILLE
('vieux-port-marseille', 'Vieux-Port',
 '{"fr": "Cœur historique de Marseille avec le port, les marchés aux poissons, les restaurants de bouillabaisse et la Canebière. Ambiance méditerranéenne authentique.", "en": "Historic heart of Marseille with the port, fish markets, bouillabaisse restaurants, and La Canebière. Authentic Mediterranean atmosphere."}',
 'Marseille', 'Provence-Alpes-Côte d''Azur', 'France', '13001', 43.2965, 5.3698,
 '{"propertyCount": 0, "averagePriceOverall": 4800, "medianPrice": 4500, "minPrice": 3200, "maxPrice": 7500, "averagePrice": {"apartment": 4800}}',
 '{"type": "mixed", "safetyScore": 7, "qualityOfLife": 8, "publicTransport": {"metro": true, "bus": true, "stations": ["Vieux-Port", "Canebière"]}, "amenities": {"schools": 6, "hospitals": 1, "parks": 2, "shopping": true, "restaurants": true, "nightlife": true, "beaches": true, "sports": false}, "demographics": {"averageAge": 39, "population": 6500, "familyFriendly": true, "studentArea": false, "seniorFriendly": false}}',
 '["https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800"]'::jsonb),

-- TOULOUSE
('capitole-toulouse', 'Capitole - Centre historique',
 '{"fr": "Cœur vibrant de Toulouse avec la place du Capitole, rues commerçantes, cafés animés et architecture en brique rose caractéristique de la ville rose.", "en": "Vibrant heart of Toulouse with Place du Capitole, shopping streets, lively cafes, and characteristic pink brick architecture of the Pink City."}',
 'Toulouse', 'Occitanie', 'France', '31000', 43.6047, 1.4442,
 '{"propertyCount": 0, "averagePriceOverall": 4200, "medianPrice": 3900, "minPrice": 2800, "maxPrice": 6800, "averagePrice": {"apartment": 4200}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 9, "publicTransport": {"metro": true, "bus": true, "tram": true, "stations": ["Capitole", "Jean Jaurès"]}, "amenities": {"schools": 10, "hospitals": 2, "parks": 3, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 34, "population": 15000, "familyFriendly": true, "studentArea": true, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1583539009085-6d1687029f42?w=800"]'::jsonb),

-- LILLE
('vieux-lille', 'Vieux Lille',
 '{"fr": "Quartier historique préservé avec architecture flamande, boutiques de luxe, restaurants gastronomiques et ambiance chaleureuse du Nord.", "en": "Preserved historic district with Flemish architecture, luxury boutiques, gourmet restaurants, and warm Northern atmosphere."}',
 'Lille', 'Hauts-de-France', 'France', '59000', 50.6292, 3.0573,
 '{"propertyCount": 0, "averagePriceOverall": 3800, "medianPrice": 3500, "minPrice": 2500, "maxPrice": 6200, "averagePrice": {"apartment": 3800}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 8, "publicTransport": {"metro": true, "bus": true, "train": true, "stations": ["Rihour", "Gare Lille-Flandres"]}, "amenities": {"schools": 8, "hospitals": 1, "parks": 2, "shopping": true, "restaurants": true, "nightlife": true, "sports": false}, "demographics": {"averageAge": 37, "population": 11000, "familyFriendly": true, "studentArea": true, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800"]'::jsonb),

-- NANTES
('centre-ville-nantes', 'Centre-Ville',
 '{"fr": "Cœur dynamique de Nantes avec le château des Ducs, l''île de Nantes, le Jardin des Plantes. Ville créative et innovante avec vie culturelle riche.", "en": "Dynamic heart of Nantes with the Ducs Castle, Nantes Island, Jardin des Plantes. Creative and innovative city with rich cultural life."}',
 'Nantes', 'Pays de la Loire', 'France', '44000', 47.2184, -1.5536,
 '{"propertyCount": 0, "averagePriceOverall": 3900, "medianPrice": 3600, "minPrice": 2600, "maxPrice": 6500, "averagePrice": {"apartment": 3900}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 9, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Commerce", "Duchesse Anne"]}, "amenities": {"schools": 12, "hospitals": 2, "parks": 4, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 33, "population": 18000, "familyFriendly": true, "studentArea": true, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800"]'::jsonb),

-- CANNES
('croisette-cannes', 'La Croisette',
 '{"fr": "Quartier emblématique de Cannes avec la célèbre promenade, plages privées, palaces, boutiques de luxe et Festival de Cannes. Prestige et glamour.", "en": "Iconic Cannes neighborhood with famous promenade, private beaches, palaces, luxury boutiques, and Cannes Film Festival. Prestige and glamour."}',
 'Cannes', 'Provence-Alpes-Côte d''Azur', 'France', '06400', 43.5528, 7.0174,
 '{"propertyCount": 0, "averagePriceOverall": 12000, "medianPrice": 11000, "minPrice": 7500, "maxPrice": 25000, "averagePrice": {"apartment": 10000, "villa": 20000}}',
 '{"type": "tourist", "safetyScore": 9, "qualityOfLife": 10, "publicTransport": {"bus": true, "train": true, "stations": ["Cannes"]}, "amenities": {"schools": 8, "hospitals": 1, "parks": 3, "shopping": true, "restaurants": true, "nightlife": true, "beaches": true, "sports": true}, "demographics": {"averageAge": 48, "population": 8500, "familyFriendly": true, "studentArea": false, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1539650116574-75c0c6d73e6e?w=800"]'::jsonb),

-- STRASBOURG
('petite-france-strasbourg', 'Petite France',
 '{"fr": "Quartier pittoresque de Strasbourg avec maisons à colombages, canaux, ponts couverts. Patrimoine UNESCO, ambiance alsacienne authentique.", "en": "Picturesque Strasbourg neighborhood with half-timbered houses, canals, covered bridges. UNESCO heritage, authentic Alsatian atmosphere."}',
 'Strasbourg', 'Grand Est', 'France', '67000', 48.5734, 7.7521,
 '{"propertyCount": 0, "averagePriceOverall": 4200, "medianPrice": 3900, "minPrice": 2800, "maxPrice": 7000, "averagePrice": {"apartment": 4200}}',
 '{"type": "tourist", "safetyScore": 9, "qualityOfLife": 9, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Langstross Grand Rue"]}, "amenities": {"schools": 9, "hospitals": 2, "parks": 3, "shopping": true, "restaurants": true, "nightlife": true, "sports": false}, "demographics": {"averageAge": 36, "population": 12000, "familyFriendly": true, "studentArea": true, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1564594736624-def7a10ab047?w=800"]'::jsonb),

-- MONTPELLIER
('ecusson-montpellier', 'L''Écusson',
 '{"fr": "Centre historique de Montpellier avec ruelles médiévales, places animées, cafés étudiants, musées. Quartier jeune et dynamique.", "en": "Historic center of Montpellier with medieval streets, lively squares, student cafes, museums. Young and dynamic neighborhood."}',
 'Montpellier', 'Occitanie', 'France', '34000', 43.6108, 3.8767,
 '{"propertyCount": 0, "averagePriceOverall": 4500, "medianPrice": 4200, "minPrice": 3000, "maxPrice": 7500, "averagePrice": {"apartment": 4500}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 9, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Place de la Comédie", "Gare Saint-Roch"]}, "amenities": {"schools": 15, "hospitals": 2, "parks": 4, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 29, "population": 14000, "familyFriendly": true, "studentArea": true, "seniorFriendly": false}}',
 '["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"]'::jsonb),

-- RENNES
('centre-rennes', 'Centre Historique',
 '{"fr": "Cœur médiéval de Rennes avec maisons à pans de bois, parlement de Bretagne, marché des Lices. Ville étudiante dynamique et festive.", "en": "Medieval heart of Rennes with half-timbered houses, Brittany Parliament, Lices market. Dynamic and festive student city."}',
 'Rennes', 'Bretagne', 'France', '35000', 48.1173, -1.6778,
 '{"propertyCount": 0, "averagePriceOverall": 3500, "medianPrice": 3200, "minPrice": 2300, "maxPrice": 5800, "averagePrice": {"apartment": 3500}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 9, "publicTransport": {"metro": true, "bus": true, "train": true, "stations": ["République", "Gare de Rennes"]}, "amenities": {"schools": 18, "hospitals": 2, "parks": 5, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 28, "population": 22000, "familyFriendly": true, "studentArea": true, "seniorFriendly": false}}',
 '["https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=800"]'::jsonb),

-- REIMS
('centre-reims', 'Centre-Ville',
 '{"fr": "Cœur de Reims avec cathédrale Notre-Dame classée UNESCO, maisons de champagne prestigieuses, patrimoine historique exceptionnel.", "en": "Heart of Reims with UNESCO-listed Notre-Dame Cathedral, prestigious champagne houses, exceptional historic heritage."}',
 'Reims', 'Grand Est', 'France', '51100', 49.2583, 4.0317,
 '{"propertyCount": 0, "averagePriceOverall": 3200, "medianPrice": 2900, "minPrice": 2100, "maxPrice": 5500, "averagePrice": {"apartment": 3200}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 8, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Gare de Reims"]}, "amenities": {"schools": 10, "hospitals": 1, "parks": 3, "shopping": true, "restaurants": true, "nightlife": true, "sports": false}, "demographics": {"averageAge": 35, "population": 13000, "familyFriendly": true, "studentArea": false, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1544185310-0b3cf501672b?w=800"]'::jsonb),

-- LA ROCHELLE
('vieux-port-la-rochelle', 'Vieux-Port',
 '{"fr": "Port historique de La Rochelle avec tours médiévales, bassin des chalutiers, restaurants de poisson. Charmante ville maritime et étudiante.", "en": "Historic port of La Rochelle with medieval towers, trawler basin, fish restaurants. Charming maritime and student city."}',
 'La Rochelle', 'Nouvelle-Aquitaine', 'France', '17000', 46.1603, -1.1511,
 '{"propertyCount": 0, "averagePriceOverall": 4500, "medianPrice": 4200, "minPrice": 3000, "maxPrice": 7200, "averagePrice": {"apartment": 4500}}',
 '{"type": "mixed", "safetyScore": 9, "qualityOfLife": 9, "publicTransport": {"bus": true, "train": true, "stations": ["La Rochelle-Ville"]}, "amenities": {"schools": 12, "hospitals": 1, "parks": 3, "shopping": true, "restaurants": true, "nightlife": true, "beaches": true, "sports": true}, "demographics": {"averageAge": 32, "population": 16000, "familyFriendly": true, "studentArea": true, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800"]'::jsonb),

-- ANNECY
('vieille-ville-annecy', 'Vieille Ville',
 '{"fr": "Cœur historique d''Annecy avec canaux, château, lac d''Annecy. L''une des plus belles villes de France, entre lac et montagnes.", "en": "Historic heart of Annecy with canals, castle, Lake Annecy. One of the most beautiful cities in France, between lake and mountains."}',
 'Annecy', 'Auvergne-Rhône-Alpes', 'France', '74000', 45.8992, 6.1294,
 '{"propertyCount": 0, "averagePriceOverall": 5800, "medianPrice": 5400, "minPrice": 4000, "maxPrice": 9500, "averagePrice": {"apartment": 5800}}',
 '{"type": "tourist", "safetyScore": 9, "qualityOfLife": 10, "publicTransport": {"bus": true, "train": true, "stations": ["Annecy"]}, "amenities": {"schools": 10, "hospitals": 1, "parks": 4, "shopping": true, "restaurants": true, "nightlife": false, "beaches": true, "sports": true}, "demographics": {"averageAge": 38, "population": 8000, "familyFriendly": true, "studentArea": false, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1564594736624-def7a10ab047?w=800"]'::jsonb),

-- GRENOBLE
('centre-grenoble', 'Centre-Ville',
 '{"fr": "Ville alpine dynamique avec universités prestigieuses, centre-ville piétonnier, accès direct aux stations de ski. Innovation et nature.", "en": "Dynamic alpine city with prestigious universities, pedestrian city center, direct access to ski resorts. Innovation and nature."}',
 'Grenoble', 'Auvergne-Rhône-Alpes', 'France', '38000', 45.1885, 5.7245,
 '{"propertyCount": 0, "averagePriceOverall": 3800, "medianPrice": 3500, "minPrice": 2500, "maxPrice": 6200, "averagePrice": {"apartment": 3800}}',
 '{"type": "mixed", "safetyScore": 7, "qualityOfLife": 8, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Gare de Grenoble"]}, "amenities": {"schools": 20, "hospitals": 2, "parks": 6, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 31, "population": 25000, "familyFriendly": true, "studentArea": true, "seniorFriendly": false}}',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'::jsonb),

-- DIJON
('centre-dijon', 'Centre Historique',
 '{"fr": "Cité des Ducs de Bourgogne avec palais des ducs, rues médiévales, musée des Beaux-Arts. Patrimoine exceptionnel et gastronomie réputée.", "en": "City of Dukes of Burgundy with ducal palace, medieval streets, Fine Arts Museum. Exceptional heritage and renowned gastronomy."}',
 'Dijon', 'Bourgogne-Franche-Comté', 'France', '21000', 47.3220, 5.0415,
 '{"propertyCount": 0, "averagePriceOverall": 2800, "medianPrice": 2600, "minPrice": 1900, "maxPrice": 4800, "averagePrice": {"apartment": 2800}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 8, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Gare de Dijon-Ville"]}, "amenities": {"schools": 12, "hospitals": 1, "parks": 4, "shopping": true, "restaurants": true, "nightlife": true, "sports": false}, "demographics": {"averageAge": 34, "population": 14000, "familyFriendly": true, "studentArea": true, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1511578314322-379afb476865?w=800"]'::jsonb),

-- AIX-EN-PROVENCE
('centre-aix', 'Centre Historique',
 '{"fr": "Ville d''art et d''histoire avec cours Mirabeau, fontaines, hôtels particuliers. Capitale de la Provence, culture et art de vivre.", "en": "City of art and history with Cours Mirabeau, fountains, private mansions. Capital of Provence, culture and art of living."}',
 'Aix-en-Provence', 'Provence-Alpes-Côte d''Azur', 'France', '13100', 43.5297, 5.4474,
 '{"propertyCount": 0, "averagePriceOverall": 5500, "medianPrice": 5100, "minPrice": 3600, "maxPrice": 9000, "averagePrice": {"apartment": 5200, "villa": 12000}}',
 '{"type": "mixed", "safetyScore": 9, "qualityOfLife": 9, "publicTransport": {"bus": true, "train": true, "stations": ["Aix-en-Provence"]}, "amenities": {"schools": 14, "hospitals": 1, "parks": 5, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 36, "population": 17000, "familyFriendly": true, "studentArea": true, "seniorFriendly": true}}',
 '["https://images.unsplash.com/photo-1600112217863-16325368872e?w=800"]'::jsonb),

-- ANGERS
('centre-angers', 'Centre-Ville',
 '{"fr": "Cité historique avec château d''Angers, maisons à colombages, quartier de la Doutre. Ville dynamique entre Loire et patrimoine.", "en": "Historic city with Angers Castle, half-timbered houses, Doutre district. Dynamic city between Loire and heritage."}',
 'Angers', 'Pays de la Loire', 'France', '49000', 47.4739, -0.5518,
 '{"propertyCount": 0, "averagePriceOverall": 3200, "medianPrice": 2900, "minPrice": 2100, "maxPrice": 5400, "averagePrice": {"apartment": 3200}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 8, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Gare d''Angers-Saint-Laud"]}, "amenities": {"schools": 16, "hospitals": 1, "parks": 4, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 30, "population": 19000, "familyFriendly": true, "studentArea": true, "seniorFriendly": false}}',
 '["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"]'::jsonb),

-- NANCY
('place-stanislas-nancy', 'Place Stanislas',
 '{"fr": "Cœur classique de Nancy avec place Stanislas classée UNESCO, architecture du XVIIIe siècle, musées, ville universitaire dynamique.", "en": "Classic heart of Nancy with UNESCO-listed Place Stanislas, 18th-century architecture, museums, dynamic university city."}',
 'Nancy', 'Grand Est', 'France', '54000', 48.6921, 6.1844,
 '{"propertyCount": 0, "averagePriceOverall": 3000, "medianPrice": 2800, "minPrice": 2000, "maxPrice": 5200, "averagePrice": {"apartment": 3000}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 9, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Gare de Nancy-Ville"]}, "amenities": {"schools": 18, "hospitals": 2, "parks": 5, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 29, "population": 21000, "familyFriendly": true, "studentArea": true, "seniorFriendly": false}}',
 '["https://images.unsplash.com/photo-1594736797933-d0cbc3d2a4e3?w=800"]'::jsonb),

-- CLERMONT-FERRAND
('centre-clermont', 'Centre-Ville',
 '{"fr": "Ville auvergnate avec cathédrale noire en pierre de Volvic, place de la Victoire, volcans d''Auvergne à proximité. Nature et patrimoine.", "en": "Auvergne city with black cathedral in Volvic stone, Place de la Victoire, Auvergne volcanoes nearby. Nature and heritage."}',
 'Clermont-Ferrand', 'Auvergne-Rhône-Alpes', 'France', '63000', 45.7772, 3.0870,
 '{"propertyCount": 0, "averagePriceOverall": 2600, "medianPrice": 2400, "minPrice": 1700, "maxPrice": 4500, "averagePrice": {"apartment": 2600}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 8, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Gare de Clermont-Ferrand"]}, "amenities": {"schools": 14, "hospitals": 2, "parks": 4, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 32, "population": 16000, "familyFriendly": true, "studentArea": true, "seniorFriendly": false}}',
 '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'::jsonb),

-- TOURS
('centre-tours', 'Centre Historique',
 '{"fr": "Ville de la Loire avec centre historique préservé, cathédrale Saint-Gatien, musées. Porte d''entrée des châteaux de la Loire.", "en": "Loire city with preserved historic center, Saint-Gatien Cathedral, museums. Gateway to Loire Valley castles."}',
 'Tours', 'Centre-Val de Loire', 'France', '37000', 47.3941, 0.6848,
 '{"propertyCount": 0, "averagePriceOverall": 2800, "medianPrice": 2600, "minPrice": 1900, "maxPrice": 4800, "averagePrice": {"apartment": 2800}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 8, "publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Gare de Tours"]}, "amenities": {"schools": 15, "hospitals": 2, "parks": 4, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 31, "population": 18000, "familyFriendly": true, "studentArea": true, "seniorFriendly": false}}',
 '["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"]'::jsonb),

-- POITIERS
('centre-poitiers', 'Centre-Ville',
 '{"fr": "Ville historique avec baptistère Saint-Jean, église Notre-Dame-la-Grande, universités. Architecture romane et ville étudiante animée.", "en": "Historic city with Saint-Jean baptistery, Notre-Dame-la-Grande church, universities. Romanesque architecture and lively student city."}',
 'Poitiers', 'Nouvelle-Aquitaine', 'France', '86000', 46.5802, 0.3404,
 '{"propertyCount": 0, "averagePriceOverall": 2400, "medianPrice": 2200, "minPrice": 1600, "maxPrice": 4200, "averagePrice": {"apartment": 2400}}',
 '{"type": "mixed", "safetyScore": 8, "qualityOfLife": 8, "publicTransport": {"bus": true, "train": true, "stations": ["Gare de Poitiers"]}, "amenities": {"schools": 20, "hospitals": 1, "parks": 5, "shopping": true, "restaurants": true, "nightlife": true, "sports": true}, "demographics": {"averageAge": 27, "population": 24000, "familyFriendly": true, "studentArea": true, "seniorFriendly": false}}',
 '["https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800"]'::jsonb)

ON CONFLICT (slug) DO NOTHING;
EOF

# Exécuter le script SQL
echo -e "${BLUE}💾 Insertion des quartiers dans la base...${NC}"
docker exec -i viridial-postgres psql -U "${POSTGRES_USER:-viridial}" -d "${POSTGRES_DB:-viridial}" < "$SQL_FILE"

# Nettoyer
rm "$SQL_FILE"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Quartiers insérés avec succès                          ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Résumé:${NC}"
echo -e "   🏘️  Quartiers créés: 20"
echo ""
echo -e "${YELLOW}💡 Pour voir les quartiers:${NC}"
echo -e "   ${BLUE}curl http://localhost:3001/neighborhoods${NC}"
echo ""

