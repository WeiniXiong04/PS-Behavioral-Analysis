"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, RotateCw } from "lucide-react";
import { BehaviourMasterplanViewer } from "@/components/BehaviourMasterplanViewer";
import { BehaviourPatternViewer } from "@/components/BehaviourPatternViewer";
import {
  buildBehaviourDataset,
  defaultCoefficients,
  type ModelCoefficients
} from "@/lib/behaviorModel";
import { createFallbackInputs } from "@/lib/analysis";
import { storageKeys } from "@/lib/defaultOptions";
import type { ScaleInputs } from "@/types";

export function OutputExperience() {
  const [inputs, setInputs] = useState<ScaleInputs | null>(null);
  const [coefficients, setCoefficients] = useState<ModelCoefficients>(defaultCoefficients);

  useEffect(() => {
    const savedInputs = window.localStorage.getItem(storageKeys.scaleInputs);
    const savedCoefficients = window.localStorage.getItem(storageKeys.modelCoefficients);

    if (savedInputs) {
      try {
        setInputs(JSON.parse(savedInputs) as ScaleInputs);
      } catch {
        setInputs(createFallbackInputs());
      }
    } else {
      setInputs(createFallbackInputs());
    }

    if (savedCoefficients) {
      try {
        setCoefficients({ ...defaultCoefficients, ...JSON.parse(savedCoefficients) });
      } catch {
        setCoefficients(defaultCoefficients);
      }
    }
  }, []);

  const dataset = useMemo(
    () => buildBehaviourDataset(inputs ?? createFallbackInputs(), coefficients),
    [inputs, coefficients]
  );
  const initialSlot = dataset.timeSlots[1]?.id ?? dataset.timeSlots[0]?.id ?? "morning";
  const [timeSlotId, setTimeSlotId] = useState(initialSlot);

  useEffect(() => {
    if (!dataset.timeSlots.some((slot) => slot.id === timeSlotId)) {
      setTimeSlotId(dataset.timeSlots[0]?.id ?? "morning");
    }
  }, [dataset.timeSlots, timeSlotId]);

  const cIndex = dataset.diagnostics.cIndex;

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8">
      <section className="liquid-surface rounded-[2rem] p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Analysis / results
            </div>
            <h1 className="font-dot mt-3 text-4xl font-black uppercase leading-none text-black md:text-6xl">
              Computed Behaviour Output
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-black/60">
              These plan and 3D overlays are rebuilt from the Configure page: regional raw scores,
              dynamic entrance weights, and softmax choice probabilities drive flows, hotspots,
              program popularity, and time-slot variation.
            </p>
          </div>
          <div className="grid min-w-[260px] gap-3">
            <div className="liquid-soft rounded-[1.4rem] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                C-index validation
              </div>
              <div className="mt-2 flex items-end justify-between gap-4">
                <span className="font-dot text-4xl font-black text-black">{cIndex.toFixed(2)}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    cIndex > 0.7 ? "bg-[#d7e5de] text-[#24483b]" : "bg-[#f2dfd6] text-[#7b3c2b]"
                  }`}
                >
                  {cIndex > 0.7 ? "good match" : "needs calibration"}
                </span>
              </div>
            </div>
            <Link
              href="/scale"
              className="glass-chip inline-flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold text-black transition hover:scale-[1.01]"
            >
              Adjust Configure Inputs <RotateCw size={15} />
            </Link>
          </div>
        </div>
      </section>

      <BehaviourMasterplanViewer dataset={dataset} timeSlotId={timeSlotId} onTimeSlotChange={setTimeSlotId} />
      <BehaviourPatternViewer dataset={dataset} timeSlotId={timeSlotId} onTimeSlotChange={setTimeSlotId} />
      <div className="flex flex-wrap justify-end gap-3">
        <Link
          href="/methodology"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-black/10 bg-white/40 px-6 text-sm font-semibold text-black transition hover:scale-[1.02]"
        >
          View Methodology <ArrowUpRight size={18} />
        </Link>
        <Link
          href="/optimization-effects"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:scale-[1.02]"
        >
          Continue to Optimization Effects <ArrowUpRight size={18} />
        </Link>
      </div>
    </main>
  );
}
