#!/bin/bash
set -euo pipefail

dnf install -y docker
systemctl enable --now docker

# ── Tailscale ──────────────────────────────────────────────────────────────────
curl -fsSL https://tailscale.com/install.sh | sh
tailscale up \
  --auth-key="${tailscale_auth_key}" \
  --hostname="trst-clickstack-${environment}" \
  --accept-routes \
  --ssh

mkdir -p /opt/clickstack/clickhouse

# ── ClickHouse config ──────────────────────────────────────────────────────────
cat > /opt/clickstack/clickhouse/config.xml << 'XML'
<?xml version="1.0"?>
<clickhouse>
    <logger>
        <level>warning</level>
        <console>true</console>
        <log remove="remove" />
        <errorlog remove="remove" />
    </logger>

    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <interserver_http_host>ch-server</interserver_http_host>
    <interserver_http_port>9009</interserver_http_port>

    <max_connections>4096</max_connections>
    <keep_alive_timeout>64</keep_alive_timeout>
    <max_concurrent_queries>100</max_concurrent_queries>

    <path>/var/lib/clickhouse/</path>
    <tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>

    <user_directories>
        <users_xml>
            <path>users.xml</path>
        </users_xml>
    </user_directories>

    <default_profile>default</default_profile>
    <default_database>default</default_database>
    <timezone>UTC</timezone>
    <mlock_executable>false</mlock_executable>

    <remote_servers>
        <hdx_cluster>
            <shard>
                <replica>
                    <host>ch-server</host>
                    <port>9000</port>
                </replica>
            </shard>
        </hdx_cluster>
    </remote_servers>

    <distributed_ddl>
        <path>/clickhouse/task_queue/ddl</path>
    </distributed_ddl>

    <format_schema_path>/var/lib/clickhouse/format_schemas/</format_schema_path>
</clickhouse>
XML

cat > /opt/clickstack/clickhouse/users.xml << 'XML'
<?xml version="1.0"?>
<clickhouse>
    <profiles>
        <default>
            <max_memory_usage>10000000000</max_memory_usage>
            <use_uncompressed_cache>0</use_uncompressed_cache>
            <load_balancing>in_order</load_balancing>
            <log_queries>1</log_queries>
        </default>
    </profiles>

    <users>
        <default>
            <password></password>
            <profile>default</profile>
            <networks>
                <ip>::/0</ip>
            </networks>
            <quota>default</quota>
        </default>
    </users>

    <quotas>
        <default>
            <interval>
                <duration>3600</duration>
                <queries>0</queries>
                <errors>0</errors>
                <result_rows>0</result_rows>
                <read_rows>0</read_rows>
                <execution_time>0</execution_time>
            </interval>
        </default>
    </quotas>
</clickhouse>
XML

