"use client";

import { useMemo, useState } from "react";
import { LayerControl } from "@/components/LayerControl";
import { TimeSlider } from "@/components/TimeSlider";
import { ZoneInfoCard } from "@/components/ZoneInfoCard";
import { heatmapFrames } from "@/lib/data";
import type { BehaviourPoint, DiagnosticZone, MovementFlow, TusparkData, UserType } from "@/types";

export interface LayerState {
  basePlan: boolean;
  behaviourPoints: boolean;
  movementFlow: boolean;
  inactiveAreas: boolean;
  congestedAreas: boolean;
  userTypeOverlay: boolean;
  timeHeatmap: boolean;
}

type Selection =
  | { kind: "inactive"; item: DiagnosticZone }
  | { kind: "congested"; item: DiagnosticZone }
  | { kind: "point"; item: BehaviourPoint };

const initialLayers: LayerState = {
  basePlan: true,
  behaviourPoints: true,
  movementFlow: true,
  inactiveAreas: true,
  congestedAreas: true,
  userTypeOverlay: true,
  timeHeatmap: false
};

const userTypeColors: Record<UserType, string> = {
  office_worker: "#d88945",
  visitor: "#3d8bff",
  passive_user: "#80a4c2",
  through_pedestrian: "#e35d4f",
  service_staff: "#b58ad9",
  student_young_user: "#68c784"
};

export function PlanViewer({
  data,
  compact = false
}: {
  data: TusparkData;
  compact?: boolean;
}) {
  const [layers, setLayers] = useState<LayerState>(initialLayers);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(1);
  const [selection, setSelection] = useState<Selection | null>(null);

  const activeMinute = heatmapFrames[selectedTimeIndex].minute;
  const visiblePoints = useMemo(
    () =>
      data.behaviourPoints.filter((point) => {
        const [hour, minute] = point.time.split(":").map(Number);
        return hour * 60 + minute <= activeMinute;
      }),
    [activeMinute, data.behaviourPoints]
  );

  function toggleLayer(key: keyof LayerState) {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <div className={`grid gap-4 ${compact ? "" : "xl:grid-cols-[1fr_320px]"}`}>
      <div className="glass-panel overflow-hidden rounded-lg">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/50">Interactive plan output</p>
            <h2 className="mt-1 text-xl font-semibold text-white">Tuspark behavioural diagnosis</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Legend color="#3d8bff" label="Inactive" />
            <Legend color="#e35d4f" label="Congested" />
            <Legend color="#d88945" label="Flow" />
          </div>
        </div>
        <div className="relative bg-[#ece8de] p-3">
          <div className="relative mx-auto aspect-[1000/1175] max-h-[76vh] overflow-hidden rounded-md border border-black/20 bg-[#f3f0e8] shadow-analytical">
            {layers.basePlan && (
              <img
                src="/images/tuspark-plan.jpg"
                alt="Tuspark base plan"
                className="absolute inset-0 h-full w-full object-fill"
              />
            )}
            {layers.timeHeatmap && (
              <img
                src={heatmapFrames[selectedTimeIndex].src}
                alt={`Movement heatmap at ${heatmapFrames[selectedTimeIndex].label}`}
                className="absolute inset-0 h-full w-full object-fill opacity-45 mix-blend-multiply"
              />
            )}
            <svg
              viewBox="0 0 1000 1175"
              className="absolute inset-0 h-full w-full"
              role="img"
              aria-label="Interactive diagnosis overlays"
            >
              <defs>
                <marker
                  id="arrow"
                  markerHeight="8"
                  markerWidth="8"
                  orient="auto-start-reverse"
                  refX="6"
                  refY="4"
                  viewBox="0 0 8 8"
                >
                  <path d="M 0 0 L 8 4 L 0 8 z" fill="#d88945" />
                </marker>
              </defs>
              <polyline
                points={data.siteBoundary.boundary.map((point) => point.join(",")).join(" ")}
                fill="none"
                stroke="rgba(13,18,24,0.42)"
                strokeDasharray="8 8"
                strokeWidth="2"
              />
              {layers.movementFlow &&
                data.movementFlows.map((flow) => <FlowPath key={flow.id} flow={flow} />)}
              {layers.inactiveAreas &&
                data.inactiveZones.map((zone) => (
                  <ZonePolygon
                    key={zone.id}
                    zone={zone}
                    color="#3d8bff"
                    onSelect={() => setSelection({ kind: "inactive", item: zone })}
                  />
                ))}
              {layers.congestedAreas &&
                data.congestedZones.map((zone) => (
                  <ZonePolygon
                    key={zone.id}
                    zone={zone}
                    color="#e35d4f"
                    onSelect={() => setSelection({ kind: "congested", item: zone })}
                  />
                ))}
              {layers.behaviourPoints &&
                visiblePoints.map((point) => (
                  <g
                    key={point.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select behaviour point ${point.id}`}
                    onClick={() => setSelection({ kind: "point", item: point })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        setSelection({ kind: "point", item: point });
                      }
                    }}
                    className="cursor-pointer"
                  >
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={layers.userTypeOverlay ? 9 : 6}
                      fill={layers.userTypeOverlay ? userTypeColors[point.userType] : "#111821"}
                      stroke="#ffffff"
                      strokeWidth="2"
                      opacity="0.9"
                    />
                  </g>
                ))}
            </svg>
          </div>
        </div>
        <div className="border-t border-white/10 p-4">
          <TimeSlider value={selectedTimeIndex} onChange={setSelectedTimeIndex} />
        </div>
      </div>

      {!compact && (
        <aside className="grid content-start gap-4">
          <div className="glass-panel rounded-lg p-4">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-white/50">Layer control</p>
            <LayerControl layers={layers} onToggle={toggleLayer} />
          </div>
          <ZoneInfoCard selection={selection} />
        </aside>
      )}
    </div>
  );
}

function FlowPath({ flow }: { flow: MovementFlow }) {
  const width = Math.max(3, Math.min(9, flow.volume / 70));

  return (
    <polyline
      points={flow.path.map((point) => point.join(",")).join(" ")}
      fill="none"
      markerEnd="url(#arrow)"
      stroke="#d88945"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={width}
      opacity="0.72"
    />
  );
}

function ZonePolygon({
  zone,
  color,
  onSelect
}: {
  zone: DiagnosticZone;
  color: string;
  onSelect: () => void;
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Select ${zone.name}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect();
        }
      }}
    >
      <polygon
        points={zone.polygon.map((point) => point.join(",")).join(" ")}
        fill={color}
        opacity="0.24"
        stroke={color}
        strokeDasharray="10 5"
        strokeWidth="4"
        className="cursor-pointer transition hover:opacity-40"
      />
    </g>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/50">
      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
