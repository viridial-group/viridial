# Actions Post-Push - Sécurité et Maintenance

## ✅ Push Réussi

Le push vers GitHub a été effectué avec succès. L'historique a été nettoyé et les secrets ont été supprimés.

## 🔐 Actions de Sécurité REQUISES

### 1. Révoquer les Identifiants OAuth Compromis

**CRITIQUE** : Les identifiants OAuth qui ont été exposés dans Git doivent être révoqués immédiatement.

#### Étapes

1. Aller sur [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Sélectionner le projet approprié
3. Trouver le **OAuth 2.0 Client ID** :
   - Client ID : `991109105818-lllmlebo17hs5nag6k7ep71vg246mj5f`
4. Cliquer sur le Client ID pour ouvrir les détails
5. Cliquer sur **"Delete"** en haut de la page
6. Confirmer la suppression

#### Pourquoi c'est important

Même si les secrets ont été supprimés de Git, ils ont été exposés publiquement dans l'historique. N'importe qui ayant accès au dépôt (ou ayant cloné le dépôt avant le nettoyage) peut les utiliser. La révocation empêche leur utilisation malveillante.

### 2. Générer de Nouveaux Identifiants OAuth

Une fois les anciens identifiants révoqués, créer de nouveaux identifiants :

1. Dans [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Cliquer sur **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Configurer :
   - **Application type** : Web application
   - **Name** : Viridial Auth Service (nouveau)
   - **Authorized JavaScript origins** :
     ```
     http://localhost:3000
     http://localhost:8080
     https://viridial.com
     ```
   - **Authorized redirect URIs** :
     ```
     http://localhost:3000/auth/oidc/google/callback
     http://localhost:8080/auth/oidc/google/callback
     https://viridial.com/auth/oidc/google/callback
     ```
4. Cliquer sur **"Create"**
5. **Copier les nouveaux identifiants** :
   - Nouveau Client ID
   - Nouveau Client Secret

### 3. Mettre à Jour les Variables d'Environnement

#### Localement

Mettre à jour ton `.env` local :

```bash
cd services/auth-service
nano .env
```

Remplacer :
```env
GOOGLE_CLIENT_ID=NOUVEAU_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=NOUVEAU_CLIENT_SECRET
```

#### Sur le VPS

```bash
ssh user@vps
cd /opt/viridial/infrastructure/docker-compose
nano .env
# Mettre à jour GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET
```

Puis redémarrer le service :

```bash
docker compose -f app-auth.yml restart
```

### 4. Vérifier que les Nouveaux Identifiants Fonctionnent

Tester l'authentification Google OAuth :

1. **Localement** :
   ```bash
   cd services/auth-service
   npm run start:dev
   ```
   Ouvrir : `http://localhost:3000/auth/oidc/google`

2. **Sur le VPS** :
   Ouvrir : `http://VOTRE_IP:8080/auth/oidc/google`

## 🧹 Nettoyage des Fichiers Temporaires

Les scripts de nettoyage suivants peuvent être supprimés ou ajoutés au `.gitignore` :

- `scripts/clean-history-secrets.sh`
- `scripts/cleanup-oauth-secrets-clean.sh`
- `scripts/fix-commit-secrets.sh`
- `scripts/remove-secrets-from-history.sh`
- `scripts/fix-google-sso-secrets.sh`

Ils ont servi leur but et ne sont plus nécessaires.

## 📚 Documentation à Conserver

Ces fichiers de documentation sont utiles et doivent être conservés :

- `scripts/SECRETS-CLEANUP-SUMMARY.md` - Résumé du nettoyage effectué
- `scripts/PUSH-INSTRUCTIONS.md` - Instructions pour les futurs pushes
- `scripts/NEXT-STEPS.md` - Guide des prochaines étapes
- `scripts/GITHUB-SECRETS-AUTHORIZATION.md` - Guide d'autorisation GitHub
- `scripts/POST-PUSH-ACTIONS.md` - Ce fichier

## ✅ Checklist Post-Push

- [ ] Identifiants OAuth compromis révoqués dans Google Cloud Console
- [ ] Nouveaux identifiants OAuth générés
- [ ] Variables d'environnement locales mises à jour
- [ ] Variables d'environnement VPS mises à jour
- [ ] Service `auth-service` redémarré sur le VPS
- [ ] Authentification Google OAuth testée et fonctionnelle
- [ ] Fichiers temporaires nettoyés (optionnel)

## 🚀 Prochaines Étapes de Développement

Une fois la sécurité assurée, tu peux continuer avec :

1. **Finaliser l'intégration frontend** :
   - Tester le flow complet de connexion Google
   - Gérer les tokens et la session utilisateur
   - Implémenter la déconnexion

2. **Améliorer la sécurité** :
   - Ajouter rate limiting sur les endpoints OAuth
   - Implémenter CSRF protection
   - Ajouter des logs de sécurité

3. **Documentation** :
   - Mettre à jour la documentation utilisateur
   - Documenter le flow OAuth complet

## 📞 Support

Si tu rencontres des problèmes :

1. Vérifier les logs du service : `docker logs viridial-auth-service`
2. Vérifier les variables d'environnement : `docker exec viridial-auth-service env | grep GOOGLE`
3. Consulter la documentation : `services/auth-service/docs/GOOGLE_SSO_SETUP.md`

