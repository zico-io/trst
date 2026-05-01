import { NodeTracerProvider, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { BatchLogRecordProcessor, LoggerProvider } from "@opentelemetry/sdk-logs";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { logs, SeverityNumber, type Logger } from "@opentelemetry/api-logs";

let traceProvider: NodeTracerProvider | null = null;

// Parse OTEL_EXPORTER_OTLP_HEADERS="key=value,key2=value2" into a plain object.
// We do this explicitly rather than relying on the SDK's env-var support, which
// has inconsistent behaviour under Bun's Node.js compat layer.
function parseOtlpHeaders(): Record<string, string> {
  const raw = process.env.OTEL_EXPORTER_OTLP_HEADERS;
  if (!raw) return {};
  return Object.fromEntries(
    raw.split(",").flatMap((pair) => {
      const eq = pair.indexOf("=");
      if (eq < 1) return [];
      return [[pair.slice(0, eq).trim(), pair.slice(eq + 1).trim()]];
    }),
  );
}

export function initTelemetry({ serviceName }: { serviceName: string }): void {
  if (traceProvider) return;

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
  if (!endpoint) return;

  const headers = parseOtlpHeaders();
  const hasAuth = "authorization" in headers;
  console.log(
    `[otel] Initializing: service=${serviceName} endpoint=${endpoint} auth=${hasAuth ? "yes" : "NO — set OTEL_EXPORTER_OTLP_HEADERS"}`,
  );

  const resource = resourceFromAttributes({ [ATTR_SERVICE_NAME]: serviceName });

  // SimpleSpanProcessor exports each span immediately — no 5s batch delay in local dev.
  // NodeTracerProvider.register() sets the global tracer, AsyncLocalStorageContextManager,
  // and W3C trace-context + baggage propagators.
  traceProvider = new NodeTracerProvider({
    resource,
    spanProcessors: [
      new SimpleSpanProcessor(new OTLPTraceExporter({ url: `${endpoint}/v1/traces`, headers })),
    ],
  });
  traceProvider.register();

  const loggerProvider = new LoggerProvider({
    resource,
    processors: [
      new BatchLogRecordProcessor(new OTLPLogExporter({ url: `${endpoint}/v1/logs`, headers })),
    ],
  });
  logs.setGlobalLoggerProvider(loggerProvider);

  bridgeConsoleToOtel(logs.getLogger(serviceName));

  process.on("SIGTERM", () => {
    Promise.allSettled([traceProvider?.shutdown(), loggerProvider.shutdown()]).catch(
      console.error,
    );
  });
}

// Wrap console.* so existing log statements appear in HyperDX without requiring
// manual instrumentation. The originals still write to stdout.
function bridgeConsoleToOtel(logger: Logger): void {
  function emit(severity: SeverityNumber, severityText: string, args: unknown[]): void {
    const body = args
      .map((a) => (typeof a === "string" ? a : JSON.stringify(a)))
      .join(" ");
    logger.emit({ severityNumber: severity, severityText, body });
  }

  const orig = {
    log: console.log.bind(console),
    info: console.info.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };

  console.log = (...a) => { orig.log(...a); emit(SeverityNumber.INFO, "info", a); };
  console.info = (...a) => { orig.info(...a); emit(SeverityNumber.INFO, "info", a); };
  console.warn = (...a) => { orig.warn(...a); emit(SeverityNumber.WARN, "warn", a); };
  console.error = (...a) => { orig.error(...a); emit(SeverityNumber.ERROR, "error", a); };
}
