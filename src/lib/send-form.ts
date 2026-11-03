import { WEB3FORMS_KEY } from "@/data/hideas";

/** Sends a form to events@hideas.ca through Web3Forms. The site is static, so there is no
 * server of our own to deliver mail. Throws if the message was not accepted. */
export async function sendForm(subject: string, form: HTMLFormElement, replyTo?: string) {
  // Repeated names (e.g. several consent checkboxes) are joined so none are lost.
  const fields: Record<string, string> = {};
  for (const [key, value] of new FormData(form).entries()) {
    fields[key] = fields[key] ? `${fields[key]}\n${String(value)}` : String(value);
  }
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject,
      from_name: "Hideas website",
      ...(replyTo ? { replyto: replyTo } : {}),
      ...fields,
    }),
  });
  const data: { success?: boolean; message?: string } | null = await res.json().catch(() => null);
  if (!res.ok || !data?.success) throw new Error(data?.message || "The form could not be sent.");
}
