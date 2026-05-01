import { gdpr } from "./gdpr";
import { hipaa } from "./hipaa";
import { hitrust } from "./hitrust";
import { iso27001 } from "./iso27001";
import { soc2 } from "./soc2";

export { gdpr, hipaa, hitrust, iso27001, soc2 };

export const frameworks = { gdpr, hipaa, hitrust, iso27001, soc2 } as const;
