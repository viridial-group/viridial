# 🚀 Guide de Déploiement - Property & Geolocation Services

Guide étape par étape pour déployer les services Property et Geolocation sur le VPS.

## ✅ Prérequis

1. ✅ Auth Service déployé et fonctionnel
2. ✅ Frontend déployé avec HTTPS
3. ✅ Réseau Docker `viridial-network` créé
4. ✅ Base de données PostgreSQL accessible
5. ✅ Redis accessible (pour cache geocoding)

## 📋 Étapes de Déploiement

### Étape 1: Préparer les Variables d'Environnement

**Sur votre machine locale ou VPS :**

```bash
cd /path/to/viridial

# Générer tous les fichiers .env nécessaires
./scripts/setup-env.sh
```

Cela va créer/synchroniser :
- `infrastructure/docker-compose/.env`
- `services/auth-service/.env`
- `services/property-service/.env`
- `services/geolocation-service/.env`

**Vérifier que les variables suivantes sont définies dans `.env` principal :**

```bash
# Database (partagée avec auth-service)
DATABASE_URL=postgresql://user:password@host:5432/viridial

# Redis (pour cache geocoding)
REDIS_URL=redis://redis:6379

# Frontend
FRONTEND_URL=https://viridial.com

# Geolocation Service
GEOLOCATION_SERVICE_URL=http://geolocation-service:3002
GEOCODING_PROVIDER=stub  # ou 'google' ou 'nominatim'
GOOGLE_MAPS_API_KEY=your_key_here  # si provider='google'

# Property Service
PROPERTY_SERVICE_URL=http://property-service:3001
```

### Étape 2: Déployer le Geolocation Service

**Sur le VPS :**

```bash
# Se connecter au VPS
ssh root@148.230.112.148

# Aller dans le répertoire du projet
cd /opt/viridial  # ou le chemin où vous avez cloné le projet

# Déployer le Geolocation Service
./scripts/deploy-geolocation-service-vps.sh
```

**Vérification :**

```bash
# Health check
curl http://localhost:3002/geolocation/health

# Devrait retourner:
# {"status":"ok","service":"geolocation-service","provider":"stub"}

# Voir les logs
docker logs -f viridial-geolocation-service
```

### Étape 3: Appliquer les Migrations SQL pour Property Service

**Sur le VPS :**

```bash
# Appliquer les migrations
psql $DATABASE_URL < services/property-service/src/migrations/create-properties-tables.sql

# Vérifier que les tables ont été créées
psql $DATABASE_URL -c "\dt" | grep properties
```

**Tables créées :**
- `properties` - Table principale des propriétés
- `property_translations` - Traductions multilingues

### Étape 4: Déployer le Property Service

**Sur le VPS :**

```bash
# Déployer le Property Service
./scripts/deploy-property-service-vps.sh
```

**Vérification :**

```bash
# Health check
curl http://localhost:3001/properties/health

# Devrait retourner:
# {"status":"ok","service":"property-service"}

# Voir les logs
docker logs -f viridial-property-service
```

### Étape 5: Mettre à Jour Nginx (si pas déjà fait)

**Vérifier que Nginx est configuré pour proxier les nouveaux services :**

```bash
# Vérifier la configuration Nginx
cat deploy/nginx/conf.d/default.conf | grep -A 10 "location /properties"
cat deploy/nginx/conf.d/default.conf | grep -A 10 "location /geolocation"

# Redémarrer Nginx si nécessaire
docker restart viridial-nginx  # ou le nom de votre container Nginx
```

Les endpoints doivent être accessibles via :
- `https://viridial.com/properties/*`
- `https://viridial.com/geolocation/*`

### Étape 6: Tester l'Intégration

#### Test 1: Géocodage Manuel

```bash
# Tester le service de géocodage
curl -X POST https://viridial.com/geolocation/geocode \
  -H "Content-Type: application/json" \
  -d '{
    "address": "10 Rue de la Paix, Paris, France",
    "country": "France"
  }'
```

**Résultat attendu :**
```json
{
  "latitude": 48.8688,
  "longitude": 2.3308,
  "formattedAddress": "...",
  "city": "Paris",
  "country": "France",
  ...
}
```

#### Test 2: Géocodage Automatique lors de Création de Propriété

