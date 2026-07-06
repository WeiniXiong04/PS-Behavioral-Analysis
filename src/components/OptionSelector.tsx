"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { ActivityOption, ProgramOption, UserTypeOption } from "@/types";

type Option = UserTypeOption | ProgramOption | ActivityOption;

interface OptionSelectorProps<T extends Option> {
  title: string;
  options: T[];
  selected: T[];
  onChange: (items: T[]) => void;
  createCustom: (label: string) => T;
}

export function OptionSelector<T extends Option>({
  title,
  options,
  selected,
  onChange,
  createCustom
}: OptionSelectorProps<T>) {
  const [customLabel, setCustomLabel] = useState("");
  const [localOptions, setLocalOptions] = useState<T[]>(options);

  function toggle(option: T) {
    const exists = selected.some((item) => item.id === option.id);
    onChange(exists ? selected.filter((item) => item.id !== option.id) : [...selected, option]);
  }

  function addCustom() {
    const label = customLabel.trim();
    if (!label) {
      return;
    }
    const item = createCustom(label);
    setLocalOptions((current) => [...current, item]);
    onChange([...selected, item]);
    setCustomLabel("");
  }

  return (
    <section className="liquid-surface rounded-[2rem] p-5">
      <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/50">{title}</h2>
        <span className="glass-chip rounded-full px-3 py-1 text-xs text-black/45">
          {selected.length} selected
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {localOptions.map((option) => {
          const active = selected.some((item) => item.id === option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                active ? "liquid-control-active" : "liquid-control text-black/78 hover:border-white/80 hover:bg-white/30"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={customLabel}
          onChange={(event) => setCustomLabel(event.target.value)}
          placeholder={`Add custom ${title.toLowerCase()}`}
          className="liquid-control min-w-0 flex-1 rounded-full px-4 py-2 text-sm outline-none placeholder:text-black/34 focus:border-white/80"
        />
        <button
          type="button"
          onClick={addCustom}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white"
          aria-label={`Add ${title}`}
        >
          <Plus size={16} />
        </button>
      </div>
    </section>
  );
}
