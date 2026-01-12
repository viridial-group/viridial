#!/bin/bash

# Script de conversion du CV Markdown en Word
# Usage: ./convert-cv-to-word.sh

set -e

CV_MD="CV_Houssem_Eddine_Nasri_DevOps_AMELIORE.md"
CV_DOCX="CV_Houssem_Eddine_Nasri_DevOps_2025.docx"

echo "🔄 Conversion du CV en format Word..."

# Vérifier si Pandoc est installé
if ! command -v pandoc &> /dev/null; then
    echo "❌ Pandoc n'est pas installé."
    echo ""
    echo "📦 Installation de Pandoc:"
    echo "  macOS: brew install pandoc"
    echo "  Linux: sudo apt-get install pandoc"
    echo "  Windows: https://pandoc.org/installing.html"
    echo ""
    echo "💡 Alternative: Ouvrir le fichier .md dans Microsoft Word"
    exit 1
fi

# Vérifier si le fichier source existe
if [ ! -f "$CV_MD" ]; then
    echo "❌ Fichier source non trouvé: $CV_MD"
    exit 1
fi

# Convertir en Word
echo "📄 Conversion en cours..."
pandoc "$CV_MD" \
    -o "$CV_DOCX" \
    --from markdown \
    --to docx \
    --standalone \
    --toc-depth=1 \
    --highlight-style=tango

if [ $? -eq 0 ]; then
    echo "✅ Conversion réussie!"
    echo "📁 Fichier créé: $CV_DOCX"
    echo ""
    echo "💡 Prochaines étapes:"
    echo "   1. Ouvrir le fichier dans Microsoft Word"
    echo "   2. Appliquer les styles recommandés (voir GUIDE_CONVERSION_WORD.md)"
    echo "   3. Vérifier la mise en page"
    echo "   4. Exporter en PDF pour envoi"
else
    echo "❌ Erreur lors de la conversion"
    exit 1
fi

