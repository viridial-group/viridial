# Guide d'Installation sur VPS Hostinger

Guide rapide pour installer les services de base Viridial sur un VPS Hostinger avec Docker Compose.

## Prérequis

- VPS Hostinger avec accès root/SSH
- Au moins 2GB de RAM
- Au moins 10GB d'espace disque disponible
- Ubuntu 20.04+ ou Debian 11+

## Installation Rapide

### 1. Se connecter au VPS

```bash
ssh root@148.230.112.148
```

### 2. Installer Docker

```bash
# Mettre à jour le système
apt update && apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Démarrer Docker
systemctl start docker
systemctl enable docker

# Vérifier l'installation
docker --version
```

### 3. Installer Docker Compose

```bash
# Télécharger Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Rendre exécutable
chmod +x /usr/local/bin/docker-compose

# Vérifier l'installation
docker-compose --version
```

### 4. Cloner le Repository

```bash
# Installer Git si nécessaire
apt install -y git

# Cloner le repo
git clone https://github.com/viridial-group/viridial.git /opt/viridial
cd /opt/viridial/infrastructure/docker-compose
```

### 5. Installer les Services

```bash
# Rendre le script exécutable
chmod +x install-services.sh

# Lancer l'installation
./install-services.sh
```

Le script va:
- ✅ Vérifier Docker
- ✅ Créer le fichier `.env` avec mots de passe générés
- ✅ Démarrer tous les services
- ✅ Initialiser les buckets MinIO
- ✅ Afficher les informations de connexion

### 6. Vérifier l'Installation

```bash
# Tester la connectivité
./test-services.sh

# Voir l'état des services
docker-compose ps

# Voir les logs
docker-compose logs -f
```

## Configuration Firewall (UFW)

Si UFW est activé, ouvrir les ports nécessaires:

```bash
# PostgreSQL (si accès externe nécessaire)
ufw allow 5432/tcp

# Redis (si accès externe nécessaire - non recommandé en production)
# ufw allow 6379/tcp

# Meilisearch (si accès externe nécessaire)
ufw allow 7700/tcp

# MinIO API
ufw allow 9000/tcp

# MinIO Console
ufw allow 9001/tcp
```

⚠️ **Sécurité:** En production, n'exposez pas PostgreSQL et Redis publiquement. Utilisez un VPN ou un tunnel SSH.

## Accès aux Services

### PostgreSQL

```bash
# Depuis le VPS
docker-compose exec postgres psql -U viridial -d viridial

# Depuis l'extérieur (si port ouvert)
psql -h 148.230.112.148 -U viridial -d viridial
```

### Redis

```bash
# Depuis le VPS
docker-compose exec redis redis-cli

# Depuis l'extérieur (si port ouvert)
redis-cli -h 148.230.112.148 -p 6379
```

### Meilisearch

```bash
# Depuis le VPS
curl http://localhost:7700/health

# Depuis l'extérieur (si port ouvert)
curl http://148.230.112.148:7700/health
```

### MinIO

- **Console Web:** http://148.230.112.148:9001
- **API:** http://148.230.112.148:9000

Identifiants par défaut (voir fichier `.env`):
- User: `minioadmin`
- Password: (voir `.env`)

## Sauvegarde

### Sauvegarder PostgreSQL

```bash
# Créer un répertoire de sauvegarde
mkdir -p /opt/viridial/backups

# Sauvegarder
docker-compose exec postgres pg_dump -U viridial viridial > /opt/viridial/backups/postgres_$(date +%Y%m%d_%H%M%S).sql
```

### Sauvegarder Redis

```bash
# Forcer une sauvegarde
docker-compose exec redis redis-cli SAVE

# Copier le dump
docker cp viridial-redis:/data/dump.rdb /opt/viridial/backups/redis_$(date +%Y%m%d_%H%M%S).rdb
```

### Sauvegarder les Volumes

```bash
# Lister les volumes
docker volume ls | grep viridial

# Sauvegarder un volume
docker run --rm -v viridial_postgres_data:/data -v /opt/viridial/backups:/backup ubuntu tar czf /backup/postgres_data_$(date +%Y%m%d_%H%M%S).tar.gz /data
```

## Maintenance

### Redémarrer un Service

```bash
docker-compose restart postgres
docker-compose restart redis
docker-compose restart meilisearch
docker-compose restart minio
```

### Voir les Logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Mettre à Jour les Images

```bash
# Télécharger les nouvelles images
docker-compose pull

# Redémarrer avec les nouvelles images
docker-compose up -d
```

### Arrêter les Services

```bash
# Arrêter sans supprimer les volumes
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

## Dépannage

### Service ne démarre pas

```bash
# Vérifier les logs
docker-compose logs [service-name]

# Vérifier l'état
docker-compose ps

# Redémarrer
docker-compose restart [service-name]
```

### Port déjà utilisé

```bash
# Vérifier quel processus utilise le port
sudo lsof -i :5432
sudo netstat -tulpn | grep 5432

# Modifier le port dans .env
nano .env
# Changer POSTGRES_PORT=5433
docker-compose down
docker-compose up -d
```

### Problème de permissions

```bash
# Vérifier les permissions Docker
docker ps
docker volume ls

# Si problème, redémarrer Docker
systemctl restart docker
```

### Espace disque insuffisant

```bash
# Vérifier l'espace disque
df -h

# Nettoyer les images Docker inutilisées
docker system prune -a

# Vérifier la taille des volumes
docker system df -v
```

## Sécurité

### Changer les Mots de Passe

1. Modifier le fichier `.env`:
```bash
nano .env
```

2. Redémarrer les services:
```bash
docker-compose down
docker-compose up -d
```

### Limiter l'Accès aux Ports

En production, utilisez un reverse proxy (Nginx/Traefik) et n'exposez que les ports nécessaires.

### Sauvegarder le Fichier .env

⚠️ **IMPORTANT:** Sauvegardez le fichier `.env` dans un endroit sécurisé. Il contient tous les mots de passe.

```bash
# Sauvegarder .env (chiffré de préférence)
tar czf env_backup_$(date +%Y%m%d).tar.gz .env
# Stocker dans un endroit sécurisé
```

## Prochaines Étapes

Après l'installation des services de base:

1. ✅ Configurer les migrations Flyway pour PostgreSQL
2. ✅ Initialiser les index Meilisearch
3. ✅ Configurer les buckets MinIO avec les bonnes politiques
4. ✅ Déployer les microservices de l'application
5. ✅ Configurer un reverse proxy (Nginx) pour exposer les services
6. ✅ Configurer SSL/TLS avec Let's Encrypt

## Support

Pour plus d'aide:
- Consulter `README.md` dans le même dossier
- Vérifier les logs: `docker-compose logs -f`
- Vérifier l'état: `docker-compose ps`

