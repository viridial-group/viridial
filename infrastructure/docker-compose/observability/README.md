# Stack Observabilité Viridial 

Stack complète d'observabilité pour Viridial incluant métriques, logs, traces et alertes.

## Services Inclus

- **Prometheus** - Collecte de métriques
- **Grafana** - Visualisation et dashboards
- **Loki** - Agrégation de logs
- **Promtail** - Collection de logs
- **Jaeger** - Traçage distribué
- **Alertmanager** - Gestion des alertes
- **Node Exporter** - Métriques système
- **Postgres Exporter** - Métriques PostgreSQL
- **Redis Exporter** - Métriques Redis

## Guide rapide d'accès & d'utilisation

### Depuis le VPS (en SSH)

- Les URLs de la table ci‑dessous fonctionnent directement avec `localhost` sur le serveur (`ssh root@srv...`).
- Pour vérifier que tout est OK côté serveur :

```bash
cd /opt/viridial/infrastructure/docker-compose/observability
./test-observability.sh
```

### Depuis votre navigateur (à distance)

- Remplacez `localhost` par l'IP publique de votre VPS, par ex.:
  - Grafana : `http://VOTRE_IP:3000`
  - Prometheus : `http://VOTRE_IP:9090`
  - Jaeger : `http://VOTRE_IP:16686`
- Assurez‑vous que les ports nécessaires sont ouverts dans le firewall (cf. `open-ports.sh`).
- En dev, vous pouvez aussi utiliser un tunnel SSH:

```bash
ssh -L 3000:localhost:3000 -L 9090:localhost:9090 -L 16686:localhost:16686 root@VOTRE_IP
```

Puis ouvrez dans le navigateur de votre machine : `http://localhost:3000`, `http://localhost:9090`, etc.

### Utilisation rapide des services

- **Grafana**
  - URL: `http://VOTRE_IP:3000`
  - Login: `admin / mot de passe` défini dans `.env` (`GRAFANA_ADMIN_USER` / `GRAFANA_ADMIN_PASSWORD`)
  - Une fois connecté : onglet *Dashboards* → importez ou créez vos dashboards.
- **Prometheus**
  - URL: `http://VOTRE_IP:9090`
  - Onglet *Status → Targets* pour voir tous les exporters (Node, Postgres, Redis, etc.).
- **Loki / Promtail**
  - Logs consultables dans Grafana : *Explore* → datasource **Loki** → requêtes `{container="viridial-api"}`, etc.
- **Jaeger**
  - URL: `http://VOTRE_IP:16686`
  - Sélectionnez un service instrumenté puis lancez des recherches de traces.
- **Alertmanager**
  - URL: `http://VOTRE_IP:9093`
  - Permet de visualiser les alertes actives et silencements.

Pour les détails d'installation, de configuration et d'intégration avec les microservices, voir les sections ci‑dessous.

## Prérequis

1. Docker et Docker Compose installés
2. Services de base déployés (PostgreSQL, Redis) - voir `../README.md`
3. Réseau Docker `viridial-network` créé

## Installation Rapide

```bash
# 1. Aller dans le répertoire observability
cd infrastructure/docker-compose/observability

# 2. Lancer l'installation automatique
chmod +x install-observability.sh
./install-observability.sh

# 3. Tester la connectivité
./test-observability.sh
```

## Installation Manuelle

### 1. Créer le fichier .env

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

### 2. Démarrer les services

```bash
docker-compose -f docker-compose.observability.yml up -d
```

### 3. Vérifier l'état

```bash
docker-compose -f docker-compose.observability.yml ps
```

## Accès aux Services

| Service | URL | Credentials |
|---------|-----|------------|
| **Grafana** | http://localhost:3000 | admin / (voir .env) |
| **Prometheus** | http://localhost:9090 | - |
| **Loki** | http://localhost:3100 | - |
| **Jaeger UI** | http://localhost:16686 | - |
| **Alertmanager** | http://localhost:9093 | - |
| **Node Exporter** | http://localhost:9100/metrics | - |
| **Postgres Exporter** | http://localhost:9187/metrics | - |
| **Redis Exporter** | http://localhost:9121/metrics | - |

## Configuration

### Prometheus

- **Fichier de config:** `config/prometheus/prometheus.yml`
- **Règles d'alerte:** `config/prometheus/alerts.yml`
- **Retention:** 30 jours
- **Scrape interval:** 15 secondes

### Grafana

- **Datasources:** Configurés automatiquement (Prometheus, Loki)
- **Dashboards:** À créer manuellement ou importer depuis `/var/lib/grafana/dashboards`
- **Provisioning:** `config/grafana/provisioning/`

### Loki

- **Config:** `config/loki/loki-config.yml`
- **Retention:** 30 jours
- **Collection:** Promtail collecte les logs Docker

### Alertmanager

- **Config:** `config/alertmanager/alertmanager.yml`
- **Notifications:** Email et Slack (à configurer)

