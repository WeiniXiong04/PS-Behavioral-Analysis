"use client";

import { useEffect, useState } from "react";

const messages = [
  "Reading spatial inputs...",
  "Calculating user distribution...",
  "Generating movement heatmaps...",
  "Producing plan and 3D overlays..."
];

export function AnalysisAnimation({ active }: { active: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    const timer = window.setInterval(() => {
      setStep((current) => Math.min(messages.length - 1, current + 1));
    }, 620);
    return () => window.clearInterval(timer);
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#efefed]/90 backdrop-blur-xl">
      <div className="liquid-surface w-[min(520px,90vw)] rounded-[2rem] p-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-white" />
        </div>
        <div className="font-dot mt-6 text-xl font-black uppercase text-black">{messages[step]}</div>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {messages.map((message, index) => (
            <div
              key={message}
              className={`h-2 rounded-full transition ${index <= step ? "bg-black" : "bg-black/10"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
