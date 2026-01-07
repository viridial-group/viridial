# Guide de Provisionnement - Cluster Kubernetes Viridial

Ce guide vous permet de provisionner le cluster Kubernetes sur votre VPS.

## Informations VPS

- **IP:** 148.230.112.148
- **Repository:** https://github.com/viridial-group/viridial.git
- **Architecture:** 1 node (control plane + worker combiné) pour MVP

## Prérequis

### 1. Prérequis VPS (Hostinger)

#### Spécifications Minimales
- **OS:** Ubuntu 22.04 LTS ou Debian 12
- **RAM:** Minimum 4GB (recommandé 8GB)
- **CPU:** Minimum 2 vCPU (recommandé 4 vCPU)
- **Disk:** Minimum 50GB SSD
- **Accès:** root ou utilisateur avec sudo

#### Vérifier les Spécifications

```bash
# Se connecter au VPS
ssh root@148.230.112.148

# Vérifier OS
cat /etc/os-release

# Vérifier RAM
free -h

# Vérifier CPU
nproc
lscpu

# Vérifier Disk
df -h
```

### 2. Accès SSH au VPS

```bash
# Tester la connexion
ssh root@148.230.112.148

# Si pas de clé SSH configurée
ssh-keygen -t rsa -b 4096
ssh-copy-id root@148.230.112.148

# Vérifier connexion sans mot de passe
ssh root@148.230.112.148 "echo 'Connection OK'"
```

### 3. Prérequis Système sur le VPS

#### 3.1 Mettre à jour le Système

```bash
# Sur le VPS
sudo apt update && sudo apt upgrade -y

# Installer dépendances de base
sudo apt install -y curl wget git vim ufw htop apt-transport-https ca-certificates gnupg lsb-release
```

#### 3.2 Désactiver Swap (Obligatoire pour Kubernetes)

```bash
# Désactiver swap immédiatement
sudo swapoff -a

# Désactiver swap de manière permanente
sudo sed -i '/ swap / s/^/#/' /etc/fstab

# Vérifier que swap est désactivé
free -h
```

#### 3.3 Configurer Modules Kernel

```bash
# Créer fichier de configuration
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

# Charger les modules
sudo modprobe overlay
sudo modprobe br_netfilter

# Vérifier que les modules sont chargés
lsmod | grep br_netfilter
lsmod | grep overlay
```

#### 3.4 Configurer sysctl pour Kubernetes

```bash
# Configurer sysctl
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# Appliquer les changements
sudo sysctl --system

# Vérifier
sudo sysctl net.bridge.bridge-nf-call-iptables
sudo sysctl net.ipv4.ip_forward
```

#### 3.5 Configurer Firewall (UFW)

```bash
# Autoriser ports nécessaires
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 6443/tcp    # Kubernetes API
sudo ufw allow 10250/tcp   # Kubelet
sudo ufw allow 2379:2380/tcp # etcd (control plane uniquement)
sudo ufw allow 30000:32767/tcp # NodePort services
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# Activer firewall
sudo ufw enable

# Vérifier status
sudo ufw status
```

**Note:** Si Hostinger a un firewall dans le panel, configurer aussi les mêmes ports là-bas.

### 4. Installation Docker (Container Runtime)

#### 4.1 Installer Docker

```bash
# Installer Docker via script officiel
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Vérifier installation
docker --version
sudo docker run hello-world
```

#### 4.2 Configurer Docker pour Kubernetes

```bash
# Ajouter utilisateur au groupe docker
sudo usermod -aG docker $USER

# Configurer cgroup driver (systemd)
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

# Redémarrer Docker
sudo systemctl restart docker
sudo systemctl enable docker

# Vérifier que Docker fonctionne
sudo systemctl status docker
```

### 5. Installation Kubernetes (kubeadm, kubelet, kubectl)

#### 5.1 Ajouter Repository Kubernetes

```bash
# Installer dépendances
sudo apt-get install -y apt-transport-https ca-certificates gpg

# Ajouter clé GPG Kubernetes
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

# Ajouter repository Kubernetes
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
```

#### 5.2 Installer kubeadm, kubelet, kubectl

