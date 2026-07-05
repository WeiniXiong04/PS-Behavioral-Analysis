import behaviourPoints from "../../public/data/behaviour-points.json";
import movementFlows from "../../public/data/movement-flows.json";
import userClassification from "../../public/data/user-classification.json";
import inactiveZones from "../../public/data/inactive-zones.json";
import congestedZones from "../../public/data/congested-zones.json";
import designSuggestions from "../../public/data/design-suggestions.json";
import siteBoundary from "../../public/data/site-boundary.json";
import streetNetwork from "../../public/data/street-network.json";
import type { TusparkData } from "@/types";

export function getTusparkData(): TusparkData {
  return {
    behaviourPoints,
    movementFlows,
    classification: userClassification,
    inactiveZones,
    congestedZones,
    designSuggestions,
    siteBoundary,
    streetNetwork
  } as TusparkData;
}

export const heatmapFrames = [
  { minute: 600, label: "10:00", src: "/images/heatmaps/heatmap-600.png" },
  { minute: 720, label: "12:00", src: "/images/heatmaps/heatmap-720.png" },
  { minute: 840, label: "14:00", src: "/images/heatmaps/heatmap-840.png" },
  { minute: 960, label: "16:00", src: "/images/heatmaps/heatmap-960.png" },
  { minute: 1080, label: "18:00", src: "/images/heatmaps/heatmap-1080.png" }
];
