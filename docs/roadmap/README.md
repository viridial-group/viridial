# Roadmap Viridial

Ce document fournit une vue d'ensemble de la roadmap du projet Viridial avec liens vers les stories et épics.

## Vue d'Ensemble

La roadmap est organisée en **10 épics** couvrant l'infrastructure, les fonctionnalités core, et les features avancées.

**Total estimé:** ~150+ story points

## Épics

Voir `docs/stories/EPICS.md` pour les détails complets de chaque epic.

### Epic 1: Foundation & Infrastructure (P0)
**Objectif:** Infrastructure technique de base et fondations multi-tenant

**Stories:**
- US-000: Configuration GitHub (5 pts)
- US-INFRA-01: Kubernetes Cluster (5 pts)
- US-INFRA-02: Services de Base (5 pts)
- US-001: Création d'organisation (3 pts)
- US-014: Authn & JWT (5 pts)
- US-015: RBAC enforcement (5 pts)
- US-016: CI/CD pipeline (8 pts)

**Total:** 36 story points

### Epic 2: Multi-tenant & Administration (P0)
**Objectif:** Gestion organisations, utilisateurs, rôles, i18n

**Stories:**
- US-004: Gestion utilisateurs & rôles (5 pts)
- US-005: Configuration multi-lang (3 pts)
- US-012: Backend i18n (2 pts)
- US-013: Frontend language switcher (3 pts)

**Total:** 13 story points

### Epic 3: Core Property Management (P0)
**Objectif:** CRUD annonces immobilières

**Stories:**
- US-019: Géolocalisation (5 pts)
- US-007: CRUD annonces (8 pts)
- US-010: Listing SEO (5 pts)

**Total:** 18 story points

### Epic 4: Search & Discovery (P0)
**Objectif:** Recherche et découverte de propriétés

**Stories:**
- US-009: Recherche internationale (8 pts)
- US-011: Favoris (5 pts) - P2

**Total:** 13 story points

### Epic 5: Agency Onboarding & Management (P1)
**Objectif:** Inscription et gestion des agences

**Stories:**
- US-002: Self-signup agence (3 pts)
- US-003: Gestion abonnements (5 pts)
- US-006: Dashboard agence (5 pts)

**Total:** 13 story points

### Epic 6: Lead Management (P1)
**Objectif:** Gestion leads et contacts

**Stories:**
- US-008: Gestion leads (5 pts)
- US-024: Lead Scoring & CRM (5 pts)

**Total:** 10 story points

### Epic 7: Operations & Reliability (P1)
**Objectif:** Fiabilité et observabilité

**Stories:**
- US-017: Observability & Alerts (5 pts)
- US-018: Backups & DR (3 pts)
- US-INFRA-03: Stack Observabilité (5 pts)
- US-INFRA-06: Backup & DR Infrastructure (3 pts)

**Total:** 16 story points

### Epic 8: Advanced Features - Property Intelligence (P0)
**Objectif:** Analyse et estimation avancées

**Stories:**
- US-020: Price Estimator (8 pts)
- US-021: Neighborhood Insights (5 pts)

**Total:** 13 story points

### Epic 9: Advanced Features - Rich Media (P1)
**Objectif:** Médias riches pour annonces

**Stories:**
- US-022: Virtual Tours (8 pts)

**Total:** 8 story points

### Epic 10: Monetization & Marketplace (P0/P1)
**Objectif:** Génération de revenus

**Stories:**
- US-023: Listing Promotions (8 pts) - P0
- US-025: Agent Marketplace (8 pts) - P1
- US-026: Custom Fields (8 pts) - P1

**Total:** 24 story points

## Roadmap par Sprints

### Sprint 0: Setup (Prérequis)
- **US-000:** Configuration GitHub ⚠️ **DOIT être fait en premier**

### Sprint 1-2: Foundation (Epic 1)
**Focus:** Infrastructure et sécurité de base

**Must Have:**
- US-000 (GitHub Setup)
- US-INFRA-01 (Kubernetes Cluster)
- US-INFRA-02 (Services de Base)
- US-001 (Organization)
- US-014 (Authn)
- US-015 (RBAC)

**Can Have:**
- US-016 (CI/CD - peut être fait en parallèle)
- US-INFRA-04 (Sécurité Infra)

### Sprint 3: Multi-tenant Setup (Epic 2)
**Focus:** Administration et i18n

- US-004, US-005, US-012, US-013

### Sprint 4-5: Core Features (Epic 3 + Epic 4)
**Focus:** Propriétés et recherche

- US-019, US-007, US-010, US-009

### Sprint 6: Agency Features (Epic 5)
**Focus:** Onboarding agences

- US-002, US-003, US-006

### Sprint 7: Lead Management (Epic 6)
**Focus:** Gestion des leads

- US-008, US-024

### Sprint 8: Operations (Epic 7)
**Focus:** Fiabilité

- US-017, US-018, US-INFRA-03, US-INFRA-06

### Sprint 9+: Advanced Features
**Focus:** Fonctionnalités avancées

- Epic 8, Epic 9, Epic 10

## Dependencies Critiques

Voir `docs/stories/DEPENDENCIES.md` pour la matrice complète.

**Chemin Critique:**
1. US-000 (GitHub Setup) - 5 pts
2. US-INFRA-01 (Kubernetes) - 5 pts
3. US-INFRA-02 (Services Base) - 5 pts
4. US-001 (Organization) - 3 pts
5. US-014 (Authn) - 5 pts
6. US-015 (RBAC) - 5 pts
7. US-019 (Geolocation) - 5 pts
8. US-007 (Properties CRUD) - 8 pts
9. US-009 (Search) - 8 pts

**Total chemin critique:** 49 story points

## GitHub Projects

La roadmap est également disponible dans **GitHub Projects**:
- Board "Viridial Roadmap" avec vues par epic/service/sprint
- Issues liées aux stories
- Milestones par sprint

## Mise à Jour

Pour mettre à jour la roadmap:
1. Modifier `docs/stories/EPICS.md` si changement d'epic
2. Modifier `docs/stories/DEPENDENCIES.md` si changement de dépendances
3. Synchroniser avec GitHub: `./scripts/sync-stories-to-github.sh`

## Ressources

- [Stories Index](docs/stories/INDEX.md)
- [Epics Détails](docs/stories/EPICS.md)
- [Dependencies Matrix](docs/stories/DEPENDENCIES.md)
- [GitHub Workflow](docs/contributing/github-workflow.md)

