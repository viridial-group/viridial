# Quick Start - Déploiement Viridial sur VPS

Guide rapide pour déployer Viridial sur votre VPS avec Kubernetes.

## Option 1: Déploiement Simple (Docker Compose) - Pour commencer rapidement

Si vous voulez tester rapidement sans Kubernetes:

```bash
# Sur votre VPS
git clone <votre-repo> /opt/viridial
cd /opt/viridial
cp .env.example .env
# Éditer .env avec vos valeurs
docker compose up -d
```

**Accès:**
- Frontend: http://VOTRE_IP/
- Backend: http://VOTRE_IP:8080/actuator/health

## Option 2: Déploiement Kubernetes (Recommandé pour production)

### Prérequis Minimum

- **1 VPS** avec:
  - Ubuntu 22.04 LTS
  - 4GB RAM, 2 CPU, 50GB disk
  - Accès root/sudo

### Installation Rapide

#### 1. Préparer le VPS

```bash
# Sur votre VPS
curl -fsSL https://raw.githubusercontent.com/viridial/deploy/main/kubernetes/setup-vps.sh | bash
```

Ou manuellement:

```bash
# Mettre à jour
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Kubernetes
sudo apt-get install -y apt-transport-https ca-certificates gpg
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl

# Désactiver swap
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

#### 2. Initialiser Kubernetes (Single Node)

```bash
# Initialiser le cluster (mode single node pour test)
sudo kubeadm init --pod-network-cidr=10.244.0.0/16 --ignore-preflight-errors=Swap

# Configurer kubectl
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# Permettre les pods sur le control plane (single node)
kubectl taint nodes --all node-role.kubernetes.io/control-plane-

# Installer Calico CNI
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/tigera-operator.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/custom-resources.yaml
```

#### 3. Installer les Composants

```bash
# Nginx Ingress
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Cert-Manager (TLS automatique)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Metrics Server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

#### 4. Déployer les Services de Base

```bash
# Cloner le repo
git clone <votre-repo> /opt/viridial
cd /opt/viridial

# Exécuter le script de déploiement
./deploy/kubernetes/quick-start.sh staging
```

#### 5. Build et Déployer l'Application

```bash
# Build les images (depuis votre machine locale ou CI/CD)
cd apis/services/identity-service
docker build -t your-registry/viridial-identity-service:latest .
docker push your-registry/viridial-identity-service:latest

cd ../../frontend
docker build -t your-registry/viridial-frontend:latest .
docker push your-registry/viridial-frontend:latest

# Sur le VPS, déployer les services
# (Voir docs/deployment/VPS-KUBERNETES-DEPLOYMENT.md pour les manifests complets)
```

## Vérification

```bash
# Vérifier que tout fonctionne
kubectl get pods -n viridial-staging
kubectl get svc -n viridial-staging
kubectl get ingress -n viridial-staging

# Logs
kubectl logs -f deployment/identity-service -n viridial-staging
```

## Accès à l'Application

### Sans domaine (IP directe)

```bash
# Obtenir l'IP du node
kubectl get nodes -o wide

# Accéder via NodePort (si configuré)
# Frontend: http://VPS_IP:30080
# Backend: http://VPS_IP:30081
```

### Avec domaine (TLS automatique)

1. Configurer DNS: `staging.viridial.com` → IP du VPS
2. Créer l'Ingress avec cert-manager (voir guide complet)
3. Accéder: `https://staging.viridial.com`

## Prochaines Étapes

1. **Configurer CI/CD:** GitHub Actions pour déploiement automatique
2. **Ajouter Monitoring:** Prometheus + Grafana
3. **Configurer Backups:** Scripts automatiques
4. **Sécuriser:** Network Policies, RBAC

## Documentation Complète

- **Guide détaillé:** `docs/deployment/VPS-KUBERNETES-DEPLOYMENT.md`
- **Architecture:** `docs/stories/US-INFRA-01.story.md`

## Support

En cas de problème:
1. Vérifier les logs: `kubectl logs -f <pod-name> -n viridial-staging`
2. Vérifier les événements: `kubectl get events -n viridial-staging`
3. Décrire la ressource: `kubectl describe pod <pod-name> -n viridial-staging`

