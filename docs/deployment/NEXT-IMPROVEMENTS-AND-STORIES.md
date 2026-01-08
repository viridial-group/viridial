# 🎯 Prochaines Améliorations et Stories

Analyse des prochaines actions prioritaires pour Viridial.

## 📊 État Actuel

### ✅ Complétés
- **US-007** (Properties CRUD) - Code complet, géocodage automatique intégré
- **US-019** (Geolocation) - Code complet, recherche proximité intégrée
- **Auth Service** - JWT fonctionnel avec refresh tokens

### ⏳ Prêts mais Non Déployés
- Property Service (nécessite déploiement + migrations SQL)
- Geolocation Service (nécessite déploiement + Redis)

### 🔒 Améliorations Critiques Nécessaires

## 🚨 Option 1: Améliorer la Sécurité (RECOMMANDÉ EN PRIORITÉ)

### **Authentification JWT pour Property Service** ⚠️ CRITIQUE

**Problème actuel :**
- Les endpoints Property Service sont **ouverts** (pas de protection)
- N'importe qui peut créer/modifier/supprimer des propriétés
- Pas de vérification du propriétaire via JWT

**Impact :** 🔴 **SÉCURITÉ CRITIQUE** - Les endpoints doivent être protégés avant mise en production

**Solution à implémenter :**

1. **Créer un JWT Guard réutilisable**
   ```typescript
   // services/property-service/src/guards/jwt-auth.guard.ts
   // Vérifie le token JWT et extrait userId depuis req.user
   ```

2. **Intégrer avec Auth Service**
   - Vérifier le token JWT avec auth-service
   - Extraire `userId` depuis le payload JWT
   - Valider que l'utilisateur existe

3. **Appliquer le guard sur tous les endpoints**
   ```typescript
   @UseGuards(JwtAuthGuard)
   @Controller('properties')
   ```

4. **Mettre à jour les controllers**
   - Remplacer `req.user?.id` par extraction depuis JWT
   - Supprimer le fallback `createDto.userId`

**Estimation :** 2-3 heures  
**Priorité :** P0 (Critique)  
**Story :** Amélioration de US-007

**Avantages :**
- ✅ Sécurise immédiatement le service
- ✅ Permet de déployer en toute sécurité
- ✅ Réutilisable pour d'autres services

---

## 📋 Option 2: Implémenter US-009 (Search) - Next Story Logique

### **US-009: Recherche internationale d'annonces**

**Story complète :** `docs/stories/US-009-search.story.md`

**Fonctionnalités à implémenter :**

1. **Meilisearch Service**
   - Configuration Meilisearch
   - Index `properties` avec mapping multilingue
   - Indexation automatique lors de publication

2. **Search API**
   - Endpoint `/api/search/properties`
   - Full-text search avec filtres facettés
   - Recherche géographique (radius, bbox)
   - Autocomplete pour suggestions
   - Pagination et tri

3. **Frontend Search UI**
   - Barre de recherche avec autocomplete
   - Filtres (pays, type, prix)
   - Carte interactive avec clustering
   - Résultats avec snippets multilingues

**Dépendances :**
- ✅ US-007 (Properties CRUD) - **Complété**
- ✅ US-019 (Geolocation) - **Complété**
- ⏳ Meilisearch à configurer

**Estimation :** 3-4 jours  
**Priorité :** P0 (Core feature)  
**Story Points :** 8

**Avantages :**
- ✅ Feature core pour les utilisateurs
- ✅ Permet de découvrir les propriétés
- ✅ Bloque d'autres features (favoris, etc.)

---

## 🔧 Option 3: Améliorations Property Service

### 3.1 **Frontend Property Management** 🎨

**Fonctionnalités :**
- Interface de création/édition de propriétés
- Upload d'images avec preview
- Sélection de langues pour traductions
- Workflow de publication (draft → review → listed)
- Liste des propriétés avec filtres

**Estimation :** 2-3 jours  
**Priorité :** P1 (Important pour UX)

### 3.2 **Upload de Médias**

