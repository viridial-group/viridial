# US-026: Champs Personnalisés (Custom Fields) Réutilisables

## Status: Draft

### Story
En tant qu'agent ou admin d'organisation, je veux pouvoir créer et gérer des champs personnalisés pour les propriétés (et autres entités) afin d'adapter le système à mes besoins spécifiques et réutiliser ces champs pour d'autres entités.

### Acceptance Criteria
- Given je suis un agent ou admin, When je crée un champ personnalisé, Then le champ est disponible pour l'entité cible (ex: properties).
- Given un champ personnalisé créé, When je l'utilise sur une propriété, Then la valeur est stockée et accessible.
- Given un champ personnalisé défini, When je crée une autre entité (ex: leads, agencies), Then je peux réutiliser ce champ si le type est compatible.
- Les champs personnalisés sont indexés dans Meilisearch et recherchables.
- Les champs personnalisés sont affichés dans les formulaires et listings avec validation selon le type.
- Les champs personnalisés peuvent être multilingues (si type texte).

**Priority:** P1
**Estimation:** 8

### Tasks

#### Phase 1: Modèle de Données
- [ ] Table `custom_field_definitions` pour définir les champs:
  - `id`, `organization_id`, `entity_type` (ex: 'property', 'lead', 'agency')
  - `field_key` (slug unique par org), `label` (multilingue), `field_type` (text, number, date, boolean, select, multiselect)
  - `required`, `default_value`, `validation_rules` (JSON), `options` (pour select/multiselect)
  - `reusable` (boolean), `reusable_entity_types` (array)
  - `created_at`, `updated_at`
