# Guide de Dépannage - Services de Base

## Problème: Tests de connectivité échouent

### Étape 1: Diagnostic Complet

Exécutez le script de diagnostic pour identifier le problème:

```bash
cd /opt/viridial
./infrastructure/scripts/diagnose-services.sh
```

### Étape 2: Vérifications Manuelles

#### 2.1 Vérifier que les services sont déployés

```bash
# Vérifier les StatefulSets et Deployments
kubectl get statefulset,deployment -n viridial-staging

# Si rien n'existe, les services ne sont pas déployés
# → Exécuter: ./infrastructure/scripts/deploy-base-services.sh
```

#### 2.2 Vérifier l'état des pods

```bash
kubectl get pods -n viridial-staging

# États possibles:
# - Pending: PVC non créé ou StorageClass manquant
# - CrashLoopBackOff: Erreur de configuration ou secrets manquants
# - ImagePullBackOff: Problème de téléchargement d'images
# - Running: Pod fonctionnel ✓
```

#### 2.3 Vérifier les PVC (si pods en Pending)

```bash
kubectl get pvc -n viridial-staging

# Si PVC en Pending, vérifier StorageClass:
kubectl get storageclass

# Si 'local-path' n'existe pas, installer local-path-provisioner
```

#### 2.4 Vérifier les secrets

```bash
kubectl get secrets -n viridial-staging

# Secrets requis:
# - postgres-secret
# - meilisearch-secret
# - minio-secret

# Si manquants, le script deploy-base-services.sh les crée automatiquement
```

### Étape 3: Solutions par Problème

#### Problème 1: Services non déployés

**Symptôme:** `kubectl get pods -n viridial-staging` retourne "No resources found"

**Solution:**
```bash
cd /opt/viridial
./infrastructure/scripts/deploy-base-services.sh
```

#### Problème 2: Pods en Pending

**Symptôme:** Pods restent en état `Pending`

**Causes possibles:**
- StorageClass manquant
- PVC non créé
- Ressources insuffisantes

**Solutions:**
```bash
# Vérifier StorageClass
kubectl get storageclass

# Si 'local-path' manque, installer:
kubectl apply -f https://raw.githubusercontent.com/rancher/local-path-provisioner/v0.0.24/deploy/local-path-storage.yaml

# Vérifier les PVC
kubectl get pvc -n viridial-staging
kubectl describe pvc <pvc-name> -n viridial-staging
```

#### Problème 3: Pods en CrashLoopBackOff

**Symptôme:** Pods redémarrent en boucle

**Solution:**
```bash
# Vérifier les logs
kubectl logs -l app=postgres -n viridial-staging --tail=50
kubectl logs -l app=redis -n viridial-staging --tail=50
kubectl logs -l app=meilisearch -n viridial-staging --tail=50
kubectl logs -l app=minio -n viridial-staging --tail=50

# Vérifier les événements
kubectl describe pod <pod-name> -n viridial-staging

# Causes communes:
# - Secrets manquants ou incorrects
# - Configuration incorrecte
# - Erreurs de démarrage
```

#### Problème 4: Pods en ImagePullBackOff

**Symptôme:** Impossible de télécharger les images Docker

**Solution:**
```bash
# Vérifier la connectivité réseau
kubectl run test-connection --image=curlimages/curl --rm -it --restart=Never -- curl -I https://registry-1.docker.io

# Si problème réseau, vérifier:
# - Connexion Internet du VPS
# - Firewall (UFW/iptables)
# - Proxy si nécessaire
```

#### Problème 5: Secrets manquants

**Symptôme:** Pods ne démarrent pas, erreurs dans les logs concernant les secrets

**Solution:**
```bash
# Vérifier les secrets
kubectl get secrets -n viridial-staging

# Si manquants, les créer manuellement ou relancer le script:
./infrastructure/scripts/deploy-base-services.sh
```

### Étape 4: Redéploiement Complet

Si rien ne fonctionne, redéployer complètement:

```bash
# 1. Supprimer tous les services
kubectl delete statefulset,deployment,service,pvc -l app=postgres -n viridial-staging
kubectl delete statefulset,deployment,service,pvc -l app=redis -n viridial-staging
kubectl delete statefulset,deployment,service,pvc -l app=meilisearch -n viridial-staging
kubectl delete statefulset,deployment,service,pvc -l app=minio -n viridial-staging

# 2. Supprimer les secrets (optionnel, pour régénérer)
kubectl delete secret postgres-secret meilisearch-secret minio-secret -n viridial-staging

# 3. Redéployer
./infrastructure/scripts/deploy-base-services.sh
```

### Étape 5: Vérification Finale

Après résolution, tester la connectivité:

```bash
./infrastructure/scripts/test-services-connectivity.sh
```

## Commandes Utiles

```bash
# Voir tous les pods avec leurs états
kubectl get pods -n viridial-staging -o wide

# Voir les logs d'un service
kubectl logs -l app=<service> -n viridial-staging --tail=100 -f

# Décrire un pod pour voir les événements
kubectl describe pod <pod-name> -n viridial-staging

# Voir les événements récents
kubectl get events -n viridial-staging --sort-by='.lastTimestamp' | tail -20

# Redémarrer un deployment
kubectl rollout restart deployment/<service> -n viridial-staging

# Redémarrer un statefulset
kubectl rollout restart statefulset/<service> -n viridial-staging

# Vérifier les ressources utilisées
kubectl top pods -n viridial-staging
```

## Support

Si le problème persiste après avoir suivi ce guide:

1. Exécuter le diagnostic complet: `./infrastructure/scripts/diagnose-services.sh`
2. Collecter les logs: `kubectl logs -l app=<service> -n viridial-staging > <service>-logs.txt`
3. Collecter les événements: `kubectl get events -n viridial-staging > events.txt`
4. Vérifier la configuration: `kubectl get all -n viridial-staging -o yaml > all-resources.yaml`

