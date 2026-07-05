import type { GeneratedOverlay, OptimizationEffects, OptimizationSelection } from "@/types";

const baseMetrics = {
  movementDistribution: { before: 54, after: 54 },
  stayingActivity: { before: 31, after: 31 },
  congestionPressure: { before: 78, after: 78 },
  inactiveAreaReduction: { before: 18, after: 18 }
};

export function generateOptimizationEffects(
  overlay: GeneratedOverlay,
  selected: OptimizationSelection
): OptimizationEffects {
  const programZones = overlay.programZones.length > 0 ? overlay.programZones : [
    { id: "fallback-program", programId: "plaza", label: "Plaza", color: "#111111", x: 56, y: 38, radius: 12, intensity: 0.8 }
  ];
  const overlays = [];

  if (selected.shades) {
    overlays.push(
      ...programZones.slice(0, 2).map((zone, index) => ({
        id: `shade-${zone.id}`,
        type: "shades" as const,
        label: "Shade",
        x: Math.min(92, zone.x + 4 + index * 2),
        y: Math.max(8, zone.y - 8),
        width: 14,
        height: 8,
        intensity: 0.82,
        color: "#2f5f85"
      }))
    );
  }

  if (selected.benches) {
    overlays.push(
      ...programZones.slice(0, 3).map((zone, index) => ({
        id: `bench-${zone.id}`,
        type: "benches" as const,
        label: "Bench",
        x: Math.max(8, zone.x - 8),
        y: Math.min(92, zone.y + 6 + index * 1.6),
        width: 8,
        height: 3.2,
        intensity: 0.74,
        color: "#d88945"
      }))
    );
  }

  if (selected.stairs) {
    const entrances = overlay.markers.filter((marker) => marker.type === "entrance");
    const exits = overlay.markers.filter((marker) => marker.type === "exit");
    const source = entrances[0] ?? { x: 50, y: 90 };
    const target = exits[0] ?? { x: 18, y: 16 };
    overlays.push({
      id: "stair-connection-01",
      type: "stairs" as const,
      label: "Stair link",
      x: (source.x + target.x) / 2,
      y: (source.y + target.y) / 2,
      width: 13,
      height: 5,
      intensity: 0.9,
      color: "#111111"
    });
  }

  const shadeBonus = selected.shades ? 18 : 0;
  const benchBonus = selected.benches ? 22 : 0;
  const stairBonus = selected.stairs ? 16 : 0;

  return {
    overlays,
    metrics: {
      movementDistribution: {
        before: baseMetrics.movementDistribution.before,
        after: clamp(baseMetrics.movementDistribution.after + stairBonus + benchBonus * 0.25)
      },
      stayingActivity: {
        before: baseMetrics.stayingActivity.before,
        after: clamp(baseMetrics.stayingActivity.after + benchBonus + shadeBonus)
      },
      congestionPressure: {
        before: baseMetrics.congestionPressure.before,
        after: clamp(baseMetrics.congestionPressure.after - stairBonus - shadeBonus * 0.35, 0, 100)
      },
      inactiveAreaReduction: {
        before: baseMetrics.inactiveAreaReduction.before,
        after: clamp(baseMetrics.inactiveAreaReduction.after + shadeBonus + benchBonus * 0.8)
      }
    }
  };
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}
