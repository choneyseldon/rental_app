"use client";

import { useActionState, useEffect, useRef } from "react";
import { buttonStyles } from "@/components/ui";
import { IconCheck } from "@/components/icons";
import { sendInquiry } from "../contact-action";
import { initialContactState, type ContactField } from "./contact-state";

const field =
  "mt-1 min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-brand aria-[invalid=true]:border-bad";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: ContactField;
  label: string;
  error?: string;
  hint?: string;
  children: (props: Record<string, string | boolean | undefined>) => React.ReactNode;
}) {
  const describedBy = [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
      </label>
      {children({
        id,
        name: id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm font-medium text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(sendInquiry, initialContactState);
  const summary = useRef<HTMLDivElement>(null);

  // After a failed submit, move focus to the summary so a keyboard or screen
  // reader user lands on what went wrong instead of being left on the button.
  useEffect(() => {
    if (state.status === "error") summary.current?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div role="status" className="card flex flex-col items-start gap-3 p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-xl bg-ok-soft text-ok">
          <IconCheck className="size-6" />
        </span>
        <h3 className="text-xl font-bold tracking-tight">Thank you — we have your details.</h3>
        <p className="text-muted">
          We will email you within a couple of working days to talk about your building and show
          you ChimBill.
        </p>
      </div>
    );
  }

  const errorEntries = Object.entries(state.errors) as [ContactField, string][];
  const v = state.values;

  return (
    <form action={formAction} noValidate className="card space-y-4 p-5 sm:p-6">
      {errorEntries.length > 0 || state.formError ? (
        <div
          ref={summary}
          tabIndex={-1}
          role="alert"
          aria-labelledby="contact-error-title"
          className="rounded-xl border border-bad/30 bg-bad-soft p-4 text-sm outline-none"
        >
          <h3 id="contact-error-title" className="font-bold text-[#991b1b]">
            {state.formError ? "Could not send" : "Please check these"}
          </h3>
          {state.formError ? <p className="mt-1 text-[#991b1b]">{state.formError}</p> : null}
          {errorEntries.length > 0 ? (
            <ul className="mt-1 list-disc pl-5 text-[#991b1b]">
              {errorEntries.map(([id, message]) => (
                <li key={id}>
                  <a href={`#${id}`} className="underline">
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Your name" error={state.errors.name}>
          {(p) => (
            <input {...p} type="text" autoComplete="name" defaultValue={v.name} required className={field} />
          )}
        </Field>
        <Field id="phone" label="Phone (WhatsApp is fine)" error={state.errors.phone}>
          {(p) => (
            <input {...p} type="tel" autoComplete="tel" inputMode="tel" defaultValue={v.phone} required className={field} />
          )}
        </Field>
      </div>

      <Field id="email" label="Email" error={state.errors.email}>
        {(p) => (
          <input {...p} type="email" autoComplete="email" defaultValue={v.email} required className={field} />
        )}
      </Field>

      <Field id="buildingName" label="Building name" error={state.errors.buildingName}>
        {(p) => (
          <input {...p} type="text" autoComplete="organization" defaultValue={v.buildingName} required className={field} />
        )}
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="location" label="Town or city" error={state.errors.location}>
          {(p) => (
            <input {...p} type="text" autoComplete="address-level2" defaultValue={v.location} required className={field} />
          )}
        </Field>
        <Field
          id="unitCount"
          label="Number of units"
          error={state.errors.unitCount}
          hint="Flats or rooms you rent out."
        >
          {(p) => (
            <input {...p} type="number" inputMode="numeric" min={1} max={1000} defaultValue={v.unitCount} required className={field} />
          )}
        </Field>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold">
          Anything we should know <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          maxLength={2000}
          defaultValue={v.message}
          className={`${field} py-3`}
        />
      </div>

      {/* Honeypot. Out of sight and out of the tab order; people never fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name="fax" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full sm:w-auto`}>
        {pending ? "Sending…" : "Send my details"}
      </button>
      <p className="text-xs text-muted">
        We only use these details to reply to you. We do not share them.
      </p>
    </form>
  );
}
