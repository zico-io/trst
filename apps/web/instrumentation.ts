export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initTelemetry } = await import("@trst/telemetry");
    initTelemetry({
      serviceName: process.env.OTEL_SERVICE_NAME ?? "trst-web",
    });
  }
}
