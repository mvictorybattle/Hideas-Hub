import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { MemberAuthDialog, openMemberDialog } from "@/components/MemberAuth";
import { FIELD } from "@/components/FormDialog";
import {
  FULL_PRICE,
  MEMBER_DISCOUNT,
  availableCredits,
  loadMyMember,
  loadVideos,
  logOut,
  setNewPassword,
  useRecovering,
  useSession,
  type Credit,
  type Member,
  type MemberVideo,
} from "@/lib/members";
import { SITE_URL, pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      ...pageMeta({
        title: "Members | Hideas Socials and Ceremony",
        description: "Your Hideas membership: your personal code, referral link, $40 credits and members-only videos.",
        path: "/members",
      }),
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: MembersPage,
});

const CARD = "border-2 border-cream/20 bg-ink-soft p-6 shadow-[8px_8px_0_var(--jade)] sm:p-8";
const SMALL_BTN =
  "border-2 border-ink bg-marigold px-4 py-2 font-display text-sm uppercase text-ink transition-transform hover:-translate-y-0.5";

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text).catch(() => undefined);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }}
      className={SMALL_BTN}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}

/** Turns a Vimeo page or player link into an embeddable player address. */
function vimeoEmbed(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/i);
  if (!m) return null;
  const hash = m[2] ?? new URL(url).searchParams.get("h");
  return `https://player.vimeo.com/video/${m[1]}${hash ? `?h=${hash}&` : "?"}dnt=1`;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="grain min-h-screen bg-ink px-5 py-14 text-cream sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/" className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/60 hover:text-marigold">
          ← Back to Hideas
        </Link>
        {children}
      </div>
      <MemberAuthDialog />
    </main>
  );
}

function SetNewPassword() {
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  if (done) return <p className="mt-6 text-cream/80">Your new password is saved.</p>;
  return (
    <form
      className={`${CARD} mt-10 max-w-md space-y-4`}
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await setNewPassword(String(new FormData(e.currentTarget).get("password") ?? ""));
          setDone(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      }}
    >
      <h2 className="poster text-3xl">Choose a new password</h2>
      <input required type="password" name="password" minLength={8} autoComplete="new-password" className={FIELD} />
      <button type="submit" className={SMALL_BTN}>
        Save password
      </button>
      {error ? <p className="text-sm text-ember">{error}</p> : null}
    </form>
  );
}

