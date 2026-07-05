"use client";

import { Armchair, PanelsTopLeft, Rows3 } from "lucide-react";
import type { OptimizationSelection } from "@/types";

const controls = [
  {
    key: "shades" as const,
    label: "Shades",
    text: "Adds shaded areas and increases staying activity.",
    icon: PanelsTopLeft
  },
  {
    key: "benches" as const,
    label: "Benches",
    text: "Adds seating markers and increases resting behavior.",
    icon: Armchair
  },
  {
    key: "stairs" as const,
    label: "Stairs",
    text: "Adds connection markers and balances movement pressure.",
    icon: Rows3
  }
];

interface OptimizationControlPanelProps {
  selected: OptimizationSelection;
  onToggle: (key: keyof OptimizationSelection) => void;
}

export function OptimizationControlPanel({ selected, onToggle }: OptimizationControlPanelProps) {
  return (
    <aside className="liquid-surface rounded-[2rem] p-5">
      <div className="border-b border-black/10 pb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
          Optimization elements
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {controls.map((item) => {
          const active = Boolean(selected[item.key]);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggle(item.key)}
              className={`rounded-[1.35rem] border p-4 text-left transition ${
                active ? "border-black bg-black text-white" : "border-black/10 bg-[#f3f2ef] text-black hover:border-black/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <item.icon size={20} />
                <span className={`rounded-full px-3 py-1 text-xs ${active ? "bg-white text-black" : "bg-white text-black/45"}`}>
                  {active ? "on" : "off"}
                </span>
              </div>
              <div className="mt-5 text-lg font-bold tracking-[-0.03em]">{item.label}</div>
              <p className={`mt-2 text-sm leading-6 ${active ? "text-white/70" : "text-black/55"}`}>{item.text}</p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
