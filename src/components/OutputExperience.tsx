"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BehaviourMasterplanViewer } from "@/components/BehaviourMasterplanViewer";
import { BehaviourPatternViewer } from "@/components/BehaviourPatternViewer";
import type { BehaviourSlotId } from "@/lib/behaviourData";

export function OutputExperience() {
  const [timeSlotId, setTimeSlotId] = useState<BehaviourSlotId>("lunch");

  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8">
      <BehaviourMasterplanViewer timeSlotId={timeSlotId} onTimeSlotChange={setTimeSlotId} />
      <BehaviourPatternViewer timeSlotId={timeSlotId} onTimeSlotChange={setTimeSlotId} />
      <div className="flex justify-end">
        <Link
          href="/optimization-effects"
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white transition hover:scale-[1.02]"
        >
          Continue to Optimization Effects <ArrowUpRight size={18} />
        </Link>
      </div>
    </main>
  );
}
