import Link from "next/link";
import { ArrowRight, Activity, Map, Boxes } from "lucide-react";

export function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-14">
      <div className="flex flex-col justify-center">
        <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/70">
          Architecture research prototype
        </div>
        <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
          Public Space Behaviour Diagnostic Tool
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70">
          A data-informed platform for diagnosing inactivity and congestion in public spaces.
          The prototype uses Beijing Tuspark to connect spatial models, behaviour data, and
          design decision support.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/data-input"
            className="inline-flex items-center gap-2 rounded-md bg-signal px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#ef9b55]"
          >
            Start Analysis <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link
            href="/case-study"
            className="rounded-md border border-white/10 px-5 py-3 text-sm font-semibold text-white/100 transition hover:bg-white/10"
          >
            View Tuspark Case
          </Link>
        </div>
      </div>
      <div className="glass-panel overflow-hidden rounded-lg">
        <div className="border-b border-white/10 px-4 py-3 text-sm text-white/70">
          Live diagnostic preview
        </div>
        <div className="relative aspect-[4/3] fine-grid overflow-hidden bg-[#f4f2ec]">
          <img
            src="/images/tuspark-plan.jpg"
            alt="Tuspark public space plan"
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
          <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full">
            <path
              d="M48 70 C49 56 47 42 52 31 C61 26 72 28 90 33"
              fill="none"
              stroke="#e35d4f"
              strokeLinecap="round"
              strokeWidth="3.8"
              opacity="0.82"
            />
            <path
              d="M10 14 C25 18 40 25 52 31"
              fill="none"
              stroke="#d88945"
              strokeLinecap="round"
              strokeWidth="3.2"
              opacity="0.74"
            />
            <path
              d="M58 20 L76 20 L77 31 L61 34 Z"
              fill="#3d8bff"
              opacity="0.28"
              stroke="#3d8bff"
              strokeWidth="0.6"
            />
            <path
              d="M43 27 L62 26 L68 39 L55 48 L42 42 Z"
              fill="#e35d4f"
              opacity="0.28"
              stroke="#e35d4f"
              strokeWidth="0.8"
            />
          </svg>
          <div className="absolute bottom-4 left-4 grid gap-2 sm:grid-cols-3">
            {[
              { icon: Activity, label: "1,080 users", value: "observed" },
              { icon: Map, label: "6 user groups", value: "classified" },
              { icon: Boxes, label: "6 zones", value: "diagnosed" }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-md border border-white/10 bg-ink/100 px-3 py-2 text-xs"
              >
                <item.icon size={15} className="mb-1 text-signal" aria-hidden="true" />
                <div className="font-semibold text-white">{item.label}</div>
                <div className="text-white/50">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
