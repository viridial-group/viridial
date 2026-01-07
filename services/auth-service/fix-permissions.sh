#!/bin/bash
# Script pour corriger les permissions de node_modules

echo "🔧 Correction des permissions pour auth-service..."

cd "$(dirname "$0")"

# Supprimer node_modules et package-lock.json avec sudo
echo "Suppression de node_modules et package-lock.json..."
sudo rm -rf node_modules package-lock.json

# Corriger les permissions du répertoire
echo "Correction des permissions..."
sudo chown -R $(whoami) .

# Réinstaller les dépendances
echo "Installation des dépendances..."
npm install

echo "✅ Permissions corrigées et dépendances installées !"

