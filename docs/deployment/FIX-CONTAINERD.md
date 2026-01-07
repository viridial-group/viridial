# Correction: Erreur containerd/Docker

## 🔴 Problème

Lors de l'initialisation Kubernetes, vous obtenez:

```
[ERROR CRI]: container runtime is not running: output: time="..." level=fatal msg="validate service connection: validate CRI v1 runtime API for endpoint \"unix:///var/run/containerd/containerd.sock\": rpc error: code = Unimplemented desc = unknown service runtime.v1.RuntimeService"
```

## ✅ Solution Rapide

### Option 1: Script de Correction (Recommandé)

```bash
# Sur le VPS
cd /opt/viridial  # ou /root/viridial
chmod +x infrastructure/scripts/fix-containerd.sh
sudo infrastructure/scripts/fix-containerd.sh

# Puis réessayer
kubeadm init --pod-network-cidr=10.244.0.0/16 --service-cidr=10.96.0.0/12 --ignore-preflight-errors=Swap
```

### Option 2: Correction Manuelle

```bash
# 1. Vérifier Docker
systemctl status docker
# Si pas actif:
systemctl start docker
systemctl enable docker

# 2. Installer/Configurer containerd
apt update
apt install -y containerd

# 3. Configurer containerd
mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml

# 4. Modifier pour systemd cgroup driver
sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml

# 5. Redémarrer containerd
systemctl restart containerd
systemctl enable containerd

# 6. Vérifier
systemctl status containerd
ctr version

# 7. Réessayer kubeadm init
kubeadm init --pod-network-cidr=10.244.0.0/16 --service-cidr=10.96.0.0/12 --ignore-preflight-errors=Swap
```

## 🔍 Vérification

Après correction, vérifier:

```bash
# Containerd actif
systemctl status containerd

# Docker actif
systemctl status docker

# Test containerd
ctr version
```

## 📝 Explication

Kubernetes 1.29+ utilise containerd comme interface CRI (Container Runtime Interface), même si Docker est installé. Containerd doit être configuré avec:
- `SystemdCgroup = true` (pour systemd cgroup driver)
- Socket accessible à `/var/run/containerd/containerd.sock`

Docker utilise containerd en interne, donc les deux doivent être configurés correctement.

## 🚀 Après Correction

Une fois containerd corrigé, continuer avec:

```bash
# Initialiser cluster
kubeadm init --pod-network-cidr=10.244.0.0/16 --service-cidr=10.96.0.0/12 --ignore-preflight-errors=Swap

# Configurer kubectl
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

# Permettre pods sur control plane (single node)
kubectl taint nodes --all node-role.kubernetes.io/control-plane-

# Installer Calico
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/tigera-operator.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/custom-resources.yaml
```

