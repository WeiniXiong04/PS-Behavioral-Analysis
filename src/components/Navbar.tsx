import Link from "next/link";

const navItems = [
  { href: "/case-study", label: "Case" },
  { href: "/data-input", label: "Data" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/plan-output", label: "Plan" },
  { href: "/model-output", label: "3D" },
  { href: "/method", label: "Method" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="min-w-0">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-white/100">
            Behaviour Diagnostic
          </div>
          <div className="truncate text-xs text-muted">Tuspark public space prototype</div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/data-input"
          className="rounded-md bg-signal px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#ef9b55]"
        >
          Start Analysis
        </Link>
      </div>
    </header>
  );
}
