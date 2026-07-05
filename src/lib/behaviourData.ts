// Curated behavioural dataset for the Output page:
// Behaviour Masterplan Overview (plan) and 3D Behaviour Pattern Viewer (model).
// Plan coordinates live in the masterplan viewBox space: x 0-100, y 0-117.5.

export type BehaviourSlotId = "morning" | "lunch" | "afternoon" | "evening";

export interface BehaviourTimeSlot {
  id: BehaviourSlotId;
  label: string;
}

export const behaviourTimeSlots: BehaviourTimeSlot[] = [
  { id: "morning", label: "Morning Peak" },
  { id: "lunch", label: "Lunch Peak" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" }
];

export interface BehaviourUserType {
  id: string;
  label: string;
  color: string;
}

export const behaviourUserTypes: BehaviourUserType[] = [
  { id: "office-workers", label: "Office Workers", color: "#111111" },
  { id: "visitors", label: "Visitors", color: "#d88945" },
  { id: "passive-users", label: "Passive Users", color: "#7fa99b" },
  { id: "through-pedestrians", label: "Through Pedestrians", color: "#2f5f85" },
  { id: "service-staff", label: "Service Staff", color: "#9a7759" },
  { id: "young-social", label: "Young / Social Users", color: "#b7a1cb" }
];

export function userTypeById(id: string): BehaviourUserType {
  return behaviourUserTypes.find((type) => type.id === id) ?? behaviourUserTypes[0];
}

export interface EntranceMarker {
  id: string;
  code: string;
  label: string;
  x: number;
  y: number;
}

export const entranceMarkers: EntranceMarker[] = [
  { id: "e1", code: "E1", label: "Main Entrance", x: 88, y: 62 },
  { id: "e2", code: "E2", label: "Street Entrance", x: 46, y: 106 },
  { id: "e3", code: "E3", label: "Office Lobby Entrance", x: 38, y: 22 },
  { id: "e4", code: "E4", label: "Service Entrance", x: 10, y: 78 }
];

export interface SpatialNode {
  id: string;
  code: string;
  label: string;
  x: number;
  y: number;
}

export const spatialNodes: SpatialNode[] = [
  { id: "n1", code: "N1", label: "East Arrival Court", x: 76, y: 62 },
  { id: "n2", code: "N2", label: "Central Plaza", x: 52, y: 58 },
  { id: "n3", code: "N3", label: "Courtyard Garden", x: 40, y: 44 },
  { id: "n4", code: "N4", label: "Seating Terrace", x: 60, y: 76 },
  { id: "n5", code: "N5", label: "South Link", x: 48, y: 94 }
];

// Public space boundary polygon in plan coordinates.
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

export type FlowKind = "main" | "secondary" | "service";

export interface MovementFlowData {
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
  peakSlotId: BehaviourSlotId;
  meaning: string;
  volumeLabel: string;
  volumeBySlot: Record<BehaviourSlotId, number>; // 0..1 relative volume
}

export const movementFlows: MovementFlowData[] = [
  {
    id: "f1",
    code: "F1",
    name: "Main Arrival Flow",
    from: "E1 Main Entrance",
    to: "N2 Central Plaza",
    kind: "main",
    path: [
      [88, 62],
      [76, 61],
      [64, 59],
      [52, 58]
    ],
    dominantUserTypeId: "office-workers",
    userTypeIds: ["office-workers", "visitors", "through-pedestrians"],
    avgSpeed: "1.3 m/s",
    peakSlotId: "morning",
    meaning: "Primary arrival axis linking the east entrance with the central plaza.",
    volumeLabel: "High",
    volumeBySlot: { morning: 1, lunch: 0.62, afternoon: 0.38, evening: 0.72 }
  },
  {
    id: "f2",
    code: "F2",
    name: "Lunch Movement Flow",
    from: "E3 Office Lobby",
    to: "H1 Central Courtyard",
    kind: "main",
    path: [
      [38, 22],
      [40, 33],
      [43, 43],
      [46, 50]
    ],
    dominantUserTypeId: "office-workers",
    userTypeIds: ["office-workers", "visitors", "young-social"],
    avgSpeed: "1.0 m/s",
    peakSlotId: "lunch",
    meaning: "Midday link between the office lobby and the courtyard food area.",
    volumeLabel: "Medium-High",
    volumeBySlot: { morning: 0.3, lunch: 1, afternoon: 0.46, evening: 0.24 }
  },
  {
    id: "f3",
    code: "F3",
    name: "Through Route",
    from: "E2 Street Entrance",
    to: "North Exit",
    kind: "secondary",
    path: [
      [46, 106],
      [48, 92],
      [50, 74],
      [52, 58],
      [58, 44],
      [66, 32]
    ],
    dominantUserTypeId: "through-pedestrians",
    userTypeIds: ["through-pedestrians", "office-workers"],
    avgSpeed: "1.5 m/s",
    peakSlotId: "evening",
    meaning: "Cross-site shortcut used mainly for commuting and transit connection.",
    volumeLabel: "Medium",
    volumeBySlot: { morning: 0.7, lunch: 0.48, afternoon: 0.4, evening: 0.88 }
  },
  {
    id: "f4",
    code: "F4",
    name: "Visitor Loop",
    from: "E2 Street Entrance",
    to: "N4 Seating Terrace",
    kind: "secondary",
    path: [
      [46, 106],
      [50, 94],
      [56, 84],
      [60, 76]
    ],
    dominantUserTypeId: "visitors",
    userTypeIds: ["visitors", "passive-users", "young-social"],
    avgSpeed: "0.8 m/s",
    peakSlotId: "afternoon",
    meaning: "Slow exploratory route connecting the street edge with the seating terrace.",
    volumeLabel: "Medium",
    volumeBySlot: { morning: 0.22, lunch: 0.58, afternoon: 0.74, evening: 0.4 }
  },
  {
    id: "f5",
    code: "F5",
    name: "Service Route",
    from: "E4 Service Entrance",
    to: "Back-of-house",
    kind: "service",
    path: [
      [10, 78],
      [21, 73],
      [30, 66],
      [37, 58]
    ],
    dominantUserTypeId: "service-staff",
    userTypeIds: ["service-staff"],
    avgSpeed: "1.1 m/s",
    peakSlotId: "morning",
    meaning: "Low-frequency service access kept at the western edge of the site.",
    volumeLabel: "Low",
    volumeBySlot: { morning: 0.6, lunch: 0.32, afternoon: 0.28, evening: 0.18 }
  }
];

export interface StayingHotspotData {
  id: string;
  code: string;
  name: string;
  x: number;
  y: number;
  users: number;
  avgStayMinutes: number;
  dominantBehaviour: string;
  dominantUserTypeId: string;
  peakSlotId: BehaviourSlotId;
  meaning: string;
  strengthBySlot: Record<BehaviourSlotId, number>; // 0..1 staying strength
  userMix: Array<{ userTypeId: string; share: number }>; // shares sum to 1
}

export const stayingHotspots: StayingHotspotData[] = [
  {
    id: "h1",
    code: "H1",
    name: "Central Courtyard",
    x: 46,
    y: 50,
    users: 186,
    avgStayMinutes: 8.5,
    dominantBehaviour: "Sitting / Socialising",
    dominantUserTypeId: "office-workers",
    peakSlotId: "lunch",
    meaning: "Strongest staying anchor of the site, framed by food and seating edges.",
    strengthBySlot: { morning: 0.3, lunch: 1, afternoon: 0.6, evening: 0.35 },
    userMix: [
      { userTypeId: "office-workers", share: 0.52 },
      { userTypeId: "visitors", share: 0.2 },
      { userTypeId: "young-social", share: 0.16 },
      { userTypeId: "passive-users", share: 0.12 }
    ]
  },
  {
    id: "h2",
    code: "H2",
    name: "Entrance Edge",
    x: 80,
    y: 64,
    users: 94,
    avgStayMinutes: 3.2,
    dominantBehaviour: "Waiting",
    dominantUserTypeId: "visitors",
    peakSlotId: "morning",
    meaning: "Short-stay waiting and meeting zone at the arrival threshold.",
    strengthBySlot: { morning: 0.85, lunch: 0.5, afternoon: 0.4, evening: 0.7 },
    userMix: [
      { userTypeId: "visitors", share: 0.42 },
      { userTypeId: "office-workers", share: 0.34 },
      { userTypeId: "through-pedestrians", share: 0.24 }
    ]
  },
  {
    id: "h3",
    code: "H3",
    name: "Seating Strip",
    x: 60,
    y: 72,
    users: 132,
    avgStayMinutes: 6.7,
    dominantBehaviour: "Resting",
    dominantUserTypeId: "office-workers",
    peakSlotId: "lunch",
    meaning: "Linear resting edge along the terrace, busiest around midday.",
    strengthBySlot: { morning: 0.25, lunch: 0.85, afternoon: 0.65, evening: 0.4 },
    userMix: [
      { userTypeId: "office-workers", share: 0.44 },
      { userTypeId: "passive-users", share: 0.28 },
      { userTypeId: "visitors", share: 0.28 }
    ]
  },
  {
    id: "h4",
    code: "H4",
    name: "Landscape Boundary",
    x: 24,
    y: 62,
    users: 58,
    avgStayMinutes: 5.1,
    dominantBehaviour: "Passive Watching",
    dominantUserTypeId: "passive-users",
    peakSlotId: "afternoon",
    meaning: "Quiet green edge attracting passive, longer individual stays.",
    strengthBySlot: { morning: 0.2, lunch: 0.45, afternoon: 0.75, evening: 0.3 },
    userMix: [
      { userTypeId: "passive-users", share: 0.5 },
      { userTypeId: "visitors", share: 0.3 },
      { userTypeId: "office-workers", share: 0.2 }
    ]
  },
  {
    id: "h5",
    code: "H5",
    name: "Plaza Activity Node",
    x: 53,
    y: 62,
    users: 148,
    avgStayMinutes: 4.6,
    dominantBehaviour: "Gathering / Events",
    dominantUserTypeId: "young-social",
    peakSlotId: "evening",
    meaning: "Flexible event surface where through movement and short stays overlap.",
    strengthBySlot: { morning: 0.3, lunch: 0.7, afternoon: 0.55, evening: 0.9 },
    userMix: [
      { userTypeId: "young-social", share: 0.38 },
      { userTypeId: "visitors", share: 0.26 },
      { userTypeId: "office-workers", share: 0.2 },
      { userTypeId: "through-pedestrians", share: 0.16 }
    ]
  }
];

export interface SlotSummary {
  observedUsers: number;
  dominantUserTypeId: string;
  mainFlowId: string;
  strongestHotspotId: string;
  avgStayMinutes: number;
  mostActiveNodeId: string;
  mostActiveTimeLabel: string;
  userMix: Array<{ userTypeId: string; share: number }>;
  readings: [string, string, string];
}

export const slotSummaries: Record<BehaviourSlotId, SlotSummary> = {
  morning: {
    observedUsers: 1032,
    dominantUserTypeId: "office-workers",
    mainFlowId: "f1",
    strongestHotspotId: "h2",
    avgStayMinutes: 3.8,
    mostActiveNodeId: "n1",
    mostActiveTimeLabel: "08:30 - 09:15",
    userMix: [
      { userTypeId: "office-workers", share: 0.54 },
      { userTypeId: "through-pedestrians", share: 0.24 },
      { userTypeId: "visitors", share: 0.1 },
      { userTypeId: "passive-users", share: 0.06 },
      { userTypeId: "service-staff", share: 0.06 }
    ],
    readings: [
      "The east entrance concentrates almost all arrival movement toward the office lobby.",
      "Staying is brief and clustered at the entrance edge while commuters pass through.",
      "The service route is most active before the public space fills up."
    ]
  },
  lunch: {
    observedUsers: 1248,
    dominantUserTypeId: "office-workers",
    mainFlowId: "f1",
    strongestHotspotId: "h1",
    avgStayMinutes: 6.4,
    mostActiveNodeId: "n2",
    mostActiveTimeLabel: "12:20 - 13:10",
    userMix: [
      { userTypeId: "office-workers", share: 0.46 },
      { userTypeId: "through-pedestrians", share: 0.18 },
      { userTypeId: "visitors", share: 0.16 },
      { userTypeId: "passive-users", share: 0.12 },
      { userTypeId: "service-staff", share: 0.08 }
    ],
    readings: [
      "The east entrance forms the strongest arrival flow during lunch peak.",
      "Staying activity is concentrated around the central courtyard edge.",
      "Through movement and short-term staying overlap near the main plaza."
    ]
  },
  afternoon: {
    observedUsers: 876,
    dominantUserTypeId: "visitors",
    mainFlowId: "f4",
    strongestHotspotId: "h4",
    avgStayMinutes: 7.1,
    mostActiveNodeId: "n4",
    mostActiveTimeLabel: "15:00 - 16:00",
    userMix: [
      { userTypeId: "visitors", share: 0.3 },
      { userTypeId: "office-workers", share: 0.26 },
      { userTypeId: "passive-users", share: 0.22 },
      { userTypeId: "through-pedestrians", share: 0.14 },
      { userTypeId: "service-staff", share: 0.08 }
    ],
    readings: [
      "Movement slows down and shifts toward the visitor loop along the south edge.",
      "Longer passive stays gather along the landscape boundary and seating terrace.",
      "The central plaza acts as a calm transfer surface rather than a destination."
    ]
  },
  evening: {
    observedUsers: 964,
    dominantUserTypeId: "through-pedestrians",
    mainFlowId: "f3",
    strongestHotspotId: "h5",
    avgStayMinutes: 4.9,
    mostActiveNodeId: "n2",
    mostActiveTimeLabel: "17:40 - 18:30",
    userMix: [
      { userTypeId: "through-pedestrians", share: 0.34 },
      { userTypeId: "office-workers", share: 0.28 },
      { userTypeId: "young-social", share: 0.18 },
      { userTypeId: "visitors", share: 0.12 },
      { userTypeId: "service-staff", share: 0.08 }
    ],
    readings: [
      "Exit and transit movement dominates, converging on the through route.",
      "The plaza activity node keeps short social stays after office hours.",
      "Entrance edges switch from waiting areas to fast dispersal points."
    ]
  }
};

// Sampled background activity points (evidence layer). Deterministic scatter
// around hotspots so plan and 3D stay consistent between renders.
export interface ActivityPoint {
  id: string;
  x: number;
  y: number;
}

export const activityPoints: ActivityPoint[] = stayingHotspots.flatMap((hotspot, hotspotIndex) =>
  Array.from({ length: 14 }, (_, index) => {
    const angle = (index * 2.399963) + hotspotIndex; // golden-angle scatter
    const radius = 2 + ((index * 37 + hotspotIndex * 17) % 100) / 100 * 7;
    return {
      id: `${hotspot.id}-pt-${index}`,
      x: Math.min(96, Math.max(4, hotspot.x + Math.cos(angle) * radius)),
      y: Math.min(112, Math.max(4, hotspot.y + Math.sin(angle) * radius * 0.85))
    };
  })
);

export function flowById(id: string): MovementFlowData {
  return movementFlows.find((flow) => flow.id === id) ?? movementFlows[0];
}

export function hotspotById(id: string): StayingHotspotData {
  return stayingHotspots.find((hotspot) => hotspot.id === id) ?? stayingHotspots[0];
}

export function nodeById(id: string): SpatialNode {
  return spatialNodes.find((node) => node.id === id) ?? spatialNodes[0];
}
