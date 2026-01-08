# Geolocation Service - Setup & Deployment Guide

Guide complet pour configurer et déployer le service de géolocalisation (US-019).

## 📋 Vue d'ensemble

Le service de géolocalisation fournit:
- **Geocoding**: Conversion adresse → coordonnées (lat/lon)
- **Reverse Geocoding**: Conversion coordonnées → adresse
- **Distance Calculation**: Calcul de distance entre deux points
- **Batch Processing**: Géocodage en lot pour imports CSV
- **Caching**: Cache Redis pour optimiser les performances et réduire les coûts API

## 🚀 Déploiement Rapide

### 1. Configuration des variables d'environnement

Éditez `.env` à la racine du projet et ajoutez:

```env
# Geolocation Service
GEOCODING_PROVIDER=stub  # ou 'nominatim' ou 'google'
GOOGLE_MAPS_API_KEY=your_key_if_using_google
REDIS_URL=redis://redis:6379
GEOCODING_CACHE_TTL=86400  # 24 heures
```

### 2. Synchroniser les fichiers .env

```bash
./scripts/setup-env.sh
```

### 3. Déployer le service

```bash
# Sur le VPS
ssh root@148.230.112.148
cd /opt/viridial

# Déployer le service
./scripts/deploy-geolocation-service-vps.sh
```

## 🔧 Configuration des Providers

### Option 1: Stub Provider (Développement)

**Configuration:**
```env
GEOCODING_PROVIDER=stub
```

**Avantages:**
- ✅ Aucune clé API requise
- ✅ Fonctionne hors ligne
- ✅ Parfait pour les tests

**Inconvénients:**
- ❌ Résultats mockés (non réels)
- ⚠️ Non adapté à la production

### Option 2: Nominatim (OpenStreetMap) - Recommandé pour débuter

**Configuration:**
```env
GEOCODING_PROVIDER=nominatim
REDIS_URL=redis://redis:6379  # IMPORTANT: cache requis!
```

**Avantages:**
- ✅ Gratuit et open source
- ✅ Pas de clé API requise
- ✅ Bonne précision pour la plupart des cas

**Inconvénients:**
- ⚠️ Rate limit strict: 1 requête/seconde
- ⚠️ Cache Redis **obligatoire** pour respecter les limites
- ⚠️ Peut être moins précis que Google pour certaines adresses

**Rate Limit:**
- Le cache Redis avec TTL de 24h est **essentiel**
- Pour les batch imports, prévoir des délais entre les requêtes

### Option 3: Google Maps API (Production)

**Configuration:**
```env
GEOCODING_PROVIDER=google
GOOGLE_MAPS_API_KEY=your_api_key_here
REDIS_URL=redis://redis:6379  # Recommandé pour réduire les coûts
```

**Avantages:**
- ✅ Haute précision
- ✅ Rate limits plus élevés
- ✅ Support mondial excellent

**Inconvénients:**
- ❌ Coûts API (payant après quota gratuit)
- ❌ Clé API requise

**Obtenir une clé API:**
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un projet ou en sélectionner un
3. Activer l'API "Geocoding API"
4. Créer des credentials (API Key)
5. Optionnel: Restreindre la clé par IP/domaine

## 📊 Architecture

```
┌─────────────────┐
│  Nginx          │
│  /geolocation/  │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Geolocation Service │
│  Port 3002          │
└────────┬────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌─────────┐
│ Redis  │ │ Provider│
│ Cache  │ │ Adapter │
└────────┘ └─────────┘
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐
│ Google │ │Nominat.│ │  Stub  │
└────────┘ └────────┘ └────────┘
```

## 🧪 Tests

### Test Health Check

```bash
curl https://viridial.com/geolocation/health
```

Réponse attendue:
```json
{
  "status": "ok",
  "service": "geolocation-service",
  "provider": "stub"
}
```

### Test Geocoding

```bash
curl -X POST https://viridial.com/geolocation/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "Paris, France"}'
```

### Test Reverse Geocoding

```bash
curl -X POST https://viridial.com/geolocation/reverse \
  -H "Content-Type: application/json" \
  -d '{"latitude": 48.8566, "longitude": 2.3522}'
```

### Test Distance

```bash
curl "https://viridial.com/geolocation/distance?lat1=48.8566&lon1=2.3522&lat2=48.8606&lon2=2.3376"
```

## 🔗 Intégration avec Property Service

Le Property Service peut utiliser ce service pour géocoder automatiquement les adresses:

```typescript
// Exemple d'intégration dans Property Service
async createProperty(dto: CreatePropertyDto) {
  // Si lat/lon manquants, géocoder l'adresse
  if (!dto.latitude || !dto.longitude) {
    const geocodeResult = await this.geolocationService.geocode(
      `${dto.street}, ${dto.city}, ${dto.country}`
    );
    if (geocodeResult) {
      dto.latitude = geocodeResult.latitude;
      dto.longitude = geocodeResult.longitude;
    }
  }
  // ... créer la propriété
}
```

## 📝 Notes Importantes

1. **Cache Redis**: Essentiel pour Nominatim (rate limit) et pour réduire les coûts Google
2. **Rate Limits**: Respecter les limites des providers (1 req/sec pour Nominatim)
3. **Batch Processing**: Utiliser `/geolocation/batch` pour les imports CSV avec gestion des erreurs
4. **Provider Selection**: Utiliser 'stub' pour dev, 'nominatim' pour staging, 'google' pour production haute précision

## 🐛 Troubleshooting

### Service ne démarre pas

```bash
# Vérifier les logs
docker logs viridial-geolocation-service

# Vérifier les variables d'environnement
docker exec viridial-geolocation-service env | grep GEO
```

### Erreur de cache Redis

Si Redis n'est pas disponible, le service utilise un cache en mémoire (moins performant mais fonctionnel).

### Rate limit dépassé (Nominatim)

- Vérifier que Redis cache est actif
- Augmenter le TTL du cache
- Réduire la fréquence des requêtes
- Envisager Google Maps pour production

## 📚 Documentation API

Voir `services/geolocation-service/README.md` pour la documentation complète des endpoints.

