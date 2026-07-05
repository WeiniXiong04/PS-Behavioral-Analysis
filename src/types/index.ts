export type MarkerType = "entrance" | "exit" | "program";

export interface SelectOption {
  id: string;
  label: string;
  color: string;
}

export interface UserTypeOption extends SelectOption {
  movementBias: number;
}

export interface ProgramOption extends SelectOption {
  demand: number;
}

export interface ActivityOption extends SelectOption {
  intensity: number;
}

export interface PlanMarker {
  id: string;
  type: MarkerType;
  x: number;
  y: number;
  programId?: string;
  label?: string;
}

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
}

export interface ScaleInputs {
  userTypes: UserTypeOption[];
  programs: ProgramOption[];
  activities: ActivityOption[];
  markers: PlanMarker[];
  operationHours: {
    opening: string;
    closing: string;
  };
  timeSlots: TimeSlot[];
}

export interface HeatmapZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  timeSlotId: string;
}

export interface UserTypePoint {
  id: string;
  userTypeId: string;
  label: string;
  color: string;
  x: number;
  y: number;
  timeSlotId: string;
}

export interface ProgramZone {
  id: string;
  programId: string;
  label: string;
  color: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
}

export interface ActivityZone {
  id: string;
  activityId: string;
  label: string;
  color: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  timeSlotId: string;
}

export interface TimeSlotLayer {
  id: string;
  label: string;
  color: string;
  path: Array<[number, number]>;
}

export interface GeneratedOverlay {
  userTypePoints: UserTypePoint[];
  movementHeatmap: HeatmapZone[];
  programZones: ProgramZone[];
  activityZones: ActivityZone[];
  timeSlotLayers: TimeSlotLayer[];
  markers: PlanMarker[];
  selectedTimeSlotId: string;
}

export interface OptimizationSelection {
  shades: boolean;
  benches: boolean;
  stairs: boolean;
  trees?: boolean;
  lighting?: boolean;
}

export interface OptimizationOverlayItem {
  id: string;
  type: keyof OptimizationSelection;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  intensity: number;
  color: string;
}

export interface OptimizationEffectMetrics {
  movementDistribution: { before: number; after: number };
  stayingActivity: { before: number; after: number };
  congestionPressure: { before: number; after: number };
  inactiveAreaReduction: { before: number; after: number };
}

export interface OptimizationEffects {
  overlays: OptimizationOverlayItem[];
  metrics: OptimizationEffectMetrics;
}

// Compatibility types for legacy prototype files that are no longer routed.
export type UserType =
  | "office_worker"
  | "visitor"
  | "passive_user"
  | "through_pedestrian"
  | "service_staff"
  | "student_young_user";

export type PointTuple = [number, number];

export interface BehaviourPoint {
  id: string;
  x: number;
  y: number;
  time: string;
  userType: UserType;
  behaviour: string;
  speed: number;
  duration: number;
  density: number;
}

export interface MovementFlow {
  id: string;
  name: string;
  from: string;
  to: string;
  volume: number;
  timePeak: string;
  path: PointTuple[];
}

export interface UserGroupSummary {
  id: UserType;
  label: string;
  count: number;
  percentage: number;
  description: string;
}

export interface ClassificationSummary {
  totalObservedUsers: number;
  peakTime: string;
  mainUserGroup: string;
  groups: UserGroupSummary[];
}

export interface DiagnosticZone {
  id: string;
  name: string;
  activityScore?: number;
  congestionScore?: number;
  issue: string;
  suggestion: string;
  polygon: PointTuple[];
}

export interface DesignSuggestion {
  id: string;
  zoneId: string;
  strategy: string;
  actions: string[];
}

export interface SiteBoundary {
  name: string;
  viewBox: [number, number, number, number];
  boundary: PointTuple[];
  publicSpaceTypes: string[];
}

export interface StreetSegment {
  id: string;
  name: string;
  polyline: PointTuple[];
}

export interface TusparkData {
  behaviourPoints: BehaviourPoint[];
  movementFlows: MovementFlow[];
  classification: ClassificationSummary;
  inactiveZones: DiagnosticZone[];
  congestedZones: DiagnosticZone[];
  designSuggestions: DesignSuggestion[];
  siteBoundary: SiteBoundary;
  streetNetwork: StreetSegment[];
}
