import natureLovesCourageImg from "@/assets/event-nature-loves-courage.webp";
import goldenFrequencyImg from "@/assets/event-golden-frequency.webp";

const PLACEHOLDER_DATES = [
  { date: "[Date]", place: "[City, venue]" },
  { date: "[Date]", place: "[City, venue]" },
  { date: "[Date]", place: "[City, venue]" },
];

const EVENT_AREAS = [
  {
    id: "nature-loves-courage",
    name: "Nature Loves Courage",
    img: natureLovesCourageImg,
    alt: "Guests in glowing headphones sitting in a circle on a forested hillside at sunset",
    description:
      "[Placeholder] Description of Nature Loves Courage goes here: what the ceremony is, who it is for, and what to expect on the day.",
    dates: PLACEHOLDER_DATES,
  },
  {
    id: "golden-frequency",
    name: "Golden Frequency",
    img: goldenFrequencyImg,
    alt: "Golden line drawing of a meditating figure with chakra symbols and sound waves",
    description:
      "[Placeholder] Description of Golden Frequency goes here: what makes this sound-led ceremony unique, and what guests can expect.",
    dates: PLACEHOLDER_DATES,
  },
];

/** Draft layout for the two ceremony series. Final wording, dates and locations are to come. */
export function EventAreas() {
  return (
    <div className="space-y-10">
      {EVENT_AREAS.map((area) => (
        <article
          key={area.id}
          id={area.id}
          className="grid scroll-mt-28 items-stretch border-2 border-ink bg-cream text-ink shadow-[9px_9px_0_var(--ink)] md:grid-cols-2"
        >
          <img
            src={area.img}
            alt={area.alt}
            width={1400}
            height={788}
            loading="lazy"
            className="aspect-video h-full w-full border-b-2 border-ink object-cover md:aspect-auto md:border-b-0 md:border-r-2"
          />
          <div className="flex flex-col p-6 sm:p-8 lg:p-10">
            <h3 className="poster text-4xl sm:text-5xl">{area.name}</h3>
            <p className="mt-4 text-base leading-relaxed text-ink/80">{area.description}</p>
            <h4 className="mt-7 font-mono text-[11px] uppercase tracking-[0.24em] text-ember">
              Upcoming dates
            </h4>
            <ul className="mt-2 divide-y divide-ink/15 border-y border-ink/15">
              {area.dates.map((d, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-x-6 py-2.5 text-base">
                  <span className="font-display uppercase">{d.date}</span>
                  <span className="text-ink/75">{d.place}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
