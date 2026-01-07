#!/bin/bash
# Script de correction pour problème containerd/Docker avec Kubernetes 1.29+

set -e

echo "🔧 Correction du problème containerd/Docker pour Kubernetes 1.29+..."

# Vérifier Docker
if ! systemctl is-active --quiet docker; then
    echo "❌ Docker n'est pas actif"
    systemctl start docker
    systemctl enable docker
    echo "✓ Docker démarré"
fi

# Pour Kubernetes 1.29+, Docker nécessite cri-dockerd
echo "📦 Installation de cri-dockerd (nécessaire pour Docker avec K8s 1.29+)..."

# Vérifier si cri-dockerd est déjà installé
if command -v cri-dockerd &> /dev/null; then
    echo "✓ cri-dockerd déjà installé"
else
    echo "Installation de cri-dockerd..."
    
    # Télécharger la dernière version
    CRI_DOCKERD_VERSION=$(curl -s https://api.github.com/repos/Mirantis/cri-dockerd/releases/latest | grep tag_name | cut -d '"' -f 4 | sed 's/v//')
    
    if [ -z "$CRI_DOCKERD_VERSION" ]; then
        # Fallback si API GitHub ne répond pas
        CRI_DOCKERD_VERSION="0.3.9"
        echo "⚠ Utilisation version par défaut: $CRI_DOCKERD_VERSION"
    else
        echo "Version détectée: $CRI_DOCKERD_VERSION"
    fi
    
    # Télécharger et installer cri-dockerd
    ARCH=$(dpkg --print-architecture)
    if [ "$ARCH" = "amd64" ]; then
        ARCH="x86_64"
    elif [ "$ARCH" = "arm64" ]; then
        ARCH="aarch64"
    fi
    
    wget -q https://github.com/Mirantis/cri-dockerd/releases/download/v${CRI_DOCKERD_VERSION}/cri-dockerd_${CRI_DOCKERD_VERSION}.${ARCH}.tgz -O /tmp/cri-dockerd.tgz
    
    if [ ! -f /tmp/cri-dockerd.tgz ]; then
        echo "❌ Échec téléchargement cri-dockerd"
        echo "Téléchargement manuel depuis: https://github.com/Mirantis/cri-dockerd/releases"
        exit 1
    fi
    
    tar -xzf /tmp/cri-dockerd.tgz -C /tmp/
    mv /tmp/cri-dockerd/cri-dockerd /usr/local/bin/
    chmod +x /usr/local/bin/cri-dockerd
    
    # Installer les fichiers systemd
    wget -q https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.service -O /etc/systemd/system/cri-docker.service
    wget -q https://raw.githubusercontent.com/Mirantis/cri-dockerd/master/packaging/systemd/cri-docker.socket -O /etc/systemd/system/cri-docker.socket
    
    # Modifier le service pour utiliser le socket Docker
    sed -i 's|ExecStart=/usr/bin/cri-dockerd|ExecStart=/usr/local/bin/cri-dockerd|' /etc/systemd/system/cri-docker.service
    
    # Recharger systemd et démarrer cri-dockerd
    systemctl daemon-reload
    systemctl enable cri-docker.service
    systemctl enable --now cri-docker.socket
    systemctl start cri-docker.service
    
    echo "✓ cri-dockerd installé et démarré"
fi

# Vérifier que cri-dockerd fonctionne
if systemctl is-active --quiet cri-docker; then
    echo "✓ cri-dockerd est actif"
else
    echo "⚠ cri-dockerd n'est pas actif, démarrage..."
    systemctl start cri-docker.service
    systemctl start cri-docker.socket
    sleep 5
    
    if systemctl is-active --quiet cri-docker; then
        echo "✓ cri-dockerd démarré"
    else
        echo "❌ cri-dockerd ne démarre pas"
        systemctl status cri-docker.service
        exit 1
    fi
fi

# Vérifier le socket
if [ -S /var/run/cri-dockerd.sock ]; then
    echo "✓ Socket cri-dockerd disponible: /var/run/cri-dockerd.sock"
else
    echo "⚠ Socket cri-dockerd non trouvé, attente..."
    sleep 5
    if [ -S /var/run/cri-dockerd.sock ]; then
        echo "✓ Socket cri-dockerd maintenant disponible"
    else
        echo "❌ Socket cri-dockerd toujours absent"
        systemctl status cri-docker.socket
        exit 1
    fi
fi

echo ""
echo "✅ Correction terminée!"
echo ""
echo "📋 Utilisez cette commande pour initialiser le cluster:"
echo ""
echo "  kubeadm init \\"
echo "    --pod-network-cidr=10.244.0.0/16 \\"
echo "    --service-cidr=10.96.0.0/12 \\"
echo "    --cri-socket=unix:///var/run/cri-dockerd.sock \\"
echo "    --ignore-preflight-errors=Swap"
echo ""
echo "💡 Note: Le paramètre --cri-socket est maintenant nécessaire pour utiliser cri-dockerd"
echo ""
