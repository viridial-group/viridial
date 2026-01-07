# Prochaines Étapes

## ✅ État Actuel

- ✅ Historique Git nettoyé (secrets OAuth supprimés)
- ✅ Login page corrigée (duplication supprimée, design appliqué)
- ✅ Guide de push créé (`scripts/PUSH-INSTRUCTIONS.md`)
- ✅ Remote configuré en HTTPS
- ✅ 2 commits prêts à pousser

## 🚀 Action Immédiate : Push vers GitHub

### Commande à exécuter

```bash
git push --force-with-lease
```

### Authentification

GitHub demandera :
- **Username** : `viridial-group`
- **Password** : Utilise un **Personal Access Token (PAT)**

### Créer un Personal Access Token

1. Aller sur : https://github.com/settings/tokens
2. Cliquer sur **"Generate new token"** → **"Generate new token (classic)"**
3. Donner un nom : `viridial-push-$(date +%Y%m%d)`
4. Sélectionner le scope : **`repo`** (accès complet aux repositories)
5. Cliquer sur **"Generate token"**
6. **Copier le token immédiatement** (il ne sera plus visible après)
7. Utiliser ce token comme mot de passe lors du push

### ⚠️ Important

- Le push utilise `--force-with-lease` pour remplacer l'historique distant
- Cela est nécessaire car l'historique local a été nettoyé des secrets
- Si GitHub détecte encore des secrets, utilise les liens d'autorisation temporaire dans `scripts/SECRETS-CLEANUP-SUMMARY.md`

## 🔐 Actions de Sécurité Post-Push

**Après le push réussi**, assure-toi de :

1. ✅ **Révoquer les identifiants OAuth compromis** dans Google Cloud Console
   - Aller sur : https://console.cloud.google.com/apis/credentials
   - Trouver le Client ID : `991109105818-lllmlebo17hs5nag6k7ep71vg246mj5f`
   - Cliquer sur "Delete" ou "Revoke"

2. ✅ **Générer de nouveaux identifiants OAuth** (si nécessaire)
   - Créer un nouveau Client ID et Client Secret
   - Mettre à jour les variables d'environnement

3. ✅ **Mettre à jour les variables d'environnement** sur le VPS
   - Mettre à jour `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans `.env`
   - Redémarrer les services si nécessaire

## 📋 Fichiers Temporaires

Les scripts suivants peuvent être supprimés ou ajoutés au `.gitignore` :

- `scripts/clean-history-secrets.sh`
- `scripts/cleanup-oauth-secrets-clean.sh`
- `scripts/fix-commit-secrets.sh`
- `scripts/remove-secrets-from-history.sh`

Ils ont servi leur but et ne sont plus nécessaires.

## 🔄 Remettre SSH (Optionnel)

Après le push, si tu veux remettre SSH :

```bash
git remote set-url origin git@github.com:viridial-group/viridial.git
```

Puis charger ta clé SSH :
```bash
ssh-add ~/.ssh/id_ed25519
# Entrer la passphrase
```

