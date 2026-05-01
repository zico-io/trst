// apps/web/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bask Health Trust Center",
  description:
    "Bask Health's security, compliance, and privacy posture — continuously monitored.",
  openGraph: {
    title: "Bask Health Trust Center",
    description: "Built for trust in healthcare.",
    siteName: "Bask Health",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        {children}
      </body>
    </html>
  );
}
