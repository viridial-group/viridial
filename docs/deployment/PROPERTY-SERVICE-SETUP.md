# Property Service - Guide de Déploiement

Ce guide explique comment déployer le Property Service sur le VPS.

## 📋 Prérequis

- ✅ Auth-service déployé et fonctionnel
- ✅ Base de données PostgreSQL accessible
- ✅ Réseau Docker `viridial-network` créé
- ✅ Nginx configuré avec HTTPS

## 🗄️ Migration de Base de Données

Avant de déployer le service, appliquer les migrations SQL :

```bash
# Sur le VPS
ssh root@148.230.112.148

# Appliquer la migration
psql $DATABASE_URL < /path/to/viridial/services/property-service/src/migrations/create-properties-tables.sql

# Ou depuis votre machine locale (si vous avez accès à la DB)
cd /Users/mac/viridial
psql $DATABASE_URL < services/property-service/src/migrations/create-properties-tables.sql
```

**Vérification :**

```sql
-- Vérifier que les tables existent
\dt properties
\dt property_translations

-- Vérifier la structure
\d properties
\d property_translations
```

## 🚀 Déploiement

### Option 1: Script Automatisé (Recommandé)

```bash
# Depuis votre machine locale
cd /Users/mac/viridial
./scripts/deploy-property-service-vps.sh
```

### Option 2: Manuel

```bash
# Sur le VPS
ssh root@148.230.112.148

# Cloner ou synchroniser le code
cd /path/to/viridial

# Build et démarrer
cd infrastructure/docker-compose
docker compose -f app-property.yml build
docker compose -f app-property.yml up -d

# Vérifier les logs
docker logs -f viridial-property-service
```

## 🔧 Configuration

### Variables d'Environnement

Créer ou mettre à jour le fichier `.env` sur le VPS :

```env
# Database (partagée avec auth-service)
DATABASE_URL=postgresql://viridial:password@host:5432/viridial

# Frontend URL (pour CORS)
FRONTEND_URL=https://viridial.com
```

### Nginx Configuration

Le fichier `deploy/nginx/conf.d/default.conf` a été mis à jour avec :
- Upstream `property-service` pointant vers `viridial-property-service:3001`
- Location `/properties/` pour proxy les requêtes

**Redémarrer Nginx après modification :**

```bash
# Si Nginx est dans un container
docker restart viridial-nginx

# Ou recharger la configuration
docker exec viridial-nginx nginx -s reload
```

## ✅ Vérification

### Health Check

```bash
# Directement depuis le container
curl http://localhost:3001/properties/health

# Via Nginx (HTTPS)
curl https://viridial.com/properties/health

# Attendu: {"status":"ok","service":"property-service"}
```

### Test CRUD

```bash
# Créer une propriété
curl -X POST https://viridial.com/properties \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID",
    "type": "apartment",
    "price": 250000,
    "currency": "EUR",
    "street": "10 Rue Exemple",
    "city": "Paris",
    "country": "France",
    "translations": [{
      "language": "fr",
      "title": "Appartement centre ville",
      "description": "Superbe appartement..."
    }]
  }'

# Lister les propriétés
curl https://viridial.com/properties

# Obtenir une propriété
curl https://viridial.com/properties/PROPERTY_ID
```

## 🔍 Troubleshooting

### Le service ne démarre pas

```bash
# Vérifier les logs
docker logs viridial-property-service --tail=50

# Erreurs communes:
# - DATABASE_URL non définie → Vérifier .env
# - Connexion DB échouée → Vérifier que PostgreSQL est accessible
# - Port 3001 déjà utilisé → Arrêter le container existant
```

### Erreur 502 Bad Gateway (Nginx)

```bash
# Vérifier que le service répond
docker exec viridial-property-service wget -O- http://localhost:3001/properties/health

# Vérifier le réseau Docker
docker network inspect viridial-network

# Vérifier que property-service est dans le réseau
docker inspect viridial-property-service | grep -A 10 "Networks"
```

### Tables non créées

```bash
# Vérifier les tables
psql $DATABASE_URL -c "\dt properties*"

# Appliquer manuellement si nécessaire
psql $DATABASE_URL < services/property-service/src/migrations/create-properties-tables.sql
```

## 📝 Prochaines Étapes

Une fois le service déployé :

1. **Intégration Frontend**
   - Créer les pages pour gérer les propriétés
   - Intégrer l'API dans le frontend

2. **Authentification**
   - Implémenter JWT guard pour protéger les endpoints
   - Vérifier que l'utilisateur peut seulement modifier ses propres propriétés

3. **Features Additionnelles**
   - Géocodage automatique (US-019)
   - Indexation Meilisearch
   - Upload d'images (MinIO/S3)
   - Workflow de modération

## 🔗 Documentation

- [README Property Service](../../services/property-service/README.md)
- [Story US-007](../../docs/stories/US-007-properties-crud.story.md)
- [Docker Compose](../../infrastructure/docker-compose/app-property.yml)

