"use client";

import { useEffect, useState } from "react";

export function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0, active: false });

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      setPosition({ x: event.clientX, y: event.clientY, active: true });
    }

    function handlePointerLeave() {
      setPosition((current) => ({ ...current, active: false }));
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1] transition-opacity duration-500"
      style={{
        opacity: position.active ? 1 : 0,
        background: `radial-gradient(circle 220px at ${position.x}px ${position.y}px, rgba(127, 169, 155, 0.22), rgba(135, 155, 177, 0.1) 34%, transparent 68%)`
      }}
    />
  );
}
