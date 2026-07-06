"use client";

import { useEffect, useRef } from "react";

/**
 * Cursor-driven ambience, three layers, all rendered without React re-renders
 * (a single rAF loop writes CSS variables / styles directly):
 *
 * 1. A soft colour glow that follows the pointer.
 * 2. A grid "spotlight": the faint background grid brightens near the cursor.
 * 3. A specular highlight on liquid-glass panels: the hovered panel gets
 *    --mx/--my variables so its ::after highlight follows the pointer.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let pending: PointerEvent | null = null;
    let frame = 0;
    let lastPanel: HTMLElement | null = null;

    function apply() {
      frame = 0;
      const event = pending;
      if (!event) return;
      const { clientX: x, clientY: y } = event;

      if (glowRef.current) {
        glowRef.current.style.opacity = "1";
        glowRef.current.style.background = `radial-gradient(circle 240px at ${x}px ${y}px, rgba(127, 169, 155, 0.2), rgba(135, 155, 177, 0.09) 34%, transparent 68%)`;
      }
      if (gridRef.current) {
        gridRef.current.style.opacity = "1";
        gridRef.current.style.maskImage = `radial-gradient(circle 260px at ${x}px ${y}px, rgba(0,0,0,0.9), transparent 72%)`;
        gridRef.current.style.webkitMaskImage = `radial-gradient(circle 260px at ${x}px ${y}px, rgba(0,0,0,0.9), transparent 72%)`;
      }

      // Glass specular highlight on the hovered panel only.
      const target = event.target as Element | null;
      const panel = target?.closest?.(
        ".liquid-surface, .liquid-soft, .glass-chip"
      ) as HTMLElement | null;
      if (panel !== lastPanel && lastPanel) {
        lastPanel.style.removeProperty("--mx");
        lastPanel.style.removeProperty("--my");
      }
      if (panel) {
        const rect = panel.getBoundingClientRect();
        panel.style.setProperty("--mx", `${(((x - rect.left) / rect.width) * 100).toFixed(2)}%`);
        panel.style.setProperty("--my", `${(((y - rect.top) / rect.height) * 100).toFixed(2)}%`);
      }
      lastPanel = panel;
    }

    function handlePointerMove(event: PointerEvent) {
      pending = event;
      if (!frame) {
        frame = window.requestAnimationFrame(apply);
      }
    }

    function handlePointerLeave() {
      if (glowRef.current) glowRef.current.style.opacity = "0";
      if (gridRef.current) gridRef.current.style.opacity = "0";
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <>
      {/* Grid spotlight: same grid as the body background, revealed near the cursor. */}
      <div
        ref={gridRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(rgba(17, 17, 17, 0.085) 1px, transparent 1px), linear-gradient(90deg, rgba(17, 17, 17, 0.085) 1px, transparent 1px)",
          backgroundSize: "44px 44px"
        }}
      />
      {/* Soft colour glow following the pointer. */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1] opacity-0 transition-opacity duration-500"
      />
    </>
  );
}
