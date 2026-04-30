import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "trst - Trust Center",
  description: "Trust center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
