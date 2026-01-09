# 🚀 Guide de Démarrage Rapide - Frontend Viridial

## Prérequis

- Node.js 18+ et npm
- Services backend en cours d'exécution (ou utiliser le mode mock pour tester)

## Installation

```bash
cd frontend/web
npm install
```

## Démarrage en développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Mode Mock (Test sans backend)

Pour tester l'interface sans services backend actifs :

1. **Via variable d'environnement** :
   ```bash
   NEXT_PUBLIC_USE_MOCK_SEARCH=true npm run dev
   ```

2. **Via localStorage** :
   - Aller sur `/search`
   - Cliquer sur le bouton "Mock ON/OFF" dans l'interface

## Pages disponibles

### Pages publiques

- `/` - Page d'accueil avec présentation des fonctionnalités
- `/browse` - Liste publique des propriétés publiées
- `/search` - Recherche avancée avec carte interactive
- `/login` - Connexion
- `/signup` - Inscription
- `/forgot-password` - Mot de passe oublié
- `/verify-email` - Vérification email (requiert token)
- `/reset-password` - Réinitialisation mot de passe (requiert token)

### Pages authentifiées

- `/dashboard` - Tableau de bord utilisateur
- `/properties` - Liste de mes propriétés (gestion)
- `/properties/new` - Créer une nouvelle propriété
- `/properties/[id]` - Détails d'une propriété (vue gestion)
- `/properties/[id]/edit` - Éditer une propriété
- `/browse/[id]` - Vue publique d'une propriété

## Fonctionnalités principales

### 1. Gestion de propriétés

**Création :**
- Formulaire complet avec tous les champs
- Upload de médias (drag & drop ou URLs)
- Support multilingue (translations)
- Géolocalisation automatique (via geolocation-service)

**Édition :**
- Modification de tous les champs
- Workflow de publication (draft → review → listed)
- Gestion des médias améliorée

### 2. Recherche avancée

**Fonctionnalités :**
- Recherche textuelle avec suggestions
- Filtres avancés (type, prix, chambres, etc.)
- Carte interactive avec marqueurs
- Tri par pertinence, prix, distance
- Vue liste/grille
- Sauvegarde de recherches
- Dessiner une zone sur la carte pour filtrer

**Raccourcis clavier :**
- `/` - Focus sur la recherche
- `Esc` - Fermer les panneaux
- `Ctrl/Cmd + K` - Ouvrir les raccourcis

### 3. Authentification

- Inscription avec validation email
- Connexion avec JWT
- Réinitialisation de mot de passe
- Gestion de session persistante

## Configuration

### Variables d'environnement

Créer un fichier `.env.local` :

```env
# APIs
NEXT_PUBLIC_PROPERTY_API_URL=http://localhost:3001
NEXT_PUBLIC_SEARCH_API_URL=http://localhost:3002
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8080

# Mock mode (optionnel)
NEXT_PUBLIC_USE_MOCK_SEARCH=false
```

### Mode développement avec services locaux

Si vous utilisez Docker Compose pour les services backend :

```bash
# Depuis la racine du projet
docker-compose up -d

# Les services seront disponibles sur :
# - Property Service: http://localhost:3001
# - Search Service: http://localhost:3002
# - Auth Service: http://localhost:8080
```

## Test du flux complet

### 1. Inscription et connexion

1. Aller sur `/signup`
2. Créer un compte
3. Vérifier l'email (simuler ou utiliser le token)
4. Se connecter sur `/login`

### 2. Création de propriété

1. Aller sur `/dashboard`
2. Cliquer sur "Nouvelle Propriété"
3. Remplir le formulaire :
   - Type, prix, devise
   - Adresse (géocodage automatique)
   - Titre et description (multilingue)
   - Médias (upload ou URLs)
4. Sauvegarder

### 3. Publication

1. Aller sur `/properties`
2. Cliquer sur "Publier" pour une propriété en brouillon
3. La propriété devient visible publiquement

### 4. Recherche

1. Aller sur `/search`
2. Utiliser la barre de recherche
3. Appliquer des filtres
4. Explorer sur la carte
5. Trier les résultats

## Mode Mock - Données de test

Le mode mock inclut :
- 8 propriétés de test avec différentes caractéristiques
- Suggestions de recherche
- Résultats de recherche filtrés et triés
- Données persistées dans localStorage

### Activer le mode mock

1. **Temporaire** : Variable d'environnement
2. **Permanent** : Toggle dans l'interface `/search`
3. Les données sont sauvegardées dans `localStorage`

## Dépannage

### Erreurs de compilation

```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run build
```

### Problèmes de connexion API

1. Vérifier que les services backend sont démarrés
2. Vérifier les variables d'environnement
3. Activer le mode mock pour tester l'interface

### Erreurs d'authentification

1. Vérifier que le token JWT est valide
2. Se déconnecter et se reconnecter
3. Vérifier l'expiration du token

## Structure du projet

```
frontend/web/
├── app/                    # Pages Next.js
│   ├── page.tsx           # Page d'accueil
│   ├── search/            # Recherche
│   ├── properties/        # Gestion propriétés
│   └── ...
├── components/            # Composants réutilisables
│   ├── ui/               # Composants UI de base
│   ├── property/         # Composants propriétés
│   ├── search/           # Composants recherche
│   └── layout/           # Header, Footer
├── lib/                  # Utilitaires et API clients
│   ├── api/             # Services API
│   ├── mocks/           # Données mock
│   └── utils/           # Utilitaires
└── hooks/               # React hooks personnalisés
```

## Prochaines étapes

- [ ] Intégrer l'API d'upload de fichiers (MinIO/S3)
- [ ] Implémenter la gestion multi-langues complète
- [ ] Ajouter des tests unitaires et E2E
- [ ] Optimiser les performances (lazy loading, code splitting)
- [ ] Implémenter PWA (Service Worker)

## Support

Pour plus d'informations, voir :
- Documentation complète : `docs/`
- Architecture : `docs/architecture/`
- Déploiement : `docs/deployment/`

