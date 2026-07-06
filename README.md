# Public Space Behavior Analysis Platform

An interactive front-end prototype for architects and urban designers. Load a
public-space 3D model (test site: TusPark), configure user types, programs,
activities, entrances/exits and operating hours — then explore **computed**
behavioural outputs: movement flows, staying hotspots, congestion, user-type
distribution and time-slot variation, on both an annotated masterplan and an
interactive 3D model. A drag-and-drop Optimization page previews design
interventions and their estimated behavioural impact.

Fully client-side: no backend, no database, no external APIs.

## Run it locally

Requires [Node.js](https://nodejs.org) 18.18 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other commands:

```bash
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # TypeScript check
```

## Asset files

The site assets live in `public/assets/` (already included in this repo):

| File | Purpose |
| --- | --- |
| `public/assets/site-model.glb` | TusPark 3D site model |
| `public/assets/masterplan.png` | Masterplan base image |
| `public/assets/softmax-formula.png` | Softmax formula image (Methodology page) |

If a file is missing the app shows a clean empty state and logs exactly which
file to place where — it never hard-crashes.

## Pages

- **Home** — introduction and entry point, with the signature cursor/grid
  interaction.
- **Configure** (`/scale`) — the single source of truth: load the model, define
  user types / programs / activities / entrances / exits / operating hours /
  time slots, and tune the behaviour-model coefficients. Previews stay blank
  until you press **Load Model**.
- **Analysis** (`/output`) — Behaviour Masterplan Overview + 3D Behaviour
  Pattern Viewer, all recomputed live from the configuration. Includes a
  C-index validation readout against a mock observed dataset.
- **Optimization** (`/optimization-effects`) — drag one of five intervention
  modules (Seating, Shade/Canopy, Path Widening, Activity Node, Landscape
  Buffer) into predefined zones A–E and read the estimated, scenario-based
  behavioural impact.
- **Methodology** (`/methodology`) — the three-step behavioural model explained
  (regional raw score → dynamic entrance weight → softmax choice probability).

## Behavioural model

All outputs come from one documented module of pure functions:
`src/lib/behaviorModel.ts`.

1. **Regional raw score** — each program area scores on area size, facilities,
   environmental quality and traffic convenience.
2. **Dynamic entrance weight** —
   `W = w̄ × (1 + c_q (n − 1)) × d` (distance-weighted mean of connected area
   scores, boosted by the number of connected areas, scaled by a discount
   factor).
3. **Softmax choice probability** — scores become pedestrian choice
   probabilities; the temperature τ controls contrast.

The three coefficients (quantity coefficient, discount factor, temperature) are
tunable on the Configure page and everything downstream recomputes instantly.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · three.js ·
KaTeX

## Notes

This is a source-code prototype; it is intentionally not configured for
hosting. If the GitHub repository is public, the code is visible to others; to
make it private, open the repository settings on GitHub and change the
visibility under the Danger Zone section.
