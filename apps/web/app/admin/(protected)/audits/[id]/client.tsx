"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Circle, Loader, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import type { RunStep, RunMetadata, StepName } from "@trst/shared";

// ── Inferred DB row types ─────────────────────────────────────────────────────

type AuditRun = {
  id: string;
  repoId: string;
  status: "pending" | "running" | "complete" | "failed";
  startedAt: Date | string;
  completedAt?: Date | string | null;
  metadata?: RunMetadata | null;
};

type Finding = {
  id: string;
  auditRunId: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  controlRef: string;
  frameworkId: string;
  title: string;
  detail: string;
  remediationGuide: string;
  status: "open" | "in-progress" | "resolved" | "suppressed";
  createdAt: Date | string;
};

type ControlStatus = {
  frameworkId: string;
  controlId: string;
  status: "passing" | "partial" | "failing" | "not-applicable";
  score: number;
  lastAuditRunId: string;
};

// ── Step display config ───────────────────────────────────────────────────────

const STEP_LABELS: Record<StepName, string> = {
  code_audit: "Code Audit",
  policy_audit: "Policy Audit",
  process_audit: "Process Audit",
  gap_mapping: "Gap Mapping",
  persist: "Persist Findings",
  issue_sync: "Issue Sync",
};

const AUDITOR_STEPS: StepName[] = ["code_audit", "policy_audit", "process_audit"];
const SEQUENTIAL_STEPS: StepName[] = ["gap_mapping", "persist", "issue_sync"];

// ── Utility helpers ───────────────────────────────────────────────────────────

function elapsed(from: string | Date, to?: string | Date | null): string {
  const start = new Date(from).getTime();
  const end = to ? new Date(to).getTime() : Date.now();
  const s = Math.floor((end - start) / 1000);
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

// ── Step icon ─────────────────────────────────────────────────────────────────

function StepIcon({ status }: { status: RunStep["status"] }) {
  if (status === "running") {
    return (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        className="flex text-amber-400"
      >
        <Loader size={15} strokeWidth={2.5} />
      </motion.div>
    );
  }
  if (status === "complete") return <CheckCircle size={15} strokeWidth={2} className="text-green-500" />;
  if (status === "failed") return <XCircle size={15} strokeWidth={2} className="text-red-500" />;
  return <Circle size={15} strokeWidth={1.5} className="text-white/20" />;
}

// ── Severity badge ────────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<Finding["severity"], string> = {
  critical: "bg-red-500/15 text-red-400 border-red-500/20",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  info: "bg-white/5 text-white/40 border-white/10",
};

function SeverityBadge({ severity }: { severity: Finding["severity"] }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${SEVERITY_STYLES[severity]}`}>
      {severity}
    </span>
  );
}

// ── Control status pills ──────────────────────────────────────────────────────

const CS_STYLES: Record<ControlStatus["status"], string> = {
  passing: "bg-green-500/15 text-green-400",
  partial: "bg-amber-500/15 text-amber-400",
  failing: "bg-red-500/15 text-red-400",
  "not-applicable": "bg-white/5 text-white/30",
};

// ── Step row ──────────────────────────────────────────────────────────────────

function StepRow({ step, indent = false }: { step: RunStep; indent?: boolean }) {
  const isRunning = step.status === "running";
  const isDone = step.status === "complete" || step.status === "failed";
  const duration = isDone && step.startedAt ? elapsed(step.startedAt, step.completedAt) : null;
  const runningFor = isRunning && step.startedAt ? elapsed(step.startedAt) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex items-center gap-3 py-3.5 pr-5 ${indent ? "pl-10" : "pl-5"} ${isRunning ? "bg-amber-400/[0.025]" : ""}`}
    >
      {isRunning && (
        <span className="absolute left-0 inset-y-0 w-0.5 rounded-r-full bg-amber-400/35" />
      )}
      <span className="flex-shrink-0"><StepIcon status={step.status} /></span>
      <span
        className="flex-1 text-sm"
        style={{
          color: step.status === "pending"
            ? "var(--color-text-muted)"
            : step.status === "complete"
            ? "var(--color-text-primary)"
            : "var(--color-text-secondary)",
        }}
      >
        {STEP_LABELS[step.name]}
      </span>
      {(duration || runningFor) && (
        <span className="text-xs tabular-nums font-mono" style={{ color: "var(--color-text-muted)" }}>
          {duration ?? runningFor}
        </span>
      )}
    </motion.div>
  );
}

// ── Finding row ───────────────────────────────────────────────────────────────

