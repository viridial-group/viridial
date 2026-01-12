# Viridial Agency - Gestion des Organisations

Application Next.js pour la gestion des organisations, utilisateurs, rôles et permissions.

## 🚀 Démarrage rapide

### Installation des dépendances

```bash
pnpm install
```

### Développement

```bash
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
frontend/agency/
├── app/                    # Pages Next.js (App Router)
│   ├── page.tsx           # Page d'accueil (liste des organisations)
│   ├── organizations/     # Pages de gestion des organisations
│   └── globals.css        # Styles globaux
├── src/
│   ├── components/        # Composants React
│   │   ├── ui/            # Composants UI de base (shadcn/ui)
│   │   ├── organizations/ # Composants pour les organisations
│   │   ├── users/         # Composants pour les utilisateurs
│   │   └── roles/         # Composants pour les rôles
│   ├── data/              # Données de test (mock data)
│   ├── types/             # Types TypeScript
│   └── lib/               # Utilitaires
└── package.json
```

## 🎨 Fonctionnalités implémentées

### ✅ Gestion des Organisations
- Liste des organisations avec statistiques
- Cartes d'organisation avec informations détaillées
- Recherche et filtrage
- Statuts (actif/inactif) et plans (free/basic/professional/enterprise)

### ✅ Gestion des Utilisateurs
- Tableau des utilisateurs avec informations complètes
- Affichage des rôles associés
- Statut actif/inactif
- Dernière connexion
- Actions (édition, suppression) - prêtes pour intégration API

### ✅ Gestion des Rôles et Permissions
- Cartes de rôles avec permissions détaillées
- Groupement des permissions par ressource
- 14 permissions différentes disponibles
- Actions (édition, suppression) - prêtes pour intégration API

## 📊 Données de test

L'application utilise des données de test (mock data) pour valider l'UX/UI :

- **4 organisations** de test avec différents plans
- **7 utilisateurs** répartis sur les organisations
- **6 rôles** avec différents niveaux de permissions

### Types de rôles disponibles :
- **Super Admin** : Accès complet
- **Administrateur** : Gestion complète (sans suppression d'organisation)
- **Gestionnaire** : Gestion des propriétés
- **Agent** : Consultation et modification des propriétés
- **Lecteur** : Consultation uniquement

## 🔧 Technologies utilisées

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** avec thème Viridial
- **Radix UI** (composants accessibles)
- **Lucide React** (icônes)
- **date-fns** (formatage de dates)

## 🎯 Prochaines étapes

1. **Intégration API** : Remplacer les données mock par des appels API réels
2. **Authentification** : Ajouter la gestion de l'authentification
3. **Formulaires** : Créer les formulaires de création/édition
4. **Validation** : Ajouter la validation des formulaires
5. **Permissions** : Implémenter le système de contrôle d'accès basé sur les rôles

## 📝 Notes

- Les données sont actuellement statiques (mock data)
- Les actions (édition, suppression) sont prêtes mais nécessitent l'intégration API
- L'interface est entièrement responsive
- Le design suit le système de design Viridial

