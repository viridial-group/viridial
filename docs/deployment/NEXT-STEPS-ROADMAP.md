# 🚀 Prochaines Étapes - Roadmap Viridial

Document récapitulatif des prochaines étapes à suivre après la configuration centralisée des fichiers `.env`.

## ✅ Accomplissements Récents

1. ✅ **Auth Service** - Déployé et fonctionnel (inscription, login, email verification)
2. ✅ **Frontend** - Déployé avec HTTPS sur viridial.com
3. ✅ **Property Service** - Structure complète créée avec géocodage automatique
4. ✅ **Geolocation Service** - Implémenté avec support Google/Nominatim/Stub
5. ✅ **Intégration Geolocation ↔ Property** - Géocodage automatique et recherche proximité complétés
6. ✅ **Configuration .env** - Système centralisé avec script `setup-env.sh`

## 🎯 Actions Immédiates (Priorité 1)

### Option A: Déployer Property & Geolocation Services ✅ RECOMMANDÉ

**Services prêts à déployer :**
- ✅ Geolocation Service - Implémenté avec géocodage automatique
- ✅ Property Service - Implémenté avec intégration geocoding
- ✅ Scripts de déploiement créés
- ✅ Configuration .env centralisée

**Étapes de déploiement :**

1. **Préparer les variables d'environnement**
   ```bash
   ./scripts/setup-env.sh
   ```

2. **Déployer Geolocation Service**
   ```bash
   ./scripts/deploy-geolocation-service-vps.sh
   ```

3. **Appliquer migrations SQL pour Property Service**
   ```bash
   psql $DATABASE_URL < services/property-service/src/migrations/create-properties-tables.sql
   ```

4. **Déployer Property Service**
   ```bash
   ./scripts/deploy-property-service-vps.sh
   ```

5. **Tester l'intégration**
   - Voir `docs/deployment/DEPLOY-SERVICES-GUIDE.md` pour les tests détaillés

**Avantages:**
- Complète US-007 (Properties CRUD) et US-019 (Geolocation)
- Géocodage automatique fonctionnel
- Recherche proximité opérationnelle
- Prêt pour l'implémentation de l'authentification JWT

**Guide complet :** `docs/deployment/DEPLOY-SERVICES-GUIDE.md`

### Option B: Déployer les Services Property et Geolocation ✅ COMPLÉTÉ

L'intégration complète entre Property Service et Geolocation Service est maintenant terminée :

**Fonctionnalités implémentées :**
- ✅ Géocodage automatique lors de création/modification de propriétés
- ✅ Recherche proximité avec calcul de distance
- ✅ Cache Redis pour optimiser les performances
- ✅ Support multi-providers (Google, Nominatim, Stub)

**Prochaines actions :**
1. Générer les fichiers `.env` avec `setup-env.sh`
2. Déployer le Geolocation Service
3. Déployer le Property Service avec migrations SQL
4. Tester l'intégration complète

Voir `docs/deployment/GEOLOCATION-PROPERTY-INTEGRATION-COMPLETE.md` pour les détails.

### Option C: Implémenter la Recherche (US-009) - Ancienne Option B

Selon les dépendances, US-019 (Géolocalisation) devrait être fait avant US-007, mais comme US-007 est déjà en cours :

1. **Créer le Service de Géolocalisation**
   - Intégration avec un provider (Google Maps, OpenStreetMap, etc.)
   - Géocodage (adresse → lat/lon)
   - Reverse géocodage (lat/lon → adresse)
   - Cache géographique

2. **Intégrer dans Property Service**
   - Géocodage automatique lors de la création/modification de propriété
   - Utiliser les coordonnées pour la recherche géographique

## 📋 Roadmap Recommandée

### Phase 1: Finaliser Property Service (1-2 jours)

**Tâches:**
- [ ] Déployer Property Service sur VPS
- [ ] Appliquer migrations SQL
- [ ] Tester les endpoints CRUD
- [ ] Implémenter JWT authentication
- [ ] Créer les pages frontend pour Property Management

