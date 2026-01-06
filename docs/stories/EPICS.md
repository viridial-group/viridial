# Epic Structure

Ce document organise les user stories en épics logiques pour faciliter la planification et le suivi.

## Epic 1: Foundation & Infrastructure (P0)

**Objectif:** Mettre en place l'infrastructure technique de base et les fondations multi-tenant.

**Stories:**
- US-INFRA-01: Mise en place de l'architecture technique (13 pts)
- US-001: Création d'organisation (Tenant) (3 pts)
- US-014: Authn & JWT + SSO readiness (5 pts)
- US-015: RBAC enforcement (5 pts)
- US-016: CI/CD pipeline et déploiement en staging (8 pts)

**Total:** 34 story points

**Dépendances:** Aucune (fondation)

---

## Epic 2: Multi-tenant & Administration (P0)

**Objectif:** Gérer les organisations, utilisateurs, rôles et configurations multi-tenant.

**Stories:**
- US-004: Gestion utilisateurs & rôles (Admin) (5 pts)
- US-005: Configuration multi-lang & labels (Admin) (3 pts)
- US-012: Backend i18n & Accept-Language handling (2 pts)
- US-013: Frontend language switcher + fallback (3 pts)

**Total:** 13 story points

**Dépendances:** 
- Epic 1 (US-001, US-014, US-015)

---

## Epic 3: Core Property Management (P0)

**Objectif:** Permettre aux agences de créer et gérer leurs annonces immobilières.

**Stories:**
- US-019: Système de géolocalisation (Geocoding) (5 pts)
- US-007: CRUD annonces (Agency) (8 pts)
- US-010: Listing page / SEO / hreflang (5 pts)

**Total:** 18 story points

**Dépendances:**
- Epic 1 (US-001, US-014, US-015)
- Epic 2 (US-012, US-013 pour i18n)
- US-019 doit être complété avant US-007

---

## Epic 4: Search & Discovery (P0)

**Objectif:** Permettre aux visiteurs de rechercher et découvrir des propriétés.

**Stories:**
- US-009: Recherche internationale d'annonces (Public) (8 pts)
- US-011: Favoris / Sauvegarde recherches (5 pts) - P2

**Total:** 13 story points

**Dépendances:**
- Epic 3 (US-007 pour les propriétés indexées)
- Epic 1 (US-014 pour authentification des favoris)

---

## Epic 5: Agency Onboarding & Management (P1)

**Objectif:** Permettre aux agences de s'inscrire et gérer leur compte.

**Stories:**
- US-002: Self-signup agence (3 pts)
- US-003: Gestion des abonnements (Billing) (5 pts)
- US-006: Dashboard agence (5 pts)

**Total:** 13 story points

**Dépendances:**
- Epic 1 (US-001, US-014)
- Epic 2 (US-004 pour gestion utilisateurs)

---

## Epic 6: Lead Management (P1)

**Objectif:** Gérer les leads et contacts des agences.

**Stories:**
- US-008: Gestion leads & contact flow (5 pts)
- US-024: Lead Scoring & CRM Sync (5 pts)

**Total:** 10 story points

**Dépendances:**
- Epic 1 (US-001, US-014, US-015)
- Epic 3 (US-007 pour propriétés)
- Epic 4 (US-009 pour leads depuis recherche)

---

## Epic 7: Operations & Reliability (P1)

**Objectif:** Assurer la fiabilité et l'observabilité du système.

**Stories:**
- US-017: Observability & Alerts (5 pts)
- US-018: Backups & DR pour Postgres (3 pts)

**Total:** 8 story points

**Dépendances:**
- Epic 1 (US-INFRA-01, US-016)

---

## Epic 8: Advanced Features - Property Intelligence (P0)

**Objectif:** Ajouter des fonctionnalités avancées d'analyse et d'estimation.

**Stories:**
- US-020: Price Estimator (Automated Valuation) (8 pts)
- US-021: Neighborhood Insights (5 pts)

**Total:** 13 story points

**Dépendances:**
- Epic 3 (US-007 pour propriétés)
- Epic 1 (US-019 pour géolocalisation)

---

## Epic 9: Advanced Features - Rich Media (P1)

**Objectif:** Enrichir les annonces avec des médias riches.

**Stories:**
- US-022: Virtual Tours & Rich Media (8 pts)

**Total:** 8 story points

**Dépendances:**
- Epic 3 (US-007 pour propriétés)

---

## Epic 10: Monetization & Marketplace (P0/P1)

**Objectif:** Générer des revenus via promotions et marketplace.

**Stories:**
- US-023: Listing Promotions (Monetization) (8 pts) - P0
- US-025: Agent Marketplace & Pro Services (8 pts) - P1

**Total:** 16 story points

**Dépendances:**
- Epic 1 (US-001, US-014, US-015)
- Epic 3 (US-007 pour propriétés)
- Epic 5 (US-003 pour billing)

---

## Roadmap Suggérée

### Sprint 1-2: Foundation (Epic 1)
**Focus:** Infrastructure et sécurité de base
- US-INFRA-01, US-001, US-014, US-015, US-016

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
- US-017, US-018

### Sprint 9+: Advanced Features
**Focus:** Fonctionnalités avancées
- Epic 8, Epic 9, Epic 10

---

## Notes

- Les épics sont organisés par valeur métier et dépendances techniques
- Les priorités P0 doivent être complétées avant les P1/P2
- Certaines stories peuvent être déplacées entre épics selon les besoins
- Les estimations sont indicatives et peuvent être ajustées

