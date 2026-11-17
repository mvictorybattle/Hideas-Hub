import { useMemo, useState, type ReactNode } from "react";

import { LABEL } from "@/components/FormDialog";

/** The e-Transfer address, reversed and XOR-encoded so it never appears as plain text in the
 * page or its scripts. It is only decoded in the visitor's browser once the details are opened. */
const ENCODED = [118, 116, 57, 100, 118, 114, 115, 126, 127, 87, 110, 101, 120, 99, 116, 126, 97];
const decode = () =>
  ENCODED.map((n) => String.fromCharCode(n ^ 23))
    .reverse()
    .join("");

export const CEREMONY_PRICE = 150;

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const t = document.createElement("textarea");
          t.value = text;
          document.body.appendChild(t);
          t.select();
          document.execCommand("copy");
          t.remove();
        }
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      }}
      className="shrink-0 border-2 border-ink bg-marigold px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-ink transition-transform hover:-translate-y-0.5"
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-b border-ink/15 py-4 last:border-b-0">
      <p className={LABEL}>{label}</p>
      <div className="mt-1.5 flex items-center justify-between gap-4">{children}</div>
    </div>
  );
}

/** "Pay by e-Transfer" button for the bottom of the reserve pop-up. It opens the Interac
 * e-Transfer details in place, so the guest keeps whatever they've typed in the form. */
export function ETransferPanel({ ceremony, date, name }: { ceremony: string; date: string; name: string }) {
  const [open, setOpen] = useState(false);
  const email = useMemo(() => (open ? decode() : ""), [open]);
  const message = `${name.trim() || "Your name"}, ${ceremony}, ${date}`;

  return (
    <div className="border-t-2 border-dashed border-ink/25 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm leading-relaxed text-ink/75">
          <span className="font-bold text-ink">${CEREMONY_PRICE} per guest,</span> paid by Interac e-Transfer.
        </p>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="border-2 border-ink bg-cream px-4 py-2 font-display text-sm uppercase text-ink shadow-[4px_4px_0_var(--jade)] transition-transform hover:-translate-y-0.5"
        >
          {open ? "Hide e-Transfer details" : "Pay by e-Transfer"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 space-y-3">
          <div className="border-2 border-ink bg-paper px-5">
            <Row label="Amount">
              <p className="font-display text-3xl leading-none">${CEREMONY_PRICE}</p>
            </Row>
            <Row label="Send to">
              <p className="min-w-0 break-all font-body text-base font-bold">{email}</p>
              <CopyButton text={email} label="Copy e-Transfer email address" />
            </Row>
            <Row label="Message to include">
              <p className="min-w-0 text-base">{message}</p>
              <CopyButton text={message} label="Copy e-Transfer message" />
            </Row>
          </div>
          <p className="border-l-4 border-ember pl-3 text-sm leading-relaxed text-ink/80">
            Your exact location details will be sent once payment is received.
          </p>
        </div>
      ) : null}
    </div>
  );
}
