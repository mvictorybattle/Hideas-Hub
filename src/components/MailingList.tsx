import { useState, type FormEvent } from "react";

import { CONTACT_EMAIL, MAILING_LIST_ENDPOINT } from "@/data/hideas";

const INTERESTS = ["Nature Loves Courage", "Golden Frequency", "Private Ceremony"];
const LOCATIONS = ["Vancouver", "Kelowna", "West Kelowna", "Lake Country", "Vernon", "Other Central BC"];

const FIELD =
  "mt-1 w-full border-2 border-ink bg-cream px-4 py-3 font-body text-ink outline-none focus:shadow-[4px_4px_0_var(--ink)]";
const LABEL = "font-mono text-[11px] uppercase tracking-[0.2em] text-cream/85";

/** Mailing-list signup. Submissions go to the hideas-mailchimp Cloudflare Worker, which adds
 * them to the Mailchimp audience with their interests and location as tags. */
export function MailingList() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    try {
      const res = await fetch(MAILING_LIST_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.get("firstName"),
          email: data.get("email"),
          interests: data.getAll("interests"),
          location: data.get("location") || "",
          consent: data.get("consent") === "yes",
          website: data.get("website") || "",
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error || "");
      setSent(true);
    } catch (err) {
      const msg = err instanceof Error && err.message ? err.message : "";
      setError(msg || `That didn't go through. Please try again, or email ${CONTACT_EMAIL}.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="border-2 border-ink bg-magenta p-6 text-cream shadow-[8px_8px_0_var(--ink)] sm:p-10">
      <h2 className="poster text-4xl sm:text-6xl">Join the mailing list</h2>
      <p className="mt-3 max-w-xl text-lg text-cream/85">
        Not ready to sit yet? Hear about upcoming ceremonies and events first.
      </p>

      {sent ? (
        <p role="status" className="mt-8 max-w-2xl font-script text-3xl leading-snug text-marigold sm:text-4xl">
          Thank you, you&rsquo;re on the list. We&rsquo;ll be in touch when something special is coming up.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={LABEL}>First name</span>
              <input required name="firstName" autoComplete="given-name" maxLength={80} className={FIELD} />
            </label>
            <label className="block">
              <span className={LABEL}>Email</span>
              <input required type="email" name="email" autoComplete="email" placeholder="you@email.com" className={FIELD} />
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <fieldset>
              <legend className={LABEL}>
                I&rsquo;m interested in <span className="normal-case tracking-normal text-cream/65">(optional)</span>
              </legend>
              <div className="mt-2 space-y-2">
                {INTERESTS.map((i) => (
                  <label key={i} className="flex items-center gap-3 text-base">
                    <input type="checkbox" name="interests" value={i} className="size-5 shrink-0 accent-[var(--marigold)]" />
                    {i}
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="block">
              <span className={LABEL}>
                Location <span className="normal-case tracking-normal text-cream/65">(optional)</span>
              </span>
              <select name="location" defaultValue="" className={FIELD}>
                <option value="">Choose your area</option>
                {LOCATIONS.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Hidden from people; bots that fill it in are ignored. */}
          <label className="absolute -left-[9999px]" aria-hidden="true">
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>

          <label className="flex items-start gap-3 text-base leading-relaxed">
            <input required type="checkbox" name="consent" value="yes" className="mt-1 size-5 shrink-0 accent-[var(--marigold)]" />
            <span>
              Yes, I&rsquo;d like to receive emails from Hideas about upcoming ceremonies and events. I can
              unsubscribe at any time.
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={sending}
              className="border-2 border-ink bg-marigold px-8 py-3 font-display text-lg uppercase text-ink shadow-[5px_5px_0_var(--ink)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {sending ? "Joining…" : "Join the list"}
            </button>
            {error ? (
              <p role="alert" className="text-sm text-cream">
                {error}
              </p>
            ) : null}
          </div>
        </form>
      )}
    </div>
  );
}
