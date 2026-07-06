import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 pt-8">
      <div className="liquid-surface relative overflow-hidden rounded-[2.5rem] p-6 md:p-10">
        <div className="min-h-[520px]">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-black/50">
              spatial analysis prototype
            </p>
            <h1 className="font-dot mx-auto max-w-5xl text-[clamp(3.1rem,8vw,7.8rem)] font-black uppercase leading-[0.92] tracking-[0.04em] text-black">
              Public Space Behavior Analysis Platform
            </h1>
          </div>
          <div className="mx-auto mt-16 grid max-w-4xl gap-6">
            <div className="liquid-soft rounded-[2rem] p-6 text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
                Tool introduction
              </div>
              <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-black/70">
                Load a public-space model, configure user groups and spatial programs, then
                generate computed masterplan and 3D overlays for movement, staying behavior,
                program popularity, user composition, and time-slot variation.
              </p>
              <div className="mt-6 flex justify-center">
              <Link
                href="/scale"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                Start Analysis <ArrowUpRight size={18} />
              </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
