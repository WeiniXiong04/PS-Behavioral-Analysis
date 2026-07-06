"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { PlanImage } from "@/components/PlanImage";
import type { MarkerType, PlanMarker, ProgramOption } from "@/types";

interface PlanIdentificationProps {
  markers: PlanMarker[];
  programs: ProgramOption[];
  onChange: (markers: PlanMarker[]) => void;
  /** Until the model is loaded the plan stays blank and cannot be annotated. */
  loaded?: boolean;
}

const markerLabels: Record<MarkerType, string> = {
  entrance: "Entrance",
  exit: "Exit",
  program: "Program"
};

export function PlanIdentification({ markers, programs, onChange, loaded = true }: PlanIdentificationProps) {
  const [markerType, setMarkerType] = useState<MarkerType>("entrance");
  const [programId, setProgramId] = useState(programs[0]?.id ?? "");

  function placeMarker(event: React.MouseEvent<HTMLDivElement>) {
    if (!loaded) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    if (markerType === "program" && programs.length === 0) {
      return;
    }
    const program = programs.find((item) => item.id === programId) ?? programs[0];
    const marker: PlanMarker = {
      id: `marker-${Date.now()}`,
      type: markerType,
      x,
      y,
      programId: markerType === "program" ? program?.id : undefined,
      label: markerType === "program" ? program?.label : markerLabels[markerType]
    };
    onChange([...markers, marker]);
  }

  function removeMarker(id: string) {
    onChange(markers.filter((marker) => marker.id !== id));
  }

  function updateMarkerProgram(id: string, nextProgramId: string) {
    const program = programs.find((item) => item.id === nextProgramId);
    onChange(
      markers.map((marker) =>
        marker.id === id
          ? { ...marker, programId: nextProgramId, label: program?.label ?? "Program" }
          : marker
      )
    );
  }

  return (
    <section className="liquid-surface rounded-[2rem] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/50">Plan Identification</h2>
        <div className="flex flex-wrap gap-2">
          {(["entrance", "exit", "program"] as MarkerType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setMarkerType(type)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase ${
                markerType === type ? "bg-black text-white" : "glass-chip text-black/55"
              }`}
            >
              {markerLabels[type]}
            </button>
          ))}
          {markerType === "program" && (
            <select
              value={programId}
              onChange={(event) => setProgramId(event.target.value)}
              className="glass-chip rounded-full px-3 py-2 text-xs outline-none"
            >
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div
        className={`relative aspect-[1000/1175] overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/30 ${
          loaded ? "cursor-crosshair" : ""
        }`}
        onClick={placeMarker}
      >
        {loaded ? (
          <PlanImage src="/assets/masterplan.png" alt="Plan identification base" className="h-full w-full object-fill" />
        ) : (
          <div className="grid h-full place-items-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-24 rounded-[1.25rem] border border-dashed border-black/20 bg-white/70" />
              <div className="text-sm font-semibold text-black/45">
                Plan identification appears after loading the model
              </div>
            </div>
          </div>
        )}
        {markers.map((marker, index) => (
          <div
            key={marker.id}
            className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[10px] font-black shadow-lg ${
              marker.type === "entrance"
                ? "bg-black text-white"
                : marker.type === "exit"
                  ? "bg-[#d88945] text-black"
                  : "bg-[#7fa99b] text-black"
            }`}
            style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
            title={marker.label}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2">
        {markers.length === 0 && (
          <div className="glass-chip rounded-full px-4 py-3 text-sm text-black/45">
            Click the plan to place entrance, exit, and program markers.
          </div>
        )}
        {markers.map((marker, index) => (
          <div key={marker.id} className="glass-chip flex items-center gap-2 rounded-full px-3 py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold">
              {index + 1}
            </span>
            <span className="min-w-[72px] text-sm font-semibold capitalize">{marker.type}</span>
            {marker.type === "program" ? (
              <select
                value={marker.programId}
                onChange={(event) => updateMarkerProgram(marker.id, event.target.value)}
                className="min-w-0 flex-1 rounded-full border border-black/10 bg-white px-3 py-2 text-sm outline-none"
              >
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="min-w-0 flex-1 text-sm text-black/45">
                x {marker.x.toFixed(1)} / y {marker.y.toFixed(1)}
              </span>
            )}
            <button
              type="button"
              onClick={() => removeMarker(marker.id)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black"
              aria-label="Remove marker"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
