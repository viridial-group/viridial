#!/bin/bash
# Script d'installation directe sur VPS - Viridial Kubernetes Cluster
# À exécuter directement sur le VPS (pas depuis machine locale)

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Installation Kubernetes Cluster - Viridial                ║"
echo "║  Installation directe sur VPS                                ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Variables
K8S_VERSION="1.29"
DOCKER_VERSION="24.0"
POD_NETWORK_CIDR="10.244.0.0/16"
SERVICE_CIDR="10.96.0.0/12"
CNI_PLUGIN="calico"
CALICO_VERSION="v3.27.0"

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo -e "${GREEN}[ÉTAPE $1]${NC} $2"
    echo ""
}

error() {
    echo -e "${RED}[ERREUR]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[ATTENTION]${NC} $1"
}

# Vérifier que le script est exécuté en root
if [ "$EUID" -ne 0 ]; then 
    error "Ce script doit être exécuté en tant que root (sudo)"
fi

# ============================================
# ÉTAPE 1: Vérification des prérequis
# ============================================
step "1" "Vérification des prérequis système"

# Vérifier OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "OS détecté: $PRETTY_NAME"
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
        error "Ce script supporte uniquement Ubuntu/Debian"
    fi
else
    error "Impossible de détecter l'OS"
fi

# Vérifier RAM
RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
if [ "$RAM_GB" -lt 4 ]; then
    warning "RAM insuffisante: ${RAM_GB}GB (minimum 4GB recommandé)"
    read -p "Continuer quand même? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ RAM: ${RAM_GB}GB"
fi

# Vérifier CPU
CPU_COUNT=$(nproc)
if [ "$CPU_COUNT" -lt 2 ]; then
    warning "CPU insuffisant: ${CPU_COUNT} (minimum 2 recommandé)"
else
    echo "✓ CPU: ${CPU_COUNT} cores"
fi

# Vérifier Disk
DISK_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$DISK_GB" -lt 50 ]; then
    warning "Espace disque insuffisant: ${DISK_GB}GB (minimum 50GB recommandé)"
else
    echo "✓ Disk: ${DISK_GB}GB disponible"
fi

echo ""
read -p "Continuer l'installation? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 0
fi

# ============================================
# ÉTAPE 2: Mise à jour système
# ============================================
step "2" "Mise à jour du système"

apt update
apt upgrade -y

# Installer dépendances de base
apt install -y curl wget git vim ufw htop apt-transport-https ca-certificates gnupg lsb-release

# ============================================
# ÉTAPE 3: Désactiver Swap
# ============================================
step "3" "Désactivation du swap (obligatoire pour Kubernetes)"

swapoff -a
sed -i '/ swap / s/^/#/' /etc/fstab

echo "✓ Swap désactivé"

# ============================================
# ÉTAPE 4: Configurer modules kernel
# ============================================
step "4" "Configuration des modules kernel"

cat <<EOF > /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

modprobe overlay
modprobe br_netfilter

echo "✓ Modules kernel configurés"

# ============================================
# ÉTAPE 5: Configurer sysctl
# ============================================
step "5" "Configuration sysctl pour Kubernetes"

cat <<EOF > /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sysctl --system

echo "✓ sysctl configuré"

# ============================================
# ÉTAPE 6: Configurer Firewall
# ============================================
step "6" "Configuration du firewall (UFW)"

ufw allow 22/tcp      # SSH
ufw allow 6443/tcp    # Kubernetes API
ufw allow 10250/tcp   # Kubelet
ufw allow 2379:2380/tcp # etcd (control plane)
ufw allow 30000:32767/tcp # NodePort services
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS

ufw --force enable

echo "✓ Firewall configuré"

# ============================================
# ÉTAPE 7: Installer Docker
# ============================================
step "7" "Installation de Docker"

if command -v docker &> /dev/null; then
    echo "Docker déjà installé: $(docker --version)"
    read -p "Réinstaller Docker? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        apt remove -y docker docker-engine docker.io containerd runc || true
    else
        echo "✓ Docker déjà installé, passage à l'étape suivante"
        SKIP_DOCKER=true
    fi
fi

if [ "$SKIP_DOCKER" != "true" ]; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh

    # Configurer Docker pour Kubernetes
    mkdir -p /etc/docker
    cat <<EOF > /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

    systemctl restart docker
    systemctl enable docker

    echo "✓ Docker installé et configuré: $(docker --version)"
fi

# ============================================
# ÉTAPE 8: Installer Kubernetes
# ============================================
step "8" "Installation de Kubernetes (kubeadm, kubelet, kubectl)"

# Ajouter repository Kubernetes
curl -fsSL https://pkgs.k8s.io/core:/stable:/v${K8S_VERSION}/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v${K8S_VERSION}/deb/ /" | tee /etc/apt/sources.list.d/kubernetes.list

apt update
apt install -y kubelet kubeadm kubectl
apt-mark hold kubelet kubeadm kubectl

systemctl enable kubelet

echo "✓ Kubernetes installé:"
echo "  - kubeadm: $(kubeadm version -o short)"
echo "  - kubectl: $(kubectl version --client --short)"
echo "  - kubelet: $(kubelet --version)"

# ============================================
# ÉTAPE 9: Initialiser Cluster Kubernetes
# ============================================
step "9" "Initialisation du cluster Kubernetes"

