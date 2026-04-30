// apps/web/components/FrameworkCard.tsx
import type { FrameworkDisplayCard } from "@/lib/types";
import Link from "next/link";

interface FrameworkCardProps {
  framework: FrameworkDisplayCard;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function FrameworkCard({ framework }: FrameworkCardProps) {
  const isCertified = framework.status === "certified";

  const cardStyle: React.CSSProperties = isCertified
    ? {
        backgroundColor: "var(--color-green-bg)",
        border: "1px solid var(--color-green-border)",
        backgroundImage:
          "linear-gradient(135deg, rgba(16,185,129,0.07) 0%, transparent 60%)",
      }
    : {
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      };

  return (
    <Link
      href={`/frameworks/${framework.id}`}
      className="block rounded-xl p-5 transition-colors duration-150 hover:opacity-90"
      style={cardStyle}
    >
      <div className="flex items-start gap-4">
        {/* Badge */}
        <div className="relative flex-shrink-0">
          <div
            className={`${framework.badgeColor} rounded-lg flex flex-col items-center justify-center gap-0.5 text-white`}
            style={{ width: 44, height: 52 }}
          >
            <span className="text-xl leading-none">{framework.emoji}</span>
            <span className="text-[9px] font-bold tracking-wide leading-none opacity-90">
              {framework.abbreviation}
            </span>
          </div>

          {/* Green check ring overlay — certified only */}
          {isCertified && (
            <div
              className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
              style={{
                width: 16,
                height: 16,
                backgroundColor: "var(--color-green)",
                border: "2px solid var(--color-green-bg)",
              }}
            >
              <svg
                width="8"
                height="6"
                viewBox="0 0 8 6"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1 3l2 2 4-4"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex-1 min-w-0">
          {/* Name + percentage row */}
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <span
              style={{ color: "var(--color-text-primary)" }}
              className="text-sm font-semibold truncate"
            >
              {framework.name}
            </span>
            <span
              style={{
                color: isCertified ? "var(--color-green)" : "var(--color-text-secondary)",
              }}
              className="text-sm font-bold tabular-nums flex-shrink-0"
            >
              {framework.percentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="w-full rounded-full overflow-hidden mb-2.5"
            style={{
              height: 3,
              backgroundColor: "var(--color-border)",
            }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${framework.percentage}%`,
                backgroundColor: isCertified
                  ? "var(--color-green)"
                  : "var(--color-accent)",
                transition: "width 0.4s ease",
              }}
            />
          </div>

          {/* Bottom line: audit info + status pill */}
          <div className="flex items-center justify-between gap-2">
            {isCertified ? (
              <span
                style={{ color: "var(--color-text-muted)" }}
                className="text-xs truncate"
              >
                {framework.auditor} · Valid through{" "}
                {framework.validThrough ? formatDate(framework.validThrough) : ""}
              </span>
            ) : (
              <span
                style={{ color: "var(--color-text-muted)" }}
                className="text-xs truncate"
              >
                Audit target {framework.auditTarget}
              </span>
            )}

            {/* Status pill */}
            {isCertified ? (
              <span
                className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(16,185,129,0.15)",
                  color: "var(--color-green)",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
              >
                Certified
              </span>
            ) : (
              <span
                className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{
                  backgroundColor: "rgba(245,158,11,0.12)",
                  color: "var(--color-amber)",
                  border: "1px solid rgba(245,158,11,0.25)",
                }}
              >
                In progress
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
