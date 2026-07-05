"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";

type LoadStatus = "idle" | "loading" | "loaded";

const loaderItems = [
  { id: "sitePlan", label: "Site Plan", detail: "Tuspark plan drawing" },
  { id: "streetNetwork", label: "Street Network", detail: "Roads and pedestrian access" },
  { id: "behaviour", label: "Human Behaviour Data", detail: "Observed speed, duration, and activity" },
  { id: "movement", label: "Movement Flow Data", detail: "Directional flow and time peaks" },
  { id: "model", label: "3D Model Reference", detail: "Rhino source and web diagnostic massing" }
];

export function DataLoader() {
  const [statuses, setStatuses] = useState<Record<string, LoadStatus>>(() =>
    Object.fromEntries(loaderItems.map((item) => [item.id, "idle"]))
  );
  const [isLoading, setIsLoading] = useState(false);

  const allLoaded = useMemo(
    () => loaderItems.every((item) => statuses[item.id] === "loaded"),
    [statuses]
  );

  function startLoading() {
    setIsLoading(true);
    setStatuses(Object.fromEntries(loaderItems.map((item) => [item.id, "idle"])));

    loaderItems.forEach((item, index) => {
      window.setTimeout(() => {
        setStatuses((current) => ({ ...current, [item.id]: "loading" }));
      }, index * 420);

      window.setTimeout(() => {
        setStatuses((current) => ({ ...current, [item.id]: "loaded" }));
        if (index === loaderItems.length - 1) {
          setIsLoading(false);
        }
      }, index * 420 + 520);
    });
  }

  function reset() {
    setStatuses(Object.fromEntries(loaderItems.map((item) => [item.id, "idle"])));
    setIsLoading(false);
  }

  return (
    <div className="glass-panel rounded-lg p-5">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-signal">Preset demo dataset</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Load Beijing Tuspark Data</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            The MVP uses prepared JSON files and image/model references. This simulates a professional
            loading workflow without building a fragile upload system.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={startLoading}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-signal px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#ef9b55] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Load Tuspark Dataset
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-white/10 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {loaderItems.map((item) => {
          const status = statuses[item.id];
          return (
            <div key={item.id} className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{item.label}</div>
                  <div className="mt-1 text-sm text-white/50">{item.detail}</div>
                </div>
                <StatusPill status={status} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-md border border-white/10 bg-ink/50 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Next workflow step</div>
          <p className="mt-1 text-sm text-white/50">
            Once loaded, the dashboard can classify users and run the spatial diagnosis.
          </p>
        </div>
        <Link
          aria-disabled={!allLoaded}
          href={allLoaded ? "/dashboard" : "#"}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            allLoaded
              ? "bg-success text-ink hover:bg-[#7fda98]"
              : "pointer-events-none border border-white/10 text-white/40"
          }`}
        >
          Run Analysis
        </Link>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: LoadStatus }) {
  if (status === "loaded") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-1 text-xs font-semibold text-success">
        <CheckCircle2 size={14} />
        Loaded
      </span>
    );
  }

  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-signal/20 px-2 py-1 text-xs font-semibold text-signal">
        <Loader2 size={14} className="animate-spin" />
        Loading
      </span>
    );
  }

  return (
    <span className="rounded-full border border-white/10 px-2 py-1 text-xs font-semibold text-white/40">
      Waiting
    </span>
  );
}
