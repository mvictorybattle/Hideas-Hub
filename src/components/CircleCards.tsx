import { useRef, useState, type PointerEvent } from "react";

import nlcBase from "@/assets/circle-nlc-base.webp";
import nlcReveal from "@/assets/circle-nlc-reveal.webp";
import gfBase from "@/assets/circle-gf-base.webp";
import gfReveal from "@/assets/circle-gf-reveal.webp";

const CIRCLES = [
  {
    name: "Nature Loves Courage",
    body: "Nature Loves Courage takes its name from a Terence McKenna lecture. His idea was that nature rewards those brave enough to take a chance, and that stepping into the unknown often turns out to feel surprisingly comfortable. This is a traditional plant medicine ceremony, held somewhere chosen for its beauty: a beautiful home, an open meadow, or the shore of a lake. With headphones on, each guest settles in and journeys inward. Afterwards, we journal, share our experiences, and discover the connections between us.",
    href: "#nature-loves-courage",
    base: nlcBase,
    reveal: nlcReveal,
  },
  {
    name: "Golden Frequency",
    body: "Golden Frequency is an investment in clarity. Designed for those who value their time, each ceremony unites precisely chosen binaural beats and frequencies with plant medicine in an intimate, expertly held setting. Every experience is unique, yet guests often describe vivid sacred geometry, ancient symbols and patterns of mathematics, along with moments of insight that keep unfolding long after the ceremony ends. Discreet and unhurried, Golden Frequency is available for a small group of up to ten, as a semi-private session, or as a fully private ceremony.",
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
    <article className="relative flex aspect-[4/5] w-full min-w-0 flex-col justify-end border-2 border-cream/25 bg-ink-soft md:aspect-auto md:min-h-[44rem] lg:min-h-[48rem]">
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
          // Not lazy: browsers skip lazy-loading a fully clipped image, so it would roll up empty.
          decoding="async"
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
