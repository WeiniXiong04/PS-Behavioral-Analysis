import type { ActivityOption, ProgramOption, UserTypeOption } from "@/types";

export const storageKeys = {
  modelLoaded: "psbat:model-loaded",
  scaleInputs: "psbat:scale-inputs",
  generatedOverlay: "psbat:generated-overlay",
  modelCoefficients: "psbat:model-coefficients",
  interventions: "psbat:interventions"
};

export const defaultUserTypes: UserTypeOption[] = [
  { id: "office-workers", label: "Office workers", color: "#111111", movementBias: 0.92 },
  { id: "visitors", label: "Visitors", color: "#7f94a8", movementBias: 0.62 },
  { id: "residents", label: "Residents", color: "#a59b8f", movementBias: 0.54 },
  { id: "students", label: "Students", color: "#7fa99b", movementBias: 0.78 },
  { id: "service-staff", label: "Service staff", color: "#d88945", movementBias: 0.7 },
  { id: "through-pedestrians", label: "Through pedestrians", color: "#2f5f85", movementBias: 1 }
];

export const defaultPrograms: ProgramOption[] = [
  { id: "office-entrance", label: "Office entrance", color: "#111111", demand: 0.95 },
  { id: "retail", label: "Retail", color: "#d88945", demand: 0.82 },
  { id: "cafe", label: "Cafe", color: "#9a7759", demand: 0.88 },
  { id: "seating-area", label: "Seating area", color: "#7fa99b", demand: 0.74 },
  { id: "green-space", label: "Green space", color: "#90ad87", demand: 0.58 },
  { id: "plaza", label: "Plaza", color: "#879bb1", demand: 0.86 },
  { id: "exhibition", label: "Exhibition", color: "#b7a1cb", demand: 0.7 },
  { id: "transit-connection", label: "Transit connection", color: "#2f5f85", demand: 0.92 },
  { id: "courtyard", label: "Courtyard", color: "#c8bba8", demand: 0.66 },
  { id: "public-walkway", label: "Public walkway", color: "#555555", demand: 0.9 }
];

export const defaultActivities: ActivityOption[] = [
  { id: "walking", label: "Walking", color: "#111111", intensity: 0.92 },
  { id: "sitting", label: "Sitting", color: "#7fa99b", intensity: 0.48 },
  { id: "waiting", label: "Waiting", color: "#879bb1", intensity: 0.58 },
  { id: "socializing", label: "Socializing", color: "#d88945", intensity: 0.76 },
  { id: "eating-drinking", label: "Eating / drinking", color: "#9a7759", intensity: 0.74 },
  { id: "passing-through", label: "Passing through", color: "#2f5f85", intensity: 1 },
  { id: "gathering", label: "Gathering", color: "#b7a1cb", intensity: 0.82 },
  { id: "resting", label: "Resting", color: "#90ad87", intensity: 0.42 },
  { id: "outdoor-working", label: "Outdoor working", color: "#6e7f8f", intensity: 0.62 },
  { id: "event-activity", label: "Event activity", color: "#c7684b", intensity: 0.88 }
];

export const defaultTimeSlots = [
  { id: "morning", label: "Morning peak", start: "08:00", end: "10:00" },
  { id: "lunch", label: "Lunch peak", start: "12:00", end: "14:00" },
  { id: "afternoon", label: "Afternoon", start: "14:00", end: "17:00" },
  { id: "evening", label: "Evening peak", start: "17:00", end: "19:00" }
];
