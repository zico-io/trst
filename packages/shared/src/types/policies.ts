import type { FrameworkId } from "./frameworks";

export interface Policy {
  id: string;
  slug: string;
  title: string;
  lastReviewedAt: Date;
  contentPath: string;
  frameworks: FrameworkId[];
}

export interface Certification {
  id: string;
  frameworkId: string;
  auditor: string;
  validFrom: Date;
  validThrough: Date;
  reportUrl?: string;
}
