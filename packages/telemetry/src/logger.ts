import { logs, type Logger } from "@opentelemetry/api-logs";

export function getLogger(name: string): Logger {
  return logs.getLogger(name);
}
