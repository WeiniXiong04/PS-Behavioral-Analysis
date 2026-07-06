/**
 * interventions.ts — data for the Optimization page
 * ("Design Strategy Preview": a modular drag-and-drop intervention system).
 *
 * This is NOT a simulator. Score changes are scenario-based estimates from a
 * fixed impact table — always presented as
 * "Estimated impact based on behaviour-design assumptions."
 */

export type InterventionTypeId =
  | "seating"
  | "shade"
  | "path"
  | "activity-node"
  | "landscape-buffer";

export interface ScoreDelta {
  metric: string;
  delta: number; // signed points on a 0-100 scale (or minutes for staying duration)
  unit?: "pts" | "min" | "%";
}

export interface InterventionType {
  id: InterventionTypeId;
  label: string;
  shortLabel: string;
  color: string;
  purpose: string;
  problems: string[];
  elements: string[];
  expectedImpacts: string[];
  scoreDeltas: ScoreDelta[];
  designReading: string;
}

export const interventionTypes: InterventionType[] = [
  {
    id: "seating",
    label: "Seating Intervention",
    shortLabel: "Seating",
    color: "#c9a27a",
    purpose:
      "For places with staying demand but no proper facilities for rest, waiting, or informal social interaction.",
    problems: [
      "Staying demand exists but seating is missing",
      "People temporarily stop at edges or entrances",
      "Passive users lack comfortable staying spaces",
      "Public space edges are underused"
    ],
    elements: ["Linear bench", "Modular seating", "Edge seating", "Steps seating", "Informal platform"],
    expectedImpacts: [
      "Increase average staying duration",
      "Increase passive user occupation",
      "Convert temporary waiting into stable staying",
      "Activate edge spaces",
      "Support informal social interaction"
    ],
    scoreDeltas: [
      { metric: "Activity Score", delta: 20, unit: "pts" },
      { metric: "Staying Duration", delta: 30, unit: "%" },
      { metric: "Passive User Attraction", delta: 25, unit: "%" },
      { metric: "Congestion Score", delta: 0, unit: "pts" }
    ],
    designReading:
      "Adding seating along this edge can transform temporary waiting into more stable staying behaviour and increase passive user activity."
  },
  {
    id: "shade",
    label: "Shade / Canopy Intervention",
    shortLabel: "Shade / Canopy",
    color: "#9db8c9",
    purpose:
      "For open spaces with potential where people do not stay long, especially during lunch peak or hot conditions.",
    problems: [
      "Open space has low occupation during midday",
      "Staying duration is short",
      "People avoid exposed areas",
      "The space lacks thermal comfort"
    ],
    elements: ["Light canopy", "Tree canopy", "Pergola", "Shaded pavilion", "Temporary shading"],
    expectedImpacts: [
      "Increase midday staying",
      "Improve perceived comfort",
      "Extend the usable time of open space",
      "Attract passive users and visitors",
      "Support longer rest and social interaction"
    ],
    scoreDeltas: [
      { metric: "Activity Score", delta: 15, unit: "pts" },
      { metric: "Staying Duration", delta: 25, unit: "%" },
      { metric: "Passive User Attraction", delta: 15, unit: "%" },
      { metric: "Comfort Score", delta: 30, unit: "pts" }
    ],
    designReading:
      "Adding shade can improve thermal comfort and increase the likelihood of people staying during lunch peak."
  },
  {
    id: "path",
    label: "Path Widening / Flow Separation",
    shortLabel: "Path Widening",
    color: "#879bb1",
    purpose:
      "For over-concentrated movement, through-movement overlapping staying areas, or entrance circulation pressure.",
    problems: [
      "Main path has high pedestrian volume",
      "Through movement overlaps with staying areas",
      "Entrance zone creates circulation pressure",
      "Lunch peak paths intersect or conflict"
    ],
    elements: ["Widen main corridor", "Separate through route", "Create secondary route", "Remove bottleneck", "Adjust entrance connection"],
    expectedImpacts: [
      "Reduce congestion",
      "Reduce movement-staying conflict",
      "Improve circulation clarity",
      "Improve pedestrian movement efficiency",
      "Protect staying areas from through movement"
    ],
    scoreDeltas: [
      { metric: "Congestion Score", delta: -25, unit: "pts" },
      { metric: "Movement Efficiency", delta: 30, unit: "pts" },
      { metric: "Route Conflict", delta: -20, unit: "pts" },
      { metric: "Activity Score", delta: 0, unit: "pts" }
    ],
    designReading:
      "Separating through movement from the staying zone can reduce conflict and allow the plaza edge to support both circulation and rest."
  },
  {
    id: "activity-node",
    label: "Activity Node Intervention",
    shortLabel: "Activity Node",
    color: "#d88945",
    purpose:
      "For spaces with enough physical area but no programmatic attraction or meaningful public activity.",
    problems: [
      "Inactive area is too large",
      "Open space lacks activity",
      "The area is only passed through, not occupied",
      "Public space lacks a clear destination"
    ],
    elements: ["Coffee kiosk", "Small pavilion", "Outdoor work table", "Exhibition board", "Social platform", "Micro event space"],
    expectedImpacts: [
      "Attract visitors",
      "Increase behaviour diversity",
      "Create a new staying node",
      "Improve spatial legibility",
      "Turn underused areas into destinations"
    ],
    scoreDeltas: [
      { metric: "Activity Score", delta: 30, unit: "pts" },
      { metric: "User Diversity", delta: 20, unit: "%" },
      { metric: "Visitor Attraction", delta: 25, unit: "%" },
      { metric: "Staying Duration", delta: 20, unit: "%" }
    ],
    designReading:
      "Introducing a small activity node can create a new destination and attract more diverse users into this underused area."
  },
  {
    id: "landscape-buffer",
    label: "Landscape Buffer / Edge Activation",
    shortLabel: "Landscape Buffer",
    color: "#90ad87",
    purpose:
      "For edges that are inactive, exposed to traffic, uncomfortable, or lacking spatial definition.",
    problems: [
      "Edge space is inactive",
      "Road noise affects staying behaviour",
      "Public space lacks comfortable boundaries",
      "Exposed edges discourage passive staying"
    ],
    elements: ["Planting strip", "Low wall", "Green buffer", "Seat-integrated landscape", "Edge platform", "Soft boundary"],
    expectedImpacts: [
      "Improve edge comfort",
      "Reduce traffic or movement disturbance",
      "Create comfortable staying boundaries",
      "Increase sense of enclosure",
      "Activate underused edges"
    ],
    scoreDeltas: [
      { metric: "Edge Activity", delta: 18, unit: "pts" },
      { metric: "Comfort Score", delta: 25, unit: "pts" },
      { metric: "Passive User Attraction", delta: 15, unit: "%" },
      { metric: "Staying Duration", delta: 18, unit: "%" }
    ],
    designReading:
      "Adding a landscape buffer can create a softer and more comfortable edge condition, encouraging people to stay rather than only pass through."
  }
];