```bash
# Mettre à jour apt
sudo apt-get update

# Installer Kubernetes
sudo apt-get install -y kubelet kubeadm kubectl

# Bloquer les mises à jour automatiques (recommandé)
sudo apt-mark hold kubelet kubeadm kubectl

# Vérifier installation
kubeadm version
kubectl version --client
kubelet --version
```

#### 5.3 Activer kubelet

```bash
# Activer kubelet au démarrage
sudo systemctl enable kubelet

# Note: kubelet restera en erreur jusqu'à ce que kubeadm init soit exécuté
# C'est normal à ce stade
sudo systemctl status kubelet
```

### 6. Prérequis Locaux (Machine de Développement)

#### 6.1 Installer Ansible

**macOS:**
```bash
brew install ansible
```

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install -y ansible
```

**Linux (via pip):**
```bash
pip install ansible
```

**Vérifier installation:**
```bash
ansible --version
```

#### 6.2 Installer kubectl (Optionnel - pour gestion locale)

**macOS:**
```bash
brew install kubectl
```

**Linux:**
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
kubectl version --client
```

#### 6.3 Installer Git

```bash
# macOS
brew install git

# Linux
sudo apt install -y git

# Vérifier
git --version
```

### 7. Vérification Complète des Prérequis

#### Sur le VPS

```bash
# Vérifier OS
cat /etc/os-release | grep PRETTY_NAME

# Vérifier swap désactivé
free -h | grep Swap

# Vérifier modules kernel
lsmod | grep br_netfilter
lsmod | grep overlay

# Vérifier sysctl
sysctl net.bridge.bridge-nf-call-iptables
sysctl net.ipv4.ip_forward

# Vérifier Docker
docker --version
sudo systemctl status docker

# Vérifier Kubernetes
kubeadm version
kubectl version --client
kubelet --version

# Vérifier firewall
sudo ufw status
```

#### Sur Machine Locale

```bash
# Vérifier Ansible
ansible --version

# Vérifier connexion SSH
ssh root@148.230.112.148 "echo 'SSH OK'"

# Vérifier Git
git --version

# Vérifier kubectl (si installé)
kubectl version --client
```

### 8. Checklist Prérequis

Avant de commencer le provisionnement, vérifier:

- [ ] VPS accessible via SSH sans mot de passe
- [ ] OS: Ubuntu 22.04 LTS ou Debian 12
- [ ] RAM: Minimum 4GB disponible
- [ ] Disk: Minimum 50GB disponible
- [ ] Swap désactivé
- [ ] Modules kernel (overlay, br_netfilter) chargés
- [ ] sysctl configuré (ip_forward, bridge-nf-call)
- [ ] Firewall configuré (ports ouverts)
- [ ] Docker installé et fonctionnel
- [ ] kubeadm, kubelet, kubectl installés
- [ ] Ansible installé sur machine locale
- [ ] Git installé sur machine locale
- [ ] Connexion SSH testée et fonctionnelle

## Provisionnement Automatique

### Option 1: Script Automatique (Recommandé)

```bash
cd infrastructure
./scripts/provision-cluster.sh
```

### Option 2: Playbook Manuel

```bash
cd infrastructure/ansible

# Installer dépendances
ansible-galaxy install -r requirements.yml

# Exécuter playbook principal
ansible-playbook playbooks/main.yml -i inventory.ini
```

## Provisionnement Étape par Étape

Si vous préférez exécuter étape par étape:

```bash
cd infrastructure/ansible

# 1. Préparer VPS (Docker, swap, firewall, etc.)
ansible-playbook playbooks/01-prepare-vps.yml -i inventory.ini

# 2. Initialiser cluster Kubernetes
ansible-playbook playbooks/02-init-cluster.yml -i inventory.ini

# 3. Installer CNI (Calico)
ansible-playbook playbooks/03-install-cni.yml -i inventory.ini

# 4. Installer addons (CoreDNS, Metrics Server)
ansible-playbook playbooks/05-install-addons.yml -i inventory.ini

# 5. Créer namespaces
ansible-playbook playbooks/06-create-namespaces.yml -i inventory.ini

# 6. Installer Ingress et Cert-manager
ansible-playbook playbooks/07-install-ingress.yml -i inventory.ini

# 7. Configurer Network Policies
ansible-playbook playbooks/08-network-policies.yml -i inventory.ini
```

