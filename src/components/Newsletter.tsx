import { useState } from "react";

import { CONTACT_EMAIL } from "@/data/hideas";
import { sendForm } from "@/lib/send-form";

export function Newsletter() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="border-2 border-ink bg-magenta p-6 text-cream shadow-[8px_8px_0_var(--ink)] sm:p-8">
      <h3 className="poster text-4xl sm:text-5xl">Not ready to sit yet?</h3>
      <p className="mt-3 max-w-md text-cream/85">You can still subscribe to our newsletter.</p>
      {sent ? (
        <p className="mt-6 font-script text-3xl text-marigold">
          You&rsquo;re on the list ✦ see you at the next moon
        </p>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            setSending(true);
            setError("");
            try {
              const email = new FormData(form).get("email");
              await sendForm("Join the Hideas mailing list", form, email ? String(email) : undefined);
              setSent(true);
            } catch {
              setError(`That didn't go through. Please try again, or email ${CONTACT_EMAIL}.`);
            } finally {
              setSending(false);
            }
          }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <label className="flex-1 min-w-[220px]">
            <span className="sr-only">E-mail address</span>
            <input
              required
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@email.com"
              className="w-full border-2 border-ink bg-cream px-4 py-3 font-body text-ink outline-none focus:shadow-[4px_4px_0_var(--ink)]"
            />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="border-2 border-ink bg-marigold px-6 py-3 font-display text-lg uppercase text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {sending ? "Sending…" : "Send it"}
          </button>
          {error ? (
            <p role="alert" className="w-full text-sm text-cream">
              {error}
            </p>
          ) : null}
        </form>
      )}
    </div>
  );
}
