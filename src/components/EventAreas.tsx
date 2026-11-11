import { useEffect, useState } from "react";

import natureLovesCourageImg from "@/assets/event-nature-loves-courage.webp";
import goldenFrequencyImg from "@/assets/event-golden-frequency.webp";
import { todayInVancouver } from "@/data/hideas";
import { FIELD, Field, FormDialog } from "@/components/FormDialog";

type CeremonyDate = { date: string; day: string; time: string };

const AREAS: {
  id: string;
  name: string;
  place: string;
  img: string;
  alt: string;
  dates: CeremonyDate[];
}[] = [
  {
    id: "nature-loves-courage",
    name: "Nature Loves Courage",
    place: "West Kelowna",
    img: natureLovesCourageImg,
    alt: "Guests in glowing headphones sitting in a circle on a forested hillside at sunset",
    dates: [
      { date: "2026-11-22", day: "Sunday, November 22, 2026", time: "1:00 PM" },
      { date: "2026-11-29", day: "Sunday, November 29, 2026", time: "6:00 PM" },
    ],
  },
  {
    id: "golden-frequency",
    name: "Golden Frequency",
    place: "West Kelowna",
    img: goldenFrequencyImg,
    alt: "Golden line drawing of a meditating figure with chakra symbols and sound waves",
    dates: [
      { date: "2026-11-22", day: "Sunday, November 22, 2026", time: "6:00 PM" },
      { date: "2026-11-29", day: "Sunday, November 29, 2026", time: "1:00 PM" },
    ],
  },
];

const upcoming = (dates: CeremonyDate[], today: string) => dates.filter((d) => d.date >= today);

/** The two ceremony series with their upcoming dates. Each date has its own Reserve button
 * that opens a short request form, and dates drop off once their day has passed. */
export function EventAreas() {
  // The page is pre-built, so past dates are filtered out in the visitor's browser
  // (starting from "" keeps the pre-built page and the browser's first render identical).
  const [today, setToday] = useState("");
  useEffect(() => setToday(todayInVancouver()), []);
  const [picked, setPicked] = useState<{ name: string; place: string; slot: CeremonyDate } | null>(null);

  return (
    <div className="space-y-10">
      {AREAS.map((area) => {
        const dates = upcoming(area.dates, today);
        return (
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
              <p className="font-body text-lg font-bold">{area.place}</p>
              <h3 className="poster mt-2 text-4xl sm:text-5xl">{area.name}</h3>
              {dates.length ? (
                <ul className="mt-6 divide-y divide-ink/15 border-y border-ink/15">
                  {dates.map((slot) => (
                    <li key={slot.date + slot.time} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
                      <div>
                        <p className="font-display text-lg uppercase leading-tight">
                          {slot.day} · {slot.time}
                        </p>
                        <p className="mt-1 text-sm text-ink/65">Exact location shared once you reserve your spot.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPicked({ name: area.name, place: area.place, slot })}
                        className="border-2 border-ink bg-ember px-5 py-2 font-display text-base uppercase text-cream shadow-[4px_4px_0_var(--ink)] transition-transform hover:-translate-y-0.5"
                      >
                        Reserve this date
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 border-y border-ink/15 py-4 text-base text-ink/75">
                  New dates are coming soon. Message us to hear about the next one first.
                </p>
              )}
            </div>
          </article>
        );
      })}

      <FormDialog
        open={picked !== null}
        onOpenChange={(open) => !open && setPicked(null)}
        title={picked ? `Reserve: ${picked.name}` : "Reserve"}
        intro={
          picked
            ? `${picked.slot.day} at ${picked.slot.time}, ${picked.place}. Send us your details and we'll be in touch to confirm your spot and share the exact location.`
            : ""
        }
        subject={picked ? `Reservation request: ${picked.name}, ${picked.slot.day} ${picked.slot.time}` : "Reservation request"}
        submitLabel="Send my request"
        thanks="Thank you! We've received your request and will be in touch within 48 hours to confirm your spot and share the exact location."
      >
        {picked ? (
          <>
            <input type="hidden" name="Ceremony" value={picked.name} />
            <input type="hidden" name="Date" value={`${picked.slot.day}, ${picked.slot.time}, ${picked.place}`} />
          </>
        ) : null}
        <Field label="Your name">
          <input required name="Name" autoComplete="name" className={FIELD} />
        </Field>
        <Field label="E-mail">
          <input required type="email" name="E-mail" autoComplete="email" className={FIELD} />
        </Field>
        <Field label="Phone" optional>
          <input type="tel" name="Phone" autoComplete="tel" className={FIELD} />
        </Field>
        <Field label="How many people">
          <select required name="Number of people" defaultValue="1" className={FIELD}>
            {["1", "2", "3", "4", "5", "6+"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </Field>
        <Field label="Anything we should know" optional>
          <textarea rows={3} name="Message" className={FIELD} />
        </Field>
      </FormDialog>
    </div>
  );
}
