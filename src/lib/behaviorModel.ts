/**
 * behaviorModel.ts — the behavioural model engine.
 *
 * ONE self-contained, client-side module of pure functions. Everything the
 * Analysis page shows (heatmaps, movement flows, staying hotspots, program /
 * activity popularity, per-time-slot variation) is computed here from the
 * configuration the user builds on the Configure pages.
 *
 *   Configure inputs ──▶ behavioural model engine ──▶ output visualisations
 *
 * The model has three steps:
 *
 *  Step 1 — Regional raw score.
 *    Every area (a program marker placed on the plan) receives an initial
 *    score from four design attributes: area size, facilities, environmental
 *    quality and traffic convenience. The score is the base weight used by
 *    the simulation.
 *
 *  Step 2 — Dynamic entrance/exit weight.
 *      entranceWeight = weightedAverageWeight
 *                     × (1 + quantityCoefficient × (connectedAreas − 1))
 *                     × entranceDiscountFactor
 *    where weightedAverageWeight is the distance-weighted mean score of the
 *    areas an entrance connects to. Entrances connected to more (and more
 *    important) areas receive a higher weight.
 *
 *  Step 3 — Softmax choice probability.
 *      softmax(x_i) = e^(x_i / τ) / Σ_j e^(x_j / τ)
 *    Higher-scoring areas/entrances are proportionally more likely to be
 *    chosen by simulated pedestrians. τ (temperature) controls contrast:
 *    smaller τ → the strongest option dominates; larger τ → more even.
 *
 * A C-index (concordance index) readout compares the model's area ranking
 * against a mock observed dataset; > 0.7 counts as a good match.
 *
 * No backend, no external API — synthetic but deterministic.
 */

import type { PlanMarker, ScaleInputs, TimeSlot } from "@/types";

/* ------------------------------------------------------------------ */
/* Tunable coefficients                                                */
/* ------------------------------------------------------------------ */

export interface ModelCoefficients {
  /** Step 2: bonus per additional connected area. */
  quantityCoefficient: number;
  /** Step 2: global entrance discount factor. */
  entranceDiscountFactor: number;
  /** Step 3: softmax temperature τ. */
  softmaxTemperature: number;
}

export const defaultCoefficients: ModelCoefficients = {
  quantityCoefficient: 0.15,
  entranceDiscountFactor: 0.9,
  softmaxTemperature: 0.6
};

/** Step 1 attribute weights (sum to 1). */
const ATTRIBUTE_WEIGHTS = {
  areaSize: 0.2,
  facilities: 0.3,
  environmentalQuality: 0.2,
  trafficConvenience: 0.3
};

/** Plan-distance (0-100 grid units) within which an entrance "connects" to an area. */
const CONNECTION_RADIUS = 55;

/* ------------------------------------------------------------------ */
/* Step 1 — Regional raw score                                         */
/* ------------------------------------------------------------------ */

export interface AreaScore {
  areaId: string;
  label: string;
  programId: string;
  /** Attribute values, each 0..1 */
  areaSize: number;
  facilities: number;
  environmentalQuality: number;
  trafficConvenience: number;
  /** Weighted sum of the four attributes, 0..1 */
  rawScore: number;
}

/** Programs with a strong green / restful character score higher on environment. */
const ENVIRONMENT_BY_PROGRAM: Record<string, number> = {
  "green-space": 0.95,
  courtyard: 0.85,
  "seating-area": 0.8,
  plaza: 0.6,
  cafe: 0.65,
  exhibition: 0.55,
  retail: 0.45,
  "office-entrance": 0.4,
  "transit-connection": 0.35,
  "public-walkway": 0.5
};

/** Base dwell time in minutes by program — used by hotspot output. */
const STAY_MINUTES_BY_PROGRAM: Record<string, number> = {
  "seating-area": 8.5,
  courtyard: 7.5,
  cafe: 7,
  "green-space": 6,
  plaza: 5,
  exhibition: 4.5,
  retail: 4,
  "office-entrance": 2.5,
  "transit-connection": 2,
  "public-walkway": 1.5
};

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Step 1. Score one area from its design attributes.
 * - areaSize: program demand is used as a proxy for the space allotted to it.
 * - facilities: program demand (heavier programs bring more facilities).
 * - environmentalQuality: lookup by program character (green > paved).
 * - trafficConvenience: closeness to the nearest entrance (0..1).
 */
