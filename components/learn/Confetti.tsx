"use client";

import { motion, useReducedMotion } from "framer-motion";

const COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#34d399", "#fbbf24"];
const PIECES = 36;

/** Decorative burst shown on a perfect quiz score. Renders nothing when reduced motion is requested. */
export default function Confetti({ burstKey }: { burstKey: string }) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div key={burstKey} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 h-0 overflow-visible">
      {Array.from({ length: PIECES }, (_, i) => {
        const angle = (i / PIECES) * Math.PI * 2;
        const distance = 90 + ((i * 37) % 70);
        return (
          <motion.span
            key={i}
            className="absolute left-1/2 top-0 block h-2 w-1.5 rounded-sm"
            style={{ backgroundColor: COLORS[i % COLORS.length] }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance + 60,
              rotate: 360 * (i % 2 ? 1 : -1),
              opacity: 0,
            }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}
