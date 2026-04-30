import { AccessBanner } from "@/components/AccessBanner";
import { FrameworkCard } from "@/components/FrameworkCard";
import { Hero } from "@/components/Hero";
import { NavLinkRow } from "@/components/NavLinkRow";
import { PolicyRow } from "@/components/PolicyRow";
import { mockTrustCenterData } from "@/lib/mock-data";

export const revalidate = 60;

export default function TrustCenterPage() {
  const data = mockTrustCenterData;

  return (
    <main className="max-w-4xl mx-auto">
      {/* 1. Hero */}
      <Hero lastScannedMinutesAgo={data.lastScannedMinutesAgo} />

      {/* 2. Compliance Frameworks */}
      <section className="px-6 sm:px-10 lg:px-16 py-7">
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--color-text-muted)" }}
        >
          Compliance Frameworks
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.frameworks.map((framework) => (
            <FrameworkCard key={framework.id} framework={framework} />
          ))}
        </div>
      </section>

      {/* 3. Horizontal nav link row */}
      <NavLinkRow />

      {/* 4. Policies section */}
      <section
        id="policies"
        className="px-6 sm:px-10 lg:px-16 py-7"
        style={{ scrollMarginTop: "1rem" }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: "var(--color-text-muted)" }}
        >
          Policies
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {data.policies.map((policy) => (
            <PolicyRow key={policy.slug} policy={policy} />
          ))}
        </div>
      </section>

      {/* 5. Access banner */}
      <AccessBanner />
    </main>
  );
}