## Dashboards Grafana Recommandés

### Infrastructure
- CPU, Memory, Disk, Network par node
- Container metrics
- System load

### Services
- Request rate
- Latency (p50, p95, p99)
- Error rate
- Throughput

### Database
- PostgreSQL connections
- Query performance
- Database size

### Cache
- Redis memory usage
- Hit/miss ratio
- Commands per second

### Business Metrics
- Tenant count
- API calls
- Search queries
- Active users

## Alertes Configurées

### Infrastructure
- Service Down (critical)
- High CPU Usage (warning)
- High Memory Usage (warning)
- Disk Space Low (critical)

### Services
- High Latency (warning)
- High Error Rate (critical)

### Database
- PostgreSQL Connection Issues (critical)
- PostgreSQL High Connections (warning)

### Cache
- Redis Down (critical)
- Redis High Memory (warning)

## Configuration des Notifications

### Email (Alertmanager)

Éditer `config/alertmanager/alertmanager.yml`:

```yaml
global:
  smtp_smarthost: 'smtp.hostinger.com:465'
  smtp_from: 'alerts@viridial.com'
  smtp_auth_username: 'alerts@viridial.com'
  smtp_auth_password: 'your_password'
  smtp_require_tls: true
```

### Slack (Alertmanager)

Éditer `config/alertmanager/alertmanager.yml`:

```yaml
receivers:
  - name: 'critical-alerts'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
        title: '🚨 Critical Alert'
```

## Commandes Utiles

### Voir les logs
```bash
docker-compose -f docker-compose.observability.yml logs -f [service]
```

### Redémarrer un service
```bash
docker-compose -f docker-compose.observability.yml restart [service]
```

### Arrêter tous les services
```bash
docker-compose -f docker-compose.observability.yml down
```

### Arrêter et supprimer les volumes
```bash
docker-compose -f docker-compose.observability.yml down -v
```

### Tester la connectivité
```bash
./test-observability.sh
```

## Intégration avec les Microservices

### Spring Boot Actuator

Pour exposer les métriques Prometheus dans vos services Spring Boot:

```yaml
# application.yml
management:
  endpoints:
    web:
      exposure:
        include: prometheus,health,info
  metrics:
    export:
      prometheus:
        enabled: true
```

Ajouter la dépendance:
```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

### OpenTelemetry pour Jaeger

Pour instrumenter vos services avec OpenTelemetry:

```xml
<dependency>
    <groupId>io.opentelemetry</groupId>
    <artifactId>opentelemetry-spring-boot-starter</artifactId>
</dependency>
```

Configuration:
```yaml
opentelemetry:
  exporter:
    jaeger:
      endpoint: http://jaeger:14250
  service:
    name: your-service-name
```

## Persistence

Tous les services utilisent des volumes Docker pour la persistence:

- `prometheus_data` - Métriques historiques
- `alertmanager_data` - État des alertes
- `grafana_data` - Dashboards et configurations
- `loki_data` - Logs agrégés
- `jaeger_data` - Traces

## Troubleshooting

### Prometheus ne scrape pas les services

1. Vérifier que les services sont accessibles depuis le réseau `viridial-network`
2. Vérifier la configuration dans `config/prometheus/prometheus.yml`
3. Vérifier les logs: `docker-compose logs prometheus`

### Grafana ne peut pas se connecter à Prometheus

1. Vérifier que Prometheus est accessible: `curl http://prometheus:9090/-/healthy`
2. Vérifier la configuration dans `config/grafana/provisioning/datasources/datasources.yml`
3. Vérifier les logs: `docker-compose logs grafana`

### Loki ne collecte pas de logs

1. Vérifier que Promtail est en cours d'exécution
2. Vérifier les logs: `docker-compose logs promtail`
3. Vérifier la configuration dans `config/promtail/promtail-config.yml`

### Jaeger ne reçoit pas de traces

1. Vérifier que les services envoient des traces à `jaeger:14250` (gRPC) ou `jaeger:14268` (HTTP)
2. Vérifier les logs: `docker-compose logs jaeger`
3. Vérifier l'instrumentation OpenTelemetry dans vos services

## Ressources Requises

### Minimum (VPS)
- CPU: 2 cores
- RAM: 4GB
- Disk: 50GB (pour métriques et logs)

### Recommandé
- CPU: 4 cores
- RAM: 8GB
- Disk: 100GB+

## Sécurité

⚠️ **IMPORTANT:**
- Ne pas exposer les ports publiquement sans authentification
- Utiliser un reverse proxy (Nginx) avec authentification
- Configurer SSL/TLS pour les accès externes
- Limiter l'accès aux endpoints d'administration
- Changer les mots de passe par défaut

## Support

Pour plus d'aide:
- Consulter la documentation officielle de chaque service
- Vérifier les logs: `docker-compose logs -f [service]`
- Tester la connectivité: `./test-observability.sh`

