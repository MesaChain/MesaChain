# MesaChain Monitoring & Logging

## Overview
This system provisions Prometheus, Grafana, and the ELK stack (Elasticsearch, Logstash, Kibana) for metrics and centralized logging. All backend services expose Prometheus metrics, and logs are shipped to Elasticsearch for search and alerting.

---

## Onboarding a New Service

### 1. Metrics (Prometheus)
- Ensure your service exposes a `/metrics` endpoint using [prom-client](https://github.com/siimon/prom-client) (Node.js) or equivalent.
- Add a new `job` in `prometheus.yml` for the service:
  ```yaml
  - job_name: 'your-service'
    static_configs:
      - targets: ['your-service:PORT']
  ```

### 2. Logging (ELK)
- Ship logs to Logstash on port 5000 (TCP/UDP, JSON format recommended).
- Include fields: `timestamp`, `service`, `level`, `message`, and any relevant metadata.
- Example log (JSON):
  ```json
  {"timestamp":"2025-06-30T12:00:00Z","service":"backend","level":"error","message":"Something failed"}
  ```

---

## Playbook: Responding to Alerts

### 1. Prometheus/Grafana
- Access Grafana at `http://localhost:3000` (default user: admin/admin).
- Use dashboards to check CPU, memory, request latency, and error rates.
- Investigate spikes or anomalies by drilling down into panels.

### 2. Kibana (Logs)
- Access Kibana at `http://localhost:5601`.
- Use Discover to search logs by service, level, or message.
- Use Timeline for error/event correlation.
- Set up log-based alerts for patterns (e.g., repeated timeouts).

### 3. Alerting
- Prometheus Alertmanager will send notifications to configured channels (Slack, email, PagerDuty).
- Review alert details, check Grafana/Kibana for context, and follow runbooks for remediation.

---

## Adding Dashboards & Alerts
- Grafana: Import or create dashboards for new services.
- Prometheus: Add alert rules in `prometheus.yml` or a separate `alerts.yml`.
- Kibana: Create log-based alerts in the Alerts section.

---

## Quick Start
1. `docker-compose up --build` to start all monitoring/logging services.
2. Access:
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000
   - Kibana: http://localhost:5601

---

For more details, see the configs in this repo or contact the MesaChain DevOps team.
