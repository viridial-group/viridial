# 🔧 Configuration des Variables d'Environnement

Guide rapide pour configurer les variables d'environnement dans le projet Viridial.

## ⚡ Démarrage Rapide

```bash
# 1. Copier le template
cp .env.example .env

# 2. Éditer avec vos valeurs
vi .env

# 3. Générer tous les fichiers .env nécessaires
./scripts/setup-env.sh
```

## 📁 Structure

```
viridial/
├── .env                          # ⭐ Source principale (à éditer)
├── .env.example                  # Template (ne pas modifier)
│
├── infrastructure/docker-compose/
│   └── .env                      # Généré automatiquement
│
└── services/
    ├── auth-service/.env         # Généré automatiquement
    └── property-service/.env     # Généré automatiquement
```

## 🔄 Commandes Utiles

```bash
# Vérifier si tous les fichiers .env existents
./scripts/setup-env.sh --check

# Resynchroniser tous les fichiers depuis .env principal
./scripts/setup-env.sh --force

# Voir la documentation complète
cat docs/deployment/ENV-CONFIGURATION.md
```

## 🔐 Variables Critiques

Les variables suivantes **DOIVENT** être configurées :

1. **DATABASE_URL** - Connexion PostgreSQL
2. **POSTGRES_PASSWORD** - Mot de passe base de données
3. **SMTP_PASS** - Mot de passe SMTP pour les emails
4. **JWT_SECRET**, **JWT_REFRESH_SECRET**, **JWT_ACCESS_SECRET** - Secrets JWT
5. **MEILI_MASTER_KEY** - Clé Meilisearch

### Générer des Secrets

```bash
# Générer un secret JWT
openssl rand -base64 32
```

## ⚠️ Sécurité

- ❌ **NE JAMAIS** committer les fichiers `.env` dans Git
- ✅ Les fichiers `.env` sont déjà dans `.gitignore`
- ✅ Utilisez toujours HTTPS en production
- ✅ Changez tous les secrets par défaut

## 📚 Documentation Complète

Voir : [`docs/deployment/ENV-CONFIGURATION.md`](docs/deployment/ENV-CONFIGURATION.md)

