import { SiteModelCanvas } from "@/components/SiteModelCanvas";
import type { GeneratedOverlay, OptimizationEffects } from "@/types";

interface OptimizationModelViewProps {
  overlay: GeneratedOverlay;
  effects: OptimizationEffects;
}

export function OptimizationModelView({ overlay, effects }: OptimizationModelViewProps) {
  return (
    <section className="liquid-surface overflow-hidden rounded-[2rem]">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/45">
          3D model with optimization changes
        </h2>
        <span className="glass-chip rounded-full px-3 py-1 text-xs text-black/45">
          shades / benches / stairs
        </span>
      </div>
      <SiteModelCanvas overlay={overlay} selectedTimeSlotId={overlay.selectedTimeSlotId} optimizations={effects} />
    </section>
  );
}
