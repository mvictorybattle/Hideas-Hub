import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { KaleidoscopeLogo } from "@/components/Kaleidoscope";

const KEY = "hideas-intro-seen";
const DURATION = 4600;

/** Opening animation: the H! logo and its kaleidoscope bloom in, then the curtain lifts. */
export function IntroBeam() {
  const [state, setState] = useState<"idle" | "playing">("idle");

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {
      /* ignore */
    }
    if (seen || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setState("playing");
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => finish(), DURATION);
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finish() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    document.body.style.overflow = "";
    setState("idle");
  }

  if (state !== "playing" || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-ink [animation:intro-curtain_0.7s_3.9s_ease-in_forwards]">
      <div className="grain-overlay pointer-events-none absolute inset-0" />

      <div className="w-[min(560px,82vw)] [animation:intro-bloom_1.6s_cubic-bezier(0.22,1,0.36,1)_both]">
        <KaleidoscopeLogo intro />
      </div>

      <button
        type="button"
        onClick={finish}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 border-2 border-cream/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.28em] text-cream/70 transition-colors hover:border-marigold hover:text-marigold"
      >
        Skip intro
      </button>
    </div>,
    document.body,
  );
}
