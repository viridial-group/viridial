# ✅ US-INFRA-02: Services de Base - Installation Complétée

## Date de Complétion
$(date +%Y-%m-%d)

## Résumé

Les services de base (PostgreSQL, Redis, Meilisearch, MinIO) ont été installés avec succès sur le VPS Hostinger (148.230.112.148) en utilisant Docker Compose.

## Services Déployés

### ✅ PostgreSQL 14
- **Status:** ✅ Opérationnel
- **Port:** 5432
- **Volume:** `postgres_data` (persistence garantie)
- **Test:** ✅ Connectivité validée

### ✅ Redis 7
- **Status:** ✅ Opérationnel
- **Port:** 6379
- **Volume:** `redis_data` (persistence AOF activée)
- **Test:** ✅ Connectivité validée

### ✅ Meilisearch v1.5
- **Status:** ✅ Opérationnel
- **Port:** 7700
- **Volume:** `meilisearch_data` (persistence garantie)
- **Test:** ✅ Connectivité validée

### ✅ MinIO
- **Status:** ✅ Opérationnel
- **Ports:** 
  - API: 9000
  - Console: 9001
- **Volume:** `minio_data` (persistence garantie)
- **Buckets:** ✅ Initialisés (property-images, documents, backups)
- **Test:** ✅ Connectivité validée

## Tests de Connectivité

Tous les tests de connectivité ont réussi:

```
✓ PostgreSQL OK
✓ Redis OK
✓ Meilisearch OK
✓ MinIO API OK
```

## Endpoints de Production

### PostgreSQL
- **Host:** localhost (depuis VPS) ou 148.230.112.148 (depuis extérieur)
- **Port:** 5432
- **Database:** viridial
- **User:** viridial
- **Password:** (voir fichier `.env`)

### Redis
- **Host:** localhost (depuis VPS) ou 148.230.112.148 (depuis extérieur)
- **Port:** 6379

### Meilisearch
- **URL:** http://localhost:7700 (depuis VPS) ou http://148.230.112.148:7700 (depuis extérieur)
- **Master Key:** (voir fichier `.env`)

### MinIO
- **API:** http://localhost:9000 (depuis VPS) ou http://148.230.112.148:9000 (depuis extérieur)
- **Console:** http://localhost:9001 (depuis VPS) ou http://148.230.112.148:9001 (depuis extérieur)
- **Root User:** minioadmin
- **Root Password:** (voir fichier `.env`)

## Fichiers de Configuration

- **docker-compose.yml:** Configuration des services
- **.env:** Variables d'environnement et secrets (⚠️ NE PAS COMMITER)
- **config/redis.conf:** Configuration Redis

## Commandes Utiles

### Voir l'état des services
```bash
cd /opt/viridial/infrastructure/docker-compose
docker-compose ps
```

### Voir les logs
```bash
docker-compose logs -f [service-name]
```

### Redémarrer un service
```bash
docker-compose restart [service-name]
```

### Tester la connectivité
```bash
./test-services.sh
```

### Arrêter les services
```bash
docker-compose down
```

### Redémarrer tous les services
```bash
docker-compose restart
```

## Prochaines Étapes

1. **Sauvegarder les Credentials**
   - Sauvegarder le fichier `.env` dans un gestionnaire de mots de passe sécurisé
   - Localisation: `/opt/viridial/infrastructure/docker-compose/.env`

2. **Configurer les Microservices**
   - Mettre à jour les variables d'environnement des microservices
   - Utiliser les endpoints ci-dessus pour la connexion

3. **Initialiser les Index Meilisearch**
   - Créer les index nécessaires (properties, etc.)
   - Configurer les paramètres de recherche

4. **Configurer les Migrations Flyway**
   - Déployer les migrations PostgreSQL
   - Initialiser le schéma de base de données

5. **Configurer le Firewall (si nécessaire)**
   - Limiter l'accès aux ports exposés
   - Utiliser un reverse proxy (Nginx) pour la production

6. **Valider la Persistence**
   - Redémarrer les conteneurs et vérifier que les données sont conservées
   - Tester les sauvegardes

## Notes de Sécurité

⚠️ **IMPORTANT:**
- Le fichier `.env` contient tous les mots de passe - NE JAMAIS le commiter
- En production, limiter l'accès aux ports avec un firewall
- Utiliser un reverse proxy (Nginx/Traefik) devant les services
- Configurer SSL/TLS avec Let's Encrypt pour les accès externes

## Validation de la Persistence

Pour valider que la persistence fonctionne:

```bash
# 1. Créer des données de test
docker-compose exec postgres psql -U viridial -d viridial -c "CREATE TABLE test_persistence (id SERIAL PRIMARY KEY, data TEXT);"
docker-compose exec postgres psql -U viridial -d viridial -c "INSERT INTO test_persistence (data) VALUES ('test data');"

# 2. Redémarrer les services
docker-compose restart postgres

# 3. Vérifier que les données sont toujours là
docker-compose exec postgres psql -U viridial -d viridial -c "SELECT * FROM test_persistence;"

# 4. Nettoyer
docker-compose exec postgres psql -U viridial -d viridial -c "DROP TABLE test_persistence;"
```

## Support

Pour plus d'aide:
- Consulter `README.md` pour la documentation complète
- Consulter `INSTALL-VPS.md` pour le guide d'installation
- Consulter `NEXT-STEPS.md` pour les prochaines étapes
- Vérifier les logs: `docker-compose logs -f [service]`

