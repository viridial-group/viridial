# Property Service - Guide de Déploiement Complet

## 📋 Checklist de Déploiement

### Phase 1: Préparation Locale (Optionnel)

```bash
# 1. Installer les dépendances
cd services/property-service
npm install

# 2. Vérifier que tout compile
npm run build

# 3. Tester localement (nécessite DATABASE_URL)
npm run start:dev
```

### Phase 2: Migration Base de Données

**Important:** Appliquer la migration avant de démarrer le service.

```bash
# Option A: Depuis votre machine (si DB accessible)
cd /Users/mac/viridial
psql $DATABASE_URL < services/property-service/src/migrations/create-properties-tables.sql

# Option B: Sur le VPS
ssh root@148.230.112.148
cd /path/to/viridial
psql $DATABASE_URL < services/property-service/src/migrations/create-properties-tables.sql

# Vérification
psql $DATABASE_URL -c "\d properties"
psql $DATABASE_URL -c "\d property_translations"
```

### Phase 3: Déploiement VPS

```bash
# Depuis votre machine locale
cd /Users/mac/viridial
./scripts/deploy-property-service-vps.sh
```

Ou manuellement sur le VPS:

```bash
ssh root@148.230.112.148
cd /path/to/viridial/infrastructure/docker-compose

# Build
docker compose -f app-property.yml build

# Démarrer
docker compose -f app-property.yml up -d

# Vérifier
docker logs -f viridial-property-service
```

### Phase 4: Mise à Jour Nginx

Le fichier `deploy/nginx/conf.d/default.conf` a déjà été mis à jour, mais il faut redémarrer Nginx:

```bash
# Sur le VPS
docker restart viridial-nginx

# Ou recharger la config
docker exec viridial-nginx nginx -s reload
```

### Phase 5: Vérification

```bash
# Health check
curl https://viridial.com/properties/health
# Attendu: {"status":"ok","service":"property-service"}

# Test création (nécessite userId valide)
curl -X POST https://viridial.com/properties \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "UUID_FROM_AUTH_SERVICE",
    "type": "apartment",
    "price": 250000,
    "translations": [{
      "language": "fr",
      "title": "Test Property",
      "description": "Description test"
    }]
  }'
```

## 🔧 Configuration Requise

### Variables d'Environnement

Sur le VPS, s'assurer que `.env` contient:

```env
# Database (partagée avec auth-service)
DATABASE_URL=postgresql://viridial:password@host:5432/viridial

# Frontend URL
FRONTEND_URL=https://viridial.com
```

### Réseau Docker

Vérifier que le réseau `viridial-network` existe:

```bash
docker network ls | grep viridial-network

# Si absent, créer:
docker network create viridial-network
```

## 🐛 Troubleshooting

### Erreur: Port 3001 déjà utilisé

```bash
# Trouver et arrêter le processus
docker ps -a --filter "publish=3001"
docker stop CONTAINER_ID
docker rm CONTAINER_ID
```

### Erreur: Tables n'existent pas

```bash
# Vérifier
psql $DATABASE_URL -c "\dt properties*"

# Appliquer migration
psql $DATABASE_URL < services/property-service/src/migrations/create-properties-tables.sql
```

### Erreur: Cannot connect to database

```bash
# Vérifier DATABASE_URL
echo $DATABASE_URL

# Tester connexion
psql $DATABASE_URL -c "SELECT 1;"
```

### Service ne répond pas via Nginx

```bash
# Vérifier que le service répond directement
curl http://localhost:3001/properties/health

# Vérifier les logs Nginx
docker logs viridial-nginx --tail=50

# Vérifier le réseau Docker
docker network inspect viridial-network
```

## ✅ Validation Post-Déploiement

- [ ] Service démarre sans erreur
- [ ] Health check retourne 200 OK
- [ ] Tables créées en base de données
- [ ] Nginx proxy fonctionne
- [ ] CORS fonctionne depuis le frontend
- [ ] CRUD fonctionne (créer, lire, modifier, supprimer)

## 📝 Prochaines Étapes

Une fois déployé et validé:

1. **Intégration Frontend**
   - Créer l'interface de gestion des propriétés
   - Connecter le frontend à l'API

2. **Authentification**
   - Implémenter JWT guard
   - Vérifier les permissions utilisateur

3. **Features Avancées**
   - Géocodage automatique
   - Indexation Meilisearch
   - Upload d'images

## 🔗 Liens Utiles

- [README Property Service](../../services/property-service/README.md)
- [Story US-007](../../docs/stories/US-007-properties-crud.story.md)
- [Script de Déploiement](../../scripts/deploy-property-service-vps.sh)