export function computeAreaScore(
  marker: PlanMarker,
  inputs: ScaleInputs,
  entrances: PlanMarker[]
): AreaScore {
  const program = inputs.programs.find((p) => p.id === marker.programId);
  const demand = program?.demand ?? 0.6;
  const nearest = entrances.length
    ? Math.min(...entrances.map((e) => distance(marker, e)))
    : 50;
  const trafficConvenience = clamp01(1 - nearest / 100);
  const environmentalQuality = ENVIRONMENT_BY_PROGRAM[marker.programId ?? ""] ?? 0.5;
  const areaSize = clamp01(0.35 + demand * 0.6);
  const facilities = clamp01(demand);

  const rawScore =
    ATTRIBUTE_WEIGHTS.areaSize * areaSize +
    ATTRIBUTE_WEIGHTS.facilities * facilities +
    ATTRIBUTE_WEIGHTS.environmentalQuality * environmentalQuality +
    ATTRIBUTE_WEIGHTS.trafficConvenience * trafficConvenience;

  return {
    areaId: marker.id,
    label: marker.label ?? program?.label ?? "Area",
    programId: marker.programId ?? "unknown",
    areaSize,
    facilities,
    environmentalQuality,
    trafficConvenience,
    rawScore
  };
}

/* ------------------------------------------------------------------ */
/* Step 2 — Dynamic entrance/exit weight                               */
/* ------------------------------------------------------------------ */

export interface EntranceWeight {
  entranceId: string;
  label: string;
  connectedAreaIds: string[];
  weightedAverageWeight: number;
  weight: number;
}

/**
 * Step 2. Weight one entrance by the areas it connects to.
 * Connected = areas within CONNECTION_RADIUS plan units. The average area
 * score is weighted by 1/distance so nearby important areas count more, then
 * boosted by how many areas the entrance serves and scaled by the discount
 * factor.
 */
