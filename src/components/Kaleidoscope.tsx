import { KALEIDOSCOPE_SIZE, discPaths, type KaleidoscopeVariant } from "@/lib/kaleidoscope";

/** Each disc turns on its own, carrying some of the seven chakra rings (0 = root, 6 = crown). */
const DISCS = [
  [0, 1],
  [2, 3],
  [4, 5, 6],
];
const COLOR_SHIFT = 3;
const VIEW_BOX = `${-KALEIDOSCOPE_SIZE / 2} ${-KALEIDOSCOPE_SIZE / 2} ${KALEIDOSCOPE_SIZE} ${KALEIDOSCOPE_SIZE}`;

/** Sacred-geometry kaleidoscope drawn in code. Motion lives in styles.css so it runs on the
 * compositor, and it holds still for visitors who have reduced motion turned on. */
export function Kaleidoscope({ variant = "calm" }: { variant?: KaleidoscopeVariant }) {
  return (
    <div className={`kaleidoscope kaleidoscope-${variant}`} aria-hidden="true">
      {DISCS.map((rings) => (
        <div key={rings[0]} className="kaleidoscope-disc">
          {[0, COLOR_SHIFT].map((shift) => (
            <svg key={shift} viewBox={VIEW_BOX} className={shift ? "kaleidoscope-blend" : undefined}>
              {discPaths(rings, variant, shift).map((path, i) => (
                <path key={i} {...path} />
              ))}
            </svg>
          ))}
        </div>
      ))}
    </div>
  );
}