export function interventionById(id: InterventionTypeId): InterventionType {
  return interventionTypes.find((t) => t.id === id) ?? interventionTypes[0];
}

/* ------------------------------------------------------------------ */
/* Intervention zones                                                  */
/* ------------------------------------------------------------------ */

export interface InterventionZone {
  id: string;
  code: string;
  label: string;
  problem: string;
  /** Plan coordinates (x 0-100, y 0-117.5) and radius in plan units. */
  x: number;
  y: number;
  radius: number;
  recommended: InterventionTypeId[];
  baseline: {
    activityScore: number;
    stayingMinutes: number;
    congestionScore: number;
    comfortScore: number;
  };
}

export const interventionZones: InterventionZone[] = [
  {
    id: "zone-a",
    code: "A",
    label: "Inactive Courtyard Edge",
    problem: "Low staying activity and weak edge occupation along the courtyard boundary.",
    x: 38,
    y: 46,
    radius: 9,
    recommended: ["seating", "shade", "activity-node", "landscape-buffer"],
    baseline: { activityScore: 42, stayingMinutes: 3.1, congestionScore: 22, comfortScore: 48 }
  },
  {
    id: "zone-b",
    code: "B",
    label: "Congested Entrance Corridor",
    problem: "Arrival flows compress into a narrow corridor and conflict with waiting users.",
    x: 74,
    y: 62,
    radius: 8,
    recommended: ["path"],
    baseline: { activityScore: 58, stayingMinutes: 2.4, congestionScore: 74, comfortScore: 40 }
  },
  {
    id: "zone-c",
    code: "C",
    label: "Underused Landscape Boundary",
    problem: "The green edge is pleasant but empty — no reason to pause or stay.",
    x: 22,
    y: 64,
    radius: 9,
    recommended: ["landscape-buffer", "seating", "activity-node"],
    baseline: { activityScore: 30, stayingMinutes: 2.8, congestionScore: 12, comfortScore: 55 }
  },
  {
    id: "zone-d",
    code: "D",
    label: "Plaza Staying Area",
    problem: "The plaza gathers people at lunch but is exposed; stays remain short.",
    x: 53,
    y: 58,
    radius: 10,
    recommended: ["shade", "seating", "activity-node"],
    baseline: { activityScore: 66, stayingMinutes: 4.6, congestionScore: 42, comfortScore: 45 }
  },
  {
    id: "zone-e",
    code: "E",
    label: "Main Movement Corridor",
    problem: "The primary through-route crosses staying areas and blurs circulation.",
    x: 50,
    y: 82,
    radius: 9,
    recommended: ["path", "landscape-buffer"],
    baseline: { activityScore: 50, stayingMinutes: 1.8, congestionScore: 60, comfortScore: 44 }
  }
];

