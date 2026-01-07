# Prochaines Étapes - Installation Services de Base

## ✅ Ce qui est Prêt

- ✅ Solution Docker Compose créée dans `infrastructure/docker-compose/`
- ✅ Scripts d'installation et de test créés
- ✅ Documentation complète disponible
- ✅ Configuration Redis prête

## 🚀 Installation sur le VPS (Étape Suivante)

### Option 1: Installation Automatique (Recommandé)

```bash
# 1. Se connecter au VPS
ssh root@148.230.112.148

# 2. Aller dans le dossier docker-compose
cd /opt/viridial/infrastructure/docker-compose

# 3. Lancer l'installation automatique
chmod +x install-services.sh
./install-services.sh
```

Le script va automatiquement:
- ✅ Vérifier Docker et Docker Compose
- ✅ Créer le fichier `.env` avec mots de passe générés
- ✅ Démarrer tous les services (PostgreSQL, Redis, Meilisearch, MinIO)
- ✅ Initialiser les buckets MinIO
- ✅ Afficher les informations de connexion

### Option 2: Installation Manuelle

Si vous préférez installer manuellement, suivez le guide `INSTALL-VPS.md`.

## 📋 Après l'Installation

### 1. Vérifier que Tout Fonctionne

```bash
cd /opt/viridial/infrastructure/docker-compose
./test-services.sh
```

Vous devriez voir:
```
✓ PostgreSQL OK
✓ Redis OK
✓ Meilisearch OK
✓ MinIO API OK
```

### 2. Vérifier l'État des Services

```bash
docker-compose ps
# ou
docker compose ps
```

Tous les services doivent être `Up` et `healthy`.

### 3. Voir les Logs (si nécessaire)

```bash
docker-compose logs -f
# ou pour un service spécifique
docker-compose logs -f postgres
```

### 4. Sauvegarder les Credentials

⚠️ **IMPORTANT:** Sauvegardez le fichier `.env` qui contient tous les mots de passe:

```bash
# Sur le VPS
cat /opt/viridial/infrastructure/docker-compose/.env

# Copier les valeurs dans un gestionnaire de mots de passe sécurisé
```

## 🔧 Si Problème avec l'Ancien docker-compose.yml

Si vous avez des erreurs avec l'ancien `docker-compose.yml` à la racine:

```bash
# Sur le VPS
cd /opt/viridial

# Nettoyer l'ancien compose (optionnel)
cd infrastructure/docker-compose
./cleanup-old-compose.sh
```

## 📋 Configuration des Microservices

Une fois les services de base installés, vous devrez configurer vos microservices pour utiliser:

### Variables d'Environnement pour les Microservices

```bash
# PostgreSQL
DATABASE_URL=postgresql://viridial:PASSWORD@postgres:5432/viridial
# ou depuis l'extérieur: postgresql://viridial:PASSWORD@148.230.112.148:5432/viridial

# Redis
REDIS_URL=redis://redis:6379
# ou depuis l'extérieur: redis://148.230.112.148:6379

# Meilisearch
MEILISEARCH_URL=http://meilisearch:7700
MEILI_MASTER_KEY=YOUR_MASTER_KEY

# MinIO
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=YOUR_PASSWORD
MINIO_BUCKET_PROPERTY_IMAGES=property-images
MINIO_BUCKET_DOCUMENTS=documents
```

## 🎯 Checklist Complète

- [ ] Docker installé sur le VPS
- [ ] Docker Compose installé sur le VPS
- [ ] Repository cloné sur le VPS (`/opt/viridial`)
- [ ] Services de base installés (`./install-services.sh`)
- [ ] Tests de connectivité réussis (`./test-services.sh`)
- [ ] Credentials sauvegardés (fichier `.env`)
- [ ] Firewall configuré (si nécessaire)
- [ ] Microservices configurés pour utiliser ces services

## 📚 Documentation

- **README.md** - Documentation complète de la solution Docker Compose
- **INSTALL-VPS.md** - Guide détaillé d'installation sur VPS Hostinger
- **test-services.sh** - Script de test de connectivité
- **install-services.sh** - Script d'installation automatique

## 🆘 Support

Si vous rencontrez des problèmes:

1. Vérifier les logs: `docker-compose logs -f [service]`
2. Vérifier l'état: `docker-compose ps`
3. Consulter la section Dépannage dans `README.md`
4. Vérifier que Docker fonctionne: `docker ps`

## 🎉 Prochaines Stories

Après l'installation des services de base:

1. **US-INFRA-03:** Configuration des migrations Flyway
2. **US-INFRA-04:** Initialisation des index Meilisearch
3. **US-INFRA-05:** Configuration des buckets MinIO
4. **US-INFRA-06:** Déploiement des microservices

