import { SiteModelCanvas } from "@/components/SiteModelCanvas";

interface ModelPreviewProps {
  compact?: boolean;
  loaded?: boolean;
}

export function ModelPreview({ compact = false, loaded = true }: ModelPreviewProps) {
  return (
    <div className="liquid-surface overflow-hidden rounded-[2rem]">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
          Preview model
        </span>
        <span className={`rounded-full px-3 py-1 text-xs ${loaded ? "bg-black text-white" : "glass-chip text-black/45"}`}>
          {loaded ? "site-model.glb" : "not loaded"}
        </span>
      </div>
      {loaded ? (
        <SiteModelCanvas compact={compact} heightClass={compact ? "h-[560px]" : undefined} layers={{
          siteModel: true,
          userTypes: false,
          movementHeatmap: false,
          programs: false,
          activities: false,
          timeSlots: false
        }} />
      ) : (
        <div className={`grid place-items-center bg-white/25 ${compact ? "h-[560px]" : "h-[580px]"}`}>
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-[1.25rem] border border-dashed border-black/20 bg-white" />
            <div className="text-sm font-semibold text-black/45">Model preview appears after loading</div>
          </div>
        </div>
      )}
    </div>
  );
}