# ── Compose file ───────────────────────────────────────────────────────────────
cat > /opt/clickstack/compose.yml << YAML
services:

  ch-server:
    image: clickhouse/clickhouse-server:26.1-alpine
    environment:
      CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT: 1
    volumes:
      - /opt/clickstack/clickhouse/config.xml:/etc/clickhouse-server/config.xml
      - /opt/clickstack/clickhouse/users.xml:/etc/clickhouse-server/users.xml
      - ch_data:/var/lib/clickhouse
      - ch_logs:/var/log/clickhouse-server
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "clickhouse-client --query 'SELECT 1'"]
      interval: 5s
      timeout: 5s
      retries: 10

  clickstack-mongo:
    image: mongo:5.0.32-focal
    volumes:
      - clickstack_mongo:/data/db
    restart: always

  otel-collector:
    image: clickhouse/clickstack-otel-collector:2
    environment:
      CLICKHOUSE_ENDPOINT: "tcp://ch-server:9000?dial_timeout=10s"
      HYPERDX_OTEL_EXPORTER_CLICKHOUSE_DATABASE: default
      HYPERDX_LOG_LEVEL: warn
      OPAMP_SERVER_URL: "http://hyperdx:4320"
      HYPERDX_OTEL_EXPORTER_CREATE_LEGACY_SCHEMA: "true"
    ports:
      - "4317:4317"
      - "4318:4318"
      - "24225:24225"
    restart: always
    depends_on:
      ch-server:
        condition: service_healthy

  hyperdx:
    image: docker.hyperdx.io/hyperdx/hyperdx:2
    ports:
      - "8080:8080"
      - "8000:8000"
    environment:
      FRONTEND_URL: "http://trst-clickstack-${environment}:8080"
      HYPERDX_API_PORT: 8000
      HYPERDX_APP_PORT: 8080
      HYPERDX_APP_URL: "http://trst-clickstack-${environment}:8080"
      HYPERDX_LOG_LEVEL: warn
      HYPERDX_API_KEY: "${hyperdx_api_key}"
      OPAMP_PORT: 4320
      MONGO_URI: "mongodb://clickstack-mongo:27017/hyperdx"
      SERVER_URL: "http://127.0.0.1:8000"
      OTEL_EXPORTER_OTLP_ENDPOINT: "http://otel-collector:4318"
      OTEL_SERVICE_NAME: "hdx-oss-app"
      USAGE_STATS_ENABLED: "false"
      DEFAULT_CONNECTIONS: '[{"name":"Local ClickHouse","host":"http://ch-server:8123","username":"default","password":""}]'
      DEFAULT_SOURCES: '[{"from":{"databaseName":"default","tableName":"otel_logs"},"kind":"log","timestampValueExpression":"TimestampTime","name":"Logs","displayedTimestampValueExpression":"Timestamp","implicitColumnExpression":"Body","serviceNameExpression":"ServiceName","bodyExpression":"Body","eventAttributesExpression":"LogAttributes","resourceAttributesExpression":"ResourceAttributes","defaultTableSelectExpression":"Timestamp,ServiceName,SeverityText,Body","severityTextExpression":"SeverityText","traceIdExpression":"TraceId","spanIdExpression":"SpanId","connection":"Local ClickHouse","traceSourceId":"Traces","sessionSourceId":"Sessions","metricSourceId":"Metrics"},{"from":{"databaseName":"default","tableName":"otel_traces"},"kind":"trace","timestampValueExpression":"Timestamp","name":"Traces","displayedTimestampValueExpression":"Timestamp","implicitColumnExpression":"SpanName","serviceNameExpression":"ServiceName","eventAttributesExpression":"SpanAttributes","resourceAttributesExpression":"ResourceAttributes","defaultTableSelectExpression":"Timestamp,ServiceName,StatusCode,round(Duration\/1e6),SpanName","traceIdExpression":"TraceId","spanIdExpression":"SpanId","durationExpression":"Duration","durationPrecision":9,"parentSpanIdExpression":"ParentSpanId","spanNameExpression":"SpanName","spanKindExpression":"SpanKind","statusCodeExpression":"StatusCode","statusMessageExpression":"StatusMessage","connection":"Local ClickHouse","logSourceId":"Logs","sessionSourceId":"Sessions","metricSourceId":"Metrics"},{"from":{"databaseName":"default","tableName":""},"kind":"metric","timestampValueExpression":"TimeUnix","name":"Metrics","resourceAttributesExpression":"ResourceAttributes","metricTables":{"gauge":"otel_metrics_gauge","histogram":"otel_metrics_histogram","sum":"otel_metrics_sum"},"connection":"Local ClickHouse","logSourceId":"Logs","traceSourceId":"Traces","sessionSourceId":"Sessions"},{"from":{"databaseName":"default","tableName":"hyperdx_sessions"},"kind":"session","timestampValueExpression":"TimestampTime","name":"Sessions","displayedTimestampValueExpression":"Timestamp","implicitColumnExpression":"Body","serviceNameExpression":"ServiceName","bodyExpression":"Body","eventAttributesExpression":"LogAttributes","resourceAttributesExpression":"ResourceAttributes","defaultTableSelectExpression":"Timestamp,ServiceName,SeverityText,Body","severityTextExpression":"SeverityText","traceIdExpression":"TraceId","spanIdExpression":"SpanId","connection":"Local ClickHouse","logSourceId":"Logs","traceSourceId":"Traces","metricSourceId":"Metrics"}]'
    restart: always
    depends_on:
      ch-server:
        condition: service_healthy
      clickstack-mongo:
        condition: service_started

volumes:
  ch_data:
  ch_logs:
  clickstack_mongo:
YAML

# ── Systemd unit ───────────────────────────────────────────────────────────────
cat > /etc/systemd/system/clickstack.service << 'SERVICE'
[Unit]
Description=HyperDX ClickStack
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/clickstack
ExecStart=/usr/bin/docker compose up -d --pull always
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable --now clickstack
