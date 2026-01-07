# Guide de Déploiement Viridial sur VPS avec Kubernetes

Ce guide vous permet de déployer Viridial SaaS sur votre VPS avec Kubernetes (Kubeadm).

## Prérequis

- **VPS avec:**
  - Minimum 3 VPS (ou 1 VPS pour test simple)
  - 4GB RAM, 2 CPU, 50GB disk par node (minimum)
  - Ubuntu 22.04 LTS ou Debian 12
  - Accès root ou utilisateur avec sudo
- **Domain name** (optionnel pour staging: `staging.viridial.com`)
- **GitHub repository** avec accès

## Architecture Recommandée

### Option 1: MVP Simple (1 VPS)
- 1 node Kubernetes (control plane + worker combiné)
- Tous les services sur le même node
- **Coût:** ~5€/mois (Hetzner CPX21)

### Option 2: Staging (3 VPS)
- 1 control plane + 2 worker nodes
- Services distribués
- **Coût:** ~15€/mois (Hetzner CPX21 x 3)

### Option 3: Production (5+ VPS)
- 1 control plane + 4+ worker nodes
- HA et redondance
- **Coût:** ~25€/mois (Hetzner CPX21 x 5)

## Étape 1: Préparation des VPS

### Sur chaque VPS

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer dépendances
sudo apt install -y curl wget git vim ufw

# Configurer firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 6443/tcp  # Kubernetes API
sudo ufw allow 10250/tcp # Kubelet
sudo ufw allow 2379:2380/tcp # etcd (control plane)
sudo ufw allow 30000:32767/tcp # NodePort services
sudo ufw enable

# Désactiver swap (requis pour Kubernetes)
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# Configurer sysctl pour Kubernetes
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

## Étape 2: Installation de Docker

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Ajouter utilisateur au groupe docker
sudo usermod -aG docker $USER
newgrp docker

# Configurer Docker pour Kubernetes
sudo mkdir -p /etc/docker
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl restart docker
sudo systemctl enable docker
```

## Étape 3: Installation de Kubernetes (Kubeadm)

```bash
# Ajouter repository Kubernetes
sudo apt-get install -y apt-transport-https ca-certificates gpg
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list

# Installer kubeadm, kubelet, kubectl
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

## Étape 4: Initialiser le Cluster Kubernetes

### Sur le node Control Plane (premier VPS)

```bash
# Initialiser le cluster
sudo kubeadm init --pod-network-cidr=10.244.0.0/16

# Configurer kubectl pour utilisateur non-root
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Sauvegarder la commande join (pour ajouter worker nodes)
# La commande join sera affichée, la sauvegarder!
```

### Installer CNI Plugin (Calico)

```bash
# Installer Calico pour networking
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/tigera-operator.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/custom-resources.yaml

# Vérifier que les pods sont en cours d'exécution
kubectl get nodes
kubectl get pods --all-namespaces
```

### Sur les Worker Nodes (autres VPS)

```bash
# Exécuter la commande join obtenue lors de l'init
# Exemple (à remplacer par votre commande):
sudo kubeadm join <CONTROL_PLANE_IP>:6443 --token <TOKEN> \
  --discovery-token-ca-cert-hash sha256:<HASH>
```

## Étape 5: Installer les Composants Essentiels

### Nginx Ingress Controller

```bash
# Installer Nginx Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Vérifier l'installation
kubectl get pods -n ingress-nginx
```

### Cert-Manager (TLS automatique)

```bash
# Installer cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Configurer Let's Encrypt issuer
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@example.com  # Remplacer par votre email
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Metrics Server (pour HPA)

```bash
# Installer Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# Vérifier
kubectl get deployment metrics-server -n kube-system
```

## Étape 6: Créer les Namespaces

```bash
# Créer namespaces pour l'application
kubectl create namespace viridial-staging
kubectl create namespace viridial-production
kubectl create namespace viridial-monitoring

# Configurer resource quotas (optionnel)
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: viridial-staging
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
EOF
```

## Étape 7: Déployer les Services de Base

### PostgreSQL

```bash
# Créer secret pour PostgreSQL
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER=viridial \
  --from-literal=POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=POSTGRES_DB=viridial \
  -n viridial-staging

# Déployer PostgreSQL avec StatefulSet
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
  namespace: viridial-staging
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
  namespace: viridial-staging
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
  namespace: viridial-staging
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
EOF
```

### Redis

```bash
# Déployer Redis
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: viridial-staging
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
  namespace: viridial-staging
spec:
  selector:
    app: redis
  ports:
  - port: 6379
    targetPort: 6379
EOF
```

### Meilisearch

```bash
# Créer secret pour Meilisearch
kubectl create secret generic meilisearch-secret \
  --from-literal=MEILI_MASTER_KEY=$(openssl rand -base64 32) \
  -n viridial-staging

# Déployer Meilisearch
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: meilisearch
  namespace: viridial-staging
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
kind: PersistentVolumeClaim
metadata:
  name: meili-pvc
  namespace: viridial-staging
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: meilisearch
  namespace: viridial-staging
spec:
  selector:
    app: meilisearch
  ports:
  - port: 7700
    targetPort: 7700
EOF
```

### MinIO (Object Storage)

```bash
# Créer secret pour MinIO
kubectl create secret generic minio-secret \
  --from-literal=MINIO_ROOT_USER=minioadmin \
  --from-literal=MINIO_ROOT_PASSWORD=$(openssl rand -base64 32) \
  -n viridial-staging