**Résultat:** Property Service fonctionnel et sécurisé

### Phase 2: Géolocalisation (US-019) (2-3 jours)

**Tâches:**
- [ ] Choisir provider de géocodage (Google Maps API / OpenStreetMap)
- [ ] Créer service de géocodage
- [ ] Implémenter cache géographique (Redis)
- [ ] Intégrer dans Property Service
- [ ] Tests de géocodage

**Résultat:** Géolocalisation automatique des propriétés

### Phase 3: Recherche (US-009) (3-4 jours)

**Tâches:**
- [ ] Configurer Meilisearch
- [ ] Indexer les propriétés dans Meilisearch
- [ ] Implémenter endpoints de recherche (texte, géolocalisation)
- [ ] Créer interface de recherche frontend
- [ ] Tests de recherche

**Résultat:** Recherche de propriétés fonctionnelle

### Phase 4: Upload de Médias (2-3 jours)

**Tâches:**
- [ ] Configurer MinIO ou S3
- [ ] Implémenter upload d'images
- [ ] Optimisation d'images (resize, WebP)
- [ ] Intégrer dans Property Service
- [ ] Interface frontend pour upload

**Résultat:** Gestion des médias pour les propriétés

## 🛠️ Problèmes à Résoudre

### 1. Erreur npm EACCES (Optionnel)

**Problème:** Permission denied lors de `npm install` localement

**Solution Alternative:** Utiliser Docker pour le build (recommandé)
- Docker installe automatiquement les dépendances lors du build
- Pas besoin de npm install local
- Script `deploy-property-service-vps.sh` gère cela

**Solution Directe (si nécessaire):**
```bash
sudo chown -R $(whoami) ~/.npm
```

### 2. Property Service - Build Docker

**Action:** Vérifier que le Dockerfile build correctement
```bash
cd services/property-service
docker build -t viridial/property-service:test .
```

## 🔍 Vérification de l'État Actuel

### Checklist Pré-Déploiement Property Service

- [x] Structure du service créée
- [x] Entities, DTOs, Services, Controllers
- [x] Dockerfile configuré
- [x] Docker Compose configuré
- [x] Migration SQL créée
- [x] Script de déploiement créé
- [x] Nginx configuré pour proxy
- [ ] **Migration SQL appliquée** ← À faire
- [ ] **Service déployé** ← À faire
- [ ] **Health check fonctionne** ← À faire
- [ ] **JWT authentication implémentée** ← À faire

## 📝 Prochaines Actions Recommandées

**Option 1: Déployer Property Service (Recommandé)**
1. Configurer `.env` sur VPS avec `setup-env.sh`
2. Appliquer migrations SQL
3. Déployer via Docker
4. Tester les endpoints
5. Implémenter JWT auth

**Option 2: Continuer avec Géolocalisation**
1. Créer un nouveau service ou module de géolocalisation
2. Intégrer un provider (Google Maps API recommandé)
3. Implémenter géocodage et reverse géocodage
4. Intégrer dans Property Service

**Option 3: Créer Interface Frontend**
1. Créer pages de gestion des propriétés
2. Formulaire de création/édition
3. Liste des propriétés
4. Détails d'une propriété

## 🎯 Décision Recommandée

**Déployer d'abord le Property Service** pour :
- Valider que tout fonctionne en production
- Permettre les tests end-to-end
- Puis continuer avec les fonctionnalités avancées (géolocalisation, recherche)

**Commande pour démarrer:**
```bash
# Sur le VPS
cd /opt/viridial
./scripts/setup-env.sh  # Configurer les fichiers .env
./scripts/deploy-property-service-vps.sh  # Déployer le service
```

## 📚 Documentation Disponible

- [Property Service Deployment](./PROPERTY-SERVICE-DEPLOYMENT.md)
- [Property Service Setup](./PROPERTY-SERVICE-SETUP.md)
- [Property Service Status](./PROPERTY-SERVICE-STATUS.md)
- [Environment Configuration](./ENV-CONFIGURATION.md)
- [Production Status](./PRODUCTION-STATUS.md)

