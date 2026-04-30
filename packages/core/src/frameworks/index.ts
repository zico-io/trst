export { hipaa } from "./hipaa";
export { soc2 } from "./soc2";
export { gdpr } from "./gdpr";
export { iso27001 } from "./iso27001";
export { hitrust } from "./hitrust";

export const frameworks = {
  hipaa: () => import("./hipaa").then((m) => m.hipaa),
  soc2: () => import("./soc2").then((m) => m.soc2),
  gdpr: () => import("./gdpr").then((m) => m.gdpr),
  iso27001: () => import("./iso27001").then((m) => m.iso27001),
  hitrust: () => import("./hitrust").then((m) => m.hitrust),
} as const;