export function zoneById(id: string): InterventionZone {
  return interventionZones.find((z) => z.id === id) ?? interventionZones[0];
}

/* ------------------------------------------------------------------ */
/* Placements + estimated zone scores                                  */
/* ------------------------------------------------------------------ */

export interface Placement {
  id: string;
  typeId: InterventionTypeId;
  zoneId: string;
  /** Plan coordinates. */
  x: number;
  y: number;
  rotation: number; // radians
  enabled: boolean;
}

export interface ZoneEstimate {
  activityScore: number;
  stayingMinutes: number;
  congestionScore: number;
  comfortScore: number;
}

/**
 * Scenario-based estimate for a zone after its (enabled) placements.
 * Deltas come straight from the impact table; percentage deltas apply to the
 * staying-duration baseline. Everything is clamped to sensible ranges.
 */
export function estimateZoneScores(zone: InterventionZone, placements: Placement[]): ZoneEstimate {
  let { activityScore, stayingMinutes, congestionScore, comfortScore } = zone.baseline;

  placements
    .filter((p) => p.zoneId === zone.id && p.enabled)
    .forEach((placement) => {
      const type = interventionById(placement.typeId);
      type.scoreDeltas.forEach((delta) => {
        switch (delta.metric) {
          case "Activity Score":
          case "Edge Activity":
            activityScore += delta.delta;
            break;
          case "Staying Duration":
            stayingMinutes *= 1 + delta.delta / 100;
            break;
          case "Congestion Score":
          case "Route Conflict":
            congestionScore += delta.delta;
            break;
          case "Comfort Score":
            comfortScore += delta.delta;
            break;
          case "Movement Efficiency":
            congestionScore -= delta.delta * 0.4; // efficiency relieves congestion
            break;
          default:
            activityScore += delta.delta * 0.3; // diversity / attraction feed activity
        }
      });
    });

  return {
    activityScore: clamp(activityScore, 0, 100),
    stayingMinutes: Math.round(clamp(stayingMinutes, 0, 30) * 10) / 10,
    congestionScore: clamp(congestionScore, 0, 100),
    comfortScore: clamp(comfortScore, 0, 100)
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.round(Math.max(min, Math.min(max, v)));
}
