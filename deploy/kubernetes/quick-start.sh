#!/bin/bash
# Script de déploiement rapide Viridial sur Kubernetes
# Usage: ./quick-start.sh [staging|production]

set -e

ENVIRONMENT=${1:-staging}
NAMESPACE="viridial-${ENVIRONMENT}"

echo "🚀 Déploiement Viridial sur Kubernetes - Environment: ${ENVIRONMENT}"

# Vérifier que kubectl est installé
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl n'est pas installé. Veuillez installer Kubernetes d'abord."
    exit 1
fi

# Créer le namespace
echo "📦 Création du namespace ${NAMESPACE}..."
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

# Créer les secrets
echo "🔐 Création des secrets..."
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER=viridial \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=POSTGRES_DB=viridial \
  -n ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic meilisearch-secret \
  --from-literal=MEILI_MASTER_KEY=$(openssl rand -base64 32) \
  -n ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic minio-secret \
  --from-literal=MINIO_ROOT_USER=minioadmin \
  --from-literal=MINIO_ROOT_PASSWORD=$(openssl rand -base64 32) \
  -n ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

echo "✅ Secrets créés"

# Déployer les services de base
echo "🗄️  Déploiement PostgreSQL..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: ${NAMESPACE}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: ${NAMESPACE}
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:14-alpine
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_PASSWORD
        - name: POSTGRES_DB
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: POSTGRES_DB
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 20Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: ${NAMESPACE}
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
EOF

echo "✅ PostgreSQL déployé"

echo "🔍 Déploiement Meilisearch..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: meili-pvc
  namespace: ${NAMESPACE}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: meilisearch
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: meilisearch
  template:
    metadata:
      labels:
        app: meilisearch
    spec:
      containers:
      - name: meilisearch
        image: getmeili/meilisearch:v1.5
        env:
        - name: MEILI_MASTER_KEY
          valueFrom:
            secretKeyRef:
              name: meilisearch-secret
              key: MEILI_MASTER_KEY
        ports:
        - containerPort: 7700
        volumeMounts:
        - name: meili-data
          mountPath: /meili_data
      volumes:
      - name: meili-data
        persistentVolumeClaim:
          claimName: meili-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: meilisearch
  namespace: ${NAMESPACE}
spec:
  selector:
    app: meilisearch
  ports:
  - port: 7700
    targetPort: 7700
EOF

echo "✅ Meilisearch déployé"

echo "💾 Déploiement Redis..."
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: ${NAMESPACE}
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
EOF

echo "✅ Redis déployé"

echo "📦 Déploiement MinIO..."
kubectl apply -f - <<EOF
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: minio-pvc
  namespace: ${NAMESPACE}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minio
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: minio
  template:
    metadata:
      labels:
        app: minio
    spec:
      containers:
      - name: minio
        image: minio/minio:latest
        args:
        - server
        - /data
        - --console-address
        - ":9001"
        env:
        - name: MINIO_ROOT_USER
          valueFrom:
            secretKeyRef:
              name: minio-secret
              key: MINIO_ROOT_USER
        - name: MINIO_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: minio-secret
              key: MINIO_ROOT_PASSWORD
        ports:
        - containerPort: 9000
        - containerPort: 9001
        volumeMounts:
        - name: minio-data
          mountPath: /data
      volumes:
      - name: minio-data
        persistentVolumeClaim:
          claimName: minio-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: minio
  namespace: ${NAMESPACE}
spec:
  selector:
    app: minio
  ports:
  - name: api
    port: 9000
    targetPort: 9000
  - name: console
    port: 9001
    targetPort: 9001
EOF

echo "✅ MinIO déployé"

echo ""
echo "⏳ Attente que les services soient prêts..."
kubectl wait --for=condition=ready pod -l app=postgres -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=ready pod -l app=meilisearch -n ${NAMESPACE} --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n ${NAMESPACE} --timeout=300s

echo ""
echo "✅ Services de base déployés!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Build et push des images Docker de l'application"
echo "2. Déployer identity-service et frontend"
echo "3. Configurer l'Ingress avec TLS"
echo ""
echo "Voir: docs/deployment/VPS-KUBERNETES-DEPLOYMENT.md pour les détails complets"

