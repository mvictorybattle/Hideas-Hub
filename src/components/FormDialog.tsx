import { useState, type ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { CONTACT_EMAIL } from "@/data/hideas";
import { sendForm } from "@/lib/send-form";

/** Shared look for inputs inside these pop-up forms, matching the contact form. */
export const FIELD =
  "mt-1 w-full border-2 border-ink bg-paper px-3 py-2 font-body text-ink outline-none focus:shadow-[4px_4px_0_var(--magenta)]";
export const LABEL = "font-mono text-[11px] uppercase tracking-[0.2em] text-ink/70";

/** A labelled field. `optional` adds a quiet "(optional)" after the label. */
export function Field({ label, optional, children }: { label: string; optional?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className={LABEL}>
        {label}
        {optional ? <span className="normal-case tracking-normal text-ink/50"> (optional)</span> : null}
      </span>
      {children}
    </label>
  );
}

/** A pop-up form that emails its answers to events@hideas.ca and then thanks the visitor. */
export function FormDialog({
  open,
  onOpenChange,
  title,
  intro,
  subject,
  submitLabel,
  thanks,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  intro: string;
  subject: string;
  submitLabel: string;
  thanks: string;
  children: ReactNode;
}) {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const change = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setSent(false);
      setError("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogContent className="z-[70] max-h-[90vh] overflow-y-auto rounded-none border-2 border-ink bg-cream p-6 text-ink shadow-[10px_10px_0_var(--magenta)] sm:rounded-none sm:p-8">
        <DialogTitle className="font-display text-2xl uppercase leading-tight">{title}</DialogTitle>
        {sent ? (
          <p className="leading-relaxed text-ink/80">{thanks}</p>
        ) : (
          <>
            <DialogDescription className="text-sm leading-relaxed text-ink/70">{intro}</DialogDescription>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                setSending(true);
                setError("");
                try {
                  const email = new FormData(form).get("E-mail");
                  await sendForm(subject, form, email ? String(email) : undefined);
                  setSent(true);
                } catch {
                  setError(`Your message couldn't be sent. Please try again, or email ${CONTACT_EMAIL}.`);
                } finally {
                  setSending(false);
                }
              }}
              className="space-y-3"
            >
              {children}
              <button
                type="submit"
                disabled={sending}
                className="mt-3 w-full border-2 border-ink bg-ink px-5 py-3 font-display text-lg uppercase text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {sending ? "Sending…" : submitLabel}
              </button>
              {error ? (
                <p role="alert" className="text-center text-sm text-ember">
                  {error}
                </p>
              ) : null}
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
