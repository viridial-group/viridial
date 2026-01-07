# Installation des Services de Base avec Docker Compose

Cette solution déploie les services de base de Viridial (PostgreSQL, Redis, Meilisearch, MinIO) directement avec Docker Compose, sans Kubernetes.

## Prérequis

- Docker installé et en cours d'exécution
- Docker Compose installé (v2.0+ ou docker-compose v1.29+)
- Au moins 2GB de RAM disponible
- Au moins 10GB d'espace disque disponible

## Accès & utilisation rapide des services

> ℹ️ Les identifiants réels sont stockés dans le fichier `.env` (non versionné).  
> Sur le **VPS** : `cd /opt/viridial/infrastructure/docker-compose && cat .env`

### 1. PostgreSQL

- **URL locale (VPS)** : `postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/$POSTGRES_DB`  
- **Connexion depuis le VPS** :

```bash
cd /opt/viridial/infrastructure/docker-compose
source ./.env   # charge POSTGRES_USER / POSTGRES_PASSWORD / POSTGRES_DB / POSTGRES_PORT
docker compose exec postgres psql -U \"$POSTGRES_USER\" -d \"$POSTGRES_DB\"
```

- **Connexion depuis ton ordinateur (client psql installé)** :

```bash
psql \"postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@VOTRE_IP:$POSTGRES_PORT/$POSTGRES_DB\"
```

> Assure‑toi que le port `$POSTGRES_PORT` est ouvert dans le firewall si tu veux y accéder depuis l’extérieur.

### 2. Redis

- **URL locale (VPS)** : `redis://localhost:$REDIS_PORT`  
- **Connexion depuis le VPS** :

```bash
cd /opt/viridial/infrastructure/docker-compose
source ./.env
redis-cli -h 127.0.0.1 -p \"$REDIS_PORT\"
```

> En prod, Redis est exposé uniquement sur le réseau Docker (`viridial-network`). Pour un accès distant, il vaut mieux passer par un tunnel SSH ou exposer un port de manière contrôlée.

### 3. Meilisearch

- **URL locale (VPS)** : `http://localhost:$MEILISEARCH_PORT`  
- **Clé d’API (master key)** : dans `.env` → `MEILI_MASTER_KEY`

Exemple de test depuis le VPS :

```bash
cd /opt/viridial/infrastructure/docker-compose
source ./.env
curl -H \"Authorization: Bearer $MEILI_MASTER_KEY\" \"http://localhost:$MEILISEARCH_PORT/health\"
```

Pour accéder à l’UI web depuis ton navigateur : `http://VOTRE_IP:$MEILISEARCH_PORT`

### 4. MinIO

- **Console Web** : `http://VOTRE_IP:$MINIO_CONSOLE_PORT`  
- **Endpoint API S3** : `http://VOTRE_IP:$MINIO_API_PORT`  
- **Identifiants** : dans `.env` → `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`

Depuis le VPS :

```bash
cd /opt/viridial/infrastructure/docker-compose
source ./.env
echo \"User : $MINIO_ROOT_USER\"
echo \"Password : $MINIO_ROOT_PASSWORD\"
```

> Pour plus de sécurité, change `MINIO_ROOT_PASSWORD` dans `.env` puis redémarre :  
> `docker compose down && docker compose up -d`

## Installation Rapide

```bash
cd infrastructure/docker-compose
chmod +x install-services.sh
./install-services.sh
```

Le script va:
1. Vérifier que Docker est installé et fonctionnel
2. Créer le fichier `.env` depuis `.env.example`
3. Générer automatiquement les mots de passe sécurisés
4. Démarrer tous les services
5. Initialiser les buckets MinIO
6. Afficher les informations de connexion

## Installation Manuelle

### 1. Configurer les variables d'environnement

```bash
cd infrastructure/docker-compose
cp .env.example .env
```

Éditez le fichier `.env` et remplacez les valeurs par défaut:

```bash
# PostgreSQL
POSTGRES_PASSWORD=votre_mot_de_passe_securise

# Meilisearch
MEILI_MASTER_KEY=votre_cle_maitre_64_caracteres

# MinIO
MINIO_ROOT_PASSWORD=votre_mot_de_passe_securise
```

### 2. Démarrer les services

```bash
docker-compose up -d
# ou avec Docker Compose v2:
docker compose up -d
```

### 3. Vérifier l'état

```bash
docker-compose ps
# ou
docker compose ps
```

### 4. Initialiser les buckets MinIO

```bash
docker-compose run --rm minio-init
# ou
docker compose run --rm minio-init
```

## Services Déployés

### PostgreSQL

- **Image:** postgres:14-alpine
- **Port:** 5432 (par défaut)
- **Volume:** `postgres_data` (persistence)
- **Health Check:** pg_isready

**Connexion:**
```bash
psql -h localhost -U viridial -d viridial
```

### Redis

- **Image:** redis:7-alpine
- **Port:** 6379 (par défaut)
- **Volume:** `redis_data` (persistence avec AOF)
- **Health Check:** redis-cli ping

