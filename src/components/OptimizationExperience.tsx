"use client";

import { useEffect, useMemo, useState } from "react";
import { createFallbackInputs, generateOverlayData } from "@/lib/analysis";
import { generateOptimizationEffects } from "@/lib/generateOptimizationEffects";
import { storageKeys } from "@/lib/defaultOptions";
import { OptimizationControlPanel } from "@/components/OptimizationControlPanel";
import { OptimizationEffectMetrics } from "@/components/OptimizationEffectMetrics";
import { OptimizationModelView } from "@/components/OptimizationModelView";
import { OptimizationPlanView } from "@/components/OptimizationPlanView";
import type { GeneratedOverlay, OptimizationSelection } from "@/types";

export function OptimizationExperience() {
  const fallbackOverlay = useMemo(() => generateOverlayData(createFallbackInputs()), []);
  const [overlay, setOverlay] = useState<GeneratedOverlay>(fallbackOverlay);
  const [selected, setSelected] = useState<OptimizationSelection>({
    shades: true,
    benches: true,
    stairs: false
  });

  useEffect(() => {
    const storedOverlay = window.localStorage.getItem(storageKeys.generatedOverlay);
    if (storedOverlay) {
      try {
        setOverlay(JSON.parse(storedOverlay) as GeneratedOverlay);
      } catch {
        setOverlay(fallbackOverlay);
      }
    }
  }, [fallbackOverlay]);

  const effects = useMemo(() => generateOptimizationEffects(overlay, selected), [overlay, selected]);

  function toggle(key: keyof OptimizationSelection) {
    setSelected((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8">
      <section className="liquid-surface rounded-[2rem] p-6">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
          Optimization effects
        </div>
        <h1 className="font-dot mt-3 max-w-5xl text-5xl font-black uppercase leading-tight text-black">
          Test design interventions and compare simulated behavior effects.
        </h1>
      </section>
      <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
        <div className="grid content-start gap-6">
          <OptimizationControlPanel selected={selected} onToggle={toggle} />
          <OptimizationEffectMetrics metrics={effects.metrics} />
        </div>
        <div className="grid gap-6">
          <OptimizationPlanView overlay={overlay} effects={effects} />
          <OptimizationModelView overlay={overlay} effects={effects} />
        </div>
      </div>
    </main>
  );
}
