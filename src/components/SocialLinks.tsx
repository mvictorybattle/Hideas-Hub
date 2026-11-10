import { Instagram, Youtube, MessageCircle, Phone, Mail } from "lucide-react";
import { SOCIALS } from "@/data/hideas";

/** Spotify's mark drawn as a simple icon, sized and coloured like the other social icons. */
function Spotify({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.5 17.3a.75.75 0 0 1-1 .25c-2.85-1.74-6.43-2.13-10.65-1.17a.75.75 0 1 1-.33-1.46c4.62-1.05 8.58-.6 11.74 1.33.36.22.47.69.25 1.05Zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.26-2-8.23-2.59-12.09-1.42a.94.94 0 1 1-.54-1.8c4.4-1.33 9.88-.69 13.61 1.62.44.27.58.85.31 1.29Zm.13-3.4C15.2 8.31 8.76 8.1 5.03 9.23a1.13 1.13 0 1 1-.65-2.16c4.28-1.3 11.4-1.05 15.9 1.62a1.13 1.13 0 0 1-1.18 1.94Z" />
    </svg>
  );
}

const ICONS: Record<string, typeof Instagram | typeof Spotify> = {
  Instagram,
  YouTube: Youtube,
  Spotify,
  WhatsApp: Phone,
  Email: Mail,
};

export function SocialLinks({ tone = "light" }: { tone?: "light" | "dark" }) {
  const base =
    tone === "light"
      ? "border-ink bg-cream text-ink shadow-[5px_5px_0_var(--ink)]"
      : "border-cream/30 bg-ink text-cream shadow-[5px_5px_0_var(--jade)]";
  return (
    <ul className="flex flex-wrap gap-4">
      {SOCIALS.map((s) => {
        const Icon = ICONS[s.label] ?? MessageCircle;
        return (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${s.label} — ${s.handle}`}
              className={`group flex items-center gap-3 border-2 px-4 py-3 transition-transform hover:-translate-y-1 ${base}`}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-left leading-tight">
                <span className="block font-display text-base uppercase">{s.label}</span>
                <span className="block font-mono text-[10px] uppercase tracking-[0.16em] opacity-60">
                  {s.handle}
                </span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
