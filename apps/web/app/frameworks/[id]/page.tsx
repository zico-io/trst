import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mockTrustCenterData } from "@/lib/mock-data";

export async function generateStaticParams() {
  return mockTrustCenterData.frameworks.map((f) => ({ id: f.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const framework = mockTrustCenterData.frameworks.find((f) => f.id === id);
  if (!framework) return {};
  return {
    title: `${framework.name} — Bask Health Trust Center`,
  };
}

export default async function FrameworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const framework = mockTrustCenterData.frameworks.find((f) => f.id === id);

  if (!framework) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 py-12">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 mb-8 text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          style={{ color: "var(--color-text-muted)" }}
          className="hover:underline"
        >
          Trust Center
        </Link>
        <span style={{ color: "var(--color-text-muted)" }}>/</span>
        <span style={{ color: "var(--color-text-secondary)" }}>
          {framework.name}
        </span>
      </nav>

      {/* Badge + title */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className={`${framework.badgeColor} rounded-xl flex flex-col items-center justify-center gap-1 text-white`}
          style={{ width: 56, height: 68 }}
        >
          <span className="text-2xl leading-none">{framework.emoji}</span>
          <span className="text-[10px] font-bold tracking-wide leading-none opacity-90">
            {framework.abbreviation}
          </span>
        </div>
        <div>
          <h1
            style={{ color: "var(--color-text-primary)" }}
            className="text-2xl font-bold tracking-tight"
          >
            {framework.name}
          </h1>
          <p
            style={{ color: "var(--color-text-muted)" }}
            className="text-sm mt-0.5"
          >
            {framework.percentage}% compliant
            {framework.status === "certified" && framework.auditor
              ? ` · Certified by ${framework.auditor}`
              : framework.auditTarget
                ? ` · Audit target ${framework.auditTarget}`
                : ""}
          </p>
        </div>
      </div>

      {/* Placeholder content */}
      <div
        className="rounded-xl px-6 py-10 text-center"
        style={{
          backgroundColor: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <p style={{ color: "var(--color-text-muted)" }} className="text-sm">
          Detailed control-by-control breakdown coming in Plan 4.
        </p>
        <p
          style={{ color: "var(--color-text-muted)" }}
          className="text-xs mt-2 opacity-60"
        >
          This page will show individual control statuses, evidence links, and
          finding history.
        </p>
      </div>

      {/* Back link */}
      <div className="mt-12 pt-8" style={{ borderTop: "1px solid var(--color-border)" }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium"
          style={{ color: "var(--color-accent)" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Trust Center
        </Link>
      </div>
    </main>
  );
}
