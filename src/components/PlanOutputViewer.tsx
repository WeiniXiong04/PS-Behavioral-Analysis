"use client";

import { useState } from "react";
import { LayerTogglePanel } from "@/components/LayerTogglePanel";
import type { GeneratedOverlay, TimeSlot } from "@/types";

export interface PlanLayerState {
  basePlan: boolean;
  userTypes: boolean;
  movementHeatmap: boolean;
  programs: boolean;
  activities: boolean;
  timeSlots: boolean;
  entranceExit: boolean;
}

const initialLayers: PlanLayerState = {
  basePlan: true,
  userTypes: true,
  movementHeatmap: true,
  programs: true,
  activities: true,
  timeSlots: true,
  entranceExit: true
};

const layerLabels: Record<keyof PlanLayerState, string> = {
  basePlan: "Base Plan",
  userTypes: "User Types",
  movementHeatmap: "Movement Heatmap",
  programs: "Programs",
  activities: "Activities",
  timeSlots: "Time Slots",
  entranceExit: "Entrance / Exit"
};

interface PlanOutputViewerProps {
  overlay: GeneratedOverlay;
  timeSlots: TimeSlot[];
  selectedTimeSlotId: string;
  onTimeSlotChange: (id: string) => void;
}

export function PlanOutputViewer({
  overlay,
  timeSlots,
  selectedTimeSlotId,
  onTimeSlotChange
}: PlanOutputViewerProps) {
  const [layers, setLayers] = useState<PlanLayerState>(initialLayers);

  function toggleLayer(key: keyof PlanLayerState) {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[1fr_260px]">
      <div className="liquid-surface overflow-hidden rounded-[2rem]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/50">
            Interactive Plan with Data Overlay
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
        <div className="bg-[#efefed] p-4">
          <div className="relative mx-auto aspect-[1000/1175] max-h-[76vh] overflow-hidden rounded-[1.5rem] bg-white/35 shadow-inner backdrop-blur-xl">
            {layers.basePlan && (
              <img src="/images/masterplan.png" alt="Plan output base" className="absolute inset-0 h-full w-full object-fill" />
            )}
            <svg viewBox="0 0 100 117.5" className="absolute inset-0 h-full w-full">
              <defs>
                <radialGradient id="heatGradient">
                  <stop offset="0%" stopColor="#d88945" stopOpacity="0.7" />
                  <stop offset="54%" stopColor="#d88945" stopOpacity="0.26" />
                  <stop offset="100%" stopColor="#d88945" stopOpacity="0" />
                </radialGradient>
              </defs>
              {layers.movementHeatmap &&
                overlay.movementHeatmap
                  .filter((zone) => zone.timeSlotId === selectedTimeSlotId)
                  .map((zone) => (
                    <circle
                      key={zone.id}
                      cx={zone.x}
                      cy={zone.y * 1.175}
                      r={zone.radius / 1.5}
                      fill="url(#heatGradient)"
                      opacity={0.45 + zone.intensity * 0.45}
                    />
                  ))}
              {layers.timeSlots &&
                overlay.timeSlotLayers
                  .filter((slot) => slot.id === selectedTimeSlotId)
                  .map((slot) => (
                    <polyline
                      key={slot.id}
                      points={slot.path.map(([x, y]) => `${x},${y * 1.175}`).join(" ")}
                      fill="none"
                      stroke={slot.color}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="0.62"
                      strokeDasharray="2 1"
                      opacity="0.78"
                    />
                  ))}
              {layers.programs &&
                overlay.programZones.map((zone) => (
                  <g key={zone.id}>
                    <circle cx={zone.x} cy={zone.y * 1.175} r={zone.radius / 2.2} fill={zone.color} opacity="0.35" />
                    <rect
                      x={zone.x + 1.5}
                      y={zone.y * 1.175 - 2.2}
                      width={Math.max(10, zone.label.length * 0.86)}
                      height="4.4"
                      rx="2.2"
                      fill="#ffffff"
                      opacity="0.92"
                    />
                    <text x={zone.x + 3} y={zone.y * 1.175 + 0.7} fontSize="2.1" fontWeight="700" fill="#111111">
                      {zone.label}
                    </text>
                  </g>
                ))}
              {layers.activities &&
                overlay.activityZones
                  .filter((zone) => zone.timeSlotId === selectedTimeSlotId)
                  .map((zone) => (
                    <path
                      key={zone.id}
                      d={`M ${zone.x} ${zone.y * 1.175 - 2.4} L ${zone.x + 2.4} ${zone.y * 1.175} L ${zone.x} ${zone.y * 1.175 + 2.4} L ${zone.x - 2.4} ${zone.y * 1.175} Z`}
                      fill={zone.color}
                      opacity={0.42 + zone.intensity * 0.28}
                      stroke="#ffffff"
                      strokeWidth="0.4"
                    />
                  ))}
              {layers.userTypes &&
                overlay.userTypePoints
                  .filter((point) => point.timeSlotId === selectedTimeSlotId)
                  .map((point, index) => (
                    <g key={point.id}>
                      <circle cx={point.x} cy={point.y * 1.175} r="1.45" fill={point.color} stroke="#ffffff" strokeWidth="0.45" />
                      <text
                        x={point.x}
                        y={point.y * 1.175 + 0.55}
                        textAnchor="middle"
                        fontSize="1.35"
                        fontWeight="800"
                        fill="#ffffff"
                      >
                        {index + 1}
                      </text>
                    </g>
                  ))}
              {layers.entranceExit &&
                overlay.markers
                  .filter((marker) => marker.type !== "program")
                  .map((marker) => (
                    <g key={marker.id}>
                      <circle
                        cx={marker.x}
                        cy={marker.y * 1.175}
                        r="2.8"
                        fill={marker.type === "entrance" ? "#111111" : "#d88945"}
                        stroke="#ffffff"
                        strokeWidth="0.7"
                      />
                      <text
                        x={marker.x}
                        y={marker.y * 1.175 + 0.75}
                        textAnchor="middle"
                        fontSize="1.65"
                        fontWeight="900"
                        fill={marker.type === "entrance" ? "#ffffff" : "#111111"}
                      >
                        {marker.type === "entrance" ? "E" : "X"}
                      </text>
                    </g>
                  ))}
            </svg>
          </div>
        </div>
      </div>
      <LayerTogglePanel title="Plan layers" layers={layers} labels={layerLabels} onToggle={toggleLayer} />
    </section>
  );
}
