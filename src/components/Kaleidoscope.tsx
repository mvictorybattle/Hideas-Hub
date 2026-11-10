import { KALEIDOSCOPE_SIZE, discPaths, type KaleidoscopeVariant } from "@/lib/kaleidoscope";
import logo from "@/assets/h!logo.png";

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

/** The H! logo centred on the kaleidoscope. In the intro the rings also turn a little faster. */
export function KaleidoscopeLogo({ intro = false }: { intro?: boolean }) {
  return (
    <div className="relative mx-auto aspect-square w-full">
      <div className={`absolute inset-0 ${intro ? "[animation:intro-turn_4.6s_ease-out_both]" : ""}`}>
        <Kaleidoscope />
      </div>
      <img
        src={logo}
        alt="Hideas logo"
        width={400}
        height={400}
        className="absolute left-1/2 top-1/2 w-2/5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ boxShadow: "0 0 0 4px var(--cream), 0 0 14px 6px var(--ink)" }}
      />
    </div>
  );
}
