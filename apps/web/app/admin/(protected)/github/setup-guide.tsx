interface Props {
  baseUrl: string;
}

interface Step {
  n: number;
  heading: string;
  detail?: string;
  code?: string;
  codeColor?: string;
  dimmed?: boolean;
}

const dotStyle = {
  green: {
    backgroundColor: "var(--color-green-bg)",
    color: "var(--color-green)",
    borderColor: "var(--color-green-border)",
  },
  blue: {
    backgroundColor: "var(--color-accent-bg, #1e3a5f)",
    color: "var(--color-accent)",
    borderColor: "var(--color-accent)",
  },
  muted: {
    backgroundColor: "var(--color-surface)",
    color: "var(--color-text-muted)",
    borderColor: "var(--color-border)",
  },
} as const;

export function SetupGuide({ baseUrl }: Props) {
  const steps: Step[] = [
    {
      n: 1,
      heading: "Create a GitHub App",
      detail: "Go to GitHub → Settings → Developer settings → GitHub Apps → New GitHub App.",
      code: "github.com/settings/apps/new",
      codeColor: "var(--color-accent)",
    },
    {
      n: 2,
      heading: "Set the Setup URL",
      detail: "GitHub calls this endpoint after the app is installed.",
      code: `${baseUrl}/api/github/install`,
    },
    {
      n: 3,
      heading: "Set OAuth Callback URL",
      detail: "Required for the admin login flow.",
      code: `${baseUrl}/api/auth/callback/github`,
    },
    {
      n: 4,
      heading: "Enable repository permissions",
      detail: "Contents: Read-only · Issues: Read & write · Metadata: Read-only",
    },
    {
      n: 5,
      heading: "Download private key & copy credentials",
      detail:
        "Generate a private key from the app's settings page. Copy App ID, Client ID, Client Secret, and Webhook Secret into the form.",
    },
    {
      n: 6,
      heading: "Install the app",
      detail: 'The "Install App" button appears after saving credentials.',
      dimmed: true,
    },
  ];

  return (
    <div
      className="rounded-xl border p-6"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <h2
        className="text-xs font-semibold uppercase tracking-widest mb-5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Setup Guide
      </h2>

      <ol className="relative" style={{ paddingLeft: "0" }}>
        <div
          className="absolute"
          style={{
            left: "9px",
            top: "20px",
            bottom: "8px",
            width: "1px",
            backgroundColor: "var(--color-border)",
          }}
          aria-hidden="true"
        />

        {steps.map((step) => {
          const dotVariant = step.dimmed ? "muted" : step.n === 1 ? "green" : "blue";

          return (
            <li
              key={step.n}
              className="flex gap-3 mb-5 last:mb-0 relative"
              style={{ opacity: step.dimmed ? 0.45 : 1 }}
            >
              <div
                className="flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-bold z-10"
                style={dotStyle[dotVariant]}
              >
                {step.n}
              </div>

              <div className="flex-1 pt-0.5">
                <p
                  className="text-xs font-semibold mb-1"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {step.heading}
                </p>
                {step.detail && (
                  <p
                    className="text-xs leading-relaxed mb-1.5"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {step.detail}
                  </p>
                )}
                {step.code && (
                  <code
                    className="block text-[10px] rounded px-2 py-1 break-all"
                    style={{
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      color: step.codeColor ?? "var(--color-text-secondary)",
                    }}
                  >
                    {step.code}
                  </code>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
