/** The seven chakras, root to crown, each paired with its solfeggio frequency. */
export const CHAKRAS = [
  { color: "#e0263f", hz: 396 },
  { color: "#f2701f", hz: 417 },
  { color: "#f6c63c", hz: 528 },
  { color: "#2fbf71", hz: 639 },
  { color: "#1f9fe0", hz: 741 },
  { color: "#5151e5", hz: 852 },
  { color: "#ab4fdc", hz: 963 },
];

export type KaleidoscopeVariant = "calm" | "vivid";

export const KALEIDOSCOPE_SIZE = 1000;

/** The logo covers the centre, so the first ring starts just outside it. */
const FIRST_RING_RADIUS = 225;
const RING_SPACING = 38;
const STAINED_GLASS_LINE = "#0f0d0b";

const point = (r: number, angle: number) =>
  `${(r * Math.cos(angle)).toFixed(1)} ${(r * Math.sin(angle)).toFixed(1)}`;

/** Higher frequencies sit further out and carry more petals, always in multiples of 6. */
function petalCount(hz: number) {
  return Math.round(hz / 108) * 6;
}

/** Higher frequencies swing a little deeper, so neighbouring rings just touch. */
function petalDepth(hz: number) {
  return 24 + hz / 30;
}

/** A closed ring of scalloped petals. A negative depth points the scallops inward. */
function petalRing(radius: number, petals: number, depth: number, offset: number) {
  const step = (2 * Math.PI) / petals;
  const control = radius + depth;
  let d = `M${point(radius, offset)}`;
  for (let i = 0; i < petals; i++) {
    const a = offset + i * step;
    d += `Q${point(control, a + step / 2)} ${point(radius, a + step)}`;
  }
  return `${d}Z`;
}

/** The SVG paths for the chakra rings on one disc. `colorShift` recolours a blending copy. */
export function discPaths(rings: number[], variant: KaleidoscopeVariant, colorShift: number) {
  const vivid = variant === "vivid";
  return rings.flatMap((ring) => {
    const { hz } = CHAKRAS[ring]!;
    const color = CHAKRAS[(ring + colorShift) % CHAKRAS.length]!.color;
    const radius = FIRST_RING_RADIUS + ring * RING_SPACING;
    const petals = petalCount(hz);
    const depth = petalDepth(hz);
    const step = (2 * Math.PI) / petals;
    const outward = petalRing(radius, petals, depth, 0);
    const inward = petalRing(radius, petals, -depth, 0);
    // Calm is fine coloured linework; vivid is saturated petals with dark stained-glass leading.
    const stroke = vivid ? STAINED_GLASS_LINE : color;
    return [
      // Styled with fill-rule: evenodd, so this pair fills only the petals between them.
      { d: outward + inward, stroke, fill: `${color}${vivid ? "f0" : "2e"}` },
      { d: petalRing(radius, petals, depth, step / 2), stroke, fill: "none" },
      { d: petalRing(radius, petals, -depth, step / 2), stroke, fill: "none" },
    ];
  });
}
