"use client";

import { useMemo, useState } from "react";
import {
  BehaviourPatternCanvas,
  type Behaviour3DLayerState,
  type BehaviourSelection
} from "@/components/BehaviourPatternCanvas";
import type { BehaviourDataset } from "@/lib/behaviorModel";

const baseLayerLabels: Partial<Record<keyof Behaviour3DLayerState, string>> = {
  siteModel: "Site Model",
  boundary: "Public Space Boundary",
  entrances: "Entrances",
  mainRoutes: "Main Routes",
  keyNodes: "Key Spatial Nodes"
};

const behaviourLayerLabels: Partial<Record<keyof Behaviour3DLayerState, string>> = {
  movementFlows: "Movement Flows",
  stayingHotspots: "Staying Hotspots",
  congestion: "Congestion / Crowding",
  userTypeDistribution: "User Type Distribution",
  activityPoints: "Activity Points",
  timePatterns: "Time-based Patterns"
};

interface BehaviourPatternViewerProps {
  dataset: BehaviourDataset;
  timeSlotId: string;
  onTimeSlotChange: (id: string) => void;
}

export function BehaviourPatternViewer({ dataset, timeSlotId, onTimeSlotChange }: BehaviourPatternViewerProps) {
  const [userTypeId, setUserTypeId] = useState<string>("all");
  const [selection, setSelection] = useState<BehaviourSelection>(null);
  const [layers, setLayers] = useState<Behaviour3DLayerState>({
    siteModel: true,
    boundary: true,
    entrances: true,
    mainRoutes: true,
    keyNodes: true,
    movementFlows: true,
    stayingHotspots: true,
    userTypeDistribution: true,
    activityPoints: false,
    timePatterns: true,
    congestion: true
  });

  const userTypeMap = useMemo(
    () => new Map(dataset.userTypes.map((u) => [u.id, u])),
    [dataset.userTypes]
  );
  const typeOf = (id: string) => userTypeMap.get(id) ?? { id, label: "Users", color: "#8a8a85" };
  const slotLabel = (id: string) => dataset.timeSlots.find((s) => s.id === id)?.label ?? "";

  const summary = dataset.slotSummaries[timeSlotId] ?? Object.values(dataset.slotSummaries)[0];
  const selectedFlow = selection?.kind === "flow" ? dataset.flows.find((f) => f.id === selection.id) : null;
  const selectedHotspot =
    selection?.kind === "hotspot" ? dataset.hotspots.find((h) => h.id === selection.id) : null;
  const selectedNode = selection?.kind === "node" ? dataset.nodes.find((n) => n.id === selection.id) : null;
  const mainFlow = summary ? dataset.flows.find((f) => f.id === summary.mainFlowId) : null;
  const strongestHotspot = summary ? dataset.hotspots.find((h) => h.id === summary.strongestHotspotId) : null;

  function toggleLayer(key: keyof Behaviour3DLayerState) {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }

  return (
    <section className="grid gap-5">
      <div className="liquid-surface rounded-[2rem] px-6 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              3D Interactive Model · computed from your configuration
            </div>
            <h2 className="font-dot mt-2 text-3xl font-black uppercase text-black md:text-4xl">
              3D Behaviour Pattern Viewer
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="glass-chip flex flex-wrap items-center gap-1 rounded-full p-1">
              {dataset.timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onTimeSlotChange(slot.id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    timeSlotId === slot.id ? "liquid-control-active" : "liquid-control text-black/55 hover:text-black"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            <select
              value={userTypeId}
              onChange={(event) => setUserTypeId(event.target.value)}
              className="liquid-control rounded-full px-4 py-2 text-xs font-semibold outline-none"
              aria-label="User type filter"
            >
              <option value="all">All Users</option>
              {dataset.userTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_330px]">
        <div className="liquid-surface relative overflow-hidden rounded-[2rem]">
          <BehaviourPatternCanvas
            dataset={dataset}
            timeSlotId={timeSlotId}
            userTypeId={userTypeId}
            layers={layers}
            onSelect={setSelection}
          />

          <div className="liquid-soft absolute bottom-3 left-3 max-w-[230px] rounded-[1.1rem] p-3 text-[11px] leading-4 text-black/70">
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45">Legend</div>
            <div className="grid gap-1">
              <span>Thick line = high movement flow</span>
              <span>Arrow = movement direction</span>
              <span>Tall column = long staying duration</span>
              <span>Large hotspot = high staying frequency</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#e35d4f]" /> Warm disc = congestion pressure
              </span>
              <span>Colour = user type</span>
              <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
                {dataset.userTypes.map((type) => (
                  <span key={type.id} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: type.color }} />
                    {type.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="liquid-surface rounded-[1.6rem] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Behaviour Data Panel</div>
            <dl className="mt-3 grid gap-2 text-sm">
              <SummaryRow label="Current View" value="Behaviour View" />
              <SummaryRow label="Time Slot" value={slotLabel(timeSlotId)} />
              <SummaryRow
                label="Selected User Type"
                value={userTypeId === "all" ? "All Users" : typeOf(userTypeId).label}
              />
            </dl>
          </div>

          {summary && (
            <div className="liquid-soft rounded-[1.6rem] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Core Data Summary</div>
              <dl className="mt-3 grid gap-2 text-sm">
                <SummaryRow label="Total Observed Users" value={summary.observedUsers.toLocaleString()} />
                <SummaryRow label="Main User Type" value={typeOf(summary.dominantUserTypeId).label} />
                <SummaryRow label="Peak Movement Route" value={mainFlow ? `${mainFlow.code} ${mainFlow.name}` : "—"} />
                <SummaryRow
                  label="Highest Staying Area"
                  value={strongestHotspot ? `${strongestHotspot.code} ${strongestHotspot.name}` : "—"}
                />
                <SummaryRow label="Average Staying Duration" value={`${summary.avgStayMinutes.toFixed(1)} min`} />
                <SummaryRow label="Most Active Time" value={summary.mostActiveTimeLabel} />
              </dl>
            </div>
          )}

          {summary && (
            <div className="liquid-soft rounded-[1.6rem] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">User Type Share</div>
              <div className="mt-3 grid gap-2">
                {summary.userMix.map((mix) => {
                  const type = typeOf(mix.userTypeId);
                  return (
                    <div key={mix.userTypeId} className="grid gap-1">
                      <div className="flex items-center justify-between text-xs text-black/60">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full" style={{ background: type.color }} />
                          {type.label}
                        </span>
                        <span className="font-semibold text-black/80">{Math.round(mix.share * 100)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/50">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${mix.share * 100}%`, background: type.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(selectedFlow || selectedHotspot || selectedNode) && (
            <div className="liquid-surface rounded-[1.6rem] p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Selected Element</div>
                <button
                  type="button"
                  onClick={() => setSelection(null)}
                  className="text-xs font-semibold text-black/40 hover:text-black"
                >
                  Clear
                </button>
              </div>
              {selectedFlow && (
                <dl className="mt-3 grid gap-2 text-sm">
                  <SummaryRow label="Flow" value={`${selectedFlow.code} ${selectedFlow.name}`} />
                  <SummaryRow label="Volume" value={selectedFlow.volumeLabel} />
                  <SummaryRow label="Dominant User" value={typeOf(selectedFlow.dominantUserTypeId).label} />
                  <SummaryRow label="Average Speed" value={selectedFlow.avgSpeed} />
                  <SummaryRow label="Peak Time" value={slotLabel(selectedFlow.peakSlotId)} />
                  <p className="mt-1 text-sm leading-6 text-black/60">{selectedFlow.meaning}</p>
                </dl>
              )}
              {selectedHotspot && (
                <dl className="mt-3 grid gap-2 text-sm">
                  <SummaryRow label="Hotspot" value={`${selectedHotspot.code} ${selectedHotspot.name}`} />
                  <SummaryRow label="Average Staying Duration" value={`${selectedHotspot.avgStayMinutes} min`} />
                  <SummaryRow label="Dominant Behaviour" value={selectedHotspot.dominantBehaviour} />
                  <SummaryRow label="Dominant User" value={typeOf(selectedHotspot.dominantUserTypeId).label} />
                  <SummaryRow label="Peak Time" value={slotLabel(selectedHotspot.peakSlotId)} />
                  <p className="mt-1 text-sm leading-6 text-black/60">{selectedHotspot.meaning}</p>
                </dl>
              )}
              {selectedNode && (
                <dl className="mt-3 grid gap-2 text-sm">
                  <SummaryRow label="Node" value={`${selectedNode.code} ${selectedNode.label}`} />
                  <p className="mt-1 text-sm leading-6 text-black/60">
                    Key spatial node acting as an orientation and transfer point within the public space.
                  </p>
                </dl>
              )}
            </div>
          )}

          <div className="liquid-soft rounded-[1.6rem] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Base Layers</div>
            <div className="mt-3 grid gap-2">
              {(Object.keys(baseLayerLabels) as Array<keyof Behaviour3DLayerState>).map((key) => (
                <LayerToggle key={key} label={baseLayerLabels[key]!} checked={layers[key]} onToggle={() => toggleLayer(key)} />
              ))}
            </div>
            <div className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Behaviour Layers</div>
            <div className="mt-3 grid gap-2">
              {(Object.keys(behaviourLayerLabels) as Array<keyof Behaviour3DLayerState>).map((key) => (
                <LayerToggle key={key} label={behaviourLayerLabels[key]!} checked={layers[key]} onToggle={() => toggleLayer(key)} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-black/5 pb-1.5">
      <dt className="shrink-0 text-xs text-black/45">{label}</dt>
      <dd className="text-right text-sm font-semibold text-black/80">{value}</dd>
    </div>
  );
}

function LayerToggle({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <label className="glass-chip flex cursor-pointer items-center justify-between gap-3 rounded-full px-3 py-2 text-sm text-black/70">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={onToggle} className="h-4 w-4 accent-black" />
    </label>
  );
}
