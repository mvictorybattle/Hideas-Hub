/**
 * Hideas mailing-list signup. The website is static, so this Cloudflare Worker holds the
 * Mailchimp API key (secret MAILCHIMP_API_KEY, set in the Cloudflare dashboard, never in code)
 * and adds or updates each signup in the Hideas audience, with interests and location as tags.
 */

interface Env {
  MAILCHIMP_API_KEY: string;
  MAILCHIMP_AUDIENCE_ID: string;
  /** Comma-separated origins allowed to call this Worker, e.g. "https://hideas.ca". */
  ALLOWED_ORIGINS: string;
}

const INTERESTS = ["Nature Loves Courage", "Golden Frequency", "Private Ceremony"];
const LOCATIONS = ["Vancouver", "Kelowna", "West Kelowna", "Lake Country", "Vernon", "Other Central BC"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Signup = {
  firstName?: unknown;
  email?: unknown;
  interests?: unknown;
  location?: unknown;
  consent?: unknown;
  /** Hidden field real visitors never fill in; bots usually do. */
  website?: unknown;
};

function cors(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim());
  return origin && allowed.includes(origin)
    ? {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        Vary: "Origin",
      }
    : {};
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

async function md5(text: string) {
  const digest = await crypto.subtle.digest("MD5", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = cors(request.headers.get("Origin"), env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405, headers);
    if (!headers["Access-Control-Allow-Origin"]) return json({ ok: false, error: "Forbidden" }, 403, headers);

    let data: Signup;
    try {
      data = (await request.json()) as Signup;
    } catch {
      return json({ ok: false, error: "Invalid request" }, 400, headers);
    }

    // Quietly accept bot submissions without saving them.
    if (typeof data.website === "string" && data.website.trim()) return json({ ok: true }, 200, headers);

    const firstName = typeof data.firstName === "string" ? data.firstName.trim().slice(0, 80) : "";
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase().slice(0, 254) : "";
    const interests = Array.isArray(data.interests)
      ? INTERESTS.filter((i) => (data.interests as unknown[]).includes(i))
      : [];
    const location = typeof data.location === "string" && LOCATIONS.includes(data.location) ? data.location : "";

    if (!firstName || !EMAIL_RE.test(email)) {
      return json({ ok: false, error: "Please enter your first name and a valid email address." }, 400, headers);
    }
    if (data.consent !== true) {
      return json({ ok: false, error: "Please tick the consent box to join the list." }, 400, headers);
    }

    const key = env.MAILCHIMP_API_KEY;
    const dc = key.split("-").pop();
    const base = `https://${dc}.api.mailchimp.com/3.0/lists/${env.MAILCHIMP_AUDIENCE_ID}/members/${await md5(email)}`;
    const auth = { Authorization: `Basic ${btoa(`hideas:${key}`)}`, "Content-Type": "application/json" };

    // Add new people as subscribed; update the name of anyone already on the list.
    const existing = await fetch(base, { headers: auth });
    const current = existing.ok ? ((await existing.json()) as { status?: string }).status : undefined;
    const member: Record<string, unknown> = {
      email_address: email,
      status_if_new: "subscribed",
      merge_fields: { FNAME: firstName },
    };
    // Someone who unsubscribed earlier and opts in again gets Mailchimp's confirmation email.
    if (current === "unsubscribed" || current === "cleaned") member.status = "pending";

    const put = await fetch(base, { method: "PUT", headers: auth, body: JSON.stringify(member) });
    if (!put.ok) {
      const detail = (await put.json().catch(() => ({}))) as { title?: string; detail?: string };
      console.log("Mailchimp member error", put.status, detail.title, detail.detail);
      const fake = detail.title === "Invalid Resource" || detail.title === "Forgotten Email Not Subscribed";
      return json(
        {
          ok: false,
          error: fake
            ? "That email address couldn't be added. Please check it and try again."
            : "Something went wrong. Please try again in a moment.",
        },
        fake ? 400 : 502,
        headers,
      );
    }

    const tags = [
      "Website signup",
      ...interests.map((i) => `Interest: ${i}`),
      ...(location ? [`Location: ${location}`] : []),
    ].map((name) => ({ name, status: "active" }));
    const tagged = await fetch(`${base}/tags`, { method: "POST", headers: auth, body: JSON.stringify({ tags }) });
    if (!tagged.ok) console.log("Mailchimp tag error", tagged.status, await tagged.text());

    return json({ ok: true, pending: member.status === "pending" }, 200, headers);
  },
};
