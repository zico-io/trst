import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/llm", label: "LLM Keys" },
  { href: "/admin/github", label: "GitHub App" },
  { href: "/admin/repos", label: "Repos" },
  { href: "/admin/issue-backend", label: "Issue Backend" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Sidebar */}
      <aside
        className="w-56 shrink-0 border-r flex flex-col"
        style={{
          backgroundColor: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div
          className="px-5 py-4 border-b text-sm font-semibold tracking-tight"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-text-primary)",
          }}
        >
          Platform Admin
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-lg text-sm transition-colors nav-link"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          className="px-5 py-4 border-t space-y-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {session.user?.name ?? session.user?.email}
          </p>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/admin/login" });
            }}
          >
            <button
              type="submit"
              className="text-xs transition-colors"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
