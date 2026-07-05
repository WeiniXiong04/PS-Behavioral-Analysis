"use client";

import { useMemo, useState } from "react";
import { publicSpaceBoundary, type BehaviourDataset } from "@/lib/behaviorModel";

interface MasterplanLayerState {
  basePlan: boolean;
  movementFlows: boolean;
  stayingHotspots: boolean;
  userComposition: boolean;
  keyNodes: boolean;
}

const layerLabels: Record<keyof MasterplanLayerState, string> = {
  basePlan: "Base Plan",
  movementFlows: "Movement Flows",
  stayingHotspots: "Staying Hotspots",
  userComposition: "User Composition",
  keyNodes: "Key Nodes"
};

type Selection = { kind: "flow" | "hotspot"; id: string } | null;

interface BehaviourMasterplanViewerProps {
  dataset: BehaviourDataset;
  timeSlotId: string;
  onTimeSlotChange: (id: string) => void;
}

export function BehaviourMasterplanViewer({
  dataset,
  timeSlotId,
  onTimeSlotChange
}: BehaviourMasterplanViewerProps) {
  const [userTypeId, setUserTypeId] = useState<string>("all");
  const [layers, setLayers] = useState<MasterplanLayerState>({
    basePlan: true,
    movementFlows: true,
    stayingHotspots: true,
    userComposition: true,
    keyNodes: true
  });
  const [selection, setSelection] = useState<Selection>(null);

  const userTypeMap = useMemo(
    () => new Map(dataset.userTypes.map((u) => [u.id, u])),
    [dataset.userTypes]
  );
  const typeOf = (id: string) => userTypeMap.get(id) ?? { id, label: "Users", color: "#8a8a85" };
  const slotLabel = (id: string) => dataset.timeSlots.find((s) => s.id === id)?.label ?? "";

  const summary = dataset.slotSummaries[timeSlotId] ?? Object.values(dataset.slotSummaries)[0];
  const maxHotspotUsers = Math.max(...dataset.hotspots.map((h) => h.users), 1);
  const maxStay = Math.max(...dataset.hotspots.map((h) => h.avgStayMinutes), 1);

  function toggleLayer(key: keyof MasterplanLayerState) {
    setLayers((current) => ({ ...current, [key]: !current[key] }));
  }

  const flowById = (id: string) => dataset.flows.find((f) => f.id === id);
  const hotspotById = (id: string) => dataset.hotspots.find((h) => h.id === id);
  const nodeById = (id: string) => dataset.nodes.find((n) => n.id === id);

  const selectedFlow = selection?.kind === "flow" ? flowById(selection.id) : null;
  const selectedHotspot = selection?.kind === "hotspot" ? hotspotById(selection.id) : null;
  const mainFlow = summary ? flowById(summary.mainFlowId) : null;
  const strongestHotspot = summary ? hotspotById(summary.strongestHotspotId) : null;
  const activeNode = summary ? nodeById(summary.mostActiveNodeId) : null;

  return (
    <section className="grid gap-5">
      <div className="liquid-surface rounded-[2rem] px-6 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Masterplan Output · computed from your configuration
            </div>
            <h2 className="font-dot mt-2 text-3xl font-black uppercase text-black md:text-4xl">
              Behaviour Masterplan Overview
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
                    timeSlotId === slot.id ? "bg-black text-white" : "text-black/55 hover:text-black"
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            <select
              value={userTypeId}
              onChange={(event) => setUserTypeId(event.target.value)}
              className="glass-chip rounded-full px-4 py-2 text-xs font-semibold outline-none"
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
        <div className="liquid-surface overflow-hidden rounded-[2rem]">
          <div className="bg-white/20 p-4">
            <div className="relative mx-auto aspect-[1000/1175] max-h-[86vh] overflow-hidden rounded-[1.5rem] bg-white/40 shadow-inner backdrop-blur-xl">
              {layers.basePlan && (
                <img
                  src="/images/masterplan.png"
                  alt="TusPark masterplan base"
                  className="absolute inset-0 h-full w-full object-contain opacity-35 grayscale"
                />
              )}
              <svg viewBox="0 0 100 117.5" className="absolute inset-0 h-full w-full">
                <defs>
                  <marker id="arrowMain" viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
                    <path d="M 0.6 0.8 L 7.2 4 L 0.6 7.2 Z" fill="context-stroke" />
                  </marker>
                </defs>

                <polygon
                  points={publicSpaceBoundary.map(([x, y]) => `${x},${y}`).join(" ")}
                  fill="none"
                  stroke="#6b6b66"
                  strokeWidth="0.4"
                  strokeDasharray="1.6 1.1"
                  opacity="0.75"
                />

                {dataset.activityPoints.map((point) => (
                  <circle key={point.id} cx={point.x} cy={point.y} r="0.35" fill="#8a8a85" opacity="0.22" />
                ))}

                {layers.movementFlows &&
                  dataset.flows.map((flow) => {
                    const volume = flow.volumeBySlot[timeSlotId] ?? 0;
                    const matches = userTypeId === "all" || flow.userTypeIds.includes(userTypeId);
                    const isSelected = selection?.kind === "flow" && selection.id === flow.id;
                    const color = typeOf(flow.dominantUserTypeId).color;
                    const width =
                      flow.kind === "main" ? 0.9 + volume * 1.3 : flow.kind === "secondary" ? 0.55 + volume * 0.85 : 0.45 + volume * 0.5;
                    const mid = flow.path[Math.floor(flow.path.length / 2)];
                    return (
                      <g
                        key={flow.id}
                        className="cursor-pointer"
                        opacity={matches ? undefined : 0.12}
                        onClick={() => setSelection({ kind: "flow", id: flow.id })}
                      >
                        <polyline
                          points={flow.path.map(([x, y]) => `${x},${y}`).join(" ")}
                          fill="none"
                          stroke="#000"
                          strokeOpacity="0"
                          strokeWidth="4"
                        />
                        <polyline
                          points={flow.path.map(([x, y]) => `${x},${y}`).join(" ")}
                          fill="none"
                          stroke={color}
                          strokeWidth={width}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray={flow.kind === "service" ? "1.6 1.3" : undefined}
                          opacity={isSelected ? 1 : 0.35 + volume * 0.55}
                          markerEnd="url(#arrowMain)"
                        />
                        <g transform={`translate(${mid[0] + 1.2}, ${mid[1] - 1.2})`}>
                          <rect x="-0.4" y="-2.4" width="6" height="3.4" rx="1.7" fill="#ffffff" opacity="0.92" stroke={isSelected ? color : "none"} strokeWidth="0.3" />
                          <text x="2.6" y="0" textAnchor="middle" fontSize="2" fontWeight="800" fill="#111111">
                            {flow.code}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                {layers.stayingHotspots &&
                  dataset.hotspots.map((hotspot) => {
                    const strength = hotspot.strengthBySlot[timeSlotId] ?? 0;
                    const matches =
                      userTypeId === "all" ||
                      hotspot.userMix.some((mix) => mix.userTypeId === userTypeId && mix.share >= 0.15);
                    const isSelected = selection?.kind === "hotspot" && selection.id === hotspot.id;
                    const radius = (2.6 + (hotspot.users / maxHotspotUsers) * 3.6) * (0.7 + strength * 0.5);
                    const darkness = 0.16 + (hotspot.avgStayMinutes / maxStay) * 0.34;
                    return (
                      <g
                        key={hotspot.id}
                        className="cursor-pointer"
                        opacity={matches ? undefined : 0.12}
                        onClick={() => setSelection({ kind: "hotspot", id: hotspot.id })}
                      >
                        <circle cx={hotspot.x} cy={hotspot.y} r={radius} fill="#c7502e" opacity={darkness * (0.5 + strength * 0.7)} />
                        <circle
                          cx={hotspot.x}
                          cy={hotspot.y}
                          r={radius}
                          fill="none"
                          stroke={isSelected ? "#111111" : "#c7502e"}
                          strokeWidth={isSelected ? 0.5 : 0.3}
                          opacity="0.85"
                        />
                        <g transform={`translate(${hotspot.x + radius * 0.72}, ${hotspot.y - radius * 0.72})`}>
                          <rect x="-0.4" y="-2.4" width="6.2" height="3.4" rx="1.7" fill="#ffffff" opacity="0.92" />
                          <text x="2.7" y="0" textAnchor="middle" fontSize="2" fontWeight="800" fill="#111111">
                            {hotspot.code}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                {layers.userComposition &&
                  dataset.hotspots.map((hotspot) => (
                    <PieMarker
                      key={`pie-${hotspot.id}`}
                      x={hotspot.x - 4.4}
                      y={hotspot.y + 4.2}
                      radius={1.9}
                      mix={hotspot.userMix}
                      highlightId={userTypeId}
                      colorOf={(id) => typeOf(id).color}
                    />
                  ))}

                {dataset.entrances.map((entrance) => (
                  <g key={entrance.id}>
                    <circle cx={entrance.x} cy={entrance.y} r="2" fill="#111111" stroke="#ffffff" strokeWidth="0.5" />
                    <text x={entrance.x} y={entrance.y + 0.7} textAnchor="middle" fontSize="1.7" fontWeight="900" fill="#ffffff">
                      {entrance.code}
                    </text>
                    <text x={entrance.x} y={entrance.y + 4.4} textAnchor="middle" fontSize="1.6" fontWeight="600" fill="#333333">
                      {entrance.label}
                    </text>
                  </g>
                ))}

                {layers.keyNodes &&
                  dataset.nodes.map((node) => (
                    <g key={node.id}>
                      <rect
                        x={node.x - 1.5}
                        y={node.y - 1.5}
                        width="3"
                        height="3"
                        rx="0.7"
                        fill="#ffffff"
                        stroke="#111111"
                        strokeWidth="0.35"
                        transform={`rotate(45 ${node.x} ${node.y})`}
                      />
                      <text x={node.x} y={node.y + 0.62} textAnchor="middle" fontSize="1.5" fontWeight="800" fill="#111111">
                        {node.code}
                      </text>
                      <text x={node.x} y={node.y - 2.6} textAnchor="middle" fontSize="1.5" fontWeight="600" fill="#333333">
                        {node.label}
                      </text>
                    </g>
                  ))}
              </svg>

              <div className="liquid-soft absolute bottom-3 left-3 max-w-[240px] rounded-[1.1rem] p-3 text-[11px] leading-4 text-black/70">
                <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/45">Legend</div>
                <div className="grid gap-1">
                  <span>E entrance / F flow / H hotspot / N node</span>
                  <span className="flex items-center gap-2">
                    <svg width="26" height="6"><line x1="1" y1="3" x2="25" y2="3" stroke="#111" strokeWidth="3" /></svg>
                    thick arrow = high movement volume
                  </span>
                  <span className="flex items-center gap-2">
                    <svg width="26" height="6"><line x1="1" y1="3" x2="25" y2="3" stroke="#111" strokeWidth="1.2" /></svg>
                    thin arrow = secondary flow
                  </span>
                  <span className="flex items-center gap-2">
                    <svg width="26" height="6"><line x1="1" y1="3" x2="25" y2="3" stroke="#111" strokeWidth="1.2" strokeDasharray="4 3" /></svg>
                    dashed = low-frequency / service
                  </span>
                  <span className="flex items-center gap-2">
                    <svg width="26" height="12">
                      <circle cx="6" cy="6" r="5" fill="#c7502e" opacity="0.4" />
                      <circle cx="19" cy="6" r="3" fill="#c7502e" opacity="0.2" />
                    </svg>
                    large / darker circle = more, longer staying
                  </span>
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
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="liquid-surface rounded-[1.6rem] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
              Behaviour Masterplan Summary
            </div>
            {summary && (
              <dl className="mt-3 grid gap-2 text-sm">
                <SummaryRow label="Current Time" value={slotLabel(timeSlotId)} />
                <SummaryRow label="Observed Users" value={summary.observedUsers.toLocaleString()} />
                <SummaryRow label="Dominant User Type" value={typeOf(summary.dominantUserTypeId).label} />
                <SummaryRow
                  label="Main Movement Flow"
                  value={mainFlow ? `${mainFlow.code} ${mainFlow.from} → ${mainFlow.to}` : "—"}
                />
                <SummaryRow
                  label="Strongest Staying Hotspot"
                  value={strongestHotspot ? `${strongestHotspot.code} ${strongestHotspot.name}` : "—"}
                />
                <SummaryRow label="Average Staying Duration" value={`${summary.avgStayMinutes.toFixed(1)} min`} />
                <SummaryRow label="Most Active Node" value={activeNode ? `${activeNode.code} ${activeNode.label}` : "—"} />
              </dl>
            )}
          </div>

          {summary && (
            <div className="liquid-soft rounded-[1.6rem] p-5">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Key Spatial Readings</div>
              <ul className="mt-3 grid gap-2.5 text-sm leading-6 text-black/70">
                {summary.readings.map((reading) => (
                  <li key={reading} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                    {reading}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(selectedFlow || selectedHotspot) && (
            <div className="liquid-surface rounded-[1.6rem] border-black/20 p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Selected Element</div>
                <button type="button" onClick={() => setSelection(null)} className="text-xs font-semibold text-black/40 hover:text-black">
                  Clear
                </button>
              </div>
              {selectedFlow && (
                <dl className="mt-3 grid gap-2 text-sm">
                  <SummaryRow label="Flow" value={`${selectedFlow.code} ${selectedFlow.name}`} />
                  <SummaryRow label="Route" value={`${selectedFlow.from} → ${selectedFlow.to}`} />
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
                  <SummaryRow label="Users" value={String(selectedHotspot.users)} />
                  <SummaryRow label="Avg. Stay" value={`${selectedHotspot.avgStayMinutes} min`} />
                  <SummaryRow label="Dominant Behaviour" value={selectedHotspot.dominantBehaviour} />
                  <SummaryRow label="Dominant User" value={typeOf(selectedHotspot.dominantUserTypeId).label} />
                  <SummaryRow label="Peak Time" value={slotLabel(selectedHotspot.peakSlotId)} />
                  <p className="mt-1 text-sm leading-6 text-black/60">{selectedHotspot.meaning}</p>
                </dl>
              )}
            </div>
          )}

          <div className="liquid-soft rounded-[1.6rem] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Flow List</div>
            <div className="mt-3 grid gap-2">
              {dataset.flows.map((flow) => (
                <button
                  key={flow.id}
                  type="button"
                  onClick={() => setSelection({ kind: "flow", id: flow.id })}
                  className={`rounded-[1.1rem] px-3 py-2.5 text-left text-sm transition ${
                    selection?.kind === "flow" && selection.id === flow.id
                      ? "bg-black text-white"
                      : "bg-white/40 text-black/75 hover:bg-white/65"
                  }`}
                >
                  <div className="font-semibold">
                    {flow.code} {flow.name}
                  </div>
                  <div className="mt-0.5 text-xs opacity-70">
                    Volume: {flow.volumeLabel} · {typeOf(flow.dominantUserTypeId).label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="liquid-soft rounded-[1.6rem] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Hotspot List</div>
            <div className="mt-3 grid gap-2">
              {dataset.hotspots.map((hotspot) => (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => setSelection({ kind: "hotspot", id: hotspot.id })}
                  className={`rounded-[1.1rem] px-3 py-2.5 text-left text-sm transition ${
                    selection?.kind === "hotspot" && selection.id === hotspot.id
                      ? "bg-black text-white"
                      : "bg-white/40 text-black/75 hover:bg-white/65"
                  }`}
                >
                  <div className="font-semibold">
                    {hotspot.code} {hotspot.name}
                  </div>
                  <div className="mt-0.5 text-xs opacity-70">
                    Users: {hotspot.users} · Avg. Stay: {hotspot.avgStayMinutes} min
                  </div>
                  <div className="mt-0.5 text-xs opacity-70">Dominant Behaviour: {hotspot.dominantBehaviour}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="liquid-soft rounded-[1.6rem] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Masterplan Layers</div>
            <div className="mt-3 grid gap-2">
              {(Object.keys(layerLabels) as Array<keyof MasterplanLayerState>).map((key) => (
                <label
                  key={key}
                  className="glass-chip flex cursor-pointer items-center justify-between gap-3 rounded-full px-3 py-2 text-sm text-black/70"
                >
                  <span>{layerLabels[key]}</span>
                  <input type="checkbox" checked={layers[key]} onChange={() => toggleLayer(key)} className="h-4 w-4 accent-black" />
                </label>
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

interface PieMarkerProps {
  x: number;
  y: number;
  radius: number;
  mix: Array<{ userTypeId: string; share: number }>;
  highlightId: string;
  colorOf: (id: string) => string;
}

function PieMarker({ x, y, radius, mix, highlightId, colorOf }: PieMarkerProps) {
  const slices = useMemo(() => {
    let start = -Math.PI / 2;
    return mix.map((entry) => {
      const end = start + entry.share * Math.PI * 2;
      const largeArc = entry.share > 0.5 ? 1 : 0;
      const sx = x + Math.cos(start) * radius;
      const sy = y + Math.sin(start) * radius;
      const ex = x + Math.cos(end) * radius;
      const ey = y + Math.sin(end) * radius;
      const d = `M ${x} ${y} L ${sx} ${sy} A ${radius} ${radius} 0 ${largeArc} 1 ${ex} ${ey} Z`;
      start = end;
      return { d, userTypeId: entry.userTypeId };
    });
  }, [x, y, radius, mix]);

  return (
    <g>
      <circle cx={x} cy={y} r={radius + 0.35} fill="#ffffff" opacity="0.9" />
      {slices.map((slice) => (
        <path
          key={slice.userTypeId}
          d={slice.d}
          fill={colorOf(slice.userTypeId)}
          opacity={highlightId === "all" || highlightId === slice.userTypeId ? 0.95 : 0.2}
        />
      ))}
    </g>
  );
}
