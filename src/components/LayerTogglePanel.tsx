"use client";

interface LayerTogglePanelProps<T extends object> {
  title: string;
  layers: { [K in keyof T]: boolean };
  labels: Record<keyof T, string>;
  onToggle: (key: keyof T) => void;
}

export function LayerTogglePanel<T extends object>({
  title,
  layers,
  labels,
  onToggle
}: LayerTogglePanelProps<T>) {
  return (
    <div className="liquid-surface rounded-[1.5rem] p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-black/45">{title}</div>
      <div className="grid gap-2">
        {(Object.keys(labels) as Array<keyof T>).map((key) => (
          <label key={String(key)} className="flex cursor-pointer items-center justify-between gap-3 rounded-full bg-white/35 px-3 py-2 text-sm text-black/70 shadow-inner backdrop-blur-xl">
            <span>{labels[key]}</span>
            <input
              type="checkbox"
              checked={layers[key]}
              onChange={() => onToggle(key)}
              className="h-4 w-4 accent-black"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
