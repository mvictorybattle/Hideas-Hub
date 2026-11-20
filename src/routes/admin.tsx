import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";

import { MemberAuthDialog, openMemberDialog } from "@/components/MemberAuth";
import { FIELD } from "@/components/FormDialog";
import {
  loadAllMembers,
  markCreditUnused,
  markCreditUsed,
  useSession,
  type Credit,
  type Member,
} from "@/lib/members";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin | Hideas" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });

function MemberRow({
  m,
  credits,
  referrer,
  onChange,
}: {
  m: Member;
  credits: Credit[];
  referrer?: Member | undefined;
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);
  const available = credits.filter((c) => !c.used_at).length;

  const act = async (id: number, fn: () => Promise<void>) => {
    setBusy(id);
    try {
      await fn();
      onChange();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "That didn't work.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <li className="border-2 border-ink bg-paper text-ink">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="grid w-full gap-2 p-4 text-left sm:grid-cols-[1.4fr_1.6fr_1fr_auto] sm:items-center"
      >
        <span>
          <span className="block font-display text-lg uppercase leading-tight">{m.first_name}</span>
          <span className="block break-all text-sm text-ink/65">{m.email}</span>
        </span>
        <span className="text-sm text-ink/75">
          {[m.location, m.interest].filter(Boolean).join(" · ") || "—"}
          {referrer ? <span className="block text-xs text-ink/55">Referred by {referrer.first_name}</span> : null}
        </span>
        <span className="font-mono text-sm">{m.code}</span>
        <span
          className={`justify-self-start border-2 border-ink px-2 py-0.5 font-display text-base sm:justify-self-end ${
            available ? "bg-marigold" : "bg-cream text-ink/60"
          }`}
        >
          {available} credit{available === 1 ? "" : "s"}
        </span>
      </button>

      {open ? (
        <div className="border-t-2 border-ink/15 p-4">
          {m.reason ? <p className="mb-3 text-sm italic text-ink/75">&ldquo;{m.reason}&rdquo;</p> : null}
          <p className="mb-3 text-xs text-ink/55">Joined {fmt(m.created_at)}</p>
          {credits.length ? (
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {credits.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2 text-sm">
                  <span>
                    {c.kind === "welcome" ? "Welcome credit" : "Referral credit"} · {fmt(c.created_at)}
                    {c.used_at ? (
                      <span className="block text-xs text-ink/55">
                        Used {fmt(c.used_at)}
                        {c.used_note ? ` · ${c.used_note}` : ""}
                      </span>
                    ) : null}
                  </span>
                  {c.used_at ? (
                    <button
                      type="button"
                      disabled={busy === c.id}
                      onClick={() => {
                        if (window.confirm("Mark this credit as NOT used again?")) void act(c.id, () => markCreditUnused(c.id));
                      }}
                      className="border-2 border-ink/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink/70"
                    >
                      Undo
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy === c.id}
                      onClick={() => {
                        const note = window.prompt("Mark this $40 credit as used. Optional note (e.g. ceremony date):", "");
                        if (note !== null) void act(c.id, () => markCreditUsed(c.id, note));
                      }}
                      className="border-2 border-ink bg-ember px-3 py-1 font-display text-sm uppercase text-cream"
                    >
                      Mark used
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">No credits yet. They appear once this member confirms their email.</p>
          )}
        </div>
      ) : null}
    </li>
  );
}

function AdminPage() {
  const { session, ready } = useSession();
  const [data, setData] = useState<{ members: Member[]; credits: Credit[] } | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = useCallback(() => {
    loadAllMembers().then(setData, (e: Error) => setError(e.message));
  }, []);
  useEffect(() => {
    if (session) load();
  }, [session, load]);

  const byId = useMemo(() => new Map((data?.members ?? []).map((m) => [m.id, m])), [data]);
  const isAdmin = !!(session && byId.get(session.user.id)?.is_admin);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.members ?? []).filter(
      (m) => !q || [m.first_name, m.email, m.code, m.location ?? ""].some((v) => v.toLowerCase().includes(q)),
    );
  }, [data, query]);
  const openCredits = (data?.credits ?? []).filter((c) => !c.used_at).length;

  return (
    <main className="grain min-h-screen bg-ink px-5 py-14 text-cream sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/members" className="font-mono text-[11px] uppercase tracking-[0.2em] text-cream/60 hover:text-marigold">
          ← My account
        </Link>
        <h1 className="poster mt-6 text-5xl sm:text-7xl">
          Members <span className="text-marigold">admin</span>
        </h1>

        {!ready ? null : !session ? (
          <button
            type="button"
            onClick={() => openMemberDialog("login")}
            className="mt-8 border-2 border-ink bg-marigold px-6 py-3 font-display text-lg uppercase text-ink"
          >
            Log in
          </button>
        ) : error ? (
          <p className="mt-8 text-ember">{error}</p>
        ) : !data ? (
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-cream/60">Loading…</p>
        ) : !isAdmin ? (
          <p className="mt-8 text-cream/80">This page is only for the Hideas admin.</p>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
              <p className="text-cream/80">
                {data.members.length} member{data.members.length === 1 ? "" : "s"} · {openCredits} unused $40 credit
                {openCredits === 1 ? "" : "s"}
              </p>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email or code"
                className={`${FIELD} max-w-xs`}
              />
            </div>
            <p className="mt-4 text-sm text-cream/60">
              When a discounted $110 e-Transfer arrives, find the code from its message, open that member and click
              &ldquo;Mark used&rdquo; on one credit.
            </p>
            <ul className="mt-6 space-y-3">
              {shown.map((m) => (
                <MemberRow
                  key={m.id}
                  m={m}
                  credits={data.credits.filter((c) => c.member_id === m.id)}
                  referrer={m.referred_by ? byId.get(m.referred_by) : undefined}
                  onChange={load}
                />
              ))}
            </ul>
          </>
        )}
      </div>
      <MemberAuthDialog />
    </main>
  );
}
