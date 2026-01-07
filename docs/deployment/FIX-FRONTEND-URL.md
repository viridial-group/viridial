# Correction: FRONTEND_URL vers HTTPS

## Problème

`FRONTEND_URL` était configuré avec `http://148.230.112.148/` au lieu de `https://viridial.com` pour la production.

## Solution

Mettre à jour `FRONTEND_URL` dans les variables d'environnement pour utiliser HTTPS et le domaine au lieu de l'IP HTTP.

## Correction Rapide sur le VPS

### Option 1: Utiliser le Script Automatique

```bash
# Depuis votre machine locale
./scripts/update-frontend-url-production.sh

# Ou directement depuis le VPS
ssh root@148.230.112.148 'cd /opt/viridial && ./scripts/update-frontend-url-production.sh'
```

### Option 2: Modification Manuelle

**Sur le VPS:**

```bash
ssh root@148.230.112.148
cd /opt/viridial/infrastructure/docker-compose

# Backup
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Modifier FRONTEND_URL
sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://viridial.com|' .env

# Ou si la ligne n'existe pas, l'ajouter:
echo "FRONTEND_URL=https://viridial.com" >> .env

# Vérifier
grep FRONTEND_URL .env

# Redémarrer auth-service
docker compose -f app-auth.yml restart auth-service

# Vérifier les logs
docker logs viridial-auth-service --tail=20 | grep -i "CORS\|FRONTEND"
```

## Vérification

Après la mise à jour, vérifier que la configuration est correcte:

```bash
# Vérifier la variable dans le conteneur
docker exec viridial-auth-service env | grep FRONTEND_URL

# Vérifier les logs CORS
docker logs viridial-auth-service | grep "CORS enabled"

# Les emails devraient maintenant utiliser https://viridial.com
```

## Changements Effectués

1. ✅ Code mis à jour pour utiliser HTTPS par défaut en production
2. ✅ Scripts de déploiement mis à jour
3. ✅ Documentation mise à jour

## Variables d'Environnement Recommandées

```env
# Production (HTTPS)
FRONTEND_URL=https://viridial.com

# Développement local
# FRONTEND_URL=http://localhost:3000
```

## Impact

- ✅ Les liens dans les emails de vérification utiliseront HTTPS
- ✅ Les liens dans les emails de réinitialisation utiliseront HTTPS
- ✅ Meilleure sécurité et cohérence avec la configuration HTTPS

