import { useSyncExternalStore } from "react";

/**
 * Hideas members area. Logins and member records live in Supabase (see supabase/members.sql).
 * The site talks to Supabase's sign-in and data APIs directly with fetch. The URL and the
 * publishable key below are public by design: the database's row-level security decides who
 * can see what, and credits can only be created by the database itself.
 */
export const SUPABASE_URL = "https://arnmburvekvsysgcwmrw.supabase.co";
export const SUPABASE_KEY = "sb_publishable_7IoypUJu_iXjEa6eQkLE9Q_2c1Yq5DU";

export const FULL_PRICE = 150;
export const MEMBER_DISCOUNT = 40;
export const LOCATIONS = ["Vancouver", "Kelowna", "West Kelowna", "Lake Country", "Vernon", "Other Central BC"];
export const INTERESTS = ["Nature Loves Courage", "Golden Frequency", "Both"];

const SESSION_KEY = "hideas-member-session";
const REF_KEY = "hideas-ref-code";

export type Session = {
  access_token: string;
  refresh_token: string;
  /** Seconds since 1970 when the access token stops working. */
  expires_at: number;
  user: { id: string; email: string };
};

export type Member = {
  id: string;
  first_name: string;
  email: string;
  location: string | null;
  interest: string | null;
  reason: string | null;
  code: string;
  referred_by: string | null;
  is_admin: boolean;
  created_at: string;
};

export type Credit = {
  id: number;
  member_id: string;
  kind: "welcome" | "referral";
  friend_id: string | null;
  created_at: string;
  used_at: string | null;
  used_note: string | null;
};

export type MemberVideo = { id: number; title: string; description: string | null; vimeo_url: string | null };

// ---------- Session store ----------

type State = { session: Session | null; ready: boolean };
let state: State = { session: null, ready: false };
const listeners = new Set<() => void>();
const serverState: State = { session: null, ready: false };

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function save(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* private mode: the session simply won't survive a reload */
  }
  setState({ session });
}

function toSession(data: {
  access_token: string;
  refresh_token: string;
  expires_in?: number | undefined;
  expires_at?: number | undefined;
  user: { id: string; email: string };
}): Session {
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    user: { id: data.user.id, email: data.user.email },
  };
}

async function authFetch(path: string, body: unknown, token?: string) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(friendlyError(data));
  return data;
}

function friendlyError(data: { msg?: string; error_description?: string; message?: string; error_code?: string }) {
  const raw = data.msg || data.error_description || data.message || "";
  if (/invalid login credentials/i.test(raw)) return "That email and password don't match. Please try again.";
  if (/email not confirmed/i.test(raw)) return "Please confirm your email first. Check your inbox for our link.";
  if (/already registered|already been registered/i.test(raw)) return "That email already has a membership. Try logging in instead.";
  if (/password should be at least/i.test(raw)) return "Please choose a password of at least 8 characters.";
  if (/rate limit|too many/i.test(raw)) return "Too many tries just now. Please wait a few minutes and try again.";
  return raw || "Something went wrong. Please try again.";
}

let refreshing: Promise<Session | null> | null = null;

