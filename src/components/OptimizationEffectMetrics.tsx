import type { OptimizationEffectMetrics as Metrics } from "@/types";

const metricLabels: Record<keyof Metrics, string> = {
  movementDistribution: "Movement Distribution",
  stayingActivity: "Staying Activity",
  congestionPressure: "Congestion Pressure",
  inactiveAreaReduction: "Inactive Area Reduction"
};

export function OptimizationEffectMetrics({ metrics }: { metrics: Metrics }) {
  return (
    <section className="liquid-surface rounded-[2rem] p-5">
      <div className="mb-4 border-b border-black/10 pb-3 text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
        Before / after indicators
      </div>
      <div className="grid gap-3">
        {(Object.keys(metrics) as Array<keyof Metrics>).map((key) => {
          const item = metrics[key];
          return (
            <div key={key} className="rounded-[1.2rem] bg-[#f3f2ef] p-3">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-black">{metricLabels[key]}</span>
                <span className="text-black/45">{item.before} → {item.after}</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-white">
                <div className="absolute inset-y-0 left-0 rounded-full bg-black/25" style={{ width: `${item.before}%` }} />
                <div className="absolute inset-y-0 left-0 rounded-full bg-black" style={{ width: `${item.after}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
