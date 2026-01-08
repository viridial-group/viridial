# 🎯 Quelle est la Prochaine Tâche ?

Guide pour choisir entre amélioration de sécurité ou nouvelle story.

## 🚨 Option A: Amélioration de Sécurité (RECOMMANDÉ) ⭐

### **Implémenter Authentification JWT pour Property Service**

**Pourquoi maintenant ?**
- ⚠️ **CRITIQUE** : Les endpoints Property sont actuellement **ouverts**
- N'importe qui peut créer/modifier/supprimer des propriétés
- **Blocker** avant déploiement en production

**Temps estimé :** 2-3 heures  
**Priorité :** P0 (Critique)

**Ce qui doit être fait :**

1. **Créer un JWT Guard réutilisable**
   - Vérifier le token JWT dans le header `Authorization`
   - Valider le token avec auth-service ou clé publique
   - Extraire `userId` depuis le payload JWT

2. **Intégrer avec Auth Service**
   - Option A: Vérifier token localement avec clé publique
   - Option B: Appeler auth-service pour validation
   - Extraire `userId` et le mettre dans `req.user`

3. **Appliquer sur tous les endpoints**
   - Protéger CREATE, UPDATE, DELETE, PUBLISH
   - Laisser GET (liste) public mais filtrer par propriétaire
   - GET (détail) peut être public pour propriétés `listed`

**Fichiers à créer :**
```
services/property-service/src/
├── guards/
│   └── jwt-auth.guard.ts
├── strategies/
│   └── jwt.strategy.ts
└── decorators/
    └── user.decorator.ts
```

**Avantages :**
- ✅ Sécurise immédiatement le service
- ✅ Réutilisable pour autres services (Geolocation, Search, etc.)
- ✅ Permet déploiement sécurisé
- ✅ Quick win (2-3h)

---

## 📋 Option B: Nouvelle Story - US-009 Search Service

### **US-009: Recherche internationale d'annonces**

**Story complète :** `docs/stories/US-009-search.story.md`

**Pourquoi maintenant ?**
- ✅ Toutes les dépendances sont complètes (US-007, US-019)
- Feature **core** pour utilisateurs finaux
- Bloque d'autres features (favoris, alertes)

**Temps estimé :** 3-4 jours  
**Priorité :** P0 (Core feature)  
**Story Points :** 8

**Ce qui doit être fait :**

1. **Configurer Meilisearch**
   - Service Meilisearch (Docker)
   - Index `properties` avec mapping multilingue
   - Configuration geo-point pour recherche géographique

2. **Créer Search Service** (ou endpoints dans Property Service)
   - Endpoint `/api/search/properties`
   - Full-text search avec filtres
   - Recherche géographique (radius, bbox)
   - Autocomplete

3. **Indexation automatique**
   - Indexer lors de publication (status → `listed`)
   - Mettre à jour lors de modification
   - Supprimer lors d'archivage

4. **Frontend Search UI**
   - Barre de recherche avec autocomplete
   - Filtres (pays, type, prix)
   - Résultats avec pagination
   - Carte interactive (optionnel)

**Fichiers à créer :**
```
services/search-service/  (nouveau service)
ou intégration dans property-service/

frontend/web/app/search/
  ├── page.tsx
  ├── components/
  │   ├── SearchBar.tsx
  │   ├── PropertyCard.tsx
  │   └── Filters.tsx
```

**Avantages :**
- ✅ Feature core pour la plateforme
- ✅ Permet de découvrir les propriétés
- ✅ Bloque d'autres features importantes

---

## 🎯 Recommandation

### 🥇 **COMMENCER PAR L'AMÉLIORATION DE SÉCURITÉ** (2-3h)

**Raisons :**
1. ⚠️ **Blocker sécurité** - Les endpoints sont actuellement ouverts
2. ⚡ **Quick win** - 2-3h vs 3-4 jours pour Search
3. 🔒 **Nécessaire avant production** - Impossible de déployer sans sécurité
4. 🔄 **Réutilisable** - Le guard peut être utilisé pour Search Service plus tard

### 🥈 **PUIS IMPLÉMENTER US-009** (3-4 jours)

Une fois la sécurité en place, implémenter le Search Service.

---

## 📝 Plan d'Action Détaillé

### Étape 1 : Authentification JWT (Aujourd'hui - 2-3h)

**Commandes pour démarrer :**
```bash
# Dans le terminal
cd services/property-service

# Créer la structure
mkdir -p src/guards src/strategies src/decorators

# Commencer l'implémentation
```

**Fichiers à créer (ordre recommandé) :**

1. **JWT Strategy** (`src/strategies/jwt.strategy.ts`)
   - Utilise `@nestjs/passport` et `passport-jwt`
   - Extrait token du header `Authorization: Bearer <token>`
   - Valide avec clé publique ou auth-service
   - Retourne payload avec `userId`

2. **JWT Guard** (`src/guards/jwt-auth.guard.ts`)
   - Extends `AuthGuard('jwt')` de Passport
   - Gère les erreurs d'authentification

3. **User Decorator** (`src/decorators/user.decorator.ts`)
   - Custom decorator pour `@User()`
   - Extrait `req.user` facilement

4. **Auth Module** (`src/auth/auth.module.ts`)
   - Configure Passport JWT
   - Exporte le guard pour utilisation

5. **Mettre à jour Controllers**
   - Ajouter `@UseGuards(JwtAuthGuard)`
   - Utiliser `@User()` decorator au lieu de `req.user?.id`

**Configuration nécessaire :**
```env
JWT_PUBLIC_KEY=... # Clé publique pour vérifier les tokens
# ou
AUTH_SERVICE_URL=http://auth-service:3000  # Pour validation via API
```

---

### Étape 2 : US-009 Search Service (3-4 jours)

Voir `docs/stories/US-009-search.story.md` pour les détails complets.

---

## ✅ Checklist de Décision

**Si vous choisissez l'amélioration de sécurité :**
- [ ] Créer structure guards/strategies/decorators
- [ ] Implémenter JWT Strategy
- [ ] Implémenter JWT Guard
- [ ] Créer User Decorator
- [ ] Configurer Auth Module
- [ ] Appliquer guards sur controllers
- [ ] Tester avec tokens valides/invalides
- [ ] Mettre à jour documentation

**Si vous choisissez US-009 Search :**
- [ ] Configurer Meilisearch (Docker)
- [ ] Créer Search Service ou endpoints
- [ ] Implémenter indexation automatique
- [ ] Créer endpoints de recherche
- [ ] Frontend search UI
- [ ] Tests de recherche

---

## 🔗 Ressources

- **US-009 Story** : `docs/stories/US-009-search.story.md`
- **US-007 Story** : `docs/stories/US-007-properties-crud.story.md`
- **NestJS Passport JWT** : https://docs.nestjs.com/security/authentication#jwt-functionality
- **Auth Service** : `services/auth-service/src/` (référence)

---

**💡 Ma recommandation : Commencer par l'authentification JWT (2-3h), puis US-009 Search (3-4 jours).**

