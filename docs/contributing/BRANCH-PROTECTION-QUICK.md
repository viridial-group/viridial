# Guide Rapide: Branch Protection

## 🚀 Accès

**URL:** https://github.com/viridial-group/viridial/settings/branches

## ⚡ Configuration Rapide

### Rule 1: `main` (Production)

1. **Add rule** → Branch: `main` → **Create**

2. **Cocher:**
   - ✅ Require a pull request before merging
     - Approvals: **2**
     - Dismiss stale: ✅
     - Code Owners: ✅
   - ✅ Require status checks
     - Up to date: ✅
     - Checks: `ci-base`, `lint`, `test`, `build`
   - ✅ Require conversation resolution
   - ✅ Require linear history
   - ✅ Include administrators
   - ✅ **Do not allow bypassing** ⚠️

3. **Save changes**

### Rule 2: `develop` (Development)

1. **Add rule** → Branch: `develop` → **Create**

2. **Cocher:**
   - ✅ Require a pull request before merging
     - Approvals: **1**
     - Dismiss stale: ✅
     - Code Owners: ✅
   - ✅ Require status checks
     - Up to date: ✅
     - Checks: `ci-base`, `lint`, `test`
   - ✅ Require conversation resolution
   - ✅ Include administrators
   - ✅ **Do not allow bypassing** ⚠️

3. **Save changes**

## ⚠️ Note Importante

Les status checks (`ci-base`, `lint`, `test`, `build`) n'apparaîtront qu'après le premier push et l'exécution des workflows GitHub Actions.

**Si pas encore disponibles:**
1. Créer une PR de test
2. Les workflows s'exécuteront
3. Revenir configurer les status checks

## ✅ Vérification

Après configuration, créer une PR de test pour vérifier que les règles s'appliquent correctement.
