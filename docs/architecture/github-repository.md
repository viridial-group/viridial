# Repository GitHub - Viridial

## Informations Repository

- **URL:** https://github.com/viridial-group/viridial.git
- **Organisation:** viridial-group
- **Nom:** viridial
- **Type:** Monorepo (microservices)

## Configuration Locale

### Cloner le Repository

```bash
git clone https://github.com/viridial-group/viridial.git
cd viridial
```

### Configurer Remote

```bash
# Vérifier remote actuel
git remote -v

# Si besoin, ajouter/modifier remote
git remote add origin https://github.com/viridial-group/viridial.git
# ou
git remote set-url origin https://github.com/viridial-group/viridial.git
```

## Branches

### Branches Principales

- **main:** Production (protégée, require PR reviews)
- **develop:** Staging/Development (protégée, require PR reviews)
- **release/*:** Branches de release

### Workflow

1. Créer feature branch depuis `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/US-XXX-description
   ```

2. Pousser et créer PR:
   ```bash
   git push origin feature/US-XXX-description
   # Créer PR sur GitHub vers develop
   ```

3. Après merge, supprimer branch locale:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/US-XXX-description
   ```

## Protection des Branches

### main
- Require PR reviews (2 approbations)
- Require status checks
- No force push
- No deletion

### develop
- Require PR reviews (1 approbation)
- Require status checks
- No force push

## CI/CD

### GitHub Actions

Workflows disponibles:
- `.github/workflows/story-validation.yml` - Validation des stories

### Secrets GitHub

À configurer dans Settings → Secrets:
- `SMTP_PASS` - Mot de passe SMTP
- `DOCKER_REGISTRY_TOKEN` - Token pour registry Docker (si privé)
- `KUBERNETES_KUBECONFIG` - Kubeconfig pour déploiement (si CI/CD)

## Structure Monorepo

```
viridial/
├── services/          # 6 microservices
├── frontend/          # 3 applications frontend
├── shared/            # Code partagé
├── infrastructure/    # IaC (Ansible, Kubernetes)
└── docs/              # Documentation
```

Voir [Repository Structure](repository-structure.md) pour détails.

## Contribution

Voir [CONTRIBUTING.md](../../CONTRIBUTING.md) et [GitHub Workflow](../contributing/github-workflow.md) pour guidelines.

## Issues & Projects

- **Issues:** Utiliser templates GitHub (bug, feature, story, infrastructure)
- **Projects:** Roadmap et Kanban boards
- **Milestones:** Sprints et versions

## Ressources

- [Repository GitHub](https://github.com/viridial-group/viridial)
- [GitHub Workflow](../contributing/github-workflow.md)
- [Repository Structure](repository-structure.md)

