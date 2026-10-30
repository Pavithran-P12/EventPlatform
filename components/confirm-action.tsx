"use client";

import { useEffect, useRef, useState } from "react";

type ConfirmActionProps = {
  action: (formData: FormData) => void | Promise<void>;
  fields: Record<string, string>;
  triggerLabel: string;
  triggerClassName: string;
  title: string;
  description: string;
  confirmLabel: string;
  confirmClassName?: string;
};

export default function ConfirmAction({
  action,
  fields,
  triggerLabel,
  triggerClassName,
  title,
  description,
  confirmLabel,
  confirmClassName = "bg-red-600 text-white hover:bg-red-700",
}: ConfirmActionProps) {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-action-title"
            aria-describedby="confirm-action-description"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lift"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="confirm-action-title" className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            <p id="confirm-action-description" className="mt-2 text-sm leading-relaxed text-slate-500">
              {description}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-slate-50"
              >
                Keep it
              </button>
              <form action={action}>
                {Object.entries(fields).map(([name, value]) => (
                  <input key={name} type="hidden" name={name} value={value} />
                ))}
                <button
                  type="submit"
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${confirmClassName}`}
                >
                  {confirmLabel}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
