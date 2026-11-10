import nlcCover from "@/assets/spotify-nlc-vol1.webp";
import gfCover from "@/assets/spotify-gf-vol1.webp";

const PLAYLISTS = [
  {
    name: "Nature Loves Courage",
    id: "6khNteiIrmPJksvwmS6jww",
    cover: nlcCover,
    alt: "Nature Loves Courage, Volume 1: guests in headphones meditating in a forest beneath glowing sacred geometry",
    shadow: "shadow-[9px_9px_0_var(--jade)]",
  },
  {
    name: "Golden Frequency",
    id: "04KclFro5Y5HeiIeDvsboD",
    cover: gfCover,
    alt: "Golden Frequency, Volume 1: a meditating figure drawn in gold with frequency waves",
    shadow: "shadow-[9px_9px_0_var(--marigold)]",
  },
];

/** The two ceremony playlists, each with Spotify's own player so visitors can listen here. */
export function SpotifySection() {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      {PLAYLISTS.map((p) => (
        <article key={p.id} className={`border-2 border-cream/25 bg-ink ${p.shadow}`}>
          <img
            src={p.cover}
            alt={p.alt}
            width={720}
            height={720}
            loading="lazy"
            className="block aspect-square w-full border-b-2 border-cream/25 object-cover"
          />
          <div className="p-4 sm:p-5">
            <h3 className="font-display text-2xl uppercase text-cream">{p.name}</h3>
            <iframe
              title={`${p.name} playlist on Spotify`}
              src={`https://open.spotify.com/embed/playlist/${p.id}?theme=0`}
              width="100%"
              height="352"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              className="mt-4 block rounded-xl border-0"
            />
          </div>
        </article>
      ))}
    </div>
  );
}
