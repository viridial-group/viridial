# Installation Directe sur VPS - Viridial Kubernetes

Guide pour installer le cluster Kubernetes directement sur le VPS, sans utiliser Ansible depuis une machine locale.

## 🎯 Approche

Au lieu d'utiliser Ansible depuis votre machine locale, vous exécutez les scripts directement sur le VPS via SSH.

## 📋 Prérequis VPS

- **OS:** Ubuntu 22.04 LTS ou Debian 12
- **RAM:** Minimum 4GB (recommandé 8GB)
- **CPU:** Minimum 2 vCPU (recommandé 4 vCPU)
- **Disk:** Minimum 50GB SSD
- **Accès:** root ou utilisateur avec sudo

## 🚀 Installation

### Étape 1: Se connecter au VPS

```bash
ssh root@148.230.112.148
```

### Étape 2: Cloner le repository

```bash
# Cloner le repository
cd /root
git clone https://github.com/viridial-group/viridial.git
cd viridial
```

### Étape 3: Exécuter le script d'installation

```bash
# Rendre le script exécutable
chmod +x infrastructure/scripts/install-on-vps.sh

# Exécuter l'installation
sudo infrastructure/scripts/install-on-vps.sh
```

Le script va:
1. ✅ Vérifier les prérequis (OS, RAM, CPU, Disk)
2. ✅ Mettre à jour le système
3. ✅ Désactiver swap
4. ✅ Configurer modules kernel et sysctl
5. ✅ Configurer firewall (UFW)
6. ✅ Installer Docker
7. ✅ Installer Kubernetes (kubeadm, kubelet, kubectl)
8. ✅ Initialiser le cluster Kubernetes
9. ✅ Installer Calico (CNI Plugin)
10. ✅ Vérifier l'installation

**Durée estimée:** 10-15 minutes

### Étape 4: Installer les addons

Après l'installation de base, installer les addons:

```bash
# Rendre le script exécutable
chmod +x infrastructure/scripts/install-addons-on-vps.sh

# Exécuter l'installation des addons
sudo infrastructure/scripts/install-addons-on-vps.sh
```

Ce script installe:
- ✅ Metrics Server (pour HPA)
- ✅ Crée les namespaces (viridial-staging, viridial-production, monitoring)
- ✅ Installe Nginx Ingress Controller
- ✅ Installe Cert-manager
- ✅ Configure ClusterIssuer Let's Encrypt (si email fourni)

**Durée estimée:** 5-10 minutes

## ✅ Vérification

### Sur le VPS

```bash
# Vérifier nodes
kubectl get nodes

# Vérifier pods système
kubectl get pods -n kube-system

# Vérifier ingress
kubectl get pods -n ingress-nginx

# Vérifier cert-manager
kubectl get pods -n cert-manager

# Vérifier namespaces
kubectl get namespaces
```

### Depuis votre machine locale (optionnel)

Si vous voulez gérer le cluster depuis votre machine locale:

```bash
# Récupérer kubeconfig
scp root@148.230.112.148:~/.kube/config ~/.kube/config

# Vérifier accès
kubectl get nodes
```

## 📝 Installation Manuelle (Alternative)

Si vous préférez installer manuellement étape par étape, suivez le guide complet:

```bash
# Sur le VPS
cat docs/deployment/PROVISIONING-GUIDE.md
```

Sections importantes:
- **Prérequis:** Sections 1-8 (toutes les étapes d'installation)
- **Vérification:** Section "Vérification"

## 🔧 Configuration Post-Installation

### 1. Configurer Domain (si disponible)

Si vous avez un domaine (ex: viridial.com):

```bash
# Sur le VPS
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: votre-email@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### 2. Créer les Secrets

```bash
# Sur le VPS
cd /root/viridial/infrastructure/secrets
cp .env.example .env
# Éditer .env avec vos credentials

# Créer les secrets Kubernetes
cd /root/viridial/infrastructure/scripts
chmod +x create-secrets.sh
./create-secrets.sh viridial-staging
```

### 3. Configurer Resource Quotas

```bash
# Sur le VPS
kubectl apply -f infrastructure/kubernetes/manifests/resource-quotas.yaml
```

## 🐛 Troubleshooting

### Erreur: "container runtime is not running" ou "CRI v1 runtime API"

Cette erreur indique que containerd n'est pas correctement configuré.

**Solution rapide:**

```bash
# Sur le VPS, exécuter le script de correction
cd /opt/viridial  # ou /root/viridial selon où vous avez cloné
chmod +x infrastructure/scripts/fix-containerd.sh
sudo infrastructure/scripts/fix-containerd.sh

# Puis réessayer l'initialisation
kubeadm init --pod-network-cidr=10.244.0.0/16 --service-cidr=10.96.0.0/12 --ignore-preflight-errors=Swap
```

**Solution manuelle:**

```bash
# Configurer containerd
mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml

# Modifier pour systemd cgroup driver
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# Redémarrer containerd
systemctl restart containerd
systemctl enable containerd

# Attendre quelques secondes
sleep 10

# Réessayer kubeadm init
kubeadm init --pod-network-cidr=10.244.0.0/16 --service-cidr=10.96.0.0/12 --ignore-preflight-errors=Swap
```

### Erreur: "kubelet not running"

```bash
# Vérifier status
systemctl status kubelet

# Redémarrer
systemctl restart kubelet
```

### Erreur: "Calico pods en CrashLoopBackOff"

```bash
# Vérifier logs
kubectl logs -n kube-system -l k8s-app=calico-node

# Réinstaller Calico
kubectl delete -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/tigera-operator.yaml
kubectl delete -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/custom-resources.yaml

# Réinstaller
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/tigera-operator.yaml
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/custom-resources.yaml
```

### Réinitialiser le cluster

```bash
# Sur le VPS
kubeadm reset -f
rm -rf /etc/cni/net.d
rm -rf /var/lib/etcd
rm -rf ~/.kube

# Réexécuter install-on-vps.sh
```

## 📚 Documentation

- **Guide complet:** `docs/deployment/PROVISIONING-GUIDE.md`
- **Prérequis détaillés:** Section "Prérequis" dans PROVISIONING-GUIDE.md
- **Story:** `docs/stories/US-INFRA-01-kubernetes-cluster.story.md`

## 🎯 Prochaines Étapes

Après installation réussie:

1. ✅ **US-INFRA-01:** Cluster Kubernetes (fait)
2. ⏳ **US-INFRA-02:** Services de Base (PostgreSQL, Redis, Meilisearch, MinIO)
3. ⏳ **US-INFRA-03:** Observabilité (Prometheus, Grafana, Loki)

## 💡 Avantages de l'Installation Directe

- ✅ Pas besoin d'Ansible sur machine locale
- ✅ Plus simple pour débuter
- ✅ Toutes les commandes exécutées directement sur VPS
- ✅ Scripts automatisés pour éviter les erreurs
- ✅ Facile à déboguer (tout est sur le VPS)

## ⚠️ Notes

- Les scripts doivent être exécutés en tant que **root** (ou avec sudo)
- Le script vérifie les prérequis avant de continuer
- Les scripts sont idempotents (peuvent être réexécutés)
- En cas d'erreur, le script s'arrête et affiche le message d'erreur

