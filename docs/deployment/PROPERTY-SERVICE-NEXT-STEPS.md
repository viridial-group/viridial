# Property Service - Prochaines Étapes

Le Property Service est maintenant **implémenté** mais pas encore déployé. Voici les prochaines actions.

## 🎯 Actions Immédiates

### 1. Appliquer la Migration SQL

**Important:** Doit être fait avant de démarrer le service.

```bash
# Sur le VPS
ssh root@148.230.112.148
cd /path/to/viridial
psql $DATABASE_URL < services/property-service/src/migrations/create-properties-tables.sql
```

### 2. Déployer le Service

```bash
# Option A: Script automatisé
./scripts/deploy-property-service-vps.sh

# Option B: Manuel
cd infrastructure/docker-compose
docker compose -f app-property.yml build
docker compose -f app-property.yml up -d
```

### 3. Vérifier le Déploiement

```bash
# Health check
curl https://viridial.com/properties/health

# Devrait retourner: {"status":"ok","service":"property-service"}
```

### 4. Redémarrer Nginx (si nécessaire)

```bash
docker restart viridial-nginx
```

## 🔧 Après Déploiement

### Implémenter l'Authentification JWT

**Priorité:** Haute - Les endpoints sont actuellement ouverts

1. Créer un JWT guard réutilisable
2. Intégrer avec auth-service pour vérifier les tokens
3. Protéger les endpoints du Property Controller

**Référence:** Voir `services/auth-service/src` pour l'implémentation JWT existante.

### Intégration Frontend

Créer les pages frontend pour:
- Liste des propriétés
- Formulaire de création/édition
- Détails d'une propriété

### Tests

```bash
cd services/property-service
npm install
npm test
```

## 📚 Documentation Disponible

- [Guide de Déploiement Complet](./PROPERTY-SERVICE-DEPLOYMENT.md)
- [Quick Start](./PROPERTY-SERVICE-QUICK-START.md)
- [Statut d'Implémentation](./PROPERTY-SERVICE-STATUS.md)
- [README du Service](../../services/property-service/README.md)

## ✅ Checklist Post-Déploiement

- [ ] Migration SQL appliquée
- [ ] Service déployé et démarré
- [ ] Health check fonctionne
- [ ] Nginx proxy fonctionne
- [ ] CRUD testé via API
- [ ] Logs vérifiés (pas d'erreurs)

## 🚀 Ensuite

Une fois déployé et validé:
1. Implémenter JWT authentication
2. Créer l'interface frontend
3. Ajouter le géocodage (US-019)
4. Intégrer Meilisearch

