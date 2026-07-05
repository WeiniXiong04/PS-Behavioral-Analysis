import { CheckCircle2, CircleDot } from "lucide-react";

const steps = [
  "Load Data",
  "Classify Users",
  "Run Spatial Diagnosis",
  "View Plan Output",
  "View 3D Model"
];

export function WorkflowSidebar({ activeStep = 2 }: { activeStep?: number }) {
  return (
    <aside className="glass-panel rounded-lg p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-white/50">Workflow</div>
      <div className="mt-4 grid gap-3">
        {steps.map((step, index) => {
          const complete = index < activeStep;
          const active = index === activeStep;
          return (
            <div
              key={step}
              className={`flex items-center gap-3 rounded-md border px-3 py-3 text-sm ${
                active
                  ? "border-signal/50 bg-signal/10 text-white"
                  : complete
                    ? "border-success/20 bg-success/10 text-white/75"
                    : "border-white/10 bg-white/5 text-white/40"
              }`}
            >
              {complete ? (
                <CheckCircle2 size={17} className="text-success" />
              ) : (
                <CircleDot size={17} className={active ? "text-signal" : "text-white/30"} />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
