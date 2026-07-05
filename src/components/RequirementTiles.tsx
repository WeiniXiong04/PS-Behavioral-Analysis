import { Box, Clock, Map, MousePointer2 } from "lucide-react";

const requirements = [
  {
    icon: Box,
    title: "3D Site Model",
    text: "Required format: .glb or .gltf"
  },
  {
    icon: Map,
    title: "Masterplan",
    text: "Plan image or SVG base"
  },
  {
    icon: Clock,
    title: "User Scale",
    text: "User types, programs, activities, operation hours"
  },
  {
    icon: MousePointer2,
    title: "Plan Identification",
    text: "Entrance, exit, and program locations"
  }
];

export function RequirementTiles() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16">
      <div className="mb-5 flex items-center justify-between border-b border-black/10 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/60">
          What you will need
        </h2>
        <span className="rounded-full border border-black/10 px-3 py-1 text-xs text-black/50">
          four inputs
        </span>
      </div>
      <div className="grid gap-5 md:grid-cols-4">
        {requirements.map((item, index) => (
          <article key={item.title} className="liquid-surface rounded-[2rem] p-5">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/40 shadow-inner backdrop-blur-xl">
                <item.icon size={20} aria-hidden="true" />
              </div>
              <span className="text-xs text-black/40">/0{index + 1}</span>
            </div>
            <h3 className="font-dot mt-10 text-2xl font-black uppercase text-black">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-black/55">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
