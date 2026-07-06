"use client";

import { useState } from "react";

interface PlanImageProps {
  src: string;
  alt: string;
  className?: string;
  /** Short hint shown in the empty state when the asset file is missing. */
  assetHint?: string;
}

/**
 * Image wrapper with a clean empty state: if the asset is missing we show a
 * placeholder instead of a broken image and log exactly which file to add.
 */
export function PlanImage({ src, alt, className, assetHint }: PlanImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`grid place-items-center bg-white/30 ${className ?? ""}`}>
        <div className="max-w-[260px] p-6 text-center">
          <div className="mx-auto mb-4 h-14 w-20 rounded-[1rem] border border-dashed border-black/20 bg-white/60" />
          <div className="text-sm font-semibold text-black/45">
            {assetHint ?? `Missing asset — place the file at public${src}`}
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        console.error(
          `[assets] Missing image: put the file at "public${src}" (project folder) and reload.`
        );
        setFailed(true);
      }}
    />
  );
}
