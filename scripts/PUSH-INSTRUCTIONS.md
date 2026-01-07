# Instructions pour Pousser les Changements

## ✅ État Actuel

- Historique Git nettoyé (secrets supprimés)
- Login page corrigée
- Changements commités (commit `fde582d3`)
- Branche `main` en avance de 1 commit sur `origin/main`

## 🚀 Options pour Pousser

### Option 1: SSH avec Passphrase (Recommandé)

1. **Charger ta clé SSH** :
   ```bash
   ssh-add ~/.ssh/id_ed25519
   # Entrer ta passphrase quand demandé
   ```

2. **Tester la connexion** :
   ```bash
   ssh -T git@github.com
   # Devrait afficher: "Hi viridial-group! You've successfully authenticated..."
   ```

3. **Pousser les changements** :
   ```bash
   git push --force-with-lease
   ```

### Option 2: HTTPS Temporaire

Si tu préfères utiliser HTTPS (sans passphrase SSH) :

1. **Changer l'URL du remote** :
   ```bash
   git remote set-url origin https://github.com/viridial-group/viridial.git
   ```

2. **Pousser les changements** :
   ```bash
   git push --force-with-lease
   # GitHub demandera ton username et un Personal Access Token (PAT)
   ```

3. **Remettre SSH après** (optionnel) :
   ```bash
   git remote set-url origin git@github.com:viridial-group/viridial.git
   ```

### Option 3: GitHub CLI

Si tu as `gh` installé :

```bash
gh auth login
git push --force-with-lease
```

## ⚠️ Important

Le push utilise `--force-with-lease` pour remplacer l'historique distant par la version nettoyée. Cela est nécessaire car :

- L'historique local a été nettoyé (secrets supprimés)
- L'historique distant contient encore les secrets
- GitHub Push Protection bloque les pushes avec secrets

## 🔐 Actions de Sécurité Requises

**AVANT ou APRÈS le push**, assure-toi de :

1. ✅ **Révoquer les identifiants OAuth compromis** dans Google Cloud Console
2. ✅ **Générer de nouveaux identifiants** si nécessaire
3. ✅ **Mettre à jour les variables d'environnement** sur le VPS

## 📋 Si GitHub Bloque Encore

Si GitHub détecte encore les secrets après le push, utilise les liens d'autorisation temporaire :

- **Client Secret**: https://github.com/viridial-group/viridial/security/secret-scanning/unblock-secret/37vWU7sUYzMIZ2Us3foVqxyVDez
- **Client ID**: https://github.com/viridial-group/viridial/security/secret-scanning/unblock-secret/37vWU6heDLc5svN4uLtZ00qnYb2

**Note**: Utilise ces liens uniquement si les secrets ont été révoqués dans Google Cloud Console.