function MembersPage() {
  const { session, ready } = useSession();
  const recovering = useRecovering();
  const [data, setData] = useState<{ member: Member | null; credits: Credit[] } | null>(null);
  const [videos, setVideos] = useState<MemberVideo[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    loadMyMember(session.user.id).then(setData, (e: Error) => setError(e.message));
    loadVideos().then(setVideos, () => setVideos([]));
  }, [session]);

  if (!ready) {
    return (
      <Shell>
        <p className="mt-16 font-mono text-xs uppercase tracking-[0.2em] text-cream/60">Loading…</p>
      </Shell>
    );
  }

  if (!session) {
    return (
      <Shell>
        <div className={`${CARD} mt-10 max-w-2xl`}>
          <h1 className="poster text-5xl sm:text-6xl">
            Hideas <span className="text-marigold">members</span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-cream/80">
            Free to join. Members get ${MEMBER_DISCOUNT} off their first ceremony, a personal code to share with
            friends (you both get ${MEMBER_DISCOUNT} off), and members-only videos.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button type="button" onClick={() => openMemberDialog("join")} className={`${SMALL_BTN} px-6 py-3 text-lg`}>
              Join free
            </button>
            <button
              type="button"
              onClick={() => openMemberDialog("login")}
              className="border-2 border-cream/40 px-6 py-3 font-display text-lg uppercase text-cream hover:border-marigold hover:text-marigold"
            >
              Log in
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  const member = data?.member;
  const credits = data?.credits ?? [];
  const available = availableCredits(credits);
  const link = member ? `${SITE_URL}/?ref=${member.code}` : "";

  return (
    <Shell>
      {recovering ? <SetNewPassword /> : null}

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <h1 className="poster text-5xl sm:text-7xl">
          Hi{member ? `, ${member.first_name}` : ""} <span className="text-marigold">✦</span>
        </h1>
        <div className="flex flex-wrap gap-3">
          {member?.is_admin ? (
            <Link to="/admin" className={SMALL_BTN}>
              Admin
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => void logOut()}
            className="border-2 border-cream/40 px-4 py-2 font-display text-sm uppercase text-cream hover:border-marigold hover:text-marigold"
          >
            Log out
          </button>
        </div>
      </div>

      {error ? <p className="mt-6 text-ember">{error}</p> : null}
      {!data && !error ? (
        <p className="mt-10 font-mono text-xs uppercase tracking-[0.2em] text-cream/60">Loading your membership…</p>
      ) : null}

      {member ? (
        <>
          <div className="mt-10 grid gap-8 md:grid-cols-2">
            <section className={CARD}>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold">Your $40 credits</p>
              <p className="poster mt-2 text-7xl">{available.length}</p>
              <p className="mt-3 leading-relaxed text-cream/80">
                {available.length
                  ? `You can use one $${MEMBER_DISCOUNT} credit per ceremony.`
                  : `No credits right now, so ceremonies are the full $${FULL_PRICE}. Refer a friend to earn $${MEMBER_DISCOUNT} off.`}
              </p>
            </section>

            <section className={CARD}>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-marigold">Your personal code</p>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <p className="border-2 border-dashed border-marigold px-4 py-2 font-mono text-2xl tracking-[0.12em] text-cream">
                  {member.code}
                </p>
                <CopyButton text={member.code} label="Copy" />
              </div>
              <p className="mt-4 leading-relaxed text-cream/85">
                {available.length
                  ? `Put this code in your e-Transfer message and send $${FULL_PRICE - MEMBER_DISCOUNT} instead of $${FULL_PRICE}.`
                  : `When you have a credit, put this code in your e-Transfer message and send $${FULL_PRICE - MEMBER_DISCOUNT} instead of $${FULL_PRICE}.`}
              </p>
            </section>
          </div>

          <section className={`${CARD} mt-8 shadow-[8px_8px_0_var(--magenta)]`}>
            <h2 className="poster text-3xl sm:text-4xl">Share Hideas, both get ${MEMBER_DISCOUNT} off</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-cream/80">
              When a friend joins with your link or code, they get ${MEMBER_DISCOUNT} off their first ceremony and you
              get ${MEMBER_DISCOUNT} off a future one. Credits add up.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <p className="min-w-0 break-all font-mono text-sm text-cream/90">{link}</p>
              <button
                type="button"
                onClick={async () => {
                  const text = `Join me at Hideas: you'll get $${MEMBER_DISCOUNT} off your first ceremony.`;
                  if (navigator.share) await navigator.share({ title: "Hideas", text, url: link }).catch(() => undefined);
                  else await navigator.clipboard.writeText(`${text} ${link}`).catch(() => undefined);
                }}
                className={SMALL_BTN}
              >
                Share
              </button>
              <CopyButton text={link} label="Copy link" />
            </div>
          </section>

          {credits.length ? (
            <section className="mt-8">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream/60">Credit history</h2>
              <ul className="mt-3 divide-y divide-cream/10 border-y border-cream/10">
                {credits.map((c) => (
                  <li key={c.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                    <span>{c.kind === "welcome" ? "Welcome credit" : "Referral credit, a friend joined"}</span>
                    <span className={c.used_at ? "text-cream/50" : "text-marigold"}>
                      {c.used_at ? `Used ${new Date(c.used_at).toLocaleDateString("en-CA")}` : "Available"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-14">
            <h2 className="poster text-4xl sm:text-5xl">
              Members-only <span className="text-magenta">videos</span>
            </h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => {
                const src = v.vimeo_url ? vimeoEmbed(v.vimeo_url) : null;
                return (
                  <article key={v.id} className="border-2 border-cream/20 bg-ink-soft">
                    <div className="aspect-video bg-ink">
                      {src ? (
                        <iframe
                          src={src}
                          title={v.title}
                          allow="fullscreen; picture-in-picture"
                          loading="lazy"
                          className="size-full"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center font-mono text-[11px] uppercase tracking-[0.2em] text-cream/50">
                          Coming soon
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl uppercase">{v.title}</h3>
                      {v.description ? <p className="mt-2 text-sm text-cream/70">{v.description}</p> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      ) : null}
    </Shell>
  );
}