```bash
# Créer une propriété avec adresse (sans lat/lon)
curl -X POST https://viridial.com/properties \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "type": "apartment",
    "price": 250000,
    "currency": "EUR",
    "street": "10 Rue de la Paix",
    "postalCode": "75001",
    "city": "Paris",
    "country": "France",
    "translations": [{
      "language": "fr",
      "title": "Appartement Paris Centre",
      "description": "Bel appartement au cœur de Paris"
    }]
  }'
```

**Vérifier dans la réponse que :**
- `latitude` et `longitude` sont présents (géocodage automatique)
- Les champs d'adresse sont normalisés

#### Test 3: Recherche Proximité

```bash
# Rechercher propriétés dans un rayon de 5km autour de Paris
curl -X POST https://viridial.com/geolocation/search/nearby \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 48.8566,
    "longitude": 2.3522,
    "radiusKm": 5,
    "limit": 10
  }'
```

**Résultat attendu :**
```json
{
  "center": { "latitude": 48.8566, "longitude": 2.3522 },
  "radiusKm": 5,
  "results": [...],
  "total": 1
}
```

## 🔍 Dépannage

### Le Geolocation Service ne démarre pas

**Vérifier :**
```bash
# Logs du service
docker logs viridial-geolocation-service

# Vérifier que Redis est accessible
docker ps | grep redis

# Vérifier la configuration Redis
docker exec viridial-redis-geolocation redis-cli ping
# Devrait retourner: PONG
```

### Le Property Service ne peut pas se connecter à la base de données

**Vérifier :**
```bash
# Logs du service
docker logs viridial-property-service

# Vérifier que DATABASE_URL est correcte
docker exec viridial-property-service env | grep DATABASE_URL

# Tester la connexion PostgreSQL
psql $DATABASE_URL -c "SELECT 1"
```

### Le géocodage automatique ne fonctionne pas

**Vérifier :**
1. Le Geolocation Service est démarré et accessible
2. `GEOLOCATION_SERVICE_URL` est correctement configuré dans Property Service
3. Les deux services sont sur le même réseau Docker (`viridial-network`)
4. Les logs des deux services pour voir les erreurs de communication

```bash
# Vérifier la communication entre services
docker exec viridial-property-service curl http://geolocation-service:3002/geolocation/health

# Devrait retourner: {"status":"ok","service":"geolocation-service","provider":"stub"}
```

### La recherche proximité retourne 0 résultats

**Vérifier :**
1. Des propriétés existent avec `latitude` et `longitude`
2. Les propriétés ont le statut `listed`
3. Le Property Service peut interroger la base de données
4. Les logs du Geolocation Service pour voir les erreurs

```bash
# Vérifier qu'il y a des propriétés avec coordonnées
psql $DATABASE_URL -c "SELECT id, city, latitude, longitude, status FROM properties WHERE latitude IS NOT NULL LIMIT 5"
```

## 📊 Vérification Finale

**Checklist de déploiement :**

- [ ] Geolocation Service répond sur `http://localhost:3002/geolocation/health`
- [ ] Property Service répond sur `http://localhost:3001/properties/health`
- [ ] Nginx proxie correctement les deux services
- [ ] Géocodage manuel fonctionne
- [ ] Géocodage automatique fonctionne lors de création de propriété
- [ ] Recherche proximité retourne des résultats
- [ ] Redis cache fonctionne (vérifier avec `redis-cli KEYS geocode:*`)

## 🎯 Prochaines Étapes

Une fois les services déployés et testés :

1. **Implémenter l'authentification JWT** pour sécuriser les endpoints Property
2. **Créer l'interface frontend** pour la gestion des propriétés
3. **Configurer un provider de géocodage en production** (Google ou Nominatim)
4. **Optimiser avec PostGIS** pour améliorer les performances de recherche proximité

## 📚 Documentation Complémentaire

- `docs/deployment/US-019-IMPLEMENTATION-STATUS.md` - Statut détaillé de l'implémentation
- `docs/deployment/GEOLOCATION-PROPERTY-INTEGRATION-COMPLETE.md` - Guide d'intégration
- `docs/deployment/ENV-CONFIGURATION.md` - Configuration des variables d'environnement

