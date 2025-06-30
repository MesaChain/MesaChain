# MesaChain Monitoring & Logging Quick Reference

## Prometheus & Grafana
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)
- Prometheus scrapes `/metrics` from backend and other services.
- Alertmanager: http://localhost:9093 (alerts to Slack, email, etc.)

## ELK Stack
- Elasticsearch: http://localhost:9200
- Logstash: Receives logs on port 5000 (TCP/UDP, JSON)
- Kibana: http://localhost:5601 (log search, dashboards, alerts)

## Adding a New Service
- Expose `/metrics` endpoint for Prometheus.
- Ship logs to Logstash (port 5000, JSON format).
- Update `prometheus.yml` with new scrape job.

## Playbook
- Use Grafana for metrics dashboards and alert investigation.
- Use Kibana for log search, error analysis, and log-based alerts.
- Respond to alerts via Slack/email as configured in Alertmanager.

See MONITORING.md for full details.
