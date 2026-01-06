# Guide Rapide: Créer Milestones GitHub

## 🚀 Accès Direct

**URL:** https://github.com/viridial-group/viridial/milestones

## 📝 Étapes Rapides

1. **Cliquer sur "New milestone"** (Nouveau jalon)
2. **Remplir le formulaire** (voir ci-dessous)
3. **Cliquer "Create milestone"**
4. **Répéter** pour les 7 milestones

## 📋 Liste des 7 Milestones

### 1. Sprint 1-2: Foundation
- **Titre:** `Sprint 1-2: Foundation`
- **Description:** `Foundation: Infrastructure, Auth, Multi-tenant Setup`
- **Date:** [Aujourd'hui + 4 semaines]

### 2. Sprint 3: Multi-tenant Setup
- **Titre:** `Sprint 3: Multi-tenant Setup`
- **Description:** `Multi-tenant: Organizations, RBAC, i18n`
- **Date:** [Aujourd'hui + 6 semaines]

### 3. Sprint 4-5: Core Features
- **Titre:** `Sprint 4-5: Core Features`
- **Description:** `Core: Properties CRUD, Search, Leads`
- **Date:** [Aujourd'hui + 10 semaines]

### 4. Sprint 6: Agency Features
- **Titre:** `Sprint 6: Agency Features`
- **Description:** `Agency: Dashboard, Property Management`
- **Date:** [Aujourd'hui + 12 semaines]

### 5. Sprint 7: Lead Management
- **Titre:** `Sprint 7: Lead Management`
- **Description:** `Leads: Scoring, CRM Sync, Contact Flow`
- **Date:** [Aujourd'hui + 14 semaines]

### 6. Sprint 8: Operations
- **Titre:** `Sprint 8: Operations`
- **Description:** `Operations: Observability, Backups, Security`
- **Date:** [Aujourd'hui + 16 semaines]

### 7. Sprint 9+: Advanced Features
- **Titre:** `Sprint 9+: Advanced Features`
- **Description:** `Advanced: Price Estimator, Virtual Tours, Promotions`
- **Date:** [LAISSER VIDE]

## 📅 Calculer les Dates

**Aujourd'hui:** $(date +%Y-%m-%d)

**Dates suggérées:**
- Sprint 1-2: $(date -v+4w +%Y-%m-%d 2>/dev/null || date -d "+4 weeks" +%Y-%m-%d)
- Sprint 3: $(date -v+6w +%Y-%m-%d 2>/dev/null || date -d "+6 weeks" +%Y-%m-%d)
- Sprint 4-5: $(date -v+10w +%Y-%m-%d 2>/dev/null || date -d "+10 weeks" +%Y-%m-%d)
- Sprint 6: $(date -v+12w +%Y-%m-%d 2>/dev/null || date -d "+12 weeks" +%Y-%m-%d)
- Sprint 7: $(date -v+14w +%Y-%m-%d 2>/dev/null || date -d "+14 weeks" +%Y-%m-%d)
- Sprint 8: $(date -v+16w +%Y-%m-%d 2>/dev/null || date -d "+16 weeks" +%Y-%m-%d)

## ✅ Vérification

Après création, vérifier sur:
https://github.com/viridial-group/viridial/milestones

Vous devriez voir 7 milestones.

## 🔗 Associer Issues aux Milestones

Après création des milestones:

1. Ouvrir chaque issue GitHub
2. Dans le panneau droit, trouver "Milestone"
3. Sélectionner le milestone approprié
4. L'issue sera automatiquement associée
