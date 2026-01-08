# Configuration des Routes Publiques

## ✅ Implémentation Terminée

Les routes publiques ont été configurées pour permettre l'accès sans authentification aux propriétés publiées.

## 🔓 Routes Publiques (Sans Authentification)

### Frontend

1. **`/browse`** - Liste publique des propriétés publiées
   - Affiche uniquement les propriétés avec statut `LISTED`
   - Accessible sans authentification
   - Permet de découvrir les propriétés disponibles

2. **`/property/[id]`** - Détail public d'une propriété
   - Accessible sans authentification
   - Affiche uniquement les propriétés publiées (`LISTED`)
   - Bloque l'accès aux propriétés en brouillon ou en révision

### Backend

Les endpoints suivants sont accessibles sans authentification :

1. **`GET /properties`** (avec filtre `status=listed`)
   - Retourne uniquement les propriétés `LISTED` si pas d'authentification
   - Retourne toutes les propriétés de l'utilisateur si authentifié

2. **`GET /properties/:id`**
   - Accès public uniquement si la propriété est `LISTED`
   - Si propriété en `DRAFT` ou `REVIEW`, requiert authentification + ownership

3. **`GET /properties/search/nearby`**
   - Accès public pour la recherche de proximité
   - Par défaut, recherche dans les propriétés `LISTED`

## 🔒 Routes Protégées (Authentification Requise)

### Frontend

1. **`/properties`** - Liste des propriétés de l'utilisateur
   - Redirige vers `/login` si non authentifié
   - Affiche toutes les propriétés de l'utilisateur (tous statuts)

2. **`/properties/new`** - Créer une propriété
   - Authentification requise

3. **`/properties/[id]`** - Détail/gestion d'une propriété
   - Authentification requise
   - Affiche toutes les propriétés de l'utilisateur (même brouillons)

4. **`/properties/[id]/edit`** - Éditer une propriété
   - Authentification requise
   - Seul le propriétaire peut éditer

### Backend

1. **`POST /properties`** - Créer
   - Guard: `JwtAuthGuard`
   - `userId` extrait du token JWT

2. **`PUT /properties/:id`** - Modifier
   - Guard: `JwtAuthGuard`
   - Vérification d'ownership

3. **`DELETE /properties/:id`** - Supprimer
   - Guard: `JwtAuthGuard`
   - Vérification d'ownership

4. **`POST /properties/:id/publish`** - Publier
   - Guard: `JwtAuthGuard`
   - Vérification d'ownership

## 🔧 Logique Backend

### PropertyService.findOne()

```typescript
async findOne(id: string, userId?: string): Promise<Property> {
  // Si userId fourni :
  //   - Propriétaire : accès total
  //   - Non-propriétaire : accès seulement si LISTED
  //   - Propriété non-LISTED : ForbiddenException
  
  // Si pas de userId (accès public) :
  //   - Seulement si propriété est LISTED
  //   - Sinon : ForbiddenException
}
```

### PropertyController.findAll()

```typescript
@Get()
async findAll(@User() user?: AuthenticatedUser, @Query('status') status?) {
  // Si authentifié :
  //   - Pas de filtre de statut par défaut (voit toutes ses propriétés)
  
  // Si non authentifié :
  //   - Filtre automatique sur PropertyStatus.LISTED
}
```

## 📋 Pages Frontend

### Page Publique : `/browse`

- **Accès** : Public (pas d'authentification requise)
- **Contenu** : Liste des propriétés avec statut `LISTED`
- **Actions** : Voir les détails seulement
- **Lien** : "Mes Propriétés" si authentifié

### Page Publique : `/property/[id]`

- **Accès** : Public
- **Contenu** : Détails d'une propriété publiée
- **Actions** : 
  - Voir les détails
  - Si propriétaire authentifié : liens vers édition/gestion
- **Protection** : Le backend retourne 403 si propriété non publiée

### Page Privée : `/properties`

- **Accès** : Authentification requise
- **Contenu** : Toutes les propriétés de l'utilisateur (tous statuts)
- **Actions** : Voir, Modifier, Publier, Supprimer

### Page Privée : `/properties/[id]`

- **Accès** : Authentification requise
- **Contenu** : Détails d'une propriété de l'utilisateur
- **Actions** : Modifier, Publier, Supprimer
- **Protection** : Vérifie l'ownership côté backend

## 🧪 Tests à Effectuer

### Tests Publiques (Sans Authentification)

1. ✅ Accéder à `/browse` sans être connecté
2. ✅ Voir la liste des propriétés publiées
3. ✅ Cliquer sur une propriété → `/property/[id]`
4. ✅ Voir les détails d'une propriété publiée
5. ❌ Essayer d'accéder à une propriété non publiée → 403 Forbidden

### Tests Privés (Avec Authentification)

1. ✅ Se connecter
2. ✅ Accéder à `/properties` → voir toutes ses propriétés
3. ✅ Créer une propriété → `/properties/new`
4. ✅ Voir une propriété en brouillon → `/properties/[id]`
5. ✅ Publier une propriété → devient visible sur `/browse`

### Tests de Sécurité

1. ❌ Non-authentifié ne peut pas créer → 401 Unauthorized
2. ❌ Non-authentifié ne peut pas modifier → 401 Unauthorized
3. ❌ Non-authentifié ne peut pas voir brouillon → 403 Forbidden
4. ❌ Utilisateur A ne peut pas modifier propriété de utilisateur B → 403 Forbidden

## 📝 Notes

- Les propriétés avec statut `LISTED` sont visibles publiquement
- Les propriétés `DRAFT`, `REVIEW`, `FLAGGED`, `ARCHIVED` sont privées
- Le propriétaire peut toujours voir toutes ses propriétés (authentifié)
- Les visiteurs publics ne voient que les propriétés publiées

## 🔗 Navigation

### Pour les Visiteurs

```
/ → /browse → /property/[id]
```

### Pour les Utilisateurs Authentifiés

```
/login → /dashboard → /properties → /properties/[id]
```

ou

```
/login → /dashboard → /browse (pour voir le marché) → /property/[id]
```

---

**Status** : ✅ **CONFIGURÉ - Routes publiques actives**

