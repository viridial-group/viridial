#!/usr/bin/env bash
set -euo pipefail

# setup-cluster.sh
# Usage: ./scripts/setup-cluster.sh [--issuer staging|prod] [--email you@example.com] [--domain staging.example.com] [--create-test] [--registry-url URL --registry-user USER --registry-pass PASS]
# Example:
#  ./scripts/setup-cluster.sh --issuer staging --email ops@example.com --domain staging.example.com --create-test

ISSUER="staging"
EMAIL=""
DOMAIN=""
CREATE_TEST="false"
REGISTRY_URL=""
REGISTRY_USER=""
REGISTRY_PASS=""

print_usage(){
  sed -n '1,120p' "$0" | sed -n '1,20p'
  cat <<EOF

Options:
  --issuer staging|prod    Choose ACME server (default: staging)
  --email EMAIL            Email for ACME registration (recommended)
  --domain DOMAIN          Hostname to create a test Ingress/certificate for
  --create-test            Deploy a demo nginx app + ingress to validate
  --registry-url URL       Create imagePullSecret for private registry
  --registry-user USER
  --registry-pass PASS
  -h, --help               Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --issuer)
      ISSUER="$2"; shift 2;;
    --email)
      EMAIL="$2"; shift 2;;
    --domain)
      DOMAIN="$2"; shift 2;;
    --create-test)
      CREATE_TEST="true"; shift;;
    --registry-url)
      REGISTRY_URL="$2"; shift 2;;
    --registry-user)
      REGISTRY_USER="$2"; shift 2;;
    --registry-pass)
      REGISTRY_PASS="$2"; shift 2;;
    -h|--help)
      print_usage; exit 0;;
    *) echo "Unknown arg: $1"; print_usage; exit 1;;
  esac
done

check_cmd(){ command -v "$1" >/dev/null 2>&1 || { echo "Required command '$1' not found"; exit 1; } }
check_cmd kubectl

echo "[1/8] Cluster checks"
kubectl version --short || true
kubectl get nodes -o wide

echo "[2/8] Install local-path-provisioner (StorageClass)"
LOCAL_PATH_URL="https://raw.githubusercontent.com/rancher/local-path-provisioner/master/deploy/local-path-storage.yaml"
kubectl apply -f "$LOCAL_PATH_URL"
echo "Waiting for local-path-provisioner pod (kube-system)..."
kubectl -n kube-system wait --for=condition=ready pod -l app=local-path-provisioner --timeout=120s || echo "Warning: local-path pods not ready yet"

echo "StorageClasses:"
kubectl get storageclass || true

echo "[3/8] Ensure namespaces"
for ns in viridial-staging viridial-production; do
  if kubectl get namespace "$ns" >/dev/null 2>&1; then
    echo "namespace $ns exists"
  else
    kubectl create namespace "$ns"
    echo "created namespace $ns"
  fi
done

echo "[4/8] Create imagePullSecret if registry info provided"
if [[ -n "$REGISTRY_URL" && -n "$REGISTRY_USER" && -n "$REGISTRY_PASS" ]]; then
  echo "Creating docker-registry secret in production namespace"
  kubectl create secret docker-registry regcred \
    --docker-server="$REGISTRY_URL" \
    --docker-username="$REGISTRY_USER" \
    --docker-password="$REGISTRY_PASS" \
    --docker-email=devnull@example.com -n viridial-production --dry-run=client -o yaml | kubectl apply -f -
else
  echo "No registry credentials provided — skipping imagePullSecret"
fi

echo "[5/8] Create ClusterIssuer (cert-manager)"
if [[ "$ISSUER" == "prod" ]]; then
  ACME_SERVER="https://acme-v02.api.letsencrypt.org/directory"
  CI_NAME="letsencrypt-prod"
else
  ACME_SERVER="https://acme-staging-v02.api.letsencrypt.org/directory"
  CI_NAME="letsencrypt-staging"
fi

if [[ -z "$EMAIL" ]]; then
  echo "No --email provided: cert-manager ACME registration will proceed without an email (not recommended)"
fi

cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: ${CI_NAME}
spec:
  acme:
    server: ${ACME_SERVER}
    email: "${EMAIL}"
    privateKeySecretRef:
      name: ${CI_NAME}
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

kubectl get clusterissuer ${CI_NAME} || true

if [[ "$CREATE_TEST" == "true" && -n "$DOMAIN" ]]; then
  echo "[6/8] Deploy demo nginx + ingress in viridial-staging for domain $DOMAIN"
  cat <<YAML | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-nginx
  namespace: viridial-staging
spec:
  replicas: 1
  selector:
    matchLabels:
      app: demo-nginx
  template:
    metadata:
      labels:
        app: demo-nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.25
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: demo-nginx-svc
  namespace: viridial-staging
spec:
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: demo-nginx
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: demo-nginx-ingress
  namespace: viridial-staging
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: ${CI_NAME}
spec:
  rules:
  - host: ${DOMAIN}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: demo-nginx-svc
            port:
              number: 80
  tls:
  - hosts:
    - ${DOMAIN}
    secretName: demo-nginx-tls
YAML

  echo "Waiting for demo deployment and pod readiness..."
  kubectl -n viridial-staging wait --for=condition=available deploy/demo-nginx --timeout=120s || true
  kubectl -n viridial-staging get deploy,svc,ingress,pods

  echo "If cert-manager is configured and DNS for $DOMAIN points to your ingress controller, a Certificate should be issued."
  kubectl -n viridial-staging get certificate || true
else
  echo "[6/8] Skipping demo deploy (either --create-test not set or --domain not provided)"
fi

echo "[7/8] Show key resources summary"
kubectl get storageclass || true
kubectl get ns viridial-staging viridial-production -o wide || true
kubectl -n ingress-nginx get svc,deployment || true

echo "[8/8] Done. Next steps:"
cat <<EOF
- If you deployed demo ingress with a domain, ensure DNS A record points to your node/loadbalancer IP.
- For production certificates, re-run with --issuer prod and a valid --email when ready.
- Replace local-path with a cloud CSI provisioner for production-grade storage.
EOF

exit 0
