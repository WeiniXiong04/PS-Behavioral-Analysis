import type { GeneratedOverlay, OptimizationEffects } from "@/types";

interface OptimizationPlanViewProps {
  overlay: GeneratedOverlay;
  effects: OptimizationEffects;
}

export function OptimizationPlanView({ overlay, effects }: OptimizationPlanViewProps) {
  return (
    <section className="liquid-surface overflow-hidden rounded-[2rem]">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-black/45">
          Masterplan with optimization changes
        </h2>
        <span className="glass-chip rounded-full px-3 py-1 text-xs text-black/45">
          visual effect overlay
        </span>
      </div>
      <div className="bg-white/20 p-4">
        <div className="relative mx-auto aspect-[1000/1175] max-h-[74vh] overflow-hidden rounded-[1.5rem] bg-white/35 shadow-inner backdrop-blur-xl">
          <img src="/images/masterplan.png" alt="Optimization masterplan" className="absolute inset-0 h-full w-full object-contain p-2" />
          <svg viewBox="0 0 100 117.5" className="absolute inset-0 h-full w-full">
            <defs>
              <radialGradient id="improvedActivity">
                <stop offset="0%" stopColor="#7fa99b" stopOpacity="0.62" />
                <stop offset="100%" stopColor="#7fa99b" stopOpacity="0" />
              </radialGradient>
            </defs>
            {overlay.programZones.slice(0, 3).map((zone) => (
              <circle
                key={zone.id}
                cx={zone.x}
                cy={zone.y * 1.175}
                r="8"
                fill="url(#improvedActivity)"
                opacity="0.7"
              />
            ))}
            {effects.overlays.map((item) => {
              if (item.type === "shades") {
                return (
                  <g key={item.id}>
                    <rect
                      x={item.x - item.width / 2}
                      y={item.y * 1.175 - item.height / 2}
                      width={item.width}
                      height={item.height}
                      rx="2"
                      fill={item.color}
                      opacity="0.34"
                      stroke="#111111"
                      strokeDasharray="1.4 1.2"
                    />
                    <text x={item.x} y={item.y * 1.175 + 0.7} textAnchor="middle" fontSize="2" fontWeight="800" fill="#111111">
                      shade
                    </text>
                  </g>
                );
              }

              if (item.type === "benches") {
                return (
                  <g key={item.id} transform={`rotate(-12 ${item.x} ${item.y * 1.175})`}>
                    <rect
                      x={item.x - item.width / 2}
                      y={item.y * 1.175 - item.height / 2}
                      width={item.width}
                      height={item.height}
                      rx="1.4"
                      fill={item.color}
                    />
                    <circle cx={item.x - item.width / 2 - 1} cy={item.y * 1.175} r="1.1" fill="#111111" />
                  </g>
                );
              }

              return (
                <g key={item.id} transform={`rotate(-36 ${item.x} ${item.y * 1.175})`}>
                  {[0, 1, 2, 3].map((step) => (
                    <rect
                      key={step}
                      x={item.x - item.width / 2 + step * 3.2}
                      y={item.y * 1.175 - item.height / 2}
                      width="2.2"
                      height={item.height}
                      fill="#111111"
                      opacity={0.65 + step * 0.08}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
}
