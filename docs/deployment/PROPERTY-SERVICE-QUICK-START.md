# Property Service - Quick Start

Guide rapide pour déployer le Property Service.

## ⚡ Déploiement Rapide (5 minutes)

### 1. Migration Base de Données

```bash
# Sur le VPS
ssh root@148.230.112.148
cd /path/to/viridial
psql $DATABASE_URL < services/property-service/src/migrations/create-properties-tables.sql
```

### 2. Déploiement

```bash
# Depuis votre machine locale
cd /Users/mac/viridial
./scripts/deploy-property-service-vps.sh
```

### 3. Vérification

```bash
# Health check
curl https://viridial.com/properties/health
```

## ✅ Si tout fonctionne

Vous devriez voir:
```json
{"status":"ok","service":"property-service"}
```

## 🐛 Si ça ne fonctionne pas

Voir: `docs/deployment/PROPERTY-SERVICE-DEPLOYMENT.md` pour le troubleshooting complet.

