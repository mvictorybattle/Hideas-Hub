import { useState } from "react";

import { FIELD, Field, FormDialog } from "@/components/FormDialog";

const SPACE_TYPES = ["Land or acreage", "Home", "Studio or venue", "Other"];

/** Slim banner inviting people to offer a space for a ceremony, with a short form. */
export function HostSpaceBanner() {
  const [open, setOpen] = useState(false);

  return (
    <section aria-labelledby="host-space-title" className="relative bg-ink px-5 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 border-2 border-marigold/60 px-6 py-7 sm:px-10 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <h2 id="host-space-title" className="poster text-3xl text-marigold sm:text-4xl">
            Have a Beautiful Space?
          </h2>
          <p className="mt-3 leading-relaxed text-cream/80">
            We&apos;re always looking for special places to gather. Whether it&apos;s a few acres of
            land, a garden, or a warm and spacious living room, we&apos;d love to hear from you.
            Share your space and we&apos;ll take care of the rest.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 self-start border-2 border-ink bg-marigold px-6 py-3 font-display text-lg uppercase text-ink shadow-[6px_6px_0_var(--magenta)] transition-transform hover:-translate-y-1 md:self-center"
        >
          Offer Your Space
        </button>
      </div>

      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="Offer your space"
        intro="Tell us a little about your space and we'll get back to you within 48 hours."
        subject="Space offered for a Hideas ceremony"
        submitLabel="Send"
        thanks="Thank you for offering your space! We'll take a look and get back to you within 48 hours."
      >
        <Field label="Your name">
          <input required name="Name" autoComplete="name" className={FIELD} />
        </Field>
        <Field label="E-mail">
          <input required type="email" name="E-mail" autoComplete="email" className={FIELD} />
        </Field>
        <Field label="Phone" optional>
          <input type="tel" name="Phone" autoComplete="tel" className={FIELD} />
        </Field>
        <Field label="Town or area">
          <input required name="Town or area" className={FIELD} />
        </Field>
        <Field label="Type of space">
          <select required name="Type of space" defaultValue="" className={FIELD}>
            <option value="" disabled>
              Choose one
            </option>
            {SPACE_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Roughly how many people it fits">
          <input required name="Fits roughly" inputMode="numeric" placeholder="e.g. 12" className={FIELD} />
        </Field>
        <Field label="Message">
          <textarea required rows={4} name="Message" className={FIELD} />
        </Field>
      </FormDialog>
    </section>
  );
}
