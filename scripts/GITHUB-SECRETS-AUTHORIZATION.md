# Autorisation Temporaire GitHub pour les Secrets

## 📋 Situation

GitHub Push Protection a détecté des secrets Google OAuth dans le commit `bfd8670d` qui existe déjà sur `origin/main`. Même si l'historique local a été nettoyé, GitHub scanne tous les commits qui seront sur la branche après le push.

## ⚠️ Action de Sécurité REQUISE AVANT l'Autorisation

**CRITIQUE** : Tu DOIS révoquer les identifiants OAuth compromis dans Google Cloud Console **AVANT** d'autoriser le push sur GitHub.

### Étapes de Révocation

1. Aller sur : https://console.cloud.google.com/apis/credentials
2. Trouver le Client ID : `991109105818-lllmlebo17hs5nag6k7ep71vg246mj5f`
3. Cliquer sur le Client ID pour ouvrir les détails
4. Cliquer sur **"Delete"** ou **"Revoke"**
5. Confirmer la suppression

**Pourquoi c'est important** : Si tu autorises le push sans révoquer, les secrets compromis resteront valides et pourront être utilisés par des personnes malveillantes.

## 🔗 Liens d'Autorisation Temporaire GitHub

Une fois les identifiants révoqués, utilise ces liens pour autoriser temporairement le push :

### Google OAuth Client ID
https://github.com/viridial-group/viridial/security/secret-scanning/unblock-secret/37vWU6heDLc5svN4uLtZ00qnYb2

### Google OAuth Client Secret
https://github.com/viridial-group/viridial/security/secret-scanning/unblock-secret/37vWU7sUYzMIZ2Us3foVqxyVDez

## 📝 Processus Complet

1. ✅ **Révoquer les identifiants** dans Google Cloud Console
2. ✅ **Cliquer sur les deux liens** ci-dessus pour autoriser temporairement
3. ✅ **Exécuter le push** :
   ```bash
   git push --force-with-lease
   ```
4. ✅ **Générer de nouveaux identifiants** OAuth si nécessaire
5. ✅ **Mettre à jour les variables d'environnement** sur le VPS

## 🔄 Alternative : Nettoyer l'Historique Distant

Si tu préfères nettoyer complètement l'historique au lieu d'autoriser temporairement :

1. **Créer une nouvelle branche** propre :
   ```bash
   git checkout --orphan clean-main
   git add .
   git commit -m "Initial commit - cleaned history"
   ```

2. **Remplacer la branche main** :
   ```bash
   git branch -D main
   git branch -m main
   git push --force origin main
   ```

⚠️ **Attention** : Cette méthode supprime tout l'historique Git. Utilise-la uniquement si tu es sûr de vouloir perdre l'historique.

## 📚 Ressources

- [GitHub Push Protection Documentation](https://docs.github.com/code-security/secret-scanning/working-with-secret-scanning-and-push-protection)
- [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)

