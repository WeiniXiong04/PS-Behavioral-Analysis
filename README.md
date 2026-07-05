# Public Space Behavior Analysis Platform

An interactive front-end prototype for architecture and urban-design analysis. The platform lets a designer load a public-space model, configure users and programs, identify entrances/exits on a masterplan, and generate computed behavioural outputs as both plan overlays and a 3D model view.

## Features

- Light, premium spatial interface with glass panels, pill controls, and cursor-reactive motion.
- Four-page information architecture: Home, Configure, Analysis, Methodology.
- Configure page as the single source of truth for:
  - 3D model loading state
  - user types
  - programs
  - activities
  - entrances, exits, and program markers
  - operating hours and time slots
  - behavioural model coefficients
- Client-side behavioural model engine:
  - regional raw score
  - dynamic entrance/exit weight
  - softmax choice probability
- Analysis page with computed masterplan and 3D overlays.
- C-index validation readout against a mock observed reference dataset.
- No backend, database, paid service, or deployment dependency.

## Local Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:3000
```

Run type checking:

```bash
npm run typecheck
```

Build the production version locally:

```bash
npm run build
```

Start the production build locally:

```bash
npm run start
```

## Project Structure

- `src/app/page.tsx` - Home / landing page
- `src/app/scale/page.tsx` - Configure page
- `src/app/output/page.tsx` - Analysis / results page
- `src/app/methodology/page.tsx` - Methodology explanation
- `src/lib/behaviorModel.ts` - pure client-side behavioural model engine
- `public/models` - 3D model files
- `public/images` - masterplan and heatmap images

## Notes

The project is designed as a source-code prototype. It is not configured for hosting in this task. If the GitHub repository is public, the code will be visible to others; to make it private, open the repository settings on GitHub and change the visibility under the Danger Zone section.
