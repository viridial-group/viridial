# Manifests Kubernetes - Services de Base

Ce répertoire contient les manifests Kubernetes pour déployer les services de base de Viridial (US-INFRA-02).

## Structure

```
services/
├── postgres/
│   ├── postgres-secret.yaml          # Secrets (à générer avec mot de passe)
│   ├── postgres-configmap.yaml       # Configuration PostgreSQL
│   ├── postgres-pvc.yaml             # PersistentVolumeClaim
│   ├── postgres-statefulset.yaml    # StatefulSet PostgreSQL
│   └── postgres-service.yaml         # Service ClusterIP
├── redis/
│   ├── redis-configmap.yaml          # Configuration Redis
│   ├── redis-deployment.yaml         # Deployment Redis
│   └── redis-service.yaml            # Service ClusterIP
├── meilisearch/
│   ├── meilisearch-secret.yaml       # Secret MEILI_MASTER_KEY
│   ├── meilisearch-pvc.yaml          # PersistentVolumeClaim
│   ├── meilisearch-deployment.yaml   # Deployment Meilisearch
│   └── meilisearch-service.yaml      # Service ClusterIP
├── minio/
│   ├── minio-secret.yaml             # Secrets MinIO
│   ├── minio-pvc.yaml                # PersistentVolumeClaim
│   ├── minio-statefulset.yaml        # StatefulSet MinIO
│   ├── minio-service.yaml            # Service ClusterIP
│   └── minio-init-job.yaml           # Job pour créer buckets initiaux
├── kustomization.yaml                # Kustomize pour déploiement groupé
└── README.md                         # Ce fichier
```

## Déploiement

### Option 1: Script automatisé (recommandé)

```bash
cd /opt/viridial  # ou depuis le repo local
chmod +x infrastructure/scripts/deploy-base-services.sh
./infrastructure/scripts/deploy-base-services.sh
```

Le script vous demandera:
- L'environnement (staging/production)
- Les mots de passe (ou les générera automatiquement)

### Option 2: Déploiement manuel

#### 1. Générer les secrets

```bash
# PostgreSQL
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER=viridial \
  --from-literal=POSTGRES_PASSWORD=<password> \
  --from-literal=POSTGRES_DB=viridial \
  -n viridial-staging

# Meilisearch
kubectl create secret generic meilisearch-secret \
  --from-literal=MEILI_MASTER_KEY=$(openssl rand -hex 32) \
  -n viridial-staging

# MinIO
kubectl create secret generic minio-secret \
  --from-literal=MINIO_ROOT_USER=minioadmin \
  --from-literal=MINIO_ROOT_PASSWORD=<password> \
  -n viridial-staging
```

#### 2. Déployer les services

```bash
# PostgreSQL
kubectl apply -f infrastructure/kubernetes/manifests/services/postgres/

# Redis
kubectl apply -f infrastructure/kubernetes/manifests/services/redis/

# Meilisearch
kubectl apply -f infrastructure/kubernetes/manifests/services/meilisearch/

# MinIO
kubectl apply -f infrastructure/kubernetes/manifests/services/minio/
```

#### 3. Initialiser les buckets MinIO

```bash
kubectl apply -f infrastructure/kubernetes/manifests/services/minio/minio-init-job.yaml
kubectl wait --for=condition=complete job/minio-init-buckets -n viridial-staging --timeout=120s
```

### Option 3: Kustomize (déploiement groupé)

```bash
kubectl apply -k infrastructure/kubernetes/manifests/services/
```

**Note:** Kustomize nécessite que les secrets soient créés manuellement d'abord.

## Vérification

```bash
# Vérifier les pods
kubectl get pods -n viridial-staging

# Vérifier les services
kubectl get svc -n viridial-staging

# Vérifier les PVC
kubectl get pvc -n viridial-staging

# Vérifier les logs
kubectl logs -l app=postgres -n viridial-staging
kubectl logs -l app=redis -n viridial-staging
kubectl logs -l app=meilisearch -n viridial-staging
kubectl logs -l app=minio -n viridial-staging
```

## Endpoints des Services

Une fois déployés, les services sont accessibles via DNS Kubernetes:

- **PostgreSQL:** `postgres.viridial-staging.svc.cluster.local:5432`
- **Redis:** `redis.viridial-staging.svc.cluster.local:6379`
- **Meilisearch:** `http://meilisearch.viridial-staging.svc.cluster.local:7700`
- **MinIO API:** `http://minio.viridial-staging.svc.cluster.local:9000`
- **MinIO Console:** `http://minio.viridial-staging.svc.cluster.local:9001`

## Configuration

### PostgreSQL

- **Image:** postgres:14-alpine
- **Storage:** 20GB (staging), 50GB (production)
- **Resources:** 512Mi-1Gi RAM, 250m-1000m CPU (staging)

### Redis

- **Image:** redis:7-alpine
- **Storage:** Pas de persistence par défaut (optionnel)
- **Resources:** 256Mi-512Mi RAM, 100m-500m CPU (staging)

### Meilisearch

- **Image:** getmeili/meilisearch:v1.5
- **Storage:** 10GB (staging), 20GB (production)
- **Resources:** 512Mi-1Gi RAM, 250m-1000m CPU (staging)

### MinIO

- **Image:** minio/minio:latest
- **Storage:** 50GB (staging), 100GB (production)
- **Buckets initiaux:** property-images, documents, backups
- **Resources:** 512Mi-1Gi RAM, 250m-1000m CPU (staging)

## Secrets

⚠️ **IMPORTANT:** Les fichiers `*-secret.yaml` contiennent des placeholders vides. Vous devez:

1. Générer les secrets avec `kubectl create secret` (voir Option 2)
2. OU utiliser le script `deploy-base-services.sh` qui génère automatiquement les secrets

## Persistence

Tous les services avec persistence utilisent le StorageClass `local-path` (installé avec le cluster).

Pour vérifier:
```bash
kubectl get storageclass
```

## Health Checks

Tous les services ont des health checks configurés:
- **Liveness Probe:** Détecte si le conteneur est en vie
- **Readiness Probe:** Détecte si le conteneur est prêt à recevoir du trafic

## Troubleshooting

### Pods en Pending

```bash
# Vérifier les événements
kubectl describe pod <pod-name> -n viridial-staging

# Vérifier les PVC
kubectl get pvc -n viridial-staging
kubectl describe pvc <pvc-name> -n viridial-staging
```

### Services non accessibles

```bash
# Vérifier les services
kubectl get svc -n viridial-staging
kubectl describe svc <service-name> -n viridial-staging

# Tester depuis un pod
kubectl run -it --rm debug --image=busybox --restart=Never -n viridial-staging -- sh
# Dans le pod: wget -O- http://meilisearch:7700/health
```

### Secrets manquants

```bash
# Vérifier les secrets
kubectl get secrets -n viridial-staging
kubectl describe secret <secret-name> -n viridial-staging
```

## Prochaines Étapes

Après le déploiement des services de base:
1. Configurer les migrations Flyway pour PostgreSQL
2. Initialiser les index Meilisearch
3. Configurer les buckets MinIO avec les bonnes politiques
4. Déployer les microservices (US-INFRA-03)

