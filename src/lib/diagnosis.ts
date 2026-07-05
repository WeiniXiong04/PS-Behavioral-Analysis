import type { BehaviourPoint } from "@/types";

export function calculateActivityScore(points: BehaviourPoint[]): number {
  if (points.length === 0) {
    return 0;
  }

  const stayingMinutes = points.reduce((sum, point) => sum + point.duration / 60, 0);
  const behaviourTypes = new Set(points.map((point) => point.behaviour)).size;
  return Math.min(100, Math.round(points.length * 3 + stayingMinutes * 1.2 + behaviourTypes * 8));
}

export function calculateCongestionScore(points: BehaviourPoint[]): number {
  if (points.length === 0) {
    return 0;
  }

  const density = points.reduce((sum, point) => sum + point.density, 0) / points.length;
  const slowMovement = points.filter((point) => point.speed < 0.45).length / points.length;
  return Math.min(100, Math.round(density * 70 + slowMovement * 30));
}

export function calculateDiversityScore(points: BehaviourPoint[]): number {
  if (points.length === 0) {
    return 0;
  }

  const userTypes = new Set(points.map((point) => point.userType)).size;
  const behaviourTypes = new Set(points.map((point) => point.behaviour)).size;
  return Math.min(100, Math.round(userTypes * 10 + behaviourTypes * 8));
}
