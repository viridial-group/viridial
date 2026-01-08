# Geolocation Service - Viridial

Service de géolocalisation centralisé pour le géocodage (adresse → coordonnées) et le géocodage inverse (coordonnées → adresse).

## 🚀 Fonctionnalités

- ✅ **Geocoding**: Convertir une adresse en latitude/longitude
- ✅ **Reverse Geocoding**: Convertir des coordonnées en adresse
- ✅ **Distance Calculation**: Calculer la distance entre deux points (formule Haversine)
- ✅ **Batch Geocoding**: Géocoder plusieurs adresses en une seule requête
- ✅ **Caching Redis**: Cache des résultats pour réduire les coûts API et respecter les rate limits
- ✅ **Multiple Providers**: Support Google Maps, Nominatim (OpenStreetMap), et mode stub pour développement

## 📋 Endpoints

### Health Check
```
GET /geolocation/health
```

### Geocode (Address → Coordinates)
```
POST /geolocation/geocode
Body: {
  "address": "10 Rue Exemple, Paris",
  "country": "FR" (optional)
}
Response: {
  "latitude": 48.8566,
  "longitude": 2.3522,
  "formattedAddress": "10 Rue Exemple, Paris, France",
  "street": "10 Rue Exemple",
  "postalCode": "75001",
  "city": "Paris",
  "country": "France",
  "countryCode": "FR",
  "confidence": 0.9
}
```

### Reverse Geocode (Coordinates → Address)
```
POST /geolocation/reverse
Body: {
  "latitude": 48.8566,
  "longitude": 2.3522
}
Response: {
  "formattedAddress": "10 Rue Exemple, Paris, France",
  "street": "10 Rue Exemple",
  "city": "Paris",
  "country": "France",
  ...
}
```

### Calculate Distance
```
GET /geolocation/distance?lat1=48.8566&lon1=2.3522&lat2=48.8606&lon2=2.3376
Response: {
  "distanceKm": 1.5,
  "point1": { "latitude": 48.8566, "longitude": 2.3522 },
  "point2": { "latitude": 48.8606, "longitude": 2.3376 }
}
```

### Batch Geocoding
```
POST /geolocation/batch
Body: {
  "addresses": [
    { "id": "1", "address": "Paris", "country": "FR" },
    { "id": "2", "address": "Lyon", "country": "FR" }
  ]
}
Response: {
  "total": 2,
  "success": 2,
  "failures": 0,
  "results": [...]
}
```

## 🔧 Configuration

### Variables d'Environnement

```env
# Port du service
PORT=3002

# Provider de géocodage: 'google', 'nominatim', ou 'stub'
GEOCODING_PROVIDER=stub

# Google Maps API Key (requis si provider='google')
GOOGLE_MAPS_API_KEY=your_api_key

# Nominatim Base URL (optionnel)
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org

# Redis pour le cache
REDIS_URL=redis://localhost:6379

# Cache TTL en secondes (défaut: 86400 = 24 heures)
GEOCODING_CACHE_TTL=86400

# Frontend URL pour CORS
FRONTEND_URL=https://viridial.com
```

### Providers

#### Stub Provider (Développement)
- **Mode**: Stub/mock pour tests et développement
- **Configuration**: Aucune clé API requise
- **Utilisation**: Par défaut si `GEOCODING_PROVIDER` n'est pas défini

#### Nominatim Provider (OpenStreetMap)
- **Mode**: Gratuit, open source
- **Rate Limit**: 1 requête/seconde (le cache est essentiel!)
- **Configuration**: `GEOCODING_PROVIDER=nominatim`
- **Utilisation**: Idéal pour le développement et la production avec volume modéré

#### Google Maps Provider
- **Mode**: API payante, haute précision
- **Rate Limits**: Variables selon le plan
- **Configuration**: `GEOCODING_PROVIDER=google` + `GOOGLE_MAPS_API_KEY`
- **Utilisation**: Production avec haute précision requise

## 🏗️ Architecture

```
GeolocationService
  ├── Provider Adapter Pattern
  │   ├── GoogleProviderService
  │   ├── NominatimProviderService
  │   └── StubProviderService
  ├── Redis Cache Layer
  │   └── Cache TTL: 24h par défaut
  └── API Endpoints
      ├── /geolocation/geocode
      ├── /geolocation/reverse
      ├── /geolocation/distance
      └── /geolocation/batch
```

## 📦 Installation

```bash
cd services/geolocation-service
npm install
npm run build
npm start
```

## 🐳 Docker

```bash
# Build
docker build -t viridial/geolocation-service:latest .

# Run
docker run -d \
  -p 3002:3002 \
  -e REDIS_URL=redis://redis:6379 \
  -e GEOCODING_PROVIDER=stub \
  viridial/geolocation-service:latest
```

## 🔗 Intégration avec Property Service

Le Property Service peut utiliser ce service pour:
- Géocoder les adresses lors de la création de propriétés
- Remplir automatiquement les champs lat/lon manquants
- Valider les adresses avant publication

## 📝 Notes

- Le cache Redis réduit considérablement les coûts API et améliore les performances
- Nominatim a un rate limit strict (1 req/sec) - le cache est **essentiel**
- Pour la production, envisagez d'utiliser Google Maps ou un service Nominatim auto-hébergé