**Fonctionnalités :**
- Configuration MinIO ou S3
- Upload d'images avec optimisation (resize, WebP)
- CDN/storage path
- Validation (limites, formats)

**Estimation :** 2-3 jours  
**Priorité :** P1

### 3.3 **Modération Workflow**

**Fonctionnalités :**
- Flagging de propriétés par utilisateurs
- Queue de modération pour admins
- Actions (approve/reject/takedown)

**Estimation :** 2 jours  
**Priorité :** P2

---

## 📊 Recommandation de Priorité

### 🥇 **Priorité 1 : Authentification JWT** (2-3h)
**Pourquoi :**
- Bloqueur sécurité critique
- Nécessaire avant déploiement en production
- Permet de sécuriser les services immédiatement

### 🥈 **Priorité 2 : Déployer les Services** (1 jour)
**Pourquoi :**
- Services prêts mais pas déployés
- Permet de tester l'intégration complète
- Nécessaire pour continuer le développement

### 🥉 **Priorité 3 : US-009 Search Service** (3-4 jours)
**Pourquoi :**
- Story logique suivante selon dépendances
- Feature core pour utilisateurs finaux
- Bloque d'autres features (favoris)

### 4️⃣ **Priorité 4 : Frontend Property Management** (2-3 jours)
**Pourquoi :**
- Améliore l'UX pour les agents
- Permet de tester les fonctionnalités backend
- Mais peut attendre après la recherche

---

## 🎯 Plan d'Action Recommandé

### Phase 1 : Sécurité (Aujourd'hui - 2-3h)
```bash
1. Créer JWT Guard réutilisable
2. Intégrer avec auth-service pour validation
3. Appliquer sur tous les endpoints Property Service
4. Tester avec tokens valides/invalides
```

### Phase 2 : Déploiement (Demain - 1 jour)
```bash
1. Générer fichiers .env (setup-env.sh)
2. Déployer Geolocation Service
3. Appliquer migrations SQL Property
4. Déployer Property Service
5. Tester intégration complète
```

### Phase 3 : Search Service (3-4 jours)
```bash
1. Configurer Meilisearch
2. Créer Search Service
3. Implémenter indexation automatique
4. Créer endpoints de recherche
5. Frontend search UI
```

### Phase 4 : Améliorations UX (Optionnel - 2-3 jours)
```bash
1. Frontend Property Management
2. Upload de médias
3. Workflow de modération
```

---

## 📝 Détails pour Implémentation

### Implémenter JWT Auth (Phase 1)

**Fichiers à créer/modifier :**

1. **Guard JWT**
   ```typescript
   // services/property-service/src/guards/jwt-auth.guard.ts
   // services/property-service/src/strategies/jwt.strategy.ts
   // services/property-service/src/decorators/user.decorator.ts
   ```

2. **Module Auth**
   ```typescript
   // services/property-service/src/auth/auth.module.ts
   // Configure Passport JWT strategy
   ```

3. **Mettre à jour Controllers**
   ```typescript
   // Remplacer req.user?.id par @User() decorator
   // Ajouter @UseGuards(JwtAuthGuard) sur tous les endpoints
   ```

4. **Configuration**
   ```env
   JWT_PUBLIC_KEY=... # Pour vérifier les tokens
   AUTH_SERVICE_URL=http://auth-service:3000
   ```

**Références :**
- Auth Service JWT implementation: `services/auth-service/src/`
- NestJS Passport JWT: https://docs.nestjs.com/security/authentication

---

## 🔗 Liens Utiles

- **US-009 Story** : `docs/stories/US-009-search.story.md`
- **US-007 Story** : `docs/stories/US-007-properties-crud.story.md`
- **Dépendances** : `docs/stories/DEPENDENCIES.md`
- **Epics** : `docs/stories/EPICS.md`
- **Roadmap** : `docs/deployment/NEXT-STEPS-ROADMAP.md`

---

## ✅ Décision Recommandée

**Commencer par l'authentification JWT** (2-3h) avant de déployer en production, puis **implémenter US-009 Search** (3-4 jours) pour compléter le core feature set.

