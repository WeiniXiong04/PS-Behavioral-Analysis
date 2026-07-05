import type { DiagnosticZone, TusparkData } from "@/types";

export function ResultPanel({ data }: { data: TusparkData }) {
  const criticalZone = [...data.congestedZones].sort(
    (a, b) => (b.congestionScore ?? 0) - (a.congestionScore ?? 0)
  )[0] as DiagnosticZone;

  return (
    <section className="glass-panel rounded-lg p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-white/50">Spatial diagnosis</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric label="Inactive zones" value={data.inactiveZones.length.toString()} tone="cool" />
        <Metric label="Congested zones" value={data.congestedZones.length.toString()} tone="danger" />
      </div>
      <div className="mt-4 rounded-md border border-danger/25 bg-danger/10 p-3">
        <div className="text-xs uppercase tracking-[0.14em] text-danger">Most critical area</div>
        <div className="mt-2 font-semibold text-white">{criticalZone.name}</div>
        <p className="mt-1 text-sm leading-6 text-white/50">{criticalZone.issue}</p>
      </div>
      <div className="mt-4">
        <div className="text-sm font-semibold text-white">Suggested design responses</div>
        <ul className="mt-2 grid gap-2 text-sm text-white/50">
          <li>Separate fast through-movement from optional staying space.</li>
          <li>Use shade, seating, and small program nodes to activate low-use edges.</li>
          <li>Clarify diagonal desire lines with paving and landscape buffers.</li>
        </ul>
      </div>
    </section>
  );
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "cool" | "danger" }) {
  const color = tone === "cool" ? "text-cool bg-cool/10" : "text-danger bg-danger/10";
  return (
    <div className={`rounded-md border border-white/10 p-3 ${color}`}>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-xs text-white/50">{label}</div>
    </div>
  );
}
