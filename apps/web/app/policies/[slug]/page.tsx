// apps/web/app/policies/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const KNOWN_SLUGS = ["access-control", "data-retention", "incident-response"] as const;
type KnownSlug = (typeof KNOWN_SLUGS)[number];

function isKnownSlug(slug: string): slug is KnownSlug {
  return (KNOWN_SLUGS as readonly string[]).includes(slug);
}

const policyModules: Record<
  KnownSlug,
  () => Promise<{
    default: React.ComponentType;
    metadata?: { title?: string; lastReviewed?: string };
  }>
> = {
  "access-control": () => import("@/content/policies/access-control.mdx"),
  "data-retention": () => import("@/content/policies/data-retention.mdx"),
  "incident-response": () => import("@/content/policies/incident-response.mdx"),
};

export async function generateStaticParams() {
  return KNOWN_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isKnownSlug(slug)) return {};
  const mod = await policyModules[slug]();
  const title = mod.metadata?.title ?? slug;
  return {
    title: `${title} — Bask Health Trust Center`,
  };
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isKnownSlug(slug)) {
    notFound();
  }

  const mod = await policyModules[slug]();
  const PolicyContent = mod.default;
  const meta = mod.metadata;

  return (
    <main className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 mb-8 text-sm" aria-label="Breadcrumb">
        <Link
          href="/"
          style={{ color: "var(--color-text-muted)" }}
          className="hover:underline"
        >
          Trust Center
        </Link>
        <span style={{ color: "var(--color-text-muted)" }}>/</span>
        <span style={{ color: "var(--color-text-secondary)" }}>
          {meta?.title ?? slug}
        </span>
      </nav>

      {/* MDX content */}
      <article>
        <PolicyContent />
      </article>

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
