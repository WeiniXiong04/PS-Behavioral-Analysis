"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { AnalysisAnimation } from "@/components/AnalysisAnimation";
import { OptionSelector } from "@/components/OptionSelector";
import { PlanIdentification } from "@/components/PlanIdentification";
import { TimeSlotInput } from "@/components/TimeSlotInput";
import { generateOverlayData } from "@/lib/analysis";
import {
  defaultActivities,
  defaultPrograms,
  defaultTimeSlots,
  defaultUserTypes,
  storageKeys
} from "@/lib/defaultOptions";
import type { ActivityOption, ProgramOption, ScaleInputs, UserTypeOption } from "@/types";

const palette = ["#111111", "#d88945", "#7fa99b", "#879bb1", "#9a7759", "#b7a1cb"];

export function ScaleForm() {
  const router = useRouter();
  const [userTypes, setUserTypes] = useState<UserTypeOption[]>([]);
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [markers, setMarkers] = useState<ScaleInputs["markers"]>([]);
  const [opening, setOpening] = useState("08:00");
  const [closing, setClosing] = useState("22:00");
  const [timeSlots, setTimeSlots] = useState(defaultTimeSlots);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isReady = useMemo(() => {
    return (
      userTypes.length > 0 &&
      programs.length > 0 &&
      activities.length > 0 &&
      markers.some((marker) => marker.type === "entrance") &&
      markers.some((marker) => marker.type === "exit") &&
      markers.some((marker) => marker.type === "program") &&
      Boolean(opening) &&
      Boolean(closing)
    );
  }, [activities.length, closing, markers, opening, programs.length, userTypes.length]);

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
    setIsAnalyzing(true);
    window.setTimeout(() => router.push("/output"), 2900);
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-4 py-8 xl:grid-cols-[1fr_1.12fr]">
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
      <AnalysisAnimation active={isAnalyzing} />
    </main>
  );
}
