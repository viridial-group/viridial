#!/bin/bash
# Script de correction pour problème containerd/Docker

set -e

echo "🔧 Correction du problème containerd/Docker..."

# Vérifier Docker
if ! systemctl is-active --quiet docker; then
    echo "❌ Docker n'est pas actif"
    systemctl start docker
    systemctl enable docker
fi

# Configurer containerd
if command -v containerd &> /dev/null; then
    echo "📝 Configuration containerd..."
    
    # Créer configuration containerd si elle n'existe pas
    if [ ! -f /etc/containerd/config.toml ]; then
        mkdir -p /etc/containerd
        containerd config default | tee /etc/containerd/config.toml
    fi
    
    # Modifier pour utiliser systemd cgroup driver
    sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
    
    # Redémarrer containerd
    systemctl restart containerd
    systemctl enable containerd
    
    echo "✓ containerd configuré"
    
    # Attendre que containerd soit prêt
    echo "⏳ Attente de containerd (10 secondes)..."
    sleep 10
    
    # Vérifier containerd
    if systemctl is-active --quiet containerd; then
        echo "✓ containerd est actif"
    else
        echo "❌ containerd n'est pas actif"
        systemctl status containerd
    fi
else
    echo "⚠ containerd non trouvé, installation..."
    apt update
    apt install -y containerd
    
    # Configurer
    mkdir -p /etc/containerd
    containerd config default | tee /etc/containerd/config.toml
    sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
    
    systemctl restart containerd
    systemctl enable containerd
    
    echo "✓ containerd installé et configuré"
fi

# Vérifier que containerd peut communiquer avec Docker
echo "🔍 Vérification de la connexion containerd..."
if ctr version &> /dev/null; then
    echo "✓ containerd fonctionne"
else
    echo "❌ containerd ne répond pas"
fi

echo ""
echo "✅ Correction terminée!"
echo ""
echo "Vous pouvez maintenant réessayer:"
echo "  kubeadm init --pod-network-cidr=10.244.0.0/16 --service-cidr=10.96.0.0/12 --ignore-preflight-errors=Swap"
echo ""

