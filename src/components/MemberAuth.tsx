import { Link } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore, type FormEvent } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FIELD, Field } from "@/components/FormDialog";
import { MAILING_LIST_ENDPOINT } from "@/data/hideas";
import {
  INTERESTS,
  LOCATIONS,
  MEMBER_DISCOUNT,
  logIn,
  referralCodeValid,
  rememberedReferral,
  sendPasswordReset,
  signUp,
  useSession,
} from "@/lib/members";

type Mode = "join" | "login" | "forgot" | "check-email" | "reset-sent";

// A tiny shared store so any button on the site can open the member pop-up.
let dialog: { open: boolean; mode: Mode } = { open: false, mode: "join" };
const listeners = new Set<() => void>();
const closed = { open: false, mode: "join" as Mode };
function setDialog(next: { open: boolean; mode: Mode }) {
  dialog = next;
  listeners.forEach((l) => l());
}
export const openMemberDialog = (mode: Mode = "join") => setDialog({ open: true, mode });
function useDialog() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => dialog,
    () => closed,
  );
}

const BUTTON =
  "w-full border-2 border-ink bg-ink px-5 py-3 font-display text-lg uppercase text-cream transition-transform hover:-translate-y-0.5 disabled:opacity-60";
const LINK = "font-mono text-[11px] uppercase tracking-[0.18em] text-ember underline-offset-4 hover:underline";

/** Adds a new member to the Mailchimp audience (tags: Member, location, interests). Never blocks sign-up. */
function addToMailchimp(firstName: string, email: string, location: string, interest: string) {
  const interests = interest === "Both" ? ["Nature Loves Courage", "Golden Frequency"] : interest ? [interest] : [];
  void fetch(MAILING_LIST_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ firstName, email, interests, location, consent: true, member: true }),
  }).catch(() => undefined);
}

