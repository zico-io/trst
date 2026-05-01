import {
  trace,
  context,
  propagation,
  SpanKind,
  SpanStatusCode,
  ROOT_CONTEXT,
  type Attributes,
} from "@opentelemetry/api";

const tracer = trace.getTracer("@trst/telemetry");

export async function withSpan<T>(
  name: string,
  attrs: Attributes,
  fn: () => Promise<T>
): Promise<T> {
  const span = tracer.startSpan(name, { attributes: attrs });
  try {
    const result = await context.with(
      trace.setSpan(context.active(), span),
      fn
    );
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (err) {
    span.recordException(err as Error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (err as Error).message,
    });
    throw err;
  } finally {
    span.end();
  }
}

export async function withDbSpan<T>(
  operation: "select" | "insert" | "update" | "delete",
  table: string,
  fn: () => Promise<T>
): Promise<T> {
  return withSpan(
    `db.${operation} ${table}`,
    {
      "db.system": "postgresql",
      "db.operation.name": operation,
      "db.sql.table": table,
    },
    fn
  );
}

// For Bun.serve — Bun's http module isn't auto-instrumented by instrumentation-http.
// This helper manually creates a SERVER span and extracts W3C Trace Context from headers.
export async function withServerSpan(
  method: string,
  pathname: string,
  headers: Headers,
  fn: () => Promise<Response>
): Promise<Response> {
  const parentCtx = propagation.extract(ROOT_CONTEXT, {
    get: (_c: unknown, key: string) => headers.get(key) ?? undefined,
    keys: (_c: unknown) => [...headers.keys()],
  });

  const span = tracer.startSpan(`${method} ${pathname}`, {
    kind: SpanKind.SERVER,
    attributes: { "http.method": method, "http.target": pathname },
  }, parentCtx);

  const response = await context.with(
    trace.setSpan(parentCtx, span),
    fn
  );

  span.setAttribute("http.status_code", response.status);
  if (response.status >= 500) {
    span.setStatus({ code: SpanStatusCode.ERROR });
  }
  span.end();

  return response;
}

export async function withLlmSpan<T>(
  opts: { model: string; operation?: string },
  fn: () => Promise<T>
): Promise<T> {
  const operation = opts.operation ?? "chat";
  const span = tracer.startSpan(`gen_ai.${operation}`, {
    attributes: {
      "gen_ai.system": "anthropic",
      "gen_ai.request.model": opts.model,
      "gen_ai.operation.name": operation,
    },
  });

  try {
    const result = await context.with(
      trace.setSpan(context.active(), span),
      fn
    );

    // Extract token usage if the result looks like an Anthropic Message
    if (result !== null && typeof result === "object" && "usage" in result) {
      const usage = (result as Record<string, unknown>).usage;
      if (usage !== null && typeof usage === "object") {
        const u = usage as Record<string, unknown>;
        if (typeof u.input_tokens === "number") {
          span.setAttribute("gen_ai.usage.input_tokens", u.input_tokens);
        }
        if (typeof u.output_tokens === "number") {
          span.setAttribute("gen_ai.usage.output_tokens", u.output_tokens);
        }
      }
    }

    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (err) {
    span.recordException(err as Error);
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: (err as Error).message,
    });
    throw err;
  } finally {
    span.end();
  }
}
