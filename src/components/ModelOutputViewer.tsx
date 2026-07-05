"use client";

import { useState } from "react";
import { LayerTogglePanel } from "@/components/LayerTogglePanel";
import { ModelLayerState, SiteModelCanvas } from "@/components/SiteModelCanvas";
import type { GeneratedOverlay, TimeSlot } from "@/types";

const initialLayers: ModelLayerState = {
  siteModel: true,
  userTypes: true,
  movementHeatmap: true,
  programs: true,
  activities: true,
  timeSlots: true
};

const layerLabels: Record<keyof ModelLayerState, string> = {
  siteModel: "Site Model",
  userTypes: "User Types",
  movementHeatmap: "Movement Heatmap",
  programs: "Programs",
  activities: "Activities",
  timeSlots: "Time Slots"
};

interface ModelOutputViewerProps {
  overlay: GeneratedOverlay;
  timeSlots: TimeSlot[];
  selectedTimeSlotId: string;
  onTimeSlotChange: (id: string) => void;
}

export function ModelOutputViewer({
  overlay,
  timeSlots,
  selectedTimeSlotId,
  onTimeSlotChange
}: ModelOutputViewerProps) {
  const [layers, setLayers] = useState<ModelLayerState>(initialLayers);

  function toggleLayer(key: keyof ModelLayerState) {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_260px]">
      <div className="liquid-surface overflow-hidden rounded-[2rem]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/50">
            3D Interactive Model with Data Overlay
          </h2>
          <select
            value={selectedTimeSlotId}
            onChange={(event) => onTimeSlotChange(event.target.value)}
            className="rounded-full border border-black/10 bg-[#efefed] px-4 py-2 text-sm font-semibold outline-none"
          >
            {timeSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
        <SiteModelCanvas overlay={overlay} layers={layers} selectedTimeSlotId={selectedTimeSlotId} />
      </div>
      <LayerTogglePanel title="3D layers" layers={layers} labels={layerLabels} onToggle={toggleLayer} />
    </section>
  );
}
