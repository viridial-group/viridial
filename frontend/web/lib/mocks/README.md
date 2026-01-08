# Mode Mock pour le développement

Ce dossier contient les données et fonctions mockées pour tester l'interface de recherche sans appeler les services réels.

## 🚀 Démarrage rapide

### Activation rapide (console navigateur)

1. Ouvrez la page de recherche : `/search`
2. Ouvrez la console du navigateur (F12)
3. Tapez : `localStorage.setItem('useMockSearch', 'true')`
4. Rechargez la page : `location.reload()`

Vous verrez maintenant une bannière jaune en haut indiquant que le mode test est actif !

### Désactivation

```javascript
localStorage.removeItem('useMockSearch');
location.reload();
```

**OU** Cliquez sur le bouton "Désactiver" dans la bannière jaune.

## Activation du mode mock

### Méthode 1 : Variable d'environnement

Ajoutez dans votre fichier `.env.local` :

```bash
NEXT_PUBLIC_USE_MOCK_SEARCH=true
```

### Méthode 2 : LocalStorage (dynamique)

Ouvrez la console du navigateur et tapez :

```javascript
localStorage.setItem('useMockSearch', 'true');
location.reload();
```

Pour désactiver :

```javascript
localStorage.removeItem('useMockSearch');
location.reload();
```

## Données de test

Le fichier `search-mock-data.ts` contient :

- **8 propriétés de test** avec différents types :
  - Villa avec piscine (Paris)
  - Appartement moderne (Paris)
  - Maison familiale (Paris)
  - Terrain constructible (Nice)
  - Local commercial (Paris)
  - Villa de luxe (Cannes)
  - Studio (Paris)
  - Maison avec piscine (Avignon)

- **5 suggestions** pour l'autocomplete

## Fonctionnalités mockées

- ✅ Recherche par texte (dans titre, description, ville, pays)
- ✅ Filtrage par type de propriété
- ✅ Filtrage par pays et ville
- ✅ Filtrage par fourchette de prix
- ✅ Recherche par proximité (latitude/longitude + rayon)
- ✅ Tri par prix (croissant/décroissant)
- ✅ Tri par distance
- ✅ Tri par pertinence
- ✅ Pagination
- ✅ Suggestions d'autocomplete
- ✅ Simulation de délai réseau (300-500ms)
- ✅ Calcul du temps de traitement

## Utilisation

Une fois le mode mock activé, vous verrez une bannière jaune en haut de la page indiquant que le mode test est actif. Toutes les recherches utilisent alors les données mockées au lieu d'appeler les services réels.

## Exemples de recherches

- Rechercher "villa" → trouvera les 2 villas
- Rechercher "Paris" → trouvera toutes les propriétés à Paris
- Filtrer par type "apartment" → trouvera les appartements
- Filtrer par prix min 400000 → trouvera les propriétés à partir de 400k€
- Recherche de proximité avec latitude/longitude → filtre par rayon

