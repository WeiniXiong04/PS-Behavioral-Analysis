"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", match: "/", label: "Home" },
  { href: "/scale", match: "/scale", label: "Configure" },
  { href: "/output", match: "/output", label: "Analysis" },
  { href: "/optimization-effects", match: "/optimization-effects", label: "Optimization" },
  { href: "/methodology", match: "/methodology", label: "Methodology" }
];

export function NavigationBanner() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="liquid-surface mx-auto flex max-w-7xl items-center justify-between rounded-full px-3 py-2">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-base font-black tracking-[-0.04em] text-white"
          aria-label="Public Space Behavior Analysis Platform"
        >
          B.
        </Link>
        <nav aria-label="Primary navigation" className="flex max-w-[calc(100vw-5.5rem)] items-center gap-1 overflow-x-auto rounded-full bg-white/30 p-1 shadow-inner backdrop-blur-xl">
          {navItems.map((item) => {
            const active = pathname === item.match || (item.match !== "/" && pathname.startsWith(item.match));
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] transition ${
                  active ? "bg-black text-white" : "text-black/55 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
