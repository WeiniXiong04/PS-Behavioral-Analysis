"use client";

import { Plus } from "lucide-react";
import type { TimeSlot } from "@/types";

interface TimeSlotInputProps {
  opening: string;
  closing: string;
  slots: TimeSlot[];
  onOpeningChange: (value: string) => void;
  onClosingChange: (value: string) => void;
  onSlotsChange: (slots: TimeSlot[]) => void;
}

export function TimeSlotInput({
  opening,
  closing,
  slots,
  onOpeningChange,
  onClosingChange,
  onSlotsChange
}: TimeSlotInputProps) {
  function updateSlot(id: string, key: keyof TimeSlot, value: string) {
    onSlotsChange(slots.map((slot) => (slot.id === id ? { ...slot, [key]: value } : slot)));
  }

  function addSlot() {
    onSlotsChange([
      ...slots,
      {
        id: `custom-${Date.now()}`,
        label: "Custom slot",
        start: "15:00",
        end: "16:00"
      }
    ]);
  }

  return (
    <section className="liquid-surface rounded-[2rem] p-5">
      <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/50">
          Time Slots / Operation Hours
        </h2>
        <button type="button" onClick={addSlot} className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
          <Plus size={15} />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
          Opening time
          <input
            type="time"
            value={opening}
            onChange={(event) => onOpeningChange(event.target.value)}
            className="liquid-control rounded-full px-4 py-3 text-base text-black outline-none focus:border-white/80"
          />
        </label>
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-black/45">
          Closing time
          <input
            type="time"
            value={closing}
            onChange={(event) => onClosingChange(event.target.value)}
            className="liquid-control rounded-full px-4 py-3 text-base text-black outline-none focus:border-white/80"
          />
        </label>
      </div>
      <div className="mt-4 grid gap-3">
        {slots.map((slot) => (
          <div key={slot.id} className="liquid-soft grid gap-2 rounded-[1.25rem] p-3 sm:grid-cols-[1fr_auto_auto]">
            <input
              value={slot.label}
              onChange={(event) => updateSlot(slot.id, "label", event.target.value)}
              className="liquid-control rounded-full px-3 py-2 text-sm font-semibold outline-none"
            />
            <input
              type="time"
              value={slot.start}
              onChange={(event) => updateSlot(slot.id, "start", event.target.value)}
              className="liquid-control rounded-full px-3 py-2 text-sm outline-none"
            />
            <input
              type="time"
              value={slot.end}
              onChange={(event) => updateSlot(slot.id, "end", event.target.value)}
              className="liquid-control rounded-full px-3 py-2 text-sm outline-none"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