function JoinForm({ onDone }: { onDone: (needsConfirm: boolean) => void }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [refCode, setRefCode] = useState("");
  useEffect(() => setRefCode(rememberedReferral()), []);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const details = {
      firstName: String(f.get("firstName") ?? ""),
      email: String(f.get("email") ?? ""),
      password: String(f.get("password") ?? ""),
      location: String(f.get("location") ?? ""),
      interest: String(f.get("interest") ?? ""),
      reason: String(f.get("reason") ?? ""),
      refCode: refCode.trim(),
    };
    setSending(true);
    setError("");
    try {
      if (details.refCode && !(await referralCodeValid(details.refCode))) {
        throw new Error("We couldn't find that referral code. Please check it, or leave it empty.");
      }
      const needsConfirm = await signUp(details);
      addToMailchimp(details.firstName, details.email, details.location, details.interest);
      onDone(needsConfirm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name">
          <input required name="firstName" autoComplete="given-name" maxLength={80} className={FIELD} />
        </Field>
        <Field label="Email">
          <input required type="email" name="email" autoComplete="email" className={FIELD} />
        </Field>
      </div>
      <Field label="Password">
        <input required type="password" name="password" minLength={8} autoComplete="new-password" className={FIELD} />
        <span className="mt-1 block text-xs text-ink/55">At least 8 characters.</span>
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Location">
          <select required name="location" defaultValue="" className={FIELD}>
            <option value="" disabled>
              Choose your area
            </option>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="Ceremony interest">
          <select required name="interest" defaultValue="" className={FIELD}>
            <option value="" disabled>
              Choose one
            </option>
            {INTERESTS.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="What brings you here?" optional>
        <textarea name="reason" rows={2} maxLength={1000} className={FIELD} />
      </Field>
      <Field label="Friend's referral code" optional>
        <input
          name="refCode"
          value={refCode}
          onChange={(e) => setRefCode(e.target.value.toUpperCase())}
          placeholder="HIDEAS-XXXXX"
          autoComplete="off"
          className={`${FIELD} font-mono uppercase`}
        />
      </Field>
      <label className="flex items-start gap-3 pt-1 text-sm leading-relaxed text-ink/80">
        <input required type="checkbox" name="consent" className="mt-1 size-4 shrink-0 accent-[var(--ember)]" />
        <span>
          Yes, I&rsquo;d like to receive emails from Hideas about upcoming ceremonies and events. I can unsubscribe at
          any time.
        </span>
      </label>
      <button type="submit" disabled={sending} className={BUTTON}>
        {sending ? "Joining…" : "Become a member"}
      </button>
      {error ? (
        <p role="alert" className="text-center text-sm text-ember">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        setSending(true);
        setError("");
        try {
          await logIn(String(f.get("email") ?? ""), String(f.get("password") ?? ""));
          onDone();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
          setSending(false);
        }
      }}
      className="space-y-3"
    >
      <Field label="Email">
        <input required type="email" name="email" autoComplete="email" className={FIELD} />
      </Field>
      <Field label="Password">
        <input required type="password" name="password" autoComplete="current-password" className={FIELD} />
      </Field>
      <button type="submit" disabled={sending} className={BUTTON}>
        {sending ? "Logging in…" : "Log in"}
      </button>
      {error ? (
        <p role="alert" className="text-center text-sm text-ember">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function ForgotForm({ onDone }: { onDone: () => void }) {
  const [sending, setSending] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSending(true);
        await sendPasswordReset(String(new FormData(e.currentTarget).get("email") ?? "")).catch(() => undefined);
        setSending(false);
        onDone();
      }}
      className="space-y-3"
    >
      <Field label="Email">
        <input required type="email" name="email" autoComplete="email" className={FIELD} />
      </Field>
      <button type="submit" disabled={sending} className={BUTTON}>
        {sending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

const COPY: Record<Mode, { title: string; intro: string }> = {
  join: {
    title: "Become a member",
    intro: `Free to join. Members get $${MEMBER_DISCOUNT} off their first ceremony, a personal referral code, and members-only videos.`,
  },
  login: { title: "Member login", intro: "Welcome back." },
  forgot: { title: "Reset your password", intro: "We'll email you a link to choose a new password." },
  "check-email": {
    title: "Check your email",
    intro:
      "We've sent you a link to confirm your email address. Once you click it, your membership and your $40 welcome credit are ready.",
  },
  "reset-sent": {
    title: "Check your email",
    intro: "If that email has a membership, a link to choose a new password is on its way.",
  },
};

/** The member sign-up / login pop-up, opened from the header or the members page. */
export function MemberAuthDialog() {
  const { open, mode } = useDialog();
  const go = (m: Mode) => setDialog({ open: true, mode: m });
  const close = () => setDialog({ open: false, mode });

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? undefined : close())}>
      <DialogContent className="z-[70] max-h-[90vh] overflow-y-auto rounded-none border-2 border-ink bg-cream p-6 text-ink shadow-[10px_10px_0_var(--marigold)] sm:max-w-xl sm:rounded-none sm:p-8">
        <DialogTitle className="font-display text-3xl uppercase leading-tight">{COPY[mode].title}</DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-ink/70">{COPY[mode].intro}</DialogDescription>

        {mode === "join" || mode === "login" ? (
          <div className="flex border-2 border-ink" role="tablist">
            {(["join", "login"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => go(m)}
                className={`flex-1 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] ${
                  mode === m ? "bg-ink text-cream" : "bg-paper text-ink/70 hover:text-ink"
                }`}
              >
                {m === "join" ? "Join free" : "Log in"}
              </button>
            ))}
          </div>
        ) : null}

        {mode === "join" ? <JoinForm onDone={(needsConfirm) => (needsConfirm ? go("check-email") : finish())} /> : null}
        {mode === "login" ? (
          <>
            <LoginForm onDone={finish} />
            <button type="button" onClick={() => go("forgot")} className={LINK}>
              Forgot your password?
            </button>
          </>
        ) : null}
        {mode === "forgot" ? (
          <>
            <ForgotForm onDone={() => go("reset-sent")} />
            <button type="button" onClick={() => go("login")} className={LINK}>
              Back to log in
            </button>
          </>
        ) : null}
        {mode === "check-email" || mode === "reset-sent" ? (
          <button type="button" onClick={close} className={BUTTON}>
            Got it
          </button>
        ) : null}
      </DialogContent>
    </Dialog>
  );

  function finish() {
    close();
    if (!window.location.pathname.endsWith("/members")) window.location.assign(`${import.meta.env.BASE_URL}members`);
  }
}

/** Header button: "Member Login" when logged out, "My Account" when logged in. */
export function MemberButton() {
  const { session, ready } = useSession();
  const cls =
    "border-2 border-cream/40 px-3 py-2 font-display text-sm uppercase text-cream transition-colors hover:border-marigold hover:text-marigold";
  return (
    <>
      {ready && session ? (
        <Link to="/members" className={cls}>
          My Account
        </Link>
      ) : (
        <button type="button" onClick={() => openMemberDialog("login")} className={cls}>
          Member Login
        </button>
      )}
      <MemberAuthDialog />
    </>
  );
}

