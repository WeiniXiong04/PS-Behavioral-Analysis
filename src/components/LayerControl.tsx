"use client";

import type { LayerState } from "@/components/PlanViewer";

const labels: Record<keyof LayerState, string> = {
  basePlan: "Base Plan",
  behaviourPoints: "Human Behaviour Points",
  movementFlow: "Movement Flow",
  inactiveAreas: "Inactive Areas",
  congestedAreas: "Congested Areas",
  userTypeOverlay: "User Type Overlay",
  timeHeatmap: "Time Period Heatmap"
};

export function LayerControl({
  layers,
  onToggle
}: {
  layers: LayerState;
  onToggle: (key: keyof LayerState) => void;
}) {
  return (
    <div className="grid gap-2">
      {(Object.keys(labels) as Array<keyof LayerState>).map((key) => (
        <label
          key={key}
          className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70"
        >
          <span>{labels[key]}</span>
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={() => onToggle(key)}
            className="h-4 w-4 accent-[#d88945]"
          />
        </label>
      ))}
    </div>
  );
}
