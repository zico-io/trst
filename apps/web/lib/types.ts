import type { FrameworkId } from "@trst/shared";

export type FrameworkStatus = "certified" | "in-progress";

export interface FrameworkDisplayCard {
  id: FrameworkId;
  name: string;
  abbreviation: string;
  emoji: string;
  badgeColor: string;
  status: FrameworkStatus;
  percentage: number;
  // certified only
  auditor?: string;
  validThrough?: string;
  // in-progress only
  auditTarget?: string;
}

export interface PolicyLink {
  slug: string;
  title: string;
  icon: string;
}

export interface TrustCenterData {
  lastScannedMinutesAgo: number;
  frameworks: FrameworkDisplayCard[];
  policies: PolicyLink[];
}
