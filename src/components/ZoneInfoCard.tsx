import { getUserTypeLabel } from "@/lib/classification";
import type { BehaviourPoint, DiagnosticZone } from "@/types";

type Selection =
  | { kind: "inactive"; item: DiagnosticZone }
  | { kind: "congested"; item: DiagnosticZone }
  | { kind: "point"; item: BehaviourPoint };

export function ZoneInfoCard({ selection }: { selection: Selection | null }) {
  if (!selection) {
    return (
      <div className="rounded-md border border-white/10 bg-ink/50 p-4">
        <div className="text-sm font-semibold text-white">Click a zone or behaviour point</div>
        <p className="mt-2 text-sm leading-6 text-white/50">
          The diagnostic card will show activity score, congestion score, issue, and design
          suggestion for the selected spatial element.
        </p>
      </div>
    );
  }

  if (selection.kind === "point") {
    const point = selection.item;
    return (
      <div className="rounded-md border border-white/10 bg-ink/70 p-4">
        <div className="text-xs uppercase tracking-[0.16em] text-signal">Behaviour point</div>
        <h3 className="mt-2 text-lg font-semibold text-white">{point.id}</h3>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <Info label="User type" value={getUserTypeLabel(point.userType)} />
          <Info label="Behaviour" value={point.behaviour.replaceAll("_", " ")} />
          <Info label="Speed" value={`${point.speed} m/s`} />
          <Info label="Duration" value={`${point.duration}s`} />
          <Info label="Time" value={point.time} />
          <Info label="Density" value={point.density.toFixed(2)} />
        </dl>
      </div>
    );
  }

  const zone = selection.item;
  const isCongested = selection.kind === "congested";

  return (
    <div
      className={`rounded-md border p-4 ${
        isCongested ? "border-danger/30 bg-danger/10" : "border-cool/30 bg-cool/10"
      }`}
    >
      <div className={`text-xs uppercase tracking-[0.16em] ${isCongested ? "text-danger" : "text-cool"}`}>
        {isCongested ? "Congested zone" : "Inactive zone"}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-white">{zone.name}</h3>
      <div className="mt-3 rounded-md bg-ink/50 p-3">
        <div className="text-3xl font-semibold text-white">
          {isCongested ? zone.congestionScore : zone.activityScore}
        </div>
        <div className="text-xs text-white/50">{isCongested ? "Congestion score" : "Activity score"}</div>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/70">{zone.issue}</p>
      <div className="mt-3 rounded-md bg-white/5 p-3 text-sm leading-6 text-white/70">
        <span className="font-semibold text-white">Design suggestion: </span>
        {zone.suggestion}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="mt-1 font-medium capitalize text-white/100">{value}</dd>
    </div>
  );
}
