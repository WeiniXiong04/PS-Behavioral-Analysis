import {
  defaultActivities,
  defaultPrograms,
  defaultTimeSlots,
  defaultUserTypes
} from "@/lib/defaultOptions";
import type {
  ActivityZone,
  GeneratedOverlay,
  HeatmapZone,
  PlanMarker,
  ProgramZone,
  ScaleInputs,
  TimeSlotLayer,
  UserTypePoint
} from "@/types";

const fallbackMarkers: PlanMarker[] = [
  { id: "fallback-entrance", type: "entrance", x: 50, y: 92, label: "Entrance" },
  { id: "fallback-exit", type: "exit", x: 12, y: 14, label: "Exit" },
  { id: "fallback-program", type: "program", x: 56, y: 34, programId: "plaza", label: "Plaza" },
  { id: "fallback-program-2", type: "program", x: 38, y: 49, programId: "seating-area", label: "Seating area" }
];

export function createFallbackInputs(): ScaleInputs {
  return {
    userTypes: defaultUserTypes.slice(0, 4),
    programs: defaultPrograms.slice(0, 5),
    activities: defaultActivities.slice(0, 6),
    markers: fallbackMarkers,
    operationHours: { opening: "08:00", closing: "22:00" },
    timeSlots: defaultTimeSlots
  };
}

export function generateOverlayData(inputs: ScaleInputs): GeneratedOverlay {
  const entrances = inputs.markers.filter((marker) => marker.type === "entrance");
  const exits = inputs.markers.filter((marker) => marker.type === "exit");
  const programMarkers = inputs.markers.filter((marker) => marker.type === "program");
  const destinationMarkers = [...exits, ...programMarkers];
  const slots = inputs.timeSlots.length > 0 ? inputs.timeSlots : defaultTimeSlots;

  const movementHeatmap: HeatmapZone[] = [];
  entrances.forEach((entrance, entranceIndex) => {
    destinationMarkers.forEach((destination, destinationIndex) => {
      slots.forEach((slot, slotIndex) => {
        const midpoint = interpolatePoint(entrance, destination, 0.48 + slotIndex * 0.04);
        const slotBias = getSlotBias(slot.id);
        movementHeatmap.push({
          id: `heat-${entranceIndex}-${destinationIndex}-${slot.id}`,
          x: midpoint.x,
          y: midpoint.y,
          radius: 11 + destinationIndex * 2 + slotBias * 4,
          intensity: clamp(0.34 + slotBias + programDemand(destination.programId, inputs) * 0.18, 0.25, 1),
          timeSlotId: slot.id
        });
      });
    });
  });

  const programZones: ProgramZone[] = programMarkers.map((marker, index) => {
    const program = inputs.programs.find((item) => item.id === marker.programId) ?? inputs.programs[index % inputs.programs.length];
    return {
      id: `program-zone-${marker.id}`,
      programId: program?.id ?? "program",
      label: marker.label ?? program?.label ?? "Program",
      color: program?.color ?? "#111111",
      x: marker.x,
      y: marker.y,
      radius: 8 + (program?.demand ?? 0.5) * 8,
      intensity: program?.demand ?? 0.5
    };
  });

  const activityZones: ActivityZone[] = programMarkers.flatMap((marker, markerIndex) =>
    inputs.activities.slice(0, Math.max(1, Math.min(inputs.activities.length, 4))).map((activity, activityIndex) => ({
      id: `activity-${marker.id}-${activity.id}`,
      activityId: activity.id,
      label: activity.label,
      color: activity.color,
      x: clamp(marker.x + offset(activityIndex, markerIndex, 6), 4, 96),
      y: clamp(marker.y + offset(markerIndex, activityIndex, 5), 4, 96),
      radius: 4 + activity.intensity * 7,
      intensity: activity.intensity,
      timeSlotId: slots[(activityIndex + markerIndex) % slots.length].id
    }))
  );

  const userTypePoints: UserTypePoint[] = inputs.userTypes.flatMap((userType, userIndex) =>
    slots.flatMap((slot, slotIndex) =>
      destinationMarkers.slice(0, 5).map((destination, pointIndex) => {
        const source = entrances[(pointIndex + userIndex) % Math.max(entrances.length, 1)] ?? fallbackMarkers[0];
        const t = clamp(0.18 + pointIndex * 0.16 + slotIndex * 0.05, 0.1, 0.9);
        const point = interpolatePoint(source, destination, t);
        return {
          id: `user-point-${userType.id}-${slot.id}-${pointIndex}`,
          userTypeId: userType.id,
          label: userType.label,
          color: userType.color,
          x: clamp(point.x + offset(userIndex, pointIndex, 3.8), 2, 98),
          y: clamp(point.y + offset(pointIndex, slotIndex, 3.8), 2, 98),
          timeSlotId: slot.id
        };
      })
    )
  );

  const timeSlotLayers: TimeSlotLayer[] = slots.map((slot, slotIndex) => ({
    id: slot.id,
    label: slot.label,
    color: ["#111111", "#d88945", "#7fa99b", "#2f5f85"][slotIndex % 4],
    path: createSlotPath(entrances, destinationMarkers, slotIndex)
  }));

  return {
    userTypePoints,
    movementHeatmap,
    programZones,
    activityZones,
    timeSlotLayers,
    markers: inputs.markers,
    selectedTimeSlotId: slots[0]?.id ?? "morning"
  };
}

function interpolatePoint(start: PlanMarker, end: PlanMarker, t: number) {
  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t
  };
}

function createSlotPath(entrances: PlanMarker[], destinations: PlanMarker[], slotIndex: number): Array<[number, number]> {
  const start = entrances[slotIndex % Math.max(entrances.length, 1)] ?? fallbackMarkers[0];
  const end = destinations[slotIndex % Math.max(destinations.length, 1)] ?? fallbackMarkers[1];
  const mid = {
    x: (start.x + end.x) / 2 + offset(slotIndex, 1, 8),
    y: (start.y + end.y) / 2 + offset(1, slotIndex, 6)
  };
  return [
    [start.x, start.y],
    [mid.x, mid.y],
    [end.x, end.y]
  ];
}

function programDemand(programId: string | undefined, inputs: ScaleInputs) {
  return inputs.programs.find((program) => program.id === programId)?.demand ?? 0.62;
}

function getSlotBias(id: string) {
  if (id.includes("morning")) return 0.18;
  if (id.includes("lunch")) return 0.32;
  if (id.includes("evening")) return 0.24;
  return 0.16;
}

function offset(a: number, b: number, scale: number) {
  return Math.sin((a + 1) * 1.7 + (b + 1) * 0.9) * scale;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
