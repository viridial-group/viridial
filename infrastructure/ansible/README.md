# Infrastructure Ansible - Viridial

Playbooks Ansible pour provisionner le cluster Kubernetes sur VPS.

## Configuration

### VPS
- **IP:** 148.230.112.148
- **Repository:** https://github.com/viridial-group/viridial.git

### Prérequis

1. **Ansible installé:**
   ```bash
   pip install ansible
   # ou
   brew install ansible  # macOS
   ```

2. **Accès SSH au VPS:**
   ```bash
   # Tester la connexion
   ssh root@148.230.112.148
   ```

3. **Clé SSH configurée:**
   ```bash
   # Si pas de clé SSH
   ssh-keygen -t rsa -b 4096
   ssh-copy-id root@148.230.112.148
   ```

4. **Installer dépendances Ansible:**
   ```bash
   cd infrastructure/ansible
   ansible-galaxy install -r requirements.yml
   ```

## Utilisation

### Provisionnement Complet

```bash
cd infrastructure/ansible
ansible-playbook playbooks/main.yml
```

### Playbooks Individuels

```bash
# 1. Préparer VPS
ansible-playbook playbooks/01-prepare-vps.yml

# 2. Initialiser cluster
ansible-playbook playbooks/02-init-cluster.yml

# 3. Installer CNI (Calico)
ansible-playbook playbooks/03-install-cni.yml

# 4. Joindre workers (si plusieurs nodes)
ansible-playbook playbooks/04-join-workers.yml

# 5. Installer addons (CoreDNS, Metrics Server)
ansible-playbook playbooks/05-install-addons.yml

# 6. Créer namespaces
ansible-playbook playbooks/06-create-namespaces.yml

# 7. Installer Ingress et Cert-manager
ansible-playbook playbooks/07-install-ingress.yml

# 8. Configurer Network Policies
ansible-playbook playbooks/08-network-policies.yml
```

## Vérification

### Après provisionnement

```bash
# Récupérer kubeconfig
scp root@148.230.112.148:~/.kube/config ~/.kube/config

# Vérifier nodes
kubectl get nodes

# Vérifier pods système
kubectl get pods -n kube-system

# Vérifier namespaces
kubectl get namespaces | grep viridial

# Vérifier Ingress
kubectl get pods -n ingress-nginx

# Vérifier Cert-manager
kubectl get pods -n cert-manager
```

## Configuration

### Variables

Modifier `group_vars/all.yml` pour:
- Versions Kubernetes
- CIDR réseaux
- Email Let's Encrypt
- Domaines

### Inventory

Modifier `inventory.ini` pour ajouter des nodes supplémentaires.

## Troubleshooting

### Erreur de connexion SSH
```bash
# Vérifier accès
ssh -v root@148.230.112.148

# Vérifier clé SSH
ssh-add -l
```

### Erreur kubeadm
```bash
# Réinitialiser cluster (sur VPS)
kubeadm reset -f
rm -rf /etc/cni/net.d
rm -rf /var/lib/etcd
```

### Problème Calico
```bash
# Réinstaller Calico
kubectl delete -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml
kubectl apply -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/calico.yaml
```

## Prochaines Étapes

Après provisionnement du cluster:
1. Déployer services de base (US-INFRA-02): PostgreSQL, Redis, Meilisearch, MinIO
2. Configurer observabilité (US-INFRA-03): Prometheus, Grafana, Loki
3. Configurer sécurité (US-INFRA-04): Vault, RBAC, Network Policies avancées

