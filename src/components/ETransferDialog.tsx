import { useMemo, useState, type ReactNode } from "react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { FIELD, LABEL } from "@/components/FormDialog";

/** The e-Transfer address, reversed and XOR-encoded so it never appears as plain text in the
 * page or its scripts. It is only decoded in the visitor's browser once the pop-up opens. */
const ENCODED = [118, 116, 57, 100, 118, 114, 115, 126, 127, 87, 110, 101, 120, 99, 116, 126, 97];
const decode = () =>
  ENCODED.map((n) => String.fromCharCode(n ^ 23))
    .reverse()
    .join("");

export const CEREMONY_PRICE = 150;

type Slot = { day: string; time: string };

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

/** Pop-up with everything needed to pay for a ceremony seat by Interac e-Transfer. */
export function ETransferDialog({
  open,
  onOpenChange,
  ceremony,
  slots,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ceremony: string;
  slots: Slot[];
}) {
  const email = useMemo(() => (open ? decode() : ""), [open]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [name, setName] = useState("");
  const slot = slots[Math.min(slotIndex, slots.length - 1)];
  const message = `${name.trim() || "Your name"}, ${ceremony}, ${slot ? `${slot.day} ${slot.time}` : "event date"}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[70] max-h-[90vh] overflow-y-auto rounded-none border-2 border-ink bg-cream p-6 text-ink shadow-[10px_10px_0_var(--jade)] sm:rounded-none sm:p-8">
        <DialogTitle className="font-display text-2xl uppercase leading-tight">Pay by e-Transfer</DialogTitle>
        <DialogDescription className="text-sm leading-relaxed text-ink/70">
          {ceremony}. Send an Interac e-Transfer with the details below.
        </DialogDescription>

        <div className="mt-2 border-2 border-ink bg-paper px-5">
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

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className={LABEL}>Your name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className={FIELD}
            />
          </label>
          {slots.length > 1 ? (
            <label className="block">
              <span className={LABEL}>Event date</span>
              <select value={slotIndex} onChange={(e) => setSlotIndex(Number(e.target.value))} className={FIELD}>
                {slots.map((s, i) => (
                  <option key={s.day + s.time} value={i}>
                    {s.day}, {s.time}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        <p className="border-l-4 border-ember pl-3 text-sm leading-relaxed text-ink/80">
          Your exact location details will be sent once payment is received.
        </p>
      </DialogContent>
    </Dialog>
  );
}
