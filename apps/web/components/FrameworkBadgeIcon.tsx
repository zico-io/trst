// apps/web/components/FrameworkBadgeIcon.tsx
import type { FrameworkId } from "@trst/shared";

interface Props {
  id: FrameworkId;
  /** Width/height in px passed to the svg element */
  size?: number;
}

// HIPAA — medical cross (healthcare symbol)
function HipaaIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="7.5" y="2" width="5" height="16" rx="2" />
      <rect x="2" y="7.5" width="16" height="5" rx="2" />
    </svg>
  );
}

// SOC 2 — shield with checkmark (AICPA audit mark)
function Soc2Icon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 1.5 L2 4.5 V10.5 C2 15 5.5 18.5 10 20 C14.5 18.5 18 15 18 10.5 V4.5 Z"
        stroke="white"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="white"
        fillOpacity="0.15"
      />
      <path
        d="M6.5 10.5 L9 13 L14 8"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// GDPR — EU circle of 12 five-pointed stars (EU emblem, per official flag geometry)
// Stars at radius 7 from centre (10,10), outer radius 1.5, inner radius 0.6
function GdprIcon({ size }: { size: number }) {
  // Five-pointed star path centred at origin
  const star =
    "M0,-1.5 L0.353,-0.485 L1.427,-0.464 L0.571,0.185 L0.882,1.214 L0,0.6 L-0.882,1.214 L-0.571,0.185 L-1.427,-0.464 L-0.353,-0.485 Z";

  // 12 positions clockwise from top, radius 7
  const R = 7;
  const positions = Array.from({ length: 12 }, (_, i) => {
    const θ = (i * 30 * Math.PI) / 180;
    return { x: 10 + R * Math.sin(θ), y: 10 - R * Math.cos(θ) };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="white"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {positions.map((p, i) => (
        <path key={i} d={star} transform={`translate(${p.x.toFixed(2)},${p.y.toFixed(2)})`} />
      ))}
    </svg>
  );
}

// ISO 27001 — padlock (Information Security Management System)
function Iso27001Icon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="white"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Shackle */}
      <path d="M6.5 9V6.5a3.5 3.5 0 0 1 7 0V9" />
      {/* Body */}
      <rect x="3.5" y="9" width="13" height="9.5" rx="2" fill="white" fillOpacity="0.15" />
      {/* Keyhole dot */}
      <circle cx="10" cy="13.5" r="1.2" fill="white" stroke="none" />
      {/* Keyhole stem */}
      <line x1="10" y1="14.5" x2="10" y2="16.5" stroke="white" strokeWidth="1.4" />
    </svg>
  );
}

// HITRUST — shield with H letterform
function HitrustIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 1.5 L2 4.5 V10.5 C2 15 5.5 18.5 10 20 C14.5 18.5 18 15 18 10.5 V4.5 Z"
        fill="white"
        fillOpacity="0.15"
        stroke="white"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M7 7v6M13 7v6M7 10h6"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FrameworkBadgeIcon({ id, size = 22 }: Props) {
  switch (id) {
    case "hipaa":
      return <HipaaIcon size={size} />;
    case "soc2":
      return <Soc2Icon size={size} />;
    case "gdpr":
      return <GdprIcon size={size} />;
    case "iso27001":
      return <Iso27001Icon size={size} />;
    case "hitrust":
      return <HitrustIcon size={size} />;
    default: {
      const _exhaustive: never = id;
      throw new Error(`No badge icon for framework: ${_exhaustive}`);
    }
  }
}