- [ ] Table `custom_field_values` pour stocker les valeurs:
  - `id`, `organization_id`, `entity_type`, `entity_id` (FK vers l'entité)
  - `field_definition_id` (FK), `value_text`, `value_number`, `value_date`, `value_boolean`, `value_json`
  - Index composite sur `(entity_type, entity_id, field_definition_id)`
- [ ] Migration Flyway pour créer les tables
- [ ] Modèles JPA/Entity pour CustomFieldDefinition et CustomFieldValue

#### Phase 2: API Backend
- [ ] API CRUD pour `custom_field_definitions`:
  - `POST /api/custom-fields/definitions` - Créer un champ
  - `GET /api/custom-fields/definitions?entity_type=property` - Lister les champs d'une entité
  - `GET /api/custom-fields/definitions/{id}` - Détails d'un champ
  - `PUT /api/custom-fields/definitions/{id}` - Modifier un champ (avec validation si déjà utilisé)
  - `DELETE /api/custom-fields/definitions/{id}` - Supprimer (soft delete si valeurs existantes)
- [ ] API pour valeurs:
  - `POST /api/custom-fields/values` - Créer/modifier valeur
  - `GET /api/custom-fields/values?entity_type=property&entity_id={id}` - Récupérer valeurs d'une entité
  - `DELETE /api/custom-fields/values/{id}` - Supprimer valeur
- [ ] Validation selon type de champ (required, format, range, etc.)
- [ ] Service de réutilisation: vérifier compatibilité entre entity_types

#### Phase 3: Intégration avec Entités Existantes
- [ ] Modifier Property entity pour supporter custom fields:
  - Méthode `getCustomFields()` qui charge les valeurs
  - Méthode `setCustomField(key, value)` pour définir une valeur
- [ ] Modifier PropertyService pour inclure custom fields dans CRUD
- [ ] Endpoint Property enrichi: `GET /api/properties/{id}` inclut custom fields
- [ ] Endpoint Property création/modification: accepter custom fields dans payload

#### Phase 4: UI Frontend - Gestion des Définitions
- [ ] Page Admin: "Champs Personnalisés" avec liste des champs par entité
- [ ] Formulaire création champ:
  - Sélection entity_type (property, lead, agency, etc.)
  - Type de champ (text, number, date, boolean, select, multiselect)
  - Label multilingue
  - Options de validation (required, min/max, pattern, etc.)
  - Options pour select/multiselect
  - Checkbox "Réutilisable pour autres entités"
- [ ] Édition/suppression de champs (avec avertissement si valeurs existantes)
- [ ] Prévisualisation du champ dans un formulaire

#### Phase 5: UI Frontend - Utilisation dans Formulaires
- [ ] Composant générique `CustomFieldInput` qui s'adapte au type:
  - Text: input text/textarea
  - Number: input number avec min/max
  - Date: date picker
  - Boolean: checkbox
  - Select: dropdown
  - Multiselect: multi-select dropdown
- [ ] Intégration dans formulaire Property (US-007):
  - Section "Champs Personnalisés" dynamique
  - Affichage conditionnel selon champs définis pour l'organisation
  - Validation côté client selon règles du champ
- [ ] Affichage dans listing Property:
  - Section "Informations Complémentaires" avec custom fields
  - Formatage selon type (date formatée, boolean oui/non, etc.)

#### Phase 6: Recherche et Indexation
- [ ] Modifier indexation Meilisearch (US-009):
  - Inclure custom fields dans l'index `properties`
  - Mapping dynamique selon types (text searchable, number/date filtrable)
  - Facettes pour custom fields de type select
- [ ] API Search enrichie:
  - Filtres sur custom fields: `?custom_fields.field_key=value`
  - Recherche full-text dans custom fields text
- [ ] UI Search: filtres dynamiques pour custom fields select

#### Phase 7: Réutilisation entre Entités
- [ ] Service de réutilisation:
  - Vérifier compatibilité: même type de champ peut être réutilisé
  - API: `POST /api/custom-fields/definitions/{id}/reuse` avec `target_entity_type`
  - Créer une copie du champ pour la nouvelle entité (ou référence partagée)
- [ ] UI: bouton "Réutiliser" dans liste des champs
- [ ] Gestion des conflits: si champ existe déjà pour l'entité cible

#### Phase 8: Tests et Documentation
- [ ] Tests unitaires: validation, types, réutilisation
- [ ] Tests d'intégration: CRUD complet, indexation, recherche
- [ ] Tests E2E: création champ → utilisation → recherche
- [ ] Documentation API (OpenAPI) mise à jour
- [ ] Guide utilisateur: comment créer et utiliser les champs personnalisés

### Technical Notes

**Architecture de Stockage:**

**Option A - Table EAV (Entity-Attribute-Value) - Recommandée:**
- Table `custom_field_values` avec colonnes typées (value_text, value_number, etc.)
- Avantages: Flexible, scalable, facile à requêter
- Inconvénients: Requêtes plus complexes pour récupérer toutes les valeurs

**Option B - JSON Column:**
- Colonne JSONB dans table `properties` pour custom fields
- Avantages: Simple, performant pour une entité
- Inconvénients: Moins flexible pour réutilisation, recherche limitée

**Recommandation:** Option A (EAV) pour flexibilité et réutilisation.

**Types de Champs Supportés:**
- `text`: Texte simple (peut être multilingue)
- `textarea`: Texte long (peut être multilingue)
- `number`: Nombre (integer ou decimal selon validation)
- `date`: Date
- `datetime`: Date et heure
- `boolean`: Booléen (oui/non)
- `select`: Sélection unique (dropdown)
- `multiselect`: Sélection multiple (tags)
- `url`: URL
- `email`: Email

**Validation:**
- Required: champ obligatoire
- Min/Max: pour number, date, text length
- Pattern: regex pour text, email, url
- Options: liste de valeurs pour select/multiselect

**Réutilisation:**
- Un champ peut être marqué comme `reusable`
- Lors de la réutilisation, vérifier compatibilité:
  - Même type de champ
  - Même organisation (ou global si défini par admin)
- Créer une copie ou référence partagée selon stratégie

**Indexation Meilisearch:**
- Custom fields indexés dans un objet `custom_fields` dans le document
- Mapping dynamique: text → searchable, number/date → filtrable
- Facettes pour select/multiselect pour filtrage avancé

**Multi-tenant:**
- Custom fields isolés par `organization_id`
- Possibilité de champs globaux (admin système) pour réutilisation cross-org

**Dependencies:**
- Nécessite US-007 (Properties CRUD) pour intégration
- Nécessite US-009 (Search) pour indexation
- Nécessite US-001 (Organization) pour isolation multi-tenant
- Nécessite US-004 (Users & Roles) pour permissions (qui peut créer des champs)

### Definition of Done
- [ ] Tables `custom_field_definitions` et `custom_field_values` créées avec migrations
- [ ] API CRUD complète pour définitions et valeurs
- [ ] Intégration dans Property CRUD (création/modification avec custom fields)
- [ ] UI Admin pour gérer les définitions de champs
- [ ] UI Property avec section champs personnalisés dynamique
- [ ] Custom fields indexés dans Meilisearch et recherchables
- [ ] Réutilisation de champs entre entités fonctionnelle
- [ ] Tests unitaires et d'intégration passent
- [ ] Documentation API et guide utilisateur créés
- [ ] Validation complète selon types de champs
- [ ] Multi-tenant isolation testée

