"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, GripVertical, RotateCw, Trash2 } from "lucide-react";
import { InterventionCanvas } from "@/components/InterventionCanvas";
import {
  estimateZoneScores,
  interventionById,
  interventionTypes,
  interventionZones,
  zoneById,
  type InterventionTypeId,
  type Placement
} from "@/lib/interventions";
import { storageKeys } from "@/lib/defaultOptions";

export function OptimizationExperience() {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [armedTypeId, setArmedTypeId] = useState<InterventionTypeId | null>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [beforeMode, setBeforeMode] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKeys.interventions);
    if (saved) {
      try {
        setPlacements(JSON.parse(saved) as Placement[]);
      } catch {
        window.localStorage.removeItem(storageKeys.interventions);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.interventions, JSON.stringify(placements));
  }, [placements]);

  useEffect(() => {
    if (!hint) return;
    const timer = window.setTimeout(() => setHint(null), 2600);
    return () => window.clearTimeout(timer);
  }, [hint]);

  const selectedPlacement = placements.find((p) => p.id === selectedPlacementId) ?? null;
  const selectedZone = selectedPlacement ? zoneById(selectedPlacement.zoneId) : null;
  const selectedType = selectedPlacement ? interventionById(selectedPlacement.typeId) : null;

  const zoneEstimates = useMemo(
    () =>
      interventionZones.map((zone) => ({
        zone,
        before: zone.baseline,
        after: estimateZoneScores(zone, placements)
      })),
    [placements]
  );

  function place(typeId: InterventionTypeId, x: number, y: number, zoneId: string) {
    const zone = zoneById(zoneId);
    const type = interventionById(typeId);
    if (!zone.recommended.includes(typeId)) {
      setHint(
        `${type.shortLabel} is not recommended for Zone ${zone.code} (${zone.label}). Try: ${zone.recommended
          .map((id) => interventionById(id).shortLabel)
          .join(", ")}.`
      );
      return;
    }
    const placement: Placement = {
      id: `pl-${Date.now()}`,
      typeId,
      zoneId,
      x,
      y,
      rotation: 0,
      enabled: true
    };
    setPlacements((current) => [...current, placement]);
    setSelectedPlacementId(placement.id);
    setArmedTypeId(null);
    setHint(null);
  }

  function movePlacement(id: string, x: number, y: number) {
    setPlacements((current) =>
      current.map((p) => {
        if (p.id !== id) return p;
        // Keep the module inside its zone; snap back to the edge if dragged out.
        const zone = zoneById(p.zoneId);
        const dist = Math.hypot(x - zone.x, y - zone.y);
        if (dist > zone.radius) {
          const t = zone.radius / dist;
          x = zone.x + (x - zone.x) * t;
          y = zone.y + (y - zone.y) * t;
        }
        return { ...p, x, y };
      })
    );
  }

  function rotateSelected() {
    if (!selectedPlacementId) return;
    setPlacements((current) =>
      current.map((p) => (p.id === selectedPlacementId ? { ...p, rotation: p.rotation + Math.PI / 4 } : p))
    );
  }

  function toggleSelected() {
    if (!selectedPlacementId) return;
    setPlacements((current) =>
      current.map((p) => (p.id === selectedPlacementId ? { ...p, enabled: !p.enabled } : p))
    );
  }

  function removeSelected() {
    if (!selectedPlacementId) return;
    setPlacements((current) => current.filter((p) => p.id !== selectedPlacementId));
    setSelectedPlacementId(null);
  }

  function resetAll() {
    setPlacements([]);
    setSelectedPlacementId(null);
    setArmedTypeId(null);
  }

  return (
    <main className="mx-auto grid w-full max-w-[1720px] gap-5 px-4 py-8 2xl:px-8">
      <section className="liquid-surface rounded-[2rem] px-6 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Optimization Effects / Design Strategy Preview
            </div>
            <h1 className="font-dot mt-2 text-3xl font-black uppercase text-black md:text-5xl">
              Drag Interventions Into The Space
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-black/60">
              The system translates behaviour diagnosis into design strategy scenarios and helps
              architects compare possible spatial interventions. Drag a module from the library into
              a highlighted zone — or select a module, then click a zone.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setBeforeMode((v) => !v)}
              className={`glass-chip inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold transition ${
                beforeMode ? "text-black" : "text-black/60 hover:text-black"
              }`}
            >
              {beforeMode ? <EyeOff size={15} /> : <Eye size={15} />}
              {beforeMode ? "Before (interventions hidden)" : "After (interventions shown)"}
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="glass-chip inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-black/60 transition hover:text-black"
            >
              <Trash2 size={15} /> Reset all
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[300px_1fr_360px]">
        {/* Intervention library */}
        <aside className="grid content-start gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
            Intervention Library
          </div>
          {interventionTypes.map((type) => {
            const armed = armedTypeId === type.id;
            return (
              <button
                key={type.id}
                type="button"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData("intervention-type", type.id);
                  setArmedTypeId(type.id);
                }}
                onClick={() => setArmedTypeId(armed ? null : type.id)}
                className={`liquid-soft cursor-grab rounded-[1.4rem] p-4 text-left transition active:cursor-grabbing ${
                  armed ? "outline outline-2 outline-black/70" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-sm font-semibold text-black">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: type.color }} />
                    {type.shortLabel}
                  </span>
                  <GripVertical size={15} className="text-black/30" />
                </div>
                <p className="mt-2 text-xs leading-5 text-black/55">{type.purpose}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {type.elements.slice(0, 3).map((element) => (
                    <span key={element} className="rounded-full bg-white/50 px-2 py-0.5 text-[10px] text-black/55">
                      {element}
                    </span>
                  ))}
                </div>
                {armed && (
                  <div className="mt-2 text-[11px] font-semibold text-black/70">
                    Now click a highlighted zone in the model →
                  </div>
                )}
              </button>
            );
          })}
        </aside>

        {/* 3D viewer */}
        <div className="liquid-surface relative overflow-hidden rounded-[2rem]">
          <InterventionCanvas
            placements={placements}
            selectedPlacementId={selectedPlacementId}
            armedTypeId={armedTypeId}
            beforeMode={beforeMode}
            onPlace={place}
            onSelectPlacement={setSelectedPlacementId}
            onMovePlacement={movePlacement}
            onInvalidDrop={() => setHint("Place modules inside one of the intervention zones A–E.")}
          />
          {hint && (
            <div className="glass-chip absolute left-1/2 top-4 -translate-x-1/2 rounded-full px-4 py-2 text-xs font-semibold text-black/75">
              {hint}
            </div>
          )}
          {selectedPlacement && (
            <div className="glass-chip absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full p-1.5">
              <button
                type="button"
                onClick={rotateSelected}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/60 px-3 text-xs font-semibold text-black/70 hover:text-black"
              >
                <RotateCw size={13} /> Rotate
              </button>
              <button
                type="button"
                onClick={toggleSelected}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/60 px-3 text-xs font-semibold text-black/70 hover:text-black"
              >
                {selectedPlacement.enabled ? <EyeOff size={13} /> : <Eye size={13} />}
                {selectedPlacement.enabled ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                onClick={removeSelected}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white/60 px-3 text-xs font-semibold text-[#7b3c2b] hover:text-black"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          )}
        </div>

        {/* Impact panel */}
        <aside className="grid content-start gap-4">
          <div className="liquid-surface rounded-[1.6rem] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Impact Panel</div>
            {selectedPlacement && selectedZone && selectedType ? (
              <div className="mt-3 grid gap-3 text-sm">
                <Row label="Selected Intervention" value={selectedType.label} />
                <Row label="Applied Area" value={`Zone ${selectedZone.code} · ${selectedZone.label}`} />
                <div>
                  <div className="text-xs text-black/45">Problem</div>
                  <p className="mt-1 leading-6 text-black/70">{selectedZone.problem}</p>
                </div>
                <div>
                  <div className="text-xs text-black/45">Expected Behavioural Impact</div>
                  <ul className="mt-1 grid gap-1 text-black/70">
                    {selectedType.expectedImpacts.map((impact) => (
                      <li key={impact} className="flex gap-2">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-black/60" />
                        {impact}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <div className="text-xs text-black/45">Estimated Score Changes</div>
                  <div className="mt-1.5 grid gap-1.5">
                    {selectedType.scoreDeltas.map((delta) => (
                      <div key={delta.metric} className="flex items-center justify-between rounded-full bg-white/45 px-3 py-1.5">
                        <span className="text-xs text-black/60">{delta.metric}</span>
                        <span
                          className={`text-xs font-bold ${
                            delta.delta > 0 ? "text-[#24483b]" : delta.delta < 0 ? "text-[#2b4c7b]" : "text-black/40"
                          }`}
                        >
                          {delta.delta > 0 ? "+" : ""}
                          {delta.delta}
                          {delta.unit === "%" ? "%" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <ZoneScores zone={selectedZone} placements={placements} />
                <div>
                  <div className="text-xs text-black/45">Design Reading</div>
                  <p className="mt-1 leading-6 text-black/70">{selectedType.designReading}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-black/55">
                Drag a module into a zone, or select a placed module, to see its expected behavioural
                impact here.
              </p>
            )}
            <p className="mt-4 border-t border-black/10 pt-3 text-[11px] leading-4 text-black/40">
              Estimated impact based on behaviour-design assumptions — scenario preview, not a
              verified simulation.
            </p>
          </div>

          <div className="liquid-soft rounded-[1.6rem] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
              Intervention Zones
            </div>
            <div className="mt-3 grid gap-2">
              {zoneEstimates.map(({ zone, before, after }) => {
                const changed =
                  after.activityScore !== before.activityScore ||
                  after.congestionScore !== before.congestionScore ||
                  after.comfortScore !== before.comfortScore ||
                  after.stayingMinutes !== before.stayingMinutes;
                return (
                  <div key={zone.id} className="rounded-[1.1rem] bg-white/40 px-3 py-2.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-black/80">
                        Zone {zone.code} · {zone.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-black/40">
                        {zone.recommended.map((id) => interventionById(id).shortLabel).join(" · ")}
                      </span>
                    </div>
                    {changed && (
                      <div className="mt-1 grid gap-0.5 text-xs text-black/60">
                        <span>
                          Activity {before.activityScore} → <b>{after.activityScore}</b> · Stay{" "}
                          {before.stayingMinutes} → <b>{after.stayingMinutes} min</b>
                        </span>
                        <span>
                          Congestion {before.congestionScore} → <b>{after.congestionScore}</b> · Comfort{" "}
                          {before.comfortScore} → <b>{after.comfortScore}</b>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-black/45">{label}</div>
      <div className="mt-0.5 font-semibold text-black/85">{value}</div>
    </div>
  );
}

function ZoneScores({
  zone,
  placements
}: {
  zone: ReturnType<typeof zoneById>;
  placements: Placement[];
}) {
  const after = estimateZoneScores(zone, placements);
  return (
    <div>
      <div className="text-xs text-black/45">Zone Scores (before → after)</div>
      <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-xs">
        <ScorePill label="Activity" before={zone.baseline.activityScore} after={after.activityScore} />
        <ScorePill label="Stay (min)" before={zone.baseline.stayingMinutes} after={after.stayingMinutes} />
        <ScorePill label="Congestion" before={zone.baseline.congestionScore} after={after.congestionScore} invert />
        <ScorePill label="Comfort" before={zone.baseline.comfortScore} after={after.comfortScore} />
      </div>
    </div>
  );
}

function ScorePill({
  label,
  before,
  after,
  invert = false
}: {
  label: string;
  before: number;
  after: number;
  invert?: boolean;
}) {
  const improved = invert ? after < before : after > before;
  return (
    <div className="rounded-[0.9rem] bg-white/45 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-black/40">{label}</div>
      <div className="mt-0.5 font-semibold text-black/75">
        {before} → <span className={improved ? "text-[#24483b]" : "text-black/75"}>{after}</span>
      </div>
    </div>
  );
}
