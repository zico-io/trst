import { initTelemetry } from "@trst/telemetry";
import { router } from "./router";

initTelemetry({ serviceName: process.env.OTEL_SERVICE_NAME ?? "trst-agent" });

const PORT = Number(process.env.PORT ?? "3001");

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    try {
      return await router(request);
    } catch (err) {
      console.error("[server] Unhandled error:", err);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});

console.log(`[agent] Listening on http://localhost:${server.port}`);
