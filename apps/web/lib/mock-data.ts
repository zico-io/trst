import type { TrustCenterData } from "./types";

export const mockTrustCenterData: TrustCenterData = {
  lastScannedMinutesAgo: 4,
  frameworks: [
    {
      id: "hipaa",
      name: "HIPAA",
      abbreviation: "HIPAA",
      emoji: "🏥",
      badgeColor: "bg-emerald-800",
      status: "certified",
      percentage: 100,
      auditor: "Coalfire",
      validThrough: "2027-03-31",
    },
    {
      id: "soc2",
      name: "SOC 2 Type II",
      abbreviation: "SOC 2",
      emoji: "🔒",
      badgeColor: "bg-indigo-800",
      status: "in-progress",
      percentage: 78,
      auditTarget: "Q3 2026",
    },
    {
      id: "gdpr",
      name: "GDPR",
      abbreviation: "GDPR",
      emoji: "🇪🇺",
      badgeColor: "bg-blue-800",
      status: "in-progress",
      percentage: 62,
      auditTarget: "Q4 2026",
    },
    {
      id: "iso27001",
      name: "ISO 27001",
      abbreviation: "ISO 27001",
      emoji: "📋",
      badgeColor: "bg-purple-800",
      status: "in-progress",
      percentage: 45,
      auditTarget: "Q1 2027",
    },
  ],
  policies: [
    { slug: "access-control", title: "Access Control Policy", icon: "lock" },
    {
      slug: "data-retention",
      title: "Data Retention Policy",
      icon: "database",
    },
    {
      slug: "incident-response",
      title: "Incident Response Policy",
      icon: "alert-triangle",
    },
    {
      slug: "vulnerability-management",
      title: "Vulnerability Management",
      icon: "shield",
    },
    { slug: "encryption", title: "Encryption Policy", icon: "key" },
    {
      slug: "business-continuity",
      title: "Business Continuity Plan",
      icon: "refresh-cw",
    },
  ],
};
