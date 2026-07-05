import type { ClassificationSummary } from "@/types";

const groupColors: Record<string, string> = {
  office_worker: "bg-signal",
  through_pedestrian: "bg-danger",
  visitor: "bg-cool",
  passive_user: "bg-[#80a4c2]",
  student_young_user: "bg-success",
  service_staff: "bg-[#b58ad9]"
};

export function UserClassificationPanel({
  classification
}: {
  classification: ClassificationSummary;
}) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/50">User classification</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{classification.mainUserGroup}</h2>
        </div>
        <div className="rounded-md bg-white/5 px-3 py-2 text-right">
          <div className="text-2xl font-semibold text-white">{classification.totalObservedUsers}</div>
          <div className="text-xs text-white/50">observed users</div>
        </div>
      </div>
      <div className="mt-4 text-sm text-white/50">
        Peak time: <span className="font-semibold text-white">{classification.peakTime}</span>
      </div>
      <div className="mt-4 grid gap-3">
        {classification.groups.map((group) => (
          <div key={group.id}>
            <div className="mb-1 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-white/100">{group.label}</span>
              <span className="text-white/50">{group.percentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full ${groupColors[group.id] ?? "bg-white"}`}
                style={{ width: `${group.percentage}%` }}
              />
            </div>
            <p className="mt-1 text-xs leading-5 text-white/50">{group.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
