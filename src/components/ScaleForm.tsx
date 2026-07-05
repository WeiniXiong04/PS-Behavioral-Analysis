"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { AnalysisAnimation } from "@/components/AnalysisAnimation";
import { MasterplanPreview } from "@/components/MasterplanPreview";
import { ModelPreview } from "@/components/ModelPreview";
import { OptionSelector } from "@/components/OptionSelector";
import { PlanIdentification } from "@/components/PlanIdentification";
import { TimeSlotInput } from "@/components/TimeSlotInput";
import { generateOverlayData } from "@/lib/analysis";
import { defaultCoefficients, type ModelCoefficients } from "@/lib/behaviorModel";
import {
  defaultActivities,
  defaultPrograms,
  defaultTimeSlots,
  defaultUserTypes,
  storageKeys
} from "@/lib/defaultOptions";
import type { ActivityOption, ProgramOption, ScaleInputs, UserTypeOption } from "@/types";

const palette = ["#111111", "#d88945", "#7fa99b", "#879bb1", "#9a7759", "#b7a1cb"];
type LoadState = "idle" | "loading" | "loaded";

export function ScaleForm() {
  const router = useRouter();
  const [locationName, setLocationName] = useState("TusPark Public Space");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [progress, setProgress] = useState(0);
  const [userTypes, setUserTypes] = useState<UserTypeOption[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [markers, setMarkers] = useState<ScaleInputs["markers"]>([]);
  const [opening, setOpening] = useState("08:00");
  const [closing, setClosing] = useState("22:00");
  const [timeSlots, setTimeSlots] = useState(defaultTimeSlots);
  const [coefficients, setCoefficients] = useState<ModelCoefficients>(defaultCoefficients);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const savedInputs = window.localStorage.getItem(storageKeys.scaleInputs);
    const savedCoefficients = window.localStorage.getItem(storageKeys.modelCoefficients);
    const savedModelLoaded = window.localStorage.getItem(storageKeys.modelLoaded);

    if (savedInputs) {
      try {
        const inputs = JSON.parse(savedInputs) as ScaleInputs;
        setUserTypes(inputs.userTypes ?? []);
        setPrograms(inputs.programs ?? []);
        setActivities(inputs.activities ?? []);
        setMarkers(inputs.markers ?? []);
        setOpening(inputs.operationHours?.opening ?? "08:00");
        setClosing(inputs.operationHours?.closing ?? "22:00");
        setTimeSlots(inputs.timeSlots?.length ? inputs.timeSlots : defaultTimeSlots);
      } catch {
        window.localStorage.removeItem(storageKeys.scaleInputs);
      }
    }

    if (savedCoefficients) {
      try {
        setCoefficients({ ...defaultCoefficients, ...JSON.parse(savedCoefficients) });
      } catch {
        window.localStorage.removeItem(storageKeys.modelCoefficients);
      }
    }

    if (savedModelLoaded === "true") {
      setLoadState("loaded");
      setProgress(100);
    }
  }, []);

  const statusText = useMemo(() => {
    if (loadState === "loaded") return "Site model and masterplan loaded";
    if (loadState === "loading") return "Reading TusPark geometry";
    return "Waiting for model input";
  }, [loadState]);

  const isReady = useMemo(() => {
    return (
      loadState === "loaded" &&
      userTypes.length > 0 &&
      programs.length > 0 &&
      activities.length > 0 &&
      markers.some((marker) => marker.type === "entrance") &&
      markers.some((marker) => marker.type === "exit") &&
      markers.some((marker) => marker.type === "program") &&
      Boolean(opening) &&
      Boolean(closing)
    );
  }, [activities.length, closing, loadState, markers, opening, programs.length, userTypes.length]);

  function loadModel() {
    setLoadState("loading");
    setProgress(0);
    const sequence = [18, 42, 67, 86, 100];
    sequence.forEach((value, index) => {
      window.setTimeout(() => {
        setProgress(value);
        if (value === 100) {
          setLoadState("loaded");
          window.localStorage.setItem(storageKeys.modelLoaded, "true");
        }
      }, 320 + index * 340);
    });
  }

  function updateCoefficient(key: keyof ModelCoefficients, value: number) {
    setCoefficients((current) => ({ ...current, [key]: value }));
  }

  function runAnalysis() {
    if (!isReady) {
      return;
    }
    const inputs: ScaleInputs = {
      userTypes,
      programs,
      activities,
      markers,
      operationHours: { opening, closing },
      timeSlots
    };
    const overlay = generateOverlayData(inputs);
    window.localStorage.setItem(storageKeys.scaleInputs, JSON.stringify(inputs));
    window.localStorage.setItem(storageKeys.generatedOverlay, JSON.stringify(overlay));
    window.localStorage.setItem(storageKeys.modelCoefficients, JSON.stringify(coefficients));
    setIsAnalyzing(true);
    window.setTimeout(() => router.push("/output"), 2900);
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-4 py-8">
      <section className="grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="liquid-surface rounded-[2rem] p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
            Configure / model source
          </div>
          <h1 className="font-dot mt-3 text-4xl font-black uppercase leading-none text-black md:text-5xl">
            Single Source of Truth
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-black/60">
            Load the site model, then define user types, programs, activities, entrances, exits,
            operating hours, and model coefficients. Analysis is recomputed from this configuration.
          </p>

          <label className="mt-6 grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
            Location name
            <input
              value={locationName}
              onChange={(event) => setLocationName(event.target.value)}
              className="glass-chip rounded-full px-4 py-3 text-lg font-semibold text-black outline-none"
              aria-label="Location name"
            />
          </label>

          <button
            type="button"
            onClick={loadModel}
            disabled={loadState === "loading"}
            className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadState === "loading" ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
            Load Model
          </button>

          <div className="liquid-soft mt-5 rounded-[1.5rem] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-black">{statusText}</span>
              {loadState === "loaded" && <Check size={18} />}
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/70">
              <div className="h-full rounded-full bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 text-xs text-black/45">{progress}%</div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <ModelPreview compact loaded={loadState === "loaded"} />
          <MasterplanPreview compact loaded={loadState === "loaded"} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1.12fr]">
      <div className="grid content-start gap-5">
        <OptionSelector
          title="User Types"
          options={defaultUserTypes}
          selected={userTypes}
          onChange={setUserTypes}
          createCustom={(label) => ({
            id: `custom-user-${label.toLowerCase().replaceAll(" ", "-")}-${Date.now()}`,
            label,
            color: palette[userTypes.length % palette.length],
            movementBias: 0.68
          })}
        />
        <OptionSelector
          title="Programs"
          options={defaultPrograms}
          selected={programs}
          onChange={setPrograms}
          createCustom={(label) => ({
            id: `custom-program-${label.toLowerCase().replaceAll(" ", "-")}-${Date.now()}`,
            label,
            color: palette[programs.length % palette.length],
            demand: 0.64
          })}
        />
        <OptionSelector
          title="Activities"
          options={defaultActivities}
          selected={activities}
          onChange={setActivities}
          createCustom={(label) => ({
            id: `custom-activity-${label.toLowerCase().replaceAll(" ", "-")}-${Date.now()}`,
            label,
            color: palette[activities.length % palette.length],
            intensity: 0.62
          })}
        />
        <TimeSlotInput
          opening={opening}
          closing={closing}
          slots={timeSlots}
          onOpeningChange={setOpening}
          onClosingChange={setClosing}
          onSlotsChange={setTimeSlots}
        />
        <section className="liquid-surface rounded-[2rem] p-5">
          <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/50">
              Behaviour Model Coefficients
            </h2>
            <span className="glass-chip rounded-full px-3 py-1 text-xs text-black/45">
              tunable
            </span>
          </div>
          <div className="grid gap-4">
            <CoefficientSlider
              label="Connected area quantity coefficient"
              min={0}
              max={0.45}
              step={0.01}
              value={coefficients.quantityCoefficient}
              onChange={(value) => updateCoefficient("quantityCoefficient", value)}
            />
            <CoefficientSlider
              label="Entrance discount factor"
              min={0.45}
              max={1.25}
              step={0.01}
              value={coefficients.entranceDiscountFactor}
              onChange={(value) => updateCoefficient("entranceDiscountFactor", value)}
            />
            <CoefficientSlider
              label="Softmax temperature"
              min={0.2}
              max={1.5}
              step={0.01}
              value={coefficients.softmaxTemperature}
              onChange={(value) => updateCoefficient("softmaxTemperature", value)}
            />
          </div>
        </section>
      </div>

      <div className="grid content-start gap-5">
        <PlanIdentification markers={markers} programs={programs} onChange={setMarkers} />
        <div className="liquid-surface sticky bottom-4 rounded-full p-2">
          <button
            type="button"
            onClick={runAnalysis}
            disabled={!isReady}
            className={`flex h-14 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition ${
              isReady ? "bg-black text-white hover:scale-[1.01]" : "cursor-not-allowed bg-black/10 text-black/35"
            }`}
          >
            Run Analysis <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
      </section>
      <AnalysisAnimation active={isAnalyzing} />
    </main>
  );
}

function CoefficientSlider({
  label,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-black/65">
      <span className="flex items-center justify-between gap-4">
        <span className="font-semibold">{label}</span>
        <span className="rounded-full bg-white/45 px-2.5 py-1 text-xs font-semibold text-black/60">
          {value.toFixed(2)}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="accent-black"
      />
    </label>
  );
}
