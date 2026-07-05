import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-8">
      <div className="liquid-surface relative overflow-hidden rounded-[2.5rem] p-6 md:p-10">
        <div className="pointer-events-none absolute inset-x-20 top-28 hidden h-px bg-black/10 md:block" />
        <div className="pointer-events-none absolute left-1/2 top-28 hidden h-48 w-px bg-black/10 md:block" />
        <div className="min-h-[560px]">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
              spatial analysis prototype
            </p>
            <h1 className="font-dot mx-auto max-w-5xl text-[clamp(3.1rem,8vw,7.8rem)] font-black uppercase leading-[0.92] tracking-[0.04em] text-black">
              Public Space Behavior Analysis Tool
            </h1>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-6">
            <div className="liquid-soft relative mx-auto flex h-24 w-24 items-center justify-center rounded-[1.6rem]">
              <div className="grid grid-cols-3 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <span
                    key={item}
                    className={`h-3 w-3 rounded-full ${item === 4 ? "bg-white" : "bg-black"}`}
                  />
                ))}
              </div>
            </div>
            <div className="liquid-soft rounded-[2rem] p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Tool introduction
              </div>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-black/70">
                This tool helps architects analyze public space behavior by loading a site model,
                defining user types, programs, activities, entrances, exits, and operation hours,
                then generating plan and 3D model overlays showing movement, activities, user
                types, programs, and time-based behavior.
              </p>
              <div className="mt-6 flex justify-center">
              <Link
                href="/load-model"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                Start from Model Load <ArrowUpRight size={18} />
              </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
