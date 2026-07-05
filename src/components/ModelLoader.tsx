"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { MasterplanPreview } from "@/components/MasterplanPreview";
import { ModelPreview } from "@/components/ModelPreview";

type LoadState = "idle" | "loading" | "loaded";

export function ModelLoader() {
  const [locationName, setLocationName] = useState("Public Space Site 01");
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [progress, setProgress] = useState(0);

  const statusText = useMemo(() => {
    if (loadState === "loaded") return "Model and masterplan loaded";
    if (loadState === "loading") return "Reading model geometry";
    return "Waiting for model input";
  }, [loadState]);

  function loadModel() {
    setLoadState("loading");
    setProgress(0);
    const sequence = [22, 48, 73, 92, 100];
    sequence.forEach((value, index) => {
      window.setTimeout(() => {
        setProgress(value);
        if (value === 100) {
          setLoadState("loaded");
        }
      }, 360 + index * 360);
    });
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-4 py-8 xl:grid-cols-[320px_1fr]">
      <aside className="liquid-surface rounded-[2rem] p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">Location name</div>
        <input
          value={locationName}
          onChange={(event) => setLocationName(event.target.value)}
          className="glass-chip mt-3 w-full rounded-full px-4 py-3 text-lg font-semibold text-black outline-none transition focus:border-black"
          aria-label="Location name"
        />

        <button
          type="button"
          onClick={loadModel}
          disabled={loadState === "loading"}
          className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-black text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadState === "loading" ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
          Load Model
        </button>

        <div className="liquid-soft mt-6 rounded-[1.5rem] p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-black">{statusText}</span>
            {loadState === "loaded" && <Check size={18} />}
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-xs text-black/45">{progress}%</div>
        </div>

        <Link
          href={loadState === "loaded" ? "/scale" : "#"}
          aria-disabled={loadState !== "loaded"}
          className={`mt-6 inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition ${
            loadState === "loaded"
              ? "bg-[#d88945] text-black hover:scale-[1.01]"
              : "pointer-events-none bg-black/10 text-black/30"
          }`}
        >
          Continue to User Scale
        </Link>
      </aside>

      <section className="grid gap-5">
        <ModelPreview compact loaded={loadState === "loaded"} />
        <MasterplanPreview compact loaded={loadState === "loaded"} />
      </section>
    </main>
  );
}