function FindingRow({ finding }: { finding: Finding }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b last:border-0" style={{ borderColor: "var(--color-border)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-5 py-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <SeverityBadge severity={finding.severity} />
        <span className="flex-1 min-w-0">
          <span className="text-sm block truncate" style={{ color: "var(--color-text-primary)" }}>
            {finding.title}
          </span>
          <span className="text-xs mt-0.5 block" style={{ color: "var(--color-text-muted)" }}>
            {finding.frameworkId.toUpperCase()} · {finding.controlRef}
          </span>
        </span>
        {open ? (
          <ChevronUp size={14} className="flex-shrink-0 mt-1" style={{ color: "var(--color-text-muted)" }} />
        ) : (
          <ChevronDown size={14} className="flex-shrink-0 mt-1" style={{ color: "var(--color-text-muted)" }} />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3">
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {finding.detail}
              </p>
              <div
                className="rounded-lg px-4 py-3 border text-sm leading-relaxed"
                style={{
                  backgroundColor: "var(--color-bg)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-text-secondary)",
                }}
              >
                <span className="text-xs font-medium mb-1 block" style={{ color: "var(--color-text-muted)" }}>
                  Remediation
                </span>
                {finding.remediationGuide}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialRun: AuditRun;
  initialFindings: Finding[];
  initialControlStatuses: ControlStatus[];
}

export function AuditRunDetail({ initialRun, initialFindings, initialControlStatuses }: Props) {
  const [run, setRun] = useState(initialRun);
  const [runFindings, setFindings] = useState(initialFindings);
  const [controlSt, setControlStatuses] = useState(initialControlStatuses);
  const isLive = run.status === "pending" || run.status === "running";
  useNow(isLive); // triggers re-renders for live elapsed time display

  // Polling
  useEffect(() => {
    if (!isLive) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/audit-runs/${run.id}`);
        if (!res.ok) return;
        const data = await res.json();
        setRun(data.run);
        setFindings(data.findings);
        setControlStatuses(data.controlStatuses);
      } catch {
        // network blip — keep polling
      }
    }, 2500);
    return () => clearInterval(id);
  }, [run.id, isLive]);

  const steps: RunStep[] = run.metadata?.steps ?? [];
  const auditorSteps = steps.filter((s) => AUDITOR_STEPS.includes(s.name));
  const sequentialSteps = steps.filter((s) => SEQUENTIAL_STEPS.includes(s.name));

  // Control status grouped by framework
  const byFramework = controlSt.reduce<Record<string, { passing: number; partial: number; failing: number }>>(
    (acc, cs) => {
      if (!acc[cs.frameworkId]) acc[cs.frameworkId] = { passing: 0, partial: 0, failing: 0 };
      if (cs.status === "passing") acc[cs.frameworkId].passing++;
      else if (cs.status === "partial") acc[cs.frameworkId].partial++;
      else if (cs.status === "failing") acc[cs.frameworkId].failing++;
      return acc;
    },
    {}
  );

  const totalDuration =
    run.completedAt
      ? elapsed(run.startedAt, run.completedAt)
      : isLive
      ? elapsed(run.startedAt)
      : null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm transition-colors"
        style={{ color: "var(--color-text-muted)" }}
      >
        <ArrowLeft size={14} />
        Overview
      </Link>

      {/* Header */}
      <div
        className="rounded-xl border px-6 py-5 flex flex-wrap items-start gap-4"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-xs font-mono" style={{ color: "var(--color-text-muted)" }}>
            {run.id}
          </p>
          <p className="text-lg font-semibold font-mono truncate" style={{ color: "var(--color-text-primary)" }}>
            {run.repoId}
          </p>
          <div className="flex flex-wrap gap-4 text-xs pt-0.5" style={{ color: "var(--color-text-muted)" }}>
            <span>Started {new Date(run.startedAt).toLocaleString()}</span>
            {totalDuration && <span>Duration: {totalDuration}</span>}
            {runFindings.length > 0 && <span>{runFindings.length} finding{runFindings.length !== 1 ? "s" : ""}</span>}
          </div>
        </div>
        <StatusBadge status={run.status} />
      </div>

      {/* Step timeline */}
      {steps.length > 0 && (
        <section
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div
            className="px-5 py-3 border-b text-xs font-medium uppercase tracking-wider"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            Pipeline
          </div>
          <div className="py-2">
            {/* Auditors group — left rail to show parallel grouping */}
            {auditorSteps.length > 0 && (
              <div className="mb-1">
                <div className="px-5 pt-2 pb-1 text-[11px] tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                  Auditors <span className="opacity-40">· parallel</span>
                </div>
                <div className="ml-5 border-l-2 border-white/[0.06]">
                  {auditorSteps.map((step) => (
                    <StepRow key={step.name} step={step} indent />
                  ))}
                </div>
              </div>
            )}
            {/* Subtle inset separator between group and sequential steps */}
            {auditorSteps.length > 0 && sequentialSteps.length > 0 && (
              <div className="mx-5 my-2 border-t border-white/[0.05]" />
            )}
            {/* Sequential steps */}
            {sequentialSteps.map((step) => (
              <StepRow key={step.name} step={step} />
            ))}
          </div>
        </section>
      )}

      {/* Control status breakdown */}
      {Object.keys(byFramework).length > 0 && (
        <section
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div
            className="px-5 py-3 border-b text-xs font-medium uppercase tracking-wider"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            Control Coverage
          </div>
          <div className="px-5 py-4 flex flex-wrap gap-6">
            {Object.entries(byFramework).map(([fw, counts]) => (
              <div key={fw} className="space-y-1.5">
                <p className="text-xs font-medium uppercase" style={{ color: "var(--color-text-muted)" }}>
                  {fw}
                </p>
                <div className="flex gap-1.5">
                  {counts.passing > 0 && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${CS_STYLES.passing}`}>
                      {counts.passing} passing
                    </span>
                  )}
                  {counts.partial > 0 && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${CS_STYLES.partial}`}>
                      {counts.partial} partial
                    </span>
                  )}
                  {counts.failing > 0 && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${CS_STYLES.failing}`}>
                      {counts.failing} failing
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Findings */}
      {runFindings.length > 0 && (
        <section
          className="rounded-xl border overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <div
            className="px-5 py-3 border-b text-xs font-medium uppercase tracking-wider"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            Findings ({runFindings.length})
          </div>
          <div>
            {runFindings
              .slice()
              .sort((a, b) => {
                const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                return order[a.severity] - order[b.severity];
              })
              .map((f) => (
                <FindingRow key={f.id} finding={f} />
              ))}
          </div>
        </section>
      )}

      {/* Empty state while running */}
      {isLive && runFindings.length === 0 && (
        <div
          className="rounded-xl border px-5 py-8 text-sm text-center"
          style={{
            backgroundColor: "var(--color-surface)",
            borderColor: "var(--color-border)",
            color: "var(--color-text-muted)",
          }}
        >
          Findings will appear here as the audit progresses.
        </div>
      )}
    </div>
  );
}