async function refresh(current: Session): Promise<Session | null> {
  refreshing ??= authFetch("token?grant_type=refresh_token", { refresh_token: current.refresh_token })
    .then((data) => {
      const s = toSession(data);
      save(s);
      return s;
    })
    .catch(() => {
      save(null);
      return null;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/** A session whose access token is valid for at least another minute, or null. */
export async function activeSession(): Promise<Session | null> {
  const s = state.session;
  if (!s) return null;
  if (s.expires_at - 60 > Date.now() / 1000) return s;
  return refresh(s);
}

let started = false;

/** Restores a saved login and picks up the tokens a confirmation or reset email link brings back. */
function start() {
  if (started || typeof window === "undefined") return;
  started = true;

  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) rememberReferral(ref);

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const fromLink = hash.get("access_token");
  if (fromLink) {
    const linkType = hash.get("type");
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
    fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${fromLink}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((user) => {
        save(
          toSession({
            access_token: fromLink,
            refresh_token: hash.get("refresh_token") ?? "",
            expires_at: Number(hash.get("expires_at")) || undefined,
            expires_in: Number(hash.get("expires_in")) || 3600,
            user,
          }),
        );
        if (linkType === "recovery") setRecovering(true);
      })
      .catch(() => undefined)
      .finally(() => setState({ ready: true }));
    return;
  }

  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) state = { ...state, session: JSON.parse(saved) as Session };
  } catch {
    /* ignore */
  }
  setState({ ready: true });
  if (state.session) void activeSession();
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The logged-in member's session (null when logged out). `ready` is false until it is known. */
export function useSession() {
  return useSyncExternalStore(subscribe, () => state, () => serverState);
}

// ---------- Password reset state ----------

let recovering = false;
const recoveryListeners = new Set<() => void>();
function setRecovering(v: boolean) {
  recovering = v;
  recoveryListeners.forEach((l) => l());
}
export function useRecovering() {
  return useSyncExternalStore(
    (l) => {
      recoveryListeners.add(l);
      return () => recoveryListeners.delete(l);
    },
    () => recovering,
    () => false,
  );
}

// ---------- Referral code from a shared link ----------

export function rememberReferral(code: string) {
  try {
    localStorage.setItem(REF_KEY, code.trim().toUpperCase().slice(0, 20));
  } catch {
    /* ignore */
  }
}
export function rememberedReferral() {
  try {
    return localStorage.getItem(REF_KEY) ?? "";
  } catch {
    return "";
  }
}

// ---------- Auth actions ----------

export type SignUpDetails = {
  firstName: string;
  email: string;
  password: string;
  location: string;
  interest: string;
  reason: string;
  refCode: string;
};

/** Creates the account. Returns true when the member must confirm their email first. */
export async function signUp(d: SignUpDetails): Promise<boolean> {
  // redirect_to is where the confirmation email's link returns to.
  const data = await authFetch(`signup?redirect_to=${encodeURIComponent(`${window.location.origin}/members`)}`, {
    email: d.email.trim(),
    password: d.password,
    data: {
      first_name: d.firstName.trim(),
      location: d.location,
      interest: d.interest,
      reason: d.reason.trim(),
      ref_code: d.refCode.trim().toUpperCase(),
      email_consent: "true",
    },
  });
  if (data.access_token) {
    save(toSession(data));
    return false;
  }
  return true;
}

export async function logIn(email: string, password: string) {
  save(toSession(await authFetch("token?grant_type=password", { email: email.trim(), password })));
}

export async function logOut() {
  const s = state.session;
  save(null);
  if (s) await authFetch("logout", {}, s.access_token).catch(() => undefined);
}

export async function sendPasswordReset(email: string) {
  await fetch(`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(`${window.location.origin}/members`)}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim() }),
  });
}

export async function setNewPassword(password: string) {
  const s = await activeSession();
  if (!s) throw new Error("Your reset link has expired. Please request a new one.");
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: "PUT",
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${s.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) throw new Error(friendlyError(await res.json().catch(() => ({}))));
  setRecovering(false);
}

// ---------- Data ----------

async function rest<T>(path: string, init?: RequestInit): Promise<T> {
  const s = await activeSession();
  if (!s) throw new Error("Please log in again.");
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${s.access_token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message || "Something went wrong. Please try again.");
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export async function loadMyMember(userId: string) {
  const [member] = await rest<Member[]>(`members?id=eq.${userId}&select=*`);
  const credits = await rest<Credit[]>(`credits?member_id=eq.${userId}&select=*&order=created_at`);
  return { member: member ?? null, credits };
}

export const loadVideos = () => rest<MemberVideo[]>("member_videos?select=id,title,description,vimeo_url&order=sort");

export async function loadAllMembers() {
  const [members, credits] = await Promise.all([
    rest<Member[]>("members?select=*&order=created_at.desc"),
    rest<Credit[]>("credits?select=*&order=created_at"),
  ]);
  return { members, credits };
}

export const markCreditUsed = (id: number, note: string) =>
  rest<void>("rpc/mark_credit_used", { method: "POST", body: JSON.stringify({ credit_id: id, note }) });

export const markCreditUnused = (id: number) =>
  rest<void>("rpc/mark_credit_unused", { method: "POST", body: JSON.stringify({ credit_id: id }) });

/** Checks a friend's code before sign-up (works while logged out). */
export async function referralCodeValid(code: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/referral_code_valid`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ c: code }),
  });
  return res.ok ? ((await res.json()) as boolean) : false;
}

export const availableCredits = (credits: Credit[]) => credits.filter((c) => !c.used_at);
