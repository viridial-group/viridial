# US-INFRA-01: Kubernetes Cluster de Base

## Status: Draft

### Story
En tant qu'équipe d'ingénierie, je souhaite provisionner un cluster Kubernetes standard sur VPS avec networking, ingress et service discovery afin de déployer les microservices de manière orchestrée et scalable.

### Acceptance Criteria
- Given accès aux VPS (Hetzner, DigitalOcean, OVH), When j'exécute les scripts IaC, Then le cluster Kubernetes est provisionné et accessible.
- Given cluster Kubernetes, When je déploie un service, Then le service est accessible via service discovery (DNS).
- Given cluster Kubernetes, When je configure l'ingress, Then les services sont accessibles via HTTPS avec TLS automatique.
- Multi-tenant isolation au niveau réseau via Network Policies.
- Resource quotas configurées par namespace.

**Priority:** P0
**Estimation:** 5

### Tasks

#### Phase 1: Infrastructure as Code (IaC)
- [ ] Créer repo `infrastructure/` avec structure modulaire (Terraform ou Ansible)
- [ ] Module VPS/Servers: provisioning de VMs (Hetzner, DigitalOcean, OVH) ou bare metal
- [ ] Module Kubernetes: cluster Kubernetes standard via Kubeadm - 100% gratuit
- [ ] Module Networking: Load Balancer (Nginx Ingress), DNS (Cloudflare gratuit)
- [ ] Module Security: Firewall rules (UFW/iptables)
- [ ] Variables et outputs pour staging/production
- [ ] Documentation avec exemples (Ansible playbooks ou Terraform)

#### Phase 2: Kubernetes Cluster Setup
- [ ] Cluster Kubernetes standard provisionné via Kubeadm sur VPS
- [ ] Architecture: 1 control plane node + 2+ worker nodes (minimum 4GB RAM, 2 CPU par node)
- [ ] CNI Plugin: Calico installé et configuré (Network Policies activées)
- [ ] CoreDNS configuré pour service discovery interne
- [ ] Metrics Server installé pour HPA (Horizontal Pod Autoscaler)
- [ ] Kubernetes RBAC configuré pour accès sécurisé

#### Phase 3: Networking & Ingress
- [ ] Namespaces créés: `viridial-staging`, `viridial-production`, `viridial-monitoring`
- [ ] Resource quotas et limits par namespace
- [ ] Network Policies pour isolation multi-tenant
- [ ] Nginx Ingress Controller installé et configuré
- [ ] Cert-manager installé pour certificats TLS automatiques (Let's Encrypt gratuit)
- [ ] ClusterIssuer Let's Encrypt configuré

#### Phase 4: Service Discovery & Load Balancing
- [ ] Service Discovery fonctionnel via CoreDNS (`service-name.namespace.svc.cluster.local`)
- [ ] Service objects configurés pour load balancing interne
- [ ] Endpoints automatiques pour service discovery
- [ ] Ingress rules configurées pour routing externe

### Technical Notes

**Kubernetes Cluster Architecture:**
- **Architecture:** 1 control plane node + 2+ worker nodes
- **Requirements par node:**
  - Control Plane: 4GB RAM, 2 CPU, 50GB disk
  - Worker: 4GB RAM, 2 CPU, 50GB disk (minimum)
- **Installation:** Via Kubeadm (CNCF standard)
- **CNI Plugin:** Calico (recommandé) pour Network Policies
- **Coût:** Seulement VPS (Hetzner CPX21: 5€/mois, DigitalOcean Regular: 12$/mois)
- **Staging:** 3 nodes (1 control + 2 workers) = 15€/mois
- **Production:** 5+ nodes (1 control + 4 workers) = 25€/mois

**Kubernetes Features:**
- Auto-scaling: HPA (Horizontal Pod Autoscaler) basé sur CPU/memory
- Resource quotas par namespace (tenant isolation)
- Network Policies pour segmentation réseau
- Service Discovery via CoreDNS
- Load Balancing via Service objects
- ConfigMaps et Secrets pour configuration
- Persistent Volumes pour stockage
- DaemonSets pour agents (monitoring, logging)

**Dependencies:**
- Nécessite accès VPS Hostinger (IP: 148.230.112.148)
- GitHub repository avec secrets configurés
- Domain name pour staging (ex: staging.viridial.com) - Cloudflare DNS gratuit

**Prérequis d'Installation:**
- **VPS:** Ubuntu 22.04 LTS ou Debian 12, 4GB RAM, 2 CPU, 50GB disk minimum
- **Docker:** Version 24.0+ installé et configuré (cgroupdriver=systemd)
- **Kubernetes:** kubeadm 1.29, kubelet, kubectl installés
- **Système:** Swap désactivé, modules kernel (overlay, br_netfilter), sysctl configuré
- **Firewall:** Ports 22, 6443, 10250, 2379-2380, 30000-32767, 80, 443 ouverts
- **Local:** Ansible installé, accès SSH au VPS, Git installé
- **Voir:** `docs/deployment/PROVISIONING-GUIDE.md` section "Prérequis" pour détails complets

### Definition of Done
- [ ] Ansible playbooks ou Terraform modules créés et testés
- [ ] Kubernetes cluster provisionné via Kubeadm et accessible via `kubectl`
- [ ] CNI Plugin (Calico) installé et configuré
- [ ] CoreDNS fonctionnel pour service discovery
- [ ] Metrics Server installé pour HPA
- [ ] All namespaces créés avec resource quotas
- [ ] Network policies appliquées et testées
- [ ] Ingress controller (Nginx Ingress) fonctionnel avec TLS (cert-manager + Let's Encrypt gratuit)
- [ ] VPS provisionnés et configurés (firewall, SSH keys, monitoring de base)
- [ ] Kubernetes RBAC configuré pour accès sécurisé
- [ ] Documentation infrastructure créée avec diagrammes
- [ ] Smoke tests: déploiement d'un pod de test et vérification de la connectivité

