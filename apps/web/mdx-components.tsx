import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1
        style={{ color: "var(--color-text-primary)" }}
        className="text-2xl font-bold tracking-tight mt-8 mb-4"
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        style={{ color: "var(--color-text-primary)" }}
        className="text-xl font-semibold tracking-tight mt-6 mb-3"
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        style={{ color: "var(--color-text-secondary)" }}
        className="text-base font-semibold mt-5 mb-2"
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p
        style={{ color: "var(--color-text-secondary)" }}
        className="text-sm leading-relaxed mb-4"
      >
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <ul
        style={{ color: "var(--color-text-secondary)" }}
        className="text-sm list-disc list-inside space-y-1 mb-4"
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        style={{ color: "var(--color-text-secondary)" }}
        className="text-sm list-decimal list-inside space-y-1 mb-4"
      >
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    hr: () => (
      <hr
        style={{ borderColor: "var(--color-border)" }}
        className="my-8"
      />
    ),
    strong: ({ children }) => (
      <strong
        style={{ color: "var(--color-text-primary)" }}
        className="font-semibold"
      >
        {children}
      </strong>
    ),
    code: ({ children }) => (
      <code
        style={{
          backgroundColor: "var(--color-surface)",
          color: "var(--color-accent)",
          border: "1px solid var(--color-border)",
        }}
        className="text-xs px-1.5 py-0.5 rounded font-mono"
      >
        {children}
      </code>
    ),
    ...components,
  };
}