export function computeEntranceWeight(
  entrance: PlanMarker,
  areaScores: AreaScore[],
  areaPositions: Map<string, PlanMarker>,
  coefficients: ModelCoefficients
): EntranceWeight {
  const connected = areaScores
    .map((area) => {
      const pos = areaPositions.get(area.areaId)!;
      return { area, dist: distance(entrance, pos) };
    })
    .filter((item) => item.dist <= CONNECTION_RADIUS);

  const considered = connected.length
    ? connected
    : areaScores
        .map((area) => ({ area, dist: distance(entrance, areaPositions.get(area.areaId)!) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 1);

  const totalInverse = considered.reduce((sum, item) => sum + 1 / Math.max(item.dist, 4), 0);
  const weightedAverageWeight = considered.reduce(
    (sum, item) => sum + item.area.rawScore * (1 / Math.max(item.dist, 4)) / totalInverse,
    0
  );

  const weight =
    weightedAverageWeight *
    (1 + coefficients.quantityCoefficient * (considered.length - 1)) *
    coefficients.entranceDiscountFactor;

  return {
    entranceId: entrance.id,
    label: entrance.label ?? "Entrance",
    connectedAreaIds: considered.map((item) => item.area.areaId),
    weightedAverageWeight,
    weight
  };
}

/* ------------------------------------------------------------------ */
/* Step 3 — Softmax choice probability                                 */
/* ------------------------------------------------------------------ */

/** softmax(x_i) = e^(x_i/τ) / Σ e^(x_j/τ). Numerically stabilised. */
export function softmax(values: number[], temperature: number): number[] {
  if (values.length === 0) return [];
  const t = Math.max(temperature, 0.05);
  const max = Math.max(...values);
  const exps = values.map((v) => Math.exp((v - max) / t));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

/* ------------------------------------------------------------------ */
/* Time-slot demand profiles                                           */
/* ------------------------------------------------------------------ */

type SlotKind = "morning" | "lunch" | "afternoon" | "evening" | "neutral";

function slotKind(slot: TimeSlot): SlotKind {
  const key = `${slot.id} ${slot.label}`.toLowerCase();
  if (key.includes("morn")) return "morning";
  if (key.includes("lunch") || key.includes("noon")) return "lunch";
  if (key.includes("after")) return "afternoon";
  if (key.includes("even") || key.includes("night")) return "evening";
  const hour = Number(slot.start?.split(":")[0] ?? 12);
  if (hour < 11) return "morning";
  if (hour < 14) return "lunch";
  if (hour < 17) return "afternoon";
  return "evening";
}

/** How strongly each program category attracts people per slot kind. */
const SLOT_PROGRAM_AFFINITY: Record<SlotKind, Record<string, number>> = {
  morning: { "office-entrance": 1.5, "transit-connection": 1.4, "public-walkway": 1.2, cafe: 1.1 },
  lunch: { cafe: 1.6, retail: 1.3, "seating-area": 1.4, plaza: 1.3, courtyard: 1.35 },
  afternoon: { "green-space": 1.3, exhibition: 1.25, "seating-area": 1.15, courtyard: 1.1 },
  evening: { "transit-connection": 1.5, plaza: 1.25, "public-walkway": 1.3, retail: 1.1 },
  neutral: {}
};

/** Overall footfall multiplier per slot kind (relative to a base of 1). */
const SLOT_DEMAND: Record<SlotKind, number> = {
  morning: 1.05,
  lunch: 1.25,
  afternoon: 0.85,
  evening: 0.95,
  neutral: 0.9
};

/** How active each user type is per slot kind (matched on user-type id/label keywords). */
const SLOT_USER_ACTIVITY: Record<SlotKind, Array<[RegExp, number]>> = {
  morning: [[/office/i, 1.6], [/through|pedestrian/i, 1.4], [/service/i, 1.3], [/student/i, 1.2]],
  lunch: [[/office/i, 1.5], [/visitor/i, 1.2], [/resident/i, 1.1]],
  afternoon: [[/visitor/i, 1.5], [/resident/i, 1.3], [/student/i, 1.2]],
  evening: [[/through|pedestrian/i, 1.5], [/student/i, 1.4], [/resident/i, 1.2]],
  neutral: []
};

function userSlotActivity(kind: SlotKind, userLabel: string, movementBias: number) {
  const rule = SLOT_USER_ACTIVITY[kind].find(([re]) => re.test(userLabel));
  return (rule ? rule[1] : 1) * (0.6 + movementBias * 0.6);
}

/* ------------------------------------------------------------------ */
/* C-index validation                                                  */
/* ------------------------------------------------------------------ */

/**
 * Mock observed popularity by program category — a stand-in for a TusPark
 * field-observation sample (relative visit intensity, 0..1).
 */
export const OBSERVED_REFERENCE: Record<string, number> = {
  "office-entrance": 0.9,
  "transit-connection": 0.82,
  cafe: 0.78,
  plaza: 0.74,
  retail: 0.66,
  "seating-area": 0.6,
  courtyard: 0.55,
  "public-walkway": 0.52,
  exhibition: 0.4,
  "green-space": 0.38
};

/**
 * Concordance index: over all area pairs with different observed values, the
 * fraction where the model ranks them in the same order (ties = 0.5).
 * 1 = perfect concordance, 0.5 = random.
 */
export function computeCIndex(
  modelScores: Array<{ programId: string; score: number }>,
  reference: Record<string, number> = OBSERVED_REFERENCE
): number {
  const pairs: Array<[number, number]> = []; // [modelDelta, observedDelta]
  for (let i = 0; i < modelScores.length; i += 1) {
    for (let j = i + 1; j < modelScores.length; j += 1) {
      const obsA = reference[modelScores[i].programId];
      const obsB = reference[modelScores[j].programId];
      if (obsA === undefined || obsB === undefined || obsA === obsB) continue;
      pairs.push([modelScores[i].score - modelScores[j].score, obsA - obsB]);
    }
  }
  if (pairs.length === 0) return 0.5;
  const concordant = pairs.reduce((sum, [m, o]) => {
    if (m === 0) return sum + 0.5;
    return sum + (Math.sign(m) === Math.sign(o) ? 1 : 0);
  }, 0);
  return concordant / pairs.length;
}

/* ------------------------------------------------------------------ */
/* Output dataset for the Analysis visualisations                      */
/* ------------------------------------------------------------------ */

export interface BehaviourUserType {
  id: string;
  label: string;
  color: string;
}

export interface BehaviourTimeSlot {
  id: string;
  label: string;
}

export interface EntranceMarkerOut {
  id: string;
  code: string;
  label: string;
  x: number;
  y: number;
  /** Step-2 weight and step-3 choice probability (all-slots average). */
  weight: number;
  probability: number;
}

export interface SpatialNodeOut {
  id: string;
  code: string;
  label: string;
  x: number;
  y: number;
}

export type FlowKind = "main" | "secondary" | "service";

export interface MovementFlowOut {
  id: string;
  code: string;
  name: string;
  from: string;
  to: string;
  kind: FlowKind;
  path: Array<[number, number]>;
  dominantUserTypeId: string;
  userTypeIds: string[];
  avgSpeed: string;
  peakSlotId: string;
  meaning: string;
  volumeLabel: string;
  volumeBySlot: Record<string, number>;
}

export interface StayingHotspotOut {
  id: string;
  code: string;
  name: string;
  x: number;
  y: number;
  users: number;
  avgStayMinutes: number;
  dominantBehaviour: string;
  dominantUserTypeId: string;
  peakSlotId: string;
  meaning: string;
  strengthBySlot: Record<string, number>;
  userMix: Array<{ userTypeId: string; share: number }>;
}

export interface SlotSummaryOut {
  observedUsers: number;
  dominantUserTypeId: string;
  mainFlowId: string;
  strongestHotspotId: string;
  avgStayMinutes: number;
  mostActiveNodeId: string;
  mostActiveTimeLabel: string;
  userMix: Array<{ userTypeId: string; share: number }>;
  readings: string[];
}

export interface ActivityPointOut {
  id: string;
  x: number;
  y: number;
}

export interface BehaviourDataset {
  userTypes: BehaviourUserType[];
  timeSlots: BehaviourTimeSlot[];
  entrances: EntranceMarkerOut[];
  nodes: SpatialNodeOut[];
  flows: MovementFlowOut[];
  hotspots: StayingHotspotOut[];
  activityPoints: ActivityPointOut[];
  slotSummaries: Record<string, SlotSummaryOut>;
  diagnostics: {
    areaScores: AreaScore[];
    entranceWeights: EntranceWeight[];
    cIndex: number;
  };
}

const DOMINANT_BEHAVIOUR_BY_PROGRAM: Record<string, string> = {
  "seating-area": "Sitting / Resting",
  courtyard: "Sitting / Socialising",
  cafe: "Eating / Drinking",
  "green-space": "Passive Watching",
  plaza: "Gathering / Events",
  exhibition: "Visiting",
  retail: "Shopping",
  "office-entrance": "Waiting",
  "transit-connection": "Passing Through",
  "public-walkway": "Walking"
};

/** Vertical scale: plan y stored as marker % × 1.175 to match the 1000×1175 masterplan. */
const PLAN_Y = 1.175;

/**
 * Run the full three-step model over the configured inputs and shape the
 * result for the masterplan + 3D visualisations. Pure and deterministic:
 * the same inputs and coefficients always produce the same dataset.
 */
export function buildBehaviourDataset(
  inputs: ScaleInputs,
  coefficients: ModelCoefficients = defaultCoefficients
): BehaviourDataset {
  const entranceMarkers = inputs.markers.filter((m) => m.type === "entrance");
  const exitMarkers = inputs.markers.filter((m) => m.type === "exit");
  const accessMarkers = [...entranceMarkers, ...exitMarkers]; // all access points
  const areaMarkers = inputs.markers.filter((m) => m.type === "program");
  const slots = inputs.timeSlots.length
    ? inputs.timeSlots
    : [{ id: "all-day", label: "All Day", start: inputs.operationHours.opening, end: inputs.operationHours.closing }];

  const userTypes: BehaviourUserType[] = inputs.userTypes.map((u) => ({
    id: u.id,
    label: u.label,
    color: u.color
  }));

  const timeSlots: BehaviourTimeSlot[] = slots.map((s) => ({ id: s.id, label: s.label }));

  /* ---- Step 1: raw scores ---- */
  const areaScores = areaMarkers.map((m) => computeAreaScore(m, inputs, accessMarkers));
  const areaPositions = new Map(areaMarkers.map((m) => [m.id, m]));

  /* ---- Step 2: entrance weights ---- */
  const entranceWeights = accessMarkers.map((e) =>
    computeEntranceWeight(e, areaScores, areaPositions, coefficients)
  );

  /* ---- Step 3 per slot: choice probabilities ---- */
  const slotAreaProb = new Map<string, number[]>();
  const slotEntranceProb = new Map<string, number[]>();
  slots.forEach((slot) => {
    const kind = slotKind(slot);
    const affinity = SLOT_PROGRAM_AFFINITY[kind];
    const adjusted = areaScores.map(
      (a) => a.rawScore * (affinity[a.programId] ?? 1)
    );
    slotAreaProb.set(slot.id, softmax(adjusted, coefficients.softmaxTemperature));
    slotEntranceProb.set(
      slot.id,
      softmax(entranceWeights.map((e) => e.weight), coefficients.softmaxTemperature)
    );
  });

  /* ---- Entrances out ---- */
  const avgEntranceProb = entranceWeights.map((_, i) => {
    const per = slots.map((s) => slotEntranceProb.get(s.id)![i]);
    return per.reduce((a, b) => a + b, 0) / Math.max(per.length, 1);
  });
  const entrances: EntranceMarkerOut[] = accessMarkers.map((m, i) => ({
    id: m.id,
    code: `E${i + 1}`,
    label: m.label ?? (m.type === "exit" ? "Exit" : "Entrance"),
    x: m.x,
    y: m.y * PLAN_Y,
    weight: entranceWeights[i].weight,
    probability: avgEntranceProb[i] ?? 0
  }));

  /* ---- Nodes: top areas by raw score ---- */
  const rankedAreas = [...areaScores].sort((a, b) => b.rawScore - a.rawScore);
  const nodes: SpatialNodeOut[] = rankedAreas.slice(0, 5).map((a, i) => {
    const pos = areaPositions.get(a.areaId)!;
    return { id: a.areaId, code: `N${i + 1}`, label: a.label, x: pos.x, y: pos.y * PLAN_Y };
  });

  /* ---- Flows: entrance × area, ranked by peak volume ---- */
  interface FlowCandidate {
    entranceIndex: number;
    areaIndex: number;
    volumeBySlot: Record<string, number>;
    peak: number;
    peakSlotId: string;
  }
  const candidates: FlowCandidate[] = [];
  accessMarkers.forEach((entrance, ei) => {
    areaScores.forEach((area, ai) => {
      const volumeBySlot: Record<string, number> = {};
      let peak = 0;
      let peakSlotId = slots[0]?.id ?? "";
      slots.forEach((slot) => {
        const kind = slotKind(slot);
        const volume =
          (slotEntranceProb.get(slot.id)![ei] ?? 0) *
          (slotAreaProb.get(slot.id)![ai] ?? 0) *
          SLOT_DEMAND[kind];
        volumeBySlot[slot.id] = volume;
        if (volume > peak) {
          peak = volume;
          peakSlotId = slot.id;
        }
      });
      candidates.push({ entranceIndex: ei, areaIndex: ai, volumeBySlot, peak, peakSlotId });
    });
  });
  candidates.sort((a, b) => b.peak - a.peak);

  // Keep the flow map readable: at most 2 flows per destination area and per
  // entrance, so one dominant area cannot absorb every displayed flow.
  const perArea = new Map<number, number>();
  const perEntrance = new Map<number, number>();
  const diverse: FlowCandidate[] = [];
  for (const cand of candidates) {
    if (diverse.length >= 5) break;
    if ((perArea.get(cand.areaIndex) ?? 0) >= 2) continue;
    if ((perEntrance.get(cand.entranceIndex) ?? 0) >= 2) continue;
    perArea.set(cand.areaIndex, (perArea.get(cand.areaIndex) ?? 0) + 1);
    perEntrance.set(cand.entranceIndex, (perEntrance.get(cand.entranceIndex) ?? 0) + 1);
    diverse.push(cand);
  }

  const maxPeak = diverse[0]?.peak || 1;
  const flows: MovementFlowOut[] = diverse.map((cand, i) => {
    const entrance = accessMarkers[cand.entranceIndex];
    const area = areaScores[cand.areaIndex];
    const areaPos = areaPositions.get(area.areaId)!;
    const eOut = entrances[cand.entranceIndex];
    const rel = cand.peak / maxPeak;
    const kind: FlowKind =
      /service/i.test(entrance.label ?? "") || /service/i.test(area.label)
        ? "service"
        : rel > 0.6
          ? "main"
          : "secondary";

    // Path: entrance → gentle midpoint bend → area (plan coords).
    const from = { x: entrance.x, y: entrance.y * PLAN_Y };
    const to = { x: areaPos.x, y: areaPos.y * PLAN_Y };
    const mid = {
      x: round((from.x + to.x) / 2 + Math.sin(i * 1.7 + 1) * 5, 2),
      y: round((from.y + to.y) / 2 + Math.cos(i * 1.3 + 2) * 4, 2)
    };

    // Dominant user type at the peak slot.
    const peakKind = slotKind(slots.find((s) => s.id === cand.peakSlotId) ?? slots[0]);
    const rankedUsers = [...inputs.userTypes].sort(
      (a, b) =>
        userSlotActivity(peakKind, b.label, b.movementBias) -
        userSlotActivity(peakKind, a.label, a.movementBias)
    );
    const dominant = rankedUsers[0];
    const speed = 0.8 + (dominant?.movementBias ?? 0.7) * 0.7;

    // Normalise volumes for display (0..1 against overall max).
    const volumeBySlot: Record<string, number> = {};
    Object.entries(cand.volumeBySlot).forEach(([sid, v]) => {
      volumeBySlot[sid] = round(clamp01(v / maxPeak));
    });

    return {
      id: `flow-${entrance.id}-${area.areaId}`,
      code: `F${i + 1}`,
      name: `${eOut.label} → ${area.label}`,
      from: `${eOut.code} ${eOut.label}`,
      to: area.label,
      kind,
      path: [
        [from.x, from.y],
        [mid.x, mid.y],
        [to.x, to.y]
      ],
      dominantUserTypeId: dominant?.id ?? userTypes[0]?.id ?? "",
      userTypeIds: rankedUsers.slice(0, 3).map((u) => u.id),
      avgSpeed: `${speed.toFixed(1)} m/s`,
      peakSlotId: cand.peakSlotId,
      meaning:
        kind === "service"
          ? "Low-frequency service link kept away from the main public flows."
          : rel > 0.6
            ? `Primary route: this entrance carries a large share of arrivals to ${area.label}.`
            : `Secondary route feeding ${area.label} outside its busiest period.`,
      volumeLabel: rel > 0.66 ? "High" : rel > 0.33 ? "Medium" : "Low",
      volumeBySlot
    };
  });

  /* ---- Hotspots: areas ranked by staying strength ---- */
  const stayRank = rankedAreas
    .map((area) => {
      const baseStay = STAY_MINUTES_BY_PROGRAM[area.programId] ?? 4;
      return { area, stayScore: area.rawScore * (baseStay / 8.5) };
    })
    .sort((a, b) => b.stayScore - a.stayScore);

  const totalUsersBase = 400 + inputs.userTypes.length * 160 + areaMarkers.length * 60;

  const hotspots: StayingHotspotOut[] = stayRank.slice(0, 5).map(({ area }, i) => {
    const pos = areaPositions.get(area.areaId)!;
    const areaIndex = areaScores.indexOf(area);
    const baseStay = STAY_MINUTES_BY_PROGRAM[area.programId] ?? 4;

    const strengthBySlot: Record<string, number> = {};
    let peakSlotId = slots[0]?.id ?? "";
    let peakStrength = 0;
    slots.forEach((slot) => {
      const p = slotAreaProb.get(slot.id)![areaIndex] ?? 0;
      const strength = p * SLOT_DEMAND[slotKind(slot)] * (baseStay / 8.5);
      strengthBySlot[slot.id] = strength;
      if (strength > peakStrength) {
        peakStrength = strength;
        peakSlotId = slot.id;
      }
    });
    const maxStrength = Math.max(...Object.values(strengthBySlot), 0.001);
    Object.keys(strengthBySlot).forEach((sid) => {
      strengthBySlot[sid] = round(clamp01(strengthBySlot[sid] / maxStrength) * (0.4 + 0.6 * (1 - i / 5)));
    });

    // User mix at this hotspot: user slot activity at its peak, normalised.
    const peakKind = slotKind(slots.find((s) => s.id === peakSlotId) ?? slots[0]);
    const activities = inputs.userTypes.map((u) => ({
      userTypeId: u.id,
      value: userSlotActivity(peakKind, u.label, u.movementBias)
    }));
    const totalActivity = activities.reduce((s, a) => s + a.value, 0) || 1;
    const userMix = activities
      .map((a) => ({ userTypeId: a.userTypeId, share: a.value / totalActivity }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 4);
    const mixTotal = userMix.reduce((s, m) => s + m.share, 0) || 1;
    userMix.forEach((m) => (m.share = round(m.share / mixTotal)));

    const avgProb =
      slots.reduce((s, slot) => s + (slotAreaProb.get(slot.id)![areaIndex] ?? 0), 0) /
      Math.max(slots.length, 1);

    return {
      id: area.areaId,
      code: `H${i + 1}`,
      name: area.label,
      x: pos.x,
      y: pos.y * PLAN_Y,
      users: Math.round(totalUsersBase * avgProb * 0.6),
      avgStayMinutes: Math.round(baseStay * (0.8 + area.rawScore * 0.4) * 10) / 10,
      dominantBehaviour: DOMINANT_BEHAVIOUR_BY_PROGRAM[area.programId] ?? "Staying",
      dominantUserTypeId: userMix[0]?.userTypeId ?? userTypes[0]?.id ?? "",
      peakSlotId,
      meaning: `Staying anchor around ${area.label}: score ${area.rawScore.toFixed(2)} with ${(
        avgProb * 100
      ).toFixed(0)}% average choice probability.`,
      strengthBySlot,
      userMix
    };
  });

  /* ---- Background activity points around hotspots ---- */
  const activityPoints: ActivityPointOut[] = hotspots.flatMap((h, hi) =>
    Array.from({ length: 12 }, (_, i) => {
      const angle = i * 2.399963 + hi;
      const radius = 2 + ((i * 37 + hi * 17) % 100) / 100 * 6.5;
      return {
        id: `${h.id}-pt-${i}`,
        x: round(Math.min(96, Math.max(4, h.x + Math.cos(angle) * radius)), 2),
        y: round(Math.min(113, Math.max(4, h.y + Math.sin(angle) * radius * 0.85)), 2)
      };
    })
  );

  /* ---- Per-slot summaries ---- */
  const slotSummaries: Record<string, SlotSummaryOut> = {};
  slots.forEach((slot) => {
    const kind = slotKind(slot);
    const areaProbs = slotAreaProb.get(slot.id)!;

    const userActivity = inputs.userTypes.map((u) => ({
      userTypeId: u.id,
      value: userSlotActivity(kind, u.label, u.movementBias)
    }));
    const totalUA = userActivity.reduce((s, a) => s + a.value, 0) || 1;
    const userMix = userActivity
      .map((a) => ({ userTypeId: a.userTypeId, share: round(a.value / totalUA) }))
      .sort((a, b) => b.share - a.share);

    const mainFlow =
      [...flows].sort((a, b) => (b.volumeBySlot[slot.id] ?? 0) - (a.volumeBySlot[slot.id] ?? 0))[0] ??
      flows[0];
    const strongestHotspot =
      [...hotspots].sort(
        (a, b) => (b.strengthBySlot[slot.id] ?? 0) - (a.strengthBySlot[slot.id] ?? 0)
      )[0] ?? hotspots[0];

    const topAreaIndex = areaProbs.indexOf(Math.max(...areaProbs));
    const topArea = areaScores[topAreaIndex];
    const activeNode = nodes.find((n) => n.id === topArea?.areaId) ?? nodes[0];

    const weightedStay =
      hotspots.reduce((s, h) => s + h.avgStayMinutes * (h.strengthBySlot[slot.id] ?? 0), 0) /
      Math.max(
        hotspots.reduce((s, h) => s + (h.strengthBySlot[slot.id] ?? 0), 0),
        0.001
      );

    const dominantUser = userMix[0];
    const dominantLabel = userTypes.find((u) => u.id === dominantUser?.userTypeId)?.label ?? "Users";

    slotSummaries[slot.id] = {
      observedUsers: Math.round(totalUsersBase * SLOT_DEMAND[kind]),
      dominantUserTypeId: dominantUser?.userTypeId ?? "",
      mainFlowId: mainFlow?.id ?? "",
      strongestHotspotId: strongestHotspot?.id ?? "",
      avgStayMinutes: Math.round((weightedStay || 3) * 10) / 10,
      mostActiveNodeId: activeNode?.id ?? "",
      mostActiveTimeLabel: `${slot.start} - ${slot.end}`,
      userMix,
      readings: [
        mainFlow
          ? `${mainFlow.from} forms the strongest arrival flow toward ${mainFlow.to} during ${slot.label.toLowerCase()}.`
          : `Movement is evenly distributed during ${slot.label.toLowerCase()}.`,
        strongestHotspot
          ? `Staying activity concentrates around ${strongestHotspot.name} (avg. ${strongestHotspot.avgStayMinutes} min).`
          : "No strong staying anchor emerges in this slot.",
        `${dominantLabel} dominate the ${slot.label.toLowerCase()} mix at ${(100 * (dominantUser?.share ?? 0)).toFixed(0)}% of observed users.`
      ]
    };
  });

  /* ---- Validation ---- */
  const cIndex = computeCIndex(
    areaScores.map((a) => ({ programId: a.programId, score: a.rawScore }))
  );

  return {
    userTypes,
    timeSlots,
    entrances,
    nodes,
    flows,
    hotspots,
    activityPoints,
    slotSummaries,
    diagnostics: { areaScores, entranceWeights, cIndex }
  };
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/**
 * Round to a fixed number of decimals. Transcendental functions (sin/exp) can
 * differ in the last bit between Node and the browser, which would make the
 * server-rendered SVG differ from the client render (hydration mismatch).
 * Rounding every value that reaches the DOM keeps both sides identical.
 */
function round(v: number, decimals = 4) {
  const f = 10 ** decimals;
  return Math.round(v * f) / f;
}

/**
 * TusPark public-space boundary polygon in plan coordinates (x 0-100,
 * y 0-117.5). Site geometry, not behaviour — shared by plan and 3D views.
 */
export const publicSpaceBoundary: Array<[number, number]> = [
  [20, 30],
  [80, 30],
  [92, 54],
  [90, 82],
  [64, 100],
  [34, 98],
  [12, 74],
  [14, 44]
];
