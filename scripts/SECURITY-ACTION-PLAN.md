# Plan d'Action Sécurité - Post Push

## 🎯 Objectif

Sécuriser l'application après l'exposition des identifiants OAuth dans Git.

## ⚠️ Situation Actuelle

- ✅ Historique Git nettoyé (secrets supprimés)
- ✅ Push vers GitHub réussi
- ⚠️ **Identifiants OAuth compromis** : ``
- ⚠️ **Client Secret compromis** : ``

## 🔐 Actions de Sécurité REQUISES

### Étape 1 : Révoquer les Identifiants Compromis (URGENT)

**Temps estimé : 5 minutes**

1. Aller sur [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Sélectionner le projet approprié
3. Trouver le **OAuth 2.0 Client ID** :
   - Client ID : `xxxx`
4. Cliquer sur le Client ID pour ouvrir les détails
5. Cliquer sur **"Delete"** en haut de la page
6. Confirmer la suppression

**Pourquoi c'est urgent** : Même si les secrets ont été supprimés de Git, ils ont été exposés publiquement. N'importe qui ayant accès au dépôt peut les utiliser jusqu'à leur révocation.

### Étape 2 : Générer de Nouveaux Identifiants

**Temps estimé : 10 minutes**

1. Dans [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Cliquer sur **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. Configurer :
   - **Application type** : Web application
   - **Name** : Viridial Auth Service (Production)
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
   - Nouveau Client ID : `____________________.apps.googleusercontent.com`
   - Nouveau Client Secret : `____________________`

### Étape 3 : Mettre à Jour les Variables d'Environnement

#### 3.1 Localement

**Fichier** : `services/auth-service/.env`

```bash
cd services/auth-service
nano .env
```

Ajouter/Mettre à jour :
```env
GOOGLE_CLIENT_ID=NOUVEAU_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=NOUVEAU_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/oidc/google/callback
```

#### 3.2 Sur le VPS

**Fichier** : `/opt/viridial/infrastructure/docker-compose/.env`

```bash
ssh user@vps
cd /opt/viridial/infrastructure/docker-compose
nano .env
```

Ajouter/Mettre à jour :
```env
GOOGLE_CLIENT_ID=NOUVEAU_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=NOUVEAU_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://VOTRE_IP:8080/auth/oidc/google/callback
```

Puis redémarrer le service :
```bash
docker compose -f app-auth.yml restart
```

### Étape 4 : Vérifier le Fonctionnement

**Temps estimé : 5 minutes**

1. **Localement** :
   ```bash
   cd services/auth-service
   npm run start:dev
   ```
   Ouvrir : `http://localhost:3000/auth/oidc/google`

2. **Sur le VPS** :
   Ouvrir : `http://VOTRE_IP:8080/auth/oidc/google`

3. Vérifier que la redirection vers Google fonctionne
4. Vérifier que le callback retourne les tokens correctement

## 🧹 Nettoyage Supplémentaire

### Nettoyer le Fichier GOOGLE_SSO_SETUP.md

Le fichier `services/auth-service/docs/GOOGLE_SSO_SETUP.md` appartient à root et contient encore les secrets localement.

**Solution** : Le fichier sera nettoyé lors du prochain commit ou peut être supprimé temporairement.

### Supprimer les Scripts Temporaires

Les scripts suivants peuvent être supprimés :

```bash
rm scripts/clean-history-secrets.sh
rm scripts/cleanup-oauth-secrets-clean.sh
rm scripts/fix-commit-secrets.sh
rm scripts/remove-secrets-from-history.sh
rm scripts/fix-google-sso-secrets.sh
```

Ou les ajouter au `.gitignore` si tu veux les garder localement.

## 🔍 Vulnérabilités Dependabot

GitHub a détecté 4 vulnérabilités (3 high, 1 low) :
https://github.com/viridial-group/viridial/security/dependabot

**Action** : Examiner et corriger ces vulnérabilités après avoir sécurisé les identifiants OAuth.

## ✅ Checklist de Sécurité

- [ ] Identifiants OAuth compromis révoqués dans Google Cloud Console
- [ ] Nouveaux identifiants OAuth générés
- [ ] Variables d'environnement locales mises à jour
- [ ] Variables d'environnement VPS mises à jour
- [ ] Service `auth-service` redémarré sur le VPS
- [ ] Authentification Google OAuth testée et fonctionnelle
- [ ] Fichiers temporaires nettoyés
- [ ] Vulnérabilités Dependabot examinées

## 📚 Ressources

- [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
- [GitHub Dependabot Alerts](https://github.com/viridial-group/viridial/security/dependabot)
- [Documentation OAuth Setup](services/auth-service/docs/GOOGLE_SSO_SETUP.md)

