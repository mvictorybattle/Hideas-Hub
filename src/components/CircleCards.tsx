import { useRef, useState, type PointerEvent } from "react";

import nlcBase from "@/assets/circle-nlc-base.webp";
import nlcReveal from "@/assets/circle-nlc-reveal.webp";
import gfBase from "@/assets/circle-gf-base.webp";
import gfReveal from "@/assets/circle-gf-reveal.webp";

const CIRCLES = [
  {
    name: "Nature Loves Courage",
    body: "A traditional ceremony, held outdoors or in a carefully chosen space. Opened with smudging and carried by a soundscape of beautiful music, it's an invitation to slow down and let the experience unfold naturally.",
    href: "#nature-loves-courage",
    base: nlcBase,
    reveal: nlcReveal,
  },
  {
    name: "Golden Frequency",
    body: "A modern, sound-led ceremony. Each session is built around chosen frequencies that work hand in hand with the experience, and many guests describe vivid geometric patterns and a deep sense of focus.",
    href: "#golden-frequency",
    base: gfBase,
    reveal: gfReveal,
  },
];

/** How long a finger must rest on the button before the photo is revealed. */
const HOLD_MS = 350;
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";

function CircleCard({ circle }: { circle: (typeof CIRCLES)[number] }) {
  const [revealed, setRevealed] = useState(false);
  const holdTimer = useRef<number | undefined>(undefined);
  // Set when a press-and-hold revealed the photo, so letting go doesn't also follow the link.
  const held = useRef(false);

  const endHold = () => {
    window.clearTimeout(holdTimer.current);
    setRevealed(false);
  };

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    held.current = false;
    holdTimer.current = window.setTimeout(() => {
      held.current = true;
      setRevealed(true);
    }, HOLD_MS);
  };

  return (
    <article className="relative flex aspect-[4/5] w-full min-w-0 flex-col justify-end border-2 border-cream/25 bg-ink-soft">
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <img
          src={circle.base}
          alt=""
          width={960}
          height={1200}
          loading="lazy"
          className="absolute inset-0 size-full object-cover"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/45 transition-opacity duration-1000 ${EASE} ${
            revealed ? "opacity-0" : "opacity-100"
          }`}
        />
        <img
          src={circle.reveal}
          alt=""
          width={960}
          height={1200}
          loading="lazy"
          className={`absolute inset-0 size-full object-cover transition-[clip-path] duration-[1400ms] ${EASE} motion-reduce:duration-500 ${
            revealed ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(100%_0_0_0)]"
          }`}
        />
      </div>

      <div className="relative flex flex-col p-8 sm:p-10">
        <div
          className={`transition-opacity duration-1000 ${EASE} ${revealed ? "opacity-0" : "opacity-100"}`}
          aria-hidden={revealed}
        >
          <h2 className="poster text-4xl text-cream sm:text-5xl">{circle.name}</h2>
          <p className="mt-5 text-lg leading-relaxed text-cream/85">{circle.body}</p>
        </div>
        <a
          href={circle.href}
          aria-label={`Join a circle: ${circle.name}`}
          onPointerEnter={(e) => e.pointerType === "mouse" && setRevealed(true)}
          onPointerLeave={(e) => e.pointerType === "mouse" && setRevealed(false)}
          onPointerDown={onPointerDown}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onContextMenu={(e) => e.preventDefault()}
          onClick={(e) => {
            if (held.current) {
              e.preventDefault();
              held.current = false;
            }
          }}
          className="mt-8 select-none self-start border-2 border-ink bg-ember px-6 py-3 font-display text-lg uppercase text-cream shadow-[6px_6px_0_var(--marigold)] transition-transform [-webkit-touch-callout:none] hover:-translate-y-1"
        >
          Join a circle
        </a>
      </div>
    </article>
  );
}

/** The two ceremony series. Hovering (or pressing and holding) "Join a circle" fades the
 * text and rolls the full-colour photo up over the matte one. */
export function CircleCards() {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
      {CIRCLES.map((c) => (
        <CircleCard key={c.name} circle={c} />
      ))}
    </div>
  );
}
