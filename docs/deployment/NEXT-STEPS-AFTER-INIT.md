# Prochaines Étapes Après Initialisation Kubernetes

## ✅ Cluster Initialisé avec Succès!

Votre cluster Kubernetes est maintenant initialisé. Suivez ces étapes pour le rendre opérationnel.

## 📋 Checklist Post-Initialisation

### Étape 1: Configurer kubectl

```bash
# Option 1: Pour root (temporaire)
export KUBECONFIG=/etc/kubernetes/admin.conf

# Option 2: Pour persister (recommandé)
mkdir -p $HOME/.kube
cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
chown $(id -u):$(id -g) $HOME/.kube/config

# Vérifier
kubectl get nodes
```

### Étape 2: Installer Calico (Pod Network)

Calico est nécessaire pour que les pods puissent communiquer entre eux.

```bash
# Installer Calico Operator
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/tigera-operator.yaml

# Installer Calico Custom Resources
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.27.0/manifests/custom-resources.yaml

# Attendre que Calico soit prêt (peut prendre 1-2 minutes)
kubectl wait --for=condition=ready pod -l k8s-app=calico-node -n kube-system --timeout=300s

# Vérifier que le node est Ready
kubectl get nodes
```

**Note:** Le node devrait passer de `NotReady` à `Ready` après l'installation de Calico.

### Étape 3: Permettre Pods sur Control Plane (Single Node)

Pour un cluster single-node (control plane aussi worker), il faut retirer le taint:

```bash
kubectl taint nodes --all node-role.kubernetes.io/control-plane-
```

### Étape 4: Installer les Addons

Utilisez le script automatisé:

```bash
cd /opt/viridial  # ou /root/viridial
chmod +x infrastructure/scripts/install-addons-on-vps.sh
sudo infrastructure/scripts/install-addons-on-vps.sh
```

Ce script installe:
- Metrics Server
- Nginx Ingress Controller
- Cert-manager
- Crée les namespaces Viridial (staging, production, monitoring)
- Configure les ClusterIssuers Let's Encrypt

### Étape 5: Vérification Complète

```bash
# Vérifier les nodes
kubectl get nodes

# Vérifier les pods système
kubectl get pods -n kube-system

# Vérifier Calico
kubectl get pods -n calico-system

# Vérifier Ingress Controller
kubectl get pods -n ingress-nginx

# Vérifier Cert-manager
kubectl get pods -n cert-manager

# Vérifier les namespaces Viridial
kubectl get namespaces | grep viridial

# Vérifier les ClusterIssuers
kubectl get clusterissuers
```

## 🎯 Résultat Attendu

Après toutes ces étapes, vous devriez avoir:

- ✅ 1 node en statut `Ready`
- ✅ Calico pods en `Running`
- ✅ Metrics Server fonctionnel
- ✅ Nginx Ingress Controller actif
- ✅ Cert-manager opérationnel
- ✅ Namespaces Viridial créés
- ✅ ClusterIssuers Let's Encrypt configurés

## 🚀 Prochaines Étapes

Une fois le cluster opérationnel:

1. **Déployer les services de base** (PostgreSQL, Redis, Meilisearch, MinIO)
2. **Déployer vos microservices** (Auth Service, Property Service, etc.)
3. **Configurer les Ingress** pour exposer vos services
4. **Mettre en place l'observabilité** (Prometheus, Grafana, Loki, Jaeger)

## 📚 Documentation

- Guide installation directe: `docs/deployment/INSTALL-DIRECT-VPS.md`
- Guide provisioning: `docs/deployment/PROVISIONING-GUIDE.md`
- Story infrastructure: `docs/stories/US-INFRA-01-kubernetes-cluster.story.md`

---

**Date:** $(date +%Y-%m-%d)
**Cluster IP:** 148.230.112.148
