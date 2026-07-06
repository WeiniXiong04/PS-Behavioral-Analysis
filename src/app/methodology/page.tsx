import katex from "katex";
import "katex/dist/katex.min.css";
import { PlanImage } from "@/components/PlanImage";
import { defaultCoefficients } from "@/lib/behaviorModel";

/** Server-side KaTeX typesetting for non-image formulas. */
function Formula({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: true });
  // eslint-disable-next-line react/no-danger
  return <div className="overflow-x-auto py-1" dangerouslySetInnerHTML={{ __html: html }} />;
}

const steps = [
  {
    eyebrow: "Step 01",
    title: "Regional Raw Score",
    body:
      "Each program area receives a base score from four design attributes: area size, facilities, environmental quality, and traffic convenience. This creates the first spatial attractiveness layer."
  },
  {
    eyebrow: "Step 02",
    title: "Dynamic Entrance Weight",
    body:
      "Entrances and exits are weighted by the importance and quantity of connected areas. Access points linked to more active regions become more likely origins or destinations."
  },
  {
    eyebrow: "Step 03",
    title: "Softmax Choice Probability",
    body:
      "Area and entrance scores are transformed into choice probabilities. These probabilities drive heatmap intensity, movement flows, staying hotspots, and time-slot differences."
  }
];

export default function MethodologyPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8">
      <section className="liquid-surface overflow-hidden rounded-[2.5rem] p-6 md:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-black/45">
              Methodology / transparent behaviour model
            </div>
            <h1 className="font-dot mt-4 text-5xl font-black uppercase leading-none text-black md:text-7xl">
              Weight Driven Behaviour
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-black/62">
              The prototype is fully client-side. Configure inputs are passed into a pure behaviour
              model engine, then converted into analysis layers for the masterplan and 3D viewer.
              No backend, database, or external service is required.
            </p>
          </div>
          <div className="liquid-soft rounded-[2rem] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
              Current default coefficients
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <Row label="Quantity coefficient" value={defaultCoefficients.quantityCoefficient.toFixed(2)} />
              <Row label="Entrance discount factor" value={defaultCoefficients.entranceDiscountFactor.toFixed(2)} />
              <Row label="Softmax temperature" value={defaultCoefficients.softmaxTemperature.toFixed(2)} />
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {steps.map((step) => (
          <article key={step.title} className="liquid-surface rounded-[2rem] p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
              {step.eyebrow}
            </div>
            <h2 className="font-dot mt-8 text-3xl font-black uppercase leading-none text-black">
              {step.title}
            </h2>
            <p className="mt-5 text-sm leading-6 text-black/62">{step.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <article className="liquid-surface rounded-[2rem] p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
            Entrance weighting formula
          </div>
          <div className="mt-6 rounded-[1.5rem] bg-white/45 p-5 text-sm leading-7 text-black/70">
            <Formula tex="W_{e} = \bar{w} \times \bigl(1 + c_{q}\,(n_{\text{areas}} - 1)\bigr) \times d_{e}" />
            <p className="mt-3">
              <span className="font-semibold text-black">W<sub>e</sub></span> entrance weight ·{" "}
              <span className="font-semibold text-black">w̄</span> distance-weighted average score of
              connected areas · <span className="font-semibold text-black">c<sub>q</sub></span>{" "}
              connected-area quantity coefficient ·{" "}
              <span className="font-semibold text-black">n</span> number of connected areas ·{" "}
              <span className="font-semibold text-black">d<sub>e</sub></span> entrance discount factor.
            </p>
          </div>
        </article>

        <article className="liquid-surface rounded-[2rem] p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
            Softmax probability
          </div>
          <div className="mt-6 rounded-[1.5rem] bg-white/45 p-5 text-sm leading-7 text-black/70">
            <PlanImage
              src="/assets/softmax-formula.png"
              alt="softmax(x_i) = e^(x_i) / sum_j e^(x_j)"
              className="mx-auto h-24 object-contain"
              assetHint="Missing formula image — place softmax-formula.png in public/assets/"
            />
            <p className="mt-3">
              Scores are divided by the temperature τ before the softmax. A lower temperature creates
              more contrast and stronger attraction to high-scoring areas; a higher temperature
              distributes pedestrians more evenly.
            </p>
          </div>
        </article>
      </section>

      <section className="liquid-surface rounded-[2rem] p-6">
        <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Validation readout
            </div>
            <h2 className="font-dot mt-3 text-4xl font-black uppercase text-black">C-index</h2>
          </div>
          <p className="text-sm leading-7 text-black/62">
            The C-index compares the model's predicted area ranking against a mock observed dataset.
            A value above 0.70 is marked as a good match, indicating that the simulated spatial
            preferences broadly align with the reference behavioural observations.
          </p>
        </div>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 pb-2">
      <dt className="text-black/50">{label}</dt>
      <dd className="font-dot text-xl font-black text-black">{value}</dd>
    </div>
  );
}
