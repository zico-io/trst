"use client";
// apps/web/components/AccessBanner.tsx

export function AccessBanner() {
  return (
    <section
      className="mx-6 sm:mx-10 lg:mx-16 my-10 rounded-xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        backgroundImage:
          "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 60%)",
      }}
    >
      <div>
        <p
          style={{ color: "var(--color-text-primary)" }}
          className="text-sm font-semibold mb-0.5"
        >
          Additional documentation available
        </p>
        <p style={{ color: "var(--color-text-secondary)" }} className="text-sm">
          Security questionnaires, SOC 2 reports, and pen test summaries are available for
          approved customers and prospects.
        </p>
      </div>
      <a
        href="mailto:security@bask.health?subject=Trust%20Center%20Access%20Request"
        className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors duration-100"
        style={{
          backgroundColor: "var(--color-accent)",
          color: "#ffffff",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
            "var(--color-accent-hover)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "var(--color-accent)";
        }}
      >
        Request Access
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
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </a>
    </section>
  );
}
