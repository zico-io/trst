// apps/web/components/Hero.tsx

interface HeroProps {
  lastScannedMinutesAgo: number;
}

export function Hero({ lastScannedMinutesAgo }: HeroProps) {
  return (
    <section
      style={{ borderBottom: "1px solid var(--color-border)" }}
      className="px-6 pt-16 pb-12 sm:px-10 lg:px-16"
    >
      {/* Logo */}
      <div className="mb-6">
        <span
          style={{ color: "var(--color-text-primary)" }}
          className="text-4xl font-bold tracking-tight"
        >
          tr
          <span style={{ color: "var(--color-accent)" }}>s</span>
          t
        </span>
      </div>

      {/* Eyebrow */}
      <p
        style={{ color: "var(--color-text-muted)" }}
        className="text-sm font-medium uppercase tracking-widest mb-3"
      >
        Bask Health · Security &amp; Compliance
      </p>

      {/* Title */}
      <h1
        style={{ color: "var(--color-text-primary)" }}
        className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
      >
        Built for trust in healthcare
      </h1>

      {/* Subtitle */}
      <p
        style={{ color: "var(--color-text-secondary)" }}
        className="text-base sm:text-lg max-w-xl mb-8"
      >
        Our compliance posture is continuously scanned, scored, and published here
        so customers and auditors can verify our controls in real time.
      </p>

      {/* Live pulse indicator */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: "var(--color-green)" }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ backgroundColor: "var(--color-green)" }}
          />
        </span>
        <span style={{ color: "var(--color-text-muted)" }} className="text-sm">
          <span style={{ color: "var(--color-green)" }} className="font-medium">
            Live
          </span>
          {" · "}last scanned{" "}
          <span style={{ color: "var(--color-text-secondary)" }}>
            {lastScannedMinutesAgo} minutes ago
          </span>
        </span>
      </div>
    </section>
  );
}
