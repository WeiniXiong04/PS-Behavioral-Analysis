"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { step: 1, match: "/load-model", label: "Model Load" },
  { step: 2, match: "/scale", label: "User Scale" },
  { step: 3, match: "/output", label: "Start Analysis" }
];

export function NavigationBanner() {
  const pathname = usePathname();
  const isOutput = pathname === "/output";
  const isOptimization = pathname === "/optimization-effects";

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="liquid-surface mx-auto flex max-w-7xl items-center justify-between rounded-full px-3 py-2">
        {isOutput || isOptimization ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-base font-black tracking-[-0.04em] text-white">
            B.
          </div>
        ) : (
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-base font-black tracking-[-0.04em] text-white">
            B.
          </Link>
        )}
        {isOptimization ? (
          <div className="glass-chip rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/55">
            Optimization effects
          </div>
        ) : isOutput ? (
          <div className="glass-chip rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/55">
            Output generated
          </div>
        ) : (
          <nav aria-label="Process indicators" className="flex items-center gap-1 rounded-full bg-white/35 p-1 shadow-inner backdrop-blur-xl">
            {navItems.map((item) => (
              <span
                key={item.label}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.02em] ${
                  pathname === item.match ? "bg-black text-white" : "text-black/55"
                }`}
              >
                {item.label}
              </span>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
