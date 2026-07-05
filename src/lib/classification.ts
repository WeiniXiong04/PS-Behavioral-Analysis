import type { BehaviourPoint, UserType } from "@/types";

export function classifyBehaviourPoint(point: BehaviourPoint): UserType {
  if (point.speed > 1.2 && point.duration < 60) {
    return "through_pedestrian";
  }

  if (point.duration > 180 && point.speed < 0.3) {
    return "passive_user";
  }

  if (point.behaviour.includes("service") || point.behaviour.includes("repeated")) {
    return "service_staff";
  }

  if (point.behaviour.includes("group") || point.behaviour.includes("social")) {
    return "student_young_user";
  }

  if (point.behaviour.includes("wayfinding") || point.behaviour.includes("observing")) {
    return "visitor";
  }

  return "office_worker";
}

export function getUserTypeLabel(type: UserType): string {
  const labels: Record<UserType, string> = {
    office_worker: "Office Worker",
    visitor: "Visitor",
    passive_user: "Passive User",
    through_pedestrian: "Through Pedestrian",
    service_staff: "Service Staff",
    student_young_user: "Student / Young User"
  };

  return labels[type];
}
