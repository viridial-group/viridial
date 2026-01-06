# Guide VPS Hostinger - Viridial

Guide spécifique pour déployer Viridial sur un VPS Hostinger.

## Informations VPS

- **Fournisseur:** Hostinger
- **IP:** 148.230.112.148
- **Repository:** https://github.com/viridial-group/viridial.git
- **Architecture:** 1 node (control plane + worker combiné) pour MVP

## Spécifications Recommandées Hostinger

### Pour MVP (1 node)
- **RAM:** Minimum 4GB (recommandé 8GB)
- **CPU:** Minimum 2 vCPU (recommandé 4 vCPU)
- **Disk:** Minimum 50GB SSD
- **OS:** Ubuntu 22.04 LTS ou Debian 12

### Pour Staging/Production (3+ nodes)
- **Par node:** 4GB RAM, 2 vCPU, 50GB SSD
- **OS:** Ubuntu 22.04 LTS ou Debian 12

## Configuration Initiale Hostinger

### 1. Accès SSH

Hostinger fournit généralement un accès SSH via:
- **Panel Hostinger:** Accès via hPanel
- **SSH Direct:** `ssh root@148.230.112.148` (ou utilisateur configuré)

```bash
# Tester la connexion
ssh root@148.230.112.148

# Si pas de clé SSH configurée
ssh-keygen -t rsa -b 4096
ssh-copy-id root@148.230.112.148
```

### 2. Vérifier OS et Spécifications

```bash
# Vérifier OS
cat /etc/os-release

# Vérifier RAM
free -h

# Vérifier CPU
nproc
lscpu

# Vérifier Disk
df -h
```

### 3. Mettre à jour le Système

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# Installer dépendances de base
sudo apt install -y curl wget git vim ufw htop
```

## Configuration Firewall Hostinger

Hostinger peut avoir un firewall dans le panel. Configurer aussi UFW sur le VPS:

```bash
# Configurer UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 6443/tcp  # Kubernetes API
sudo ufw allow 10250/tcp # Kubelet
sudo ufw allow 2379:2380/tcp # etcd (control plane)
sudo ufw allow 30000:32767/tcp # NodePort services
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

**Note:** Si Hostinger a un firewall dans le panel, configurer aussi les mêmes ports là-bas.

## Configuration Réseau Hostinger

### Vérifier IP et DNS

```bash
# Vérifier IP publique
curl ifconfig.me

# Vérifier DNS (si domaine configuré)
nslookup staging.viridial.com
```

### Configurer DNS (si domaine disponible)

Si vous avez un domaine chez Hostinger:

1. **Accéder au DNS Manager** dans hPanel
2. **Ajouter records:**
   - `A` record: `staging.viridial.com` → `148.230.112.148`
   - `A` record: `*.staging.viridial.com` → `148.230.112.148` (pour wildcard)

## Installation Docker sur Hostinger

```bash
# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Vérifier installation
docker --version
sudo docker run hello-world
```

## Installation Kubernetes sur Hostinger

Suivre le guide de provisionnement standard:

```bash
cd infrastructure
./scripts/provision-cluster.sh
```

Ou manuellement:

```bash
cd infrastructure/ansible
ansible-playbook playbooks/main.yml -i inventory.ini
```

## Notes Spécifiques Hostinger

### 1. Swap

Hostinger peut avoir du swap configuré. Désactiver pour Kubernetes:

```bash
sudo swapoff -a
sudo sed -i '/ swap / s/^/#/' /etc/fstab
```

### 2. Limites de Ressources

Vérifier les limites dans hPanel si vous rencontrez des problèmes de ressources.

### 3. Backups

Hostinger propose des backups automatiques. Configurer dans hPanel:
- **Fréquence:** Quotidienne recommandée
- **Rétention:** 7-30 jours selon besoins

### 4. Monitoring

Hostinger peut avoir un monitoring de base dans hPanel. Compléter avec:
- Prometheus/Grafana (dans Kubernetes)
- Alerting configuré

## SMTP Hostinger

Vous utilisez déjà SMTP Hostinger:

```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=support@viridial.com
SMTP_PASS=S@upport!19823
EMAIL_FROM=support@viridial.com
```

Cette configuration est déjà dans `infrastructure/secrets/.env.example`.

## Support Hostinger

En cas de problème avec le VPS Hostinger:

1. **Vérifier hPanel** pour les alertes
2. **Contacter Support Hostinger** si problème infrastructure
3. **Vérifier logs** système: `/var/log/`

## Prochaines Étapes

1. ✅ VPS Hostinger configuré
2. 🔄 Provisionner cluster Kubernetes
3. ⏳ Déployer services de base
4. ⏳ Configurer ingress et TLS

Voir [PROVISIONING-GUIDE.md](PROVISIONING-GUIDE.md) pour le provisionnement complet.

## Ressources

- **Hostinger hPanel:** https://hpanel.hostinger.com
- **Documentation Hostinger:** https://support.hostinger.com
- **VPS IP:** 148.230.112.148
- **Repository:** https://github.com/viridial-group/viridial.git