# Vérifier si cluster déjà initialisé
if [ -f /etc/kubernetes/admin.conf ]; then
    warning "Cluster Kubernetes semble déjà initialisé"
    read -p "Réinitialiser le cluster? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kubeadm reset -f
        rm -rf /etc/cni/net.d
        rm -rf /var/lib/etcd
        rm -rf ~/.kube
    else
        echo "✓ Cluster déjà initialisé, passage à l'étape suivante"
        SKIP_INIT=true
    fi
fi

if [ "$SKIP_INIT" != "true" ]; then
    # Vérifier que Docker est le runtime
    if ! systemctl is-active --quiet docker; then
        error "Docker n'est pas actif. Vérifiez: systemctl status docker"
    fi
    
    # Configurer containerd pour utiliser Docker (si containerd est présent)
    if command -v containerd &> /dev/null; then
        echo "Configuration containerd pour utiliser Docker..."
        # Créer configuration containerd
        mkdir -p /etc/containerd
        containerd config default | tee /etc/containerd/config.toml > /dev/null
        
        # Modifier pour utiliser systemd cgroup driver
        sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
        
        # Redémarrer containerd
        systemctl restart containerd
        systemctl enable containerd
        sleep 5
    fi
    
    # Initialiser cluster (single node pour MVP)
    # Utiliser --cri-socket si containerd est présent, sinon Docker sera détecté automatiquement
    if command -v containerd &> /dev/null && systemctl is-active --quiet containerd; then
        echo "Utilisation de containerd comme runtime..."
        kubeadm init \
            --pod-network-cidr=${POD_NETWORK_CIDR} \
            --service-cidr=${SERVICE_CIDR} \
            --cri-socket=unix:///var/run/containerd/containerd.sock \
            --ignore-preflight-errors=Swap
    else
        echo "Utilisation de Docker comme runtime..."
        # Pour Kubernetes 1.29+, Docker est supporté via containerd
        # Mais si containerd n'est pas configuré, installer cri-dockerd
        if ! command -v cri-dockerd &> /dev/null; then
            echo "Installation de cri-dockerd pour support Docker..."
            CRI_DOCKERD_VERSION=$(curl -s https://api.github.com/repos/Mirantis/cri-dockerd/releases/latest | grep tag_name | cut -d '"' -f 4)
            wget https://github.com/Mirantis/cri-dockerd/releases/download/${CRI_DOCKERD_VERSION}/cri-dockerd_${CRI_DOCKERD_VERSION#v}.amd64.tgz
            tar xvf cri-dockerd_${CRI_DOCKERD_VERSION#v}.amd64.tgz
            mv cri-dockerd/cri-dockerd /usr/local/bin/
            wget https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.service
            wget https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.socket
            mv cri-docker.service /etc/systemd/system/
            mv cri-docker.socket /etc/systemd/system/
            systemctl daemon-reload
            systemctl enable cri-docker.service
            systemctl enable --now cri-docker.socket
            systemctl start cri-docker.service
        fi
        
        kubeadm init \
            --pod-network-cidr=${POD_NETWORK_CIDR} \
            --service-cidr=${SERVICE_CIDR} \
            --cri-socket=unix:///var/run/cri-dockerd.sock \
            --ignore-preflight-errors=Swap
    fi

    # Configurer kubectl
    mkdir -p $HOME/.kube
    cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
    chown $(id -u):$(id -g) $HOME/.kube/config

    # Permettre pods sur control plane (single node)
    kubectl taint nodes --all node-role.kubernetes.io/control-plane- || true

    echo "✓ Cluster Kubernetes initialisé"
fi

# ============================================
# ÉTAPE 10: Installer CNI Plugin (Calico)
# ============================================
step "10" "Installation du CNI Plugin (Calico)"

if kubectl get pods -n kube-system | grep -q calico; then
    echo "✓ Calico déjà installé"
else
    kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/${CALICO_VERSION}/manifests/tigera-operator.yaml
    kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/${CALICO_VERSION}/manifests/custom-resources.yaml

    echo "⏳ Attente de Calico (30 secondes)..."
    sleep 30
    kubectl wait --for=condition=ready pod -l k8s-app=calico-node -n kube-system --timeout=300s

    echo "✓ Calico installé"
fi

# ============================================
# ÉTAPE 11: Vérification
# ============================================
step "11" "Vérification du cluster"

echo "Nodes:"
kubectl get nodes

echo ""
echo "Pods système:"
kubectl get pods -n kube-system

echo ""
echo "✓ Cluster Kubernetes opérationnel!"

# ============================================
# ÉTAPE 12: Instructions pour étapes suivantes
# ============================================
step "12" "Instructions pour étapes suivantes"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Installation de base terminée!                          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 PROCHAINES ÉTAPES:"
echo ""
echo "1. Installer CoreDNS et Metrics Server:"
echo "   kubectl apply -f https://raw.githubusercontent.com/kubernetes/kubernetes/v${K8S_VERSION}.0/cluster/addons/metrics-server/metrics-server.yaml"
echo ""
echo "2. Créer les namespaces:"
echo "   kubectl create namespace viridial-staging"
echo "   kubectl create namespace viridial-production"
echo "   kubectl create namespace monitoring"
echo ""
echo "3. Installer Nginx Ingress Controller:"
echo "   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml"
echo ""
echo "4. Installer Cert-manager:"
echo "   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml"
echo ""
echo "📚 Documentation complète:"
echo "   docs/deployment/PROVISIONING-GUIDE.md"
echo ""
echo "🔑 Pour accéder au cluster depuis votre machine locale:"
echo "   scp root@148.230.112.148:~/.kube/config ~/.kube/config"
echo "   kubectl get nodes"
echo ""

