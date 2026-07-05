"use client";

import { heatmapFrames } from "@/lib/data";

export function TimeSlider({
  value,
  onChange
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const frame = heatmapFrames[value];

  return (
    <div className="rounded-md border border-white/10 bg-ink/70 p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white">Time Period Filter</span>
        <span className="text-signal">{frame.label}</span>
      </div>
      <input
        aria-label="Time period filter"
        className="mt-3 w-full accent-[#d88945]"
        min={0}
        max={heatmapFrames.length - 1}
        step={1}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-2 flex justify-between text-xs text-white/40">
        {heatmapFrames.map((item) => (
          <span key={item.minute}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
