#!/bin/bash
# Script de provisionnement complet du cluster Kubernetes
# Usage: ./infrastructure/scripts/provision-cluster.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANSIBLE_DIR="$SCRIPT_DIR/../ansible"

echo "🚀 Provisionnement du cluster Kubernetes Viridial"
echo "VPS: 148.230.112.148"
echo "Repository: https://github.com/viridial-group/viridial.git"
echo ""

# Vérifier prérequis
echo "📋 Vérification des prérequis..."

if ! command -v ansible &> /dev/null; then
  echo "❌ Ansible n'est pas installé"
  echo "Installez-le avec: pip install ansible"
  exit 1
fi

if ! ssh -o ConnectTimeout=5 root@148.230.112.148 "echo 'Connection OK'" &> /dev/null; then
  echo "❌ Impossible de se connecter au VPS (148.230.112.148)"
  echo "Vérifiez:"
  echo "  1. L'IP est correcte"
  echo "  2. SSH est accessible"
  echo "  3. La clé SSH est configurée: ssh-copy-id root@148.230.112.148"
  exit 1
fi

echo "✅ Prérequis OK"
echo ""

# Installer dépendances Ansible
echo "📦 Installation des dépendances Ansible..."
cd "$ANSIBLE_DIR"
ansible-galaxy install -r requirements.yml || echo "⚠️  Certaines dépendances peuvent être manquantes"
echo ""

# Exécuter playbook principal
echo "🔧 Exécution du playbook principal..."
ansible-playbook playbooks/main.yml -i inventory.ini

echo ""
echo "✅ Provisionnement terminé!"
echo ""
echo "📝 Prochaines étapes:"
echo "  1. Récupérer kubeconfig:"
echo "     scp root@148.230.112.148:~/.kube/config ~/.kube/config"
echo ""
echo "  2. Vérifier le cluster:"
echo "     kubectl get nodes"
echo "     kubectl get pods -n kube-system"
echo ""
echo "  3. Déployer les services de base (US-INFRA-02)"
echo ""