**Connexion:**
```bash
redis-cli -h localhost -p 6379
```

### Meilisearch

- **Image:** getmeili/meilisearch:v1.5
- **Port:** 7700 (par défaut)
- **Volume:** `meilisearch_data` (persistence)
- **Health Check:** HTTP /health

**Accès:**
```bash
curl http://localhost:7700/health
```

### MinIO

- **Image:** minio/minio:latest
- **Ports:** 
  - API: 9000 (par défaut)
  - Console: 9001 (par défaut)
- **Volume:** `minio_data` (persistence)
- **Health Check:** HTTP /minio/health/live

**Accès:**
- Console Web: http://localhost:9001
- API: http://localhost:9000

**Buckets créés automatiquement:**
- `property-images`
- `documents`
- `backups`

## Commandes Utiles

### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f meilisearch
docker-compose logs -f minio
```

### Arrêter les services

```bash
docker-compose down
```

### Arrêter et supprimer les volumes (⚠️ supprime les données)

```bash
docker-compose down -v
```

### Redémarrer un service

```bash
docker-compose restart postgres
```

### Vérifier l'état

```bash
docker-compose ps
```

### Accéder à un conteneur

```bash
docker-compose exec postgres psql -U viridial -d viridial
docker-compose exec redis redis-cli
```

## Sauvegarde et Restauration

### Sauvegarder PostgreSQL

```bash
docker-compose exec postgres pg_dump -U viridial viridial > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurer PostgreSQL

```bash
docker-compose exec -T postgres psql -U viridial -d viridial < backup.sql
```

### Sauvegarder Redis

```bash
docker-compose exec redis redis-cli SAVE
docker cp viridial-redis:/data/dump.rdb ./redis_backup_$(date +%Y%m%d_%H%M%S).rdb
```

### Sauvegarder MinIO

```bash
# Utiliser mc (MinIO Client)
docker run --rm -v $(pwd):/backup minio/mc cp -r minio/property-images /backup/
```

## Configuration Avancée

### Modifier les ports

Éditez le fichier `.env` et modifiez les variables `*_PORT`:

```bash
POSTGRES_PORT=5433
REDIS_PORT=6380
MEILISEARCH_PORT=7701
MINIO_API_PORT=9002
MINIO_CONSOLE_PORT=9003
```

Puis redémarrez:

```bash
docker-compose down
docker-compose up -d
```

### Modifier la configuration Redis

Éditez `config/redis.conf` puis redémarrez Redis:

```bash
docker-compose restart redis
```

### Modifier la configuration PostgreSQL

Ajoutez des paramètres dans `docker-compose.yml` dans la section `command` du service `postgres`.

## Sécurité

⚠️ **IMPORTANT:**

1. **Ne commitez JAMAIS le fichier `.env`** - Il contient des mots de passe
2. Changez tous les mots de passe par défaut
3. Utilisez des mots de passe forts (minimum 16 caractères)
4. Limitez l'accès aux ports exposés avec un firewall
5. Pour la production, utilisez un reverse proxy (Nginx/Traefik) devant les services

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
sudo lsof -i :5432  # Pour PostgreSQL
sudo lsof -i :6379  # Pour Redis

# Modifier le port dans .env
```

### Problème de permissions

```bash
# Vérifier les permissions des volumes
docker volume ls
docker volume inspect viridial_postgres_data
```

### Réinitialiser un service

```bash
# Arrêter et supprimer le volume
docker-compose stop [service-name]
docker volume rm viridial_[service-name]_data
docker-compose up -d [service-name]
```

## Migration depuis Kubernetes

Si vous migrez depuis Kubernetes:

1. **Exporter les données PostgreSQL:**
   ```bash
   kubectl exec -n viridial-production postgres-0 -- pg_dump -U viridial viridial > backup.sql
   ```

2. **Exporter les données Redis:**
   ```bash
   kubectl exec -n viridial-production redis-xxx -- redis-cli SAVE
   kubectl cp viridial-production/redis-xxx:/data/dump.rdb ./redis_backup.rdb
   ```

3. **Exporter les données Meilisearch:**
   ```bash
   kubectl cp viridial-production/meilisearch-xxx:/meili_data ./meilisearch_backup
   ```

4. **Exporter les données MinIO:**
   ```bash
   # Utiliser mc depuis un pod Kubernetes
   ```

5. **Importer dans Docker Compose:**
   - Restaurer PostgreSQL (voir section Sauvegarde)
   - Restaurer Redis (voir section Sauvegarde)
   - Copier les volumes Meilisearch et MinIO

## Prochaines Étapes

Après l'installation des services de base:

1. Configurer les migrations Flyway pour PostgreSQL
2. Initialiser les index Meilisearch
3. Configurer les buckets MinIO avec les bonnes politiques
4. Déployer les microservices de l'application

## Support

Pour plus d'aide, consultez:
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/)
- [Documentation Redis](https://redis.io/documentation)
- [Documentation Meilisearch](https://www.meilisearch.com/docs)
- [Documentation MinIO](https://min.io/docs/)