# Déployer MinIO
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: minio
  namespace: viridial-staging
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
kind: PersistentVolumeClaim
metadata:
  name: minio-pvc
  namespace: viridial-staging
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 50Gi
---
apiVersion: v1
kind: Service
metadata:
  name: minio
  namespace: viridial-staging
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
```

## Étape 8: Déployer l'Application

### Build et Push des Images Docker

```bash
# Depuis votre machine locale
cd /Users/mac/viridial

# Build identity-service
cd apis/services/identity-service
docker build -t your-registry/viridial-identity-service:latest .
docker push your-registry/viridial-identity-service:latest

# Build frontend
cd ../../frontend
docker build -t your-registry/viridial-frontend:latest .
docker push your-registry/viridial-frontend:latest
```

### Déployer Identity Service

```bash
# Créer ConfigMap pour configuration
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: identity-service-config
  namespace: viridial-staging
data:
  SPRING_PROFILES_ACTIVE: "staging"
  DATABASE_URL: "jdbc:postgresql://postgres:5432/viridial"
  REDIS_HOST: "redis"
  REDIS_PORT: "6379"
EOF

# Déployer Identity Service
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: identity-service
  namespace: viridial-staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: identity-service
  template:
    metadata:
      labels:
        app: identity-service
    spec:
      containers:
      - name: identity-service
        image: your-registry/viridial-identity-service:latest
        ports:
        - containerPort: 8080
        envFrom:
        - configMapRef:
            name: identity-service-config
        - secretRef:
            name: postgres-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: identity-service
  namespace: viridial-staging
spec:
  selector:
    app: identity-service
  ports:
  - port: 8080
    targetPort: 8080
EOF
```

### Déployer Frontend

```bash
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: viridial-staging
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-registry/viridial-frontend:latest
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: viridial-staging
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
EOF
```

## Étape 9: Configurer Ingress avec TLS

```bash
# Créer Ingress avec TLS automatique
cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: viridial-ingress
  namespace: viridial-staging
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - staging.viridial.com  # Remplacer par votre domaine
    secretName: viridial-tls
  rules:
  - host: staging.viridial.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: identity-service
            port:
              number: 8080
      - path: /api/search
        pathType: Prefix
        backend:
          service:
            name: meilisearch
            port:
              number: 7700
EOF
```

## Étape 10: Vérification

```bash
# Vérifier tous les pods
kubectl get pods -n viridial-staging

# Vérifier les services
kubectl get svc -n viridial-staging

# Vérifier l'ingress
kubectl get ingress -n viridial-staging

# Vérifier les certificats TLS
kubectl get certificate -n viridial-staging

# Logs d'un service
kubectl logs -f deployment/identity-service -n viridial-staging
```

## Étape 11: Initialiser Meilisearch

```bash
# Obtenir le master key
MEILI_KEY=$(kubectl get secret meilisearch-secret -n viridial-staging -o jsonpath='{.data.MEILI_MASTER_KEY}' | base64 -d)

# Port-forward pour accéder à Meilisearch
kubectl port-forward svc/meilisearch 7700:7700 -n viridial-staging

# Dans un autre terminal, initialiser l'index
export MEILI_MASTER_KEY=$MEILI_KEY
bash deploy/meili-init/init-meili.sh
```

## Étape 12: Exécuter les Migrations Database

```bash
# Port-forward PostgreSQL
kubectl port-forward svc/postgres 5432:5432 -n viridial-staging

# Exécuter Flyway migrations (depuis votre machine locale)
# Assurez-vous d'avoir Flyway installé
flyway -url=jdbc:postgresql://localhost:5432/viridial \
  -user=viridial \
  -password=$(kubectl get secret postgres-secret -n viridial-staging -o jsonpath='{.data.POSTGRES_PASSWORD}' | base64 -d) \
  migrate
```

## Commandes Utiles

```bash
# Accéder à un pod
kubectl exec -it <pod-name> -n viridial-staging -- /bin/sh

# Redémarrer un deployment
kubectl rollout restart deployment/identity-service -n viridial-staging

# Voir les événements
kubectl get events -n viridial-staging --sort-by='.lastTimestamp'

# Scale un service
kubectl scale deployment/identity-service --replicas=3 -n viridial-staging

# Voir les logs
kubectl logs -f deployment/identity-service -n viridial-staging

# Décrire une ressource
kubectl describe pod <pod-name> -n viridial-staging
```

## Prochaines Étapes

1. **Configurer CI/CD:** GitHub Actions pour déploiement automatique
2. **Ajouter Observabilité:** Prometheus, Grafana, Loki
3. **Configurer Backups:** Scripts de backup PostgreSQL et MinIO
4. **Sécuriser:** Network Policies, RBAC, Vault pour secrets
5. **Monitoring:** Alertes et dashboards

## Troubleshooting

### Pods en état Pending
```bash
# Vérifier les événements
kubectl describe pod <pod-name> -n viridial-staging

# Vérifier les PVC
kubectl get pvc -n viridial-staging
```

### Services non accessibles
```bash
# Vérifier les endpoints
kubectl get endpoints -n viridial-staging

# Tester la connectivité
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup identity-service
```

### Certificats TLS non générés
```bash
# Vérifier cert-manager
kubectl get pods -n cert-manager

# Vérifier les certificats
kubectl describe certificate viridial-tls -n viridial-staging
```

## Support

Pour plus d'informations, consultez:
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kubeadm Guide](https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/)
- Story US-INFRA-01 pour l'architecture complète