## Vérification

### 1. Récupérer kubeconfig

```bash
# Créer répertoire .kube si nécessaire
mkdir -p ~/.kube

# Récupérer kubeconfig depuis VPS
scp root@148.230.112.148:~/.kube/config ~/.kube/config

# Vérifier accès
kubectl get nodes
```

### 2. Vérifier Cluster

```bash
# Nodes
kubectl get nodes

# Pods système
kubectl get pods -n kube-system

# Namespaces
kubectl get namespaces | grep viridial

# Ingress Controller
kubectl get pods -n ingress-nginx

# Cert-manager
kubectl get pods -n cert-manager

# Network Policies
kubectl get networkpolicies --all-namespaces
```

### 3. Tester Service Discovery

```bash
# Créer un pod de test
kubectl run test-pod --image=nginx -n viridial-staging

# Vérifier DNS
kubectl exec -it test-pod -n viridial-staging -- nslookup kubernetes.default.svc.cluster.local

# Nettoyer
kubectl delete pod test-pod -n viridial-staging
```

## Configuration Post-Provisionnement

### 1. Mettre à jour Email Let's Encrypt

Éditer `infrastructure/ansible/group_vars/all.yml`:
```yaml
letsencrypt_email: "votre-email@example.com"
```

Puis réappliquer:
```bash
ansible-playbook playbooks/07-install-ingress.yml -i inventory.ini
```

### 2. Configurer Domain (si disponible)

Si vous avez un domaine (ex: viridial.com):

1. Pointer le DNS vers `148.230.112.148`
2. Mettre à jour `group_vars/all.yml`:
   ```yaml
   domain_name: "viridial.com"
   staging_domain: "staging.viridial.com"
   ```

### 3. Ajouter Nodes Workers (optionnel)

Pour ajouter des workers supplémentaires:

1. Modifier `inventory.ini`:
   ```ini
   [workers]
   worker-1 ansible_host=148.230.112.148
   worker-2 ansible_host=VOTRE_WORKER_2_IP
   ```

2. Exécuter:
   ```bash
   ansible-playbook playbooks/01-prepare-vps.yml -i inventory.ini
   ansible-playbook playbooks/04-join-workers.yml -i inventory.ini
   ```

## Troubleshooting

### Erreur: "Connection refused"

```bash
# Vérifier accès SSH
ssh -v root@148.230.112.148

# Vérifier firewall VPS
ssh root@148.230.112.148 "ufw status"
```

### Erreur: "kubeadm init failed"

```bash
# Sur le VPS, réinitialiser
ssh root@148.230.112.148
kubeadm reset -f
rm -rf /etc/cni/net.d
rm -rf /var/lib/etcd
rm -rf ~/.kube

# Réessayer
ansible-playbook playbooks/02-init-cluster.yml -i inventory.ini
```

### Calico pods en CrashLoopBackOff

```bash
# Vérifier logs
kubectl logs -n kube-system -l k8s-app=calico-node

# Réinstaller Calico
kubectl delete -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml
```

### Ingress Controller pas accessible

```bash
# Vérifier service
kubectl get svc -n ingress-nginx

# Vérifier pods
kubectl get pods -n ingress-nginx

# Vérifier logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

## Prochaines Étapes

Après provisionnement réussi:

1. ✅ **US-INFRA-01:** Cluster Kubernetes (fait)
2. ⏳ **US-INFRA-02:** Services de Base (PostgreSQL, Redis, Meilisearch, MinIO)
3. ⏳ **US-INFRA-03:** Observabilité (Prometheus, Grafana, Loki)
4. ⏳ **US-INFRA-04:** Sécurité (Vault, RBAC avancé)

## Ressources

- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Calico Documentation](https://docs.tigera.io/calico/)
- [Nginx Ingress](https://kubernetes.github.io/ingress-nginx/)

