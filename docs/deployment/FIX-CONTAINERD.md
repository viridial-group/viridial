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

# Le script vous donnera la commande exacte à utiliser
# Elle inclura --cri-socket=unix:///var/run/cri-dockerd.sock
```

### Option 2: Installation Manuelle de cri-dockerd

Pour Kubernetes 1.29+ avec Docker, vous devez utiliser `cri-dockerd`:

```bash
# 1. Vérifier Docker
systemctl status docker
# Si pas actif:
systemctl start docker
systemctl enable docker

# 2. Installer cri-dockerd
CRI_DOCKERD_VERSION="0.3.9"  # ou la dernière version
ARCH=$(dpkg --print-architecture)
if [ "$ARCH" = "amd64" ]; then ARCH="x86_64"; fi

wget https://github.com/Mirantis/cri-dockerd/releases/download/v${CRI_DOCKERD_VERSION}/cri-dockerd_${CRI_DOCKERD_VERSION}.${ARCH}.tgz
tar -xzf cri-dockerd_${CRI_DOCKERD_VERSION}.${ARCH}.tgz
mv cri-dockerd/cri-dockerd /usr/local/bin/
chmod +x /usr/local/bin/cri-dockerd

# 3. Installer fichiers systemd
wget https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.service -O /etc/systemd/system/cri-docker.service
wget https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.socket -O /etc/systemd/system/cri-docker.socket

sed -i 's|ExecStart=/usr/bin/cri-dockerd|ExecStart=/usr/local/bin/cri-dockerd|' /etc/systemd/system/cri-docker.service

# 4. Démarrer cri-dockerd
systemctl daemon-reload
systemctl enable cri-docker.service
systemctl enable --now cri-docker.socket
systemctl start cri-docker.service

# 5. Vérifier
systemctl status cri-docker

# 6. Initialiser cluster avec cri-dockerd
kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --service-cidr=10.96.0.0/12 \
  --cri-socket=unix:///var/run/cri-dockerd.sock \
  --ignore-preflight-errors=Swap
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

**Kubernetes 1.29+ ne supporte plus Docker directement** via dockershim (supprimé depuis K8s 1.24).

Pour utiliser Docker avec Kubernetes 1.29+, vous devez utiliser **cri-dockerd**, qui est une implémentation CRI (Container Runtime Interface) pour Docker.

**cri-dockerd**:
- Fournit l'interface CRI pour Docker
- Socket disponible à `/var/run/cri-dockerd.sock`
- Nécessite le paramètre `--cri-socket=unix:///var/run/cri-dockerd.sock` lors de `kubeadm init`

**Alternative**: Utiliser containerd directement (sans Docker), mais cri-dockerd est plus simple si vous avez déjà Docker installé.

## 🚀 Après Correction

Une fois cri-dockerd installé, initialiser le cluster avec:

```bash
# Initialiser cluster avec cri-dockerd
kubeadm init \
  --pod-network-cidr=10.244.0.0/16 \
  --service-cidr=10.96.0.0/12 \
  --cri-socket=unix:///var/run/cri-dockerd.sock \
  --ignore-preflight-errors=Swap

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

