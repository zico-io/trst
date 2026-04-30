// apps/web/components/FrameworkCard.tsx
import type { FrameworkDisplayCard } from "@/lib/types";
import { Badge, Card, Progress, cn } from "@trst/ui";
import Link from "next/link";

interface FrameworkCardProps {
  framework: FrameworkDisplayCard;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function FrameworkCard({ framework }: FrameworkCardProps) {
  const isCertified = framework.status === "certified";

  return (
    <Link href={`/frameworks/${framework.id}`} className="block transition-opacity hover:opacity-90">
      <Card
        className="p-5 rounded-xl"
        style={
          isCertified
            ? {
                backgroundColor: "var(--color-green-bg)",
                borderColor: "var(--color-green-border)",
                backgroundImage:
                  "linear-gradient(135deg, rgba(16,185,129,0.07) 0%, transparent 60%)",
              }
            : {
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
              }
        }
      >
        <div className="flex items-start gap-4">
          {/* Emoji badge */}
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
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none" aria-hidden="true">
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
            {/* Name + percentage */}
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
            <Progress
              value={framework.percentage}
              className={cn(
                "h-[3px] mb-2.5 bg-[var(--color-border)]",
                isCertified
                  ? "[&>div]:bg-[var(--color-green)]"
                  : "[&>div]:bg-[var(--color-accent)]"
              )}
            />

            {/* Audit info + status pill */}
            <div className="flex items-center justify-between gap-2">
              {isCertified ? (
                <span style={{ color: "var(--color-text-muted)" }} className="text-xs truncate">
                  {framework.auditor} · Valid through{" "}
                  {framework.validThrough ? formatDate(framework.validThrough) : ""}
                </span>
              ) : (
                <span style={{ color: "var(--color-text-muted)" }} className="text-xs truncate">
                  Audit target {framework.auditTarget}
                </span>
              )}

              <Badge
                className={cn(
                  "flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border",
                  isCertified
                    ? "bg-[rgba(16,185,129,0.15)] text-[var(--color-green)] border-[rgba(16,185,129,0.3)]"
                    : "bg-[rgba(245,158,11,0.12)] text-[var(--color-amber)] border-[rgba(245,158,11,0.25)]"
                )}
              >
                {isCertified ? "Certified" : "In progress"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
