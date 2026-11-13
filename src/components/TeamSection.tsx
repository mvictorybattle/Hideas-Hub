import { FACILITATORS } from "@/data/hideas";

export function TeamSection() {
  return (
    <div className="space-y-12">
      {FACILITATORS.map((f) => (
        <article
          key={f.name}
          className="grid gap-8 border-2 border-cream/20 bg-ink-soft p-6 shadow-[8px_8px_0_var(--jade)] sm:p-10 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-12"
          style={{ transform: "rotate(-0.3deg)" }}
        >
          <div className="sticker mx-auto aspect-square w-full max-w-sm overflow-hidden rotate-[-2deg] md:mx-0 md:max-w-none md:self-start">
            <img
              src={f.img}
              alt={`${f.name}, ${f.role}`}
              width={900}
              height={900}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          </div>

          <div>
            <h3 className="poster text-5xl text-cream sm:text-6xl">{f.name}</h3>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.22em] text-marigold">
              {f.role}
            </p>

            <div className="mt-6 space-y-4">
              {f.bio.map((p) => (
                <p key={p.slice(0, 24)} className="text-base leading-relaxed text-cream/75 sm:text-lg">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {f.tags.map((t) => (
                <span
                  key={t}
                  className="border-2 border-cream/25 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cream/70"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-5">
              {f.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-jade hover:text-marigold"
                >
                  {l.label} →
                </a>
              ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
