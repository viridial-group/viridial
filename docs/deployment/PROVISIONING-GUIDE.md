# Guide de Provisionnement - Cluster Kubernetes Viridial

Ce guide vous permet de provisionner le cluster Kubernetes sur votre VPS.

## Informations VPS

- **IP:** 148.230.112.148
- **Repository:** https://github.com/viridial-group/viridial.git
- **Architecture:** 1 node (control plane + worker combiné) pour MVP

## Prérequis

### 1. Accès SSH au VPS

```bash
# Tester la connexion
ssh root@148.230.112.148

# Si pas de clé SSH configurée
ssh-keygen -t rsa -b 4096
ssh-copy-id root@148.230.112.148
```

### 2. Installer Ansible

**macOS:**
```bash
brew install ansible
```

**Linux:**
```bash
pip install ansible
# ou
apt install ansible  # Debian/Ubuntu
```

### 3. Vérifier prérequis

```bash
ansible --version
ssh root@148.230.112.148 "echo 'Connection OK'"
```

## Provisionnement Automatique

### Option 1: Script Automatique (Recommandé)

```bash
cd infrastructure
./scripts/provision-cluster.sh
```

### Option 2: Playbook Manuel

```bash
cd infrastructure/ansible

# Installer dépendances
ansible-galaxy install -r requirements.yml

# Exécuter playbook principal
ansible-playbook playbooks/main.yml -i inventory.ini
```

## Provisionnement Étape par Étape

Si vous préférez exécuter étape par étape:

```bash
cd infrastructure/ansible

# 1. Préparer VPS (Docker, swap, firewall, etc.)
ansible-playbook playbooks/01-prepare-vps.yml -i inventory.ini

# 2. Initialiser cluster Kubernetes
ansible-playbook playbooks/02-init-cluster.yml -i inventory.ini

# 3. Installer CNI (Calico)
ansible-playbook playbooks/03-install-cni.yml -i inventory.ini

# 4. Installer addons (CoreDNS, Metrics Server)
ansible-playbook playbooks/05-install-addons.yml -i inventory.ini

# 5. Créer namespaces
ansible-playbook playbooks/06-create-namespaces.yml -i inventory.ini

# 6. Installer Ingress et Cert-manager
ansible-playbook playbooks/07-install-ingress.yml -i inventory.ini

# 7. Configurer Network Policies
ansible-playbook playbooks/08-network-policies.yml -i inventory.ini
```

## Vérification

### 1. Récupérer kubeconfig

```bash
# Créer répertoire .kube si nécessaire
mkdir -p ~/.kube

# Récupérer kubeconfig depuis VPS
scp root@148.230.112.148:~/.kube/config ~/.kube/config

# Vérifier accès
kubectl get nodes
```

### 2. Vérifier Cluster

```bash
# Nodes
kubectl get nodes

# Pods système
kubectl get pods -n kube-system

# Namespaces
kubectl get namespaces | grep viridial

# Ingress Controller
kubectl get pods -n ingress-nginx

# Cert-manager
kubectl get pods -n cert-manager

# Network Policies
kubectl get networkpolicies --all-namespaces
```

### 3. Tester Service Discovery

```bash
# Créer un pod de test
kubectl run test-pod --image=nginx -n viridial-staging

# Vérifier DNS
kubectl exec -it test-pod -n viridial-staging -- nslookup kubernetes.default.svc.cluster.local

# Nettoyer
kubectl delete pod test-pod -n viridial-staging
```

## Configuration Post-Provisionnement

### 1. Mettre à jour Email Let's Encrypt

Éditer `infrastructure/ansible/group_vars/all.yml`:
```yaml
letsencrypt_email: "votre-email@example.com"
```

Puis réappliquer:
```bash
ansible-playbook playbooks/07-install-ingress.yml -i inventory.ini
```

### 2. Configurer Domain (si disponible)

Si vous avez un domaine (ex: viridial.com):

1. Pointer le DNS vers `148.230.112.148`
2. Mettre à jour `group_vars/all.yml`:
   ```yaml
   domain_name: "viridial.com"
   staging_domain: "staging.viridial.com"
   ```

### 3. Ajouter Nodes Workers (optionnel)

Pour ajouter des workers supplémentaires:

1. Modifier `inventory.ini`:
   ```ini
   [workers]
   worker-1 ansible_host=148.230.112.148
   worker-2 ansible_host=VOTRE_WORKER_2_IP
   ```

2. Exécuter:
   ```bash
   ansible-playbook playbooks/01-prepare-vps.yml -i inventory.ini
   ansible-playbook playbooks/04-join-workers.yml -i inventory.ini
   ```

## Troubleshooting

### Erreur: "Connection refused"

```bash
# Vérifier accès SSH
ssh -v root@148.230.112.148

# Vérifier firewall VPS
ssh root@148.230.112.148 "ufw status"
```

### Erreur: "kubeadm init failed"

```bash
# Sur le VPS, réinitialiser
ssh root@148.230.112.148
kubeadm reset -f
rm -rf /etc/cni/net.d
rm -rf /var/lib/etcd
rm -rf ~/.kube

# Réessayer
ansible-playbook playbooks/02-init-cluster.yml -i inventory.ini
```

### Calico pods en CrashLoopBackOff

```bash
# Vérifier logs
kubectl logs -n kube-system -l k8s-app=calico-node

# Réinstaller Calico
kubectl delete -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml
```

### Ingress Controller pas accessible

```bash
# Vérifier service
kubectl get svc -n ingress-nginx

# Vérifier pods
kubectl get pods -n ingress-nginx

# Vérifier logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller
```

## Prochaines Étapes

Après provisionnement réussi:

1. ✅ **US-INFRA-01:** Cluster Kubernetes (fait)
2. ⏳ **US-INFRA-02:** Services de Base (PostgreSQL, Redis, Meilisearch, MinIO)
3. ⏳ **US-INFRA-03:** Observabilité (Prometheus, Grafana, Loki)
4. ⏳ **US-INFRA-04:** Sécurité (Vault, RBAC avancé)

## Ressources

- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Calico Documentation](https://docs.tigera.io/calico/)
- [Nginx Ingress](https://kubernetes.github.io/ingress-nginx/)

