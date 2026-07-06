import { PlanImage } from "@/components/PlanImage";

interface MasterplanPreviewProps {
  compact?: boolean;
  loaded?: boolean;
}

export function MasterplanPreview({ compact = false, loaded = true }: MasterplanPreviewProps) {
  return (
    <div className="liquid-surface overflow-hidden rounded-[2rem]">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
          Masterplan preview
        </span>
        <span className="glass-chip rounded-full px-3 py-1 text-xs text-black/50">
          {loaded ? "image base" : "not loaded"}
        </span>
      </div>
      <div className={`bg-white/25 ${compact ? "aspect-[1000/1175] w-full" : "h-[660px]"}`}>
        {loaded ? (
          <PlanImage
            src="/assets/masterplan.png"
            alt="Masterplan preview"
            className="h-full w-full object-contain p-4"
            assetHint="Missing masterplan — place masterplan.png in public/assets/"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <div className="text-center">
              <div className="mx-auto mb-4 h-16 w-24 rounded-[1.25rem] border border-dashed border-black/20 bg-white" />
              <div className="text-sm font-semibold text-black/45">Masterplan appears after loading</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
