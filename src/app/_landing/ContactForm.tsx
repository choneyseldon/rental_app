"use client";

import { useActionState, useEffect, useRef } from "react";
import { buttonStyles } from "@/components/ui";
import { IconBuilding, IconCheck, IconPin, IconSend } from "@/components/icons";
import { sendInquiry } from "../contact-action";
import { initialContactState, type ContactField } from "./contact-state";

// Roomy, tinted inputs that lift to white with a soft brand ring on focus. The
// ring is the visible focus indicator, so `outline-none` is safe here.
const input =
  "peer min-h-12 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 text-base text-slate-900 outline-none transition placeholder:text-slate-500 hover:border-slate-300 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/15 aria-[invalid=true]:border-bad aria-[invalid=true]:bg-bad-soft/40 aria-[invalid=true]:focus:ring-bad/15";

// The textarea has no leading icon, so it drops the icon gutter on the left.
const textarea = input.replace("pl-11", "pl-4");

const glyph = "size-5";

const IconUser = ({ className = glyph }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
  </svg>
);
const IconPhone = ({ className = glyph }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <rect x="7" y="3" width="10" height="18" rx="2.5" />
    <path d="M11 18h2" />
  </svg>
);
const IconMail = ({ className = glyph }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);
const IconHash = ({ className = glyph }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <path d="M9 4 7 20M17 4l-2 16M4 9h16M3.5 15h16" />
  </svg>
);
const IconLock = ({ className = "size-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

function Field({
  id,
  label,
  error,
  hint,
  icon,
  children,
}: {
  id: ContactField;
  label: string;
  error?: string;
  hint?: string;
  icon: React.ReactNode;
  children: (props: Record<string, string | boolean | undefined>) => React.ReactNode;
}) {
  const describedBy = [error ? `${id}-error` : null, hint && !error ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-800">
        {label}
      </label>
      <div className="relative mt-1.5">
        {children({
          id,
          name: id,
          "aria-invalid": error ? true : undefined,
          "aria-describedby": describedBy || undefined,
        })}
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors peer-focus:text-brand peer-aria-[invalid=true]:text-bad">
          {icon}
        </span>
      </div>
      {hint && !error ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-bad">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Group({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-labelledby={id} className="space-y-4">
      <p id={id} className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
        {title}
      </p>
      {children}
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
      <div role="status" className="rounded-[1.75rem] bg-white p-7 shadow-xl shadow-slate-950/20 sm:p-10">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-ok-soft text-ok">
          <IconCheck className="size-7" />
        </span>
        <h3 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Thank you — we have your details.</h3>
        <p className="mt-2 text-slate-600">
          We will email you within a couple of working days to talk about your building and show you ChimBill.
        </p>
      </div>
    );
  }

  const errorEntries = Object.entries(state.errors) as [ContactField, string][];
  const v = state.values;

  return (
    <form
      action={formAction}
      noValidate
      aria-busy={pending}
      className="space-y-7 rounded-[1.75rem] bg-white p-5 shadow-xl shadow-slate-950/20 sm:p-8"
    >
      {errorEntries.length > 0 || state.formError ? (
        <div
          ref={summary}
          tabIndex={-1}
          role="alert"
          aria-labelledby="contact-error-title"
          className="rounded-xl border border-bad/30 bg-bad-soft p-4 text-sm outline-none focus-visible:ring-4 focus-visible:ring-bad/20"
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

      <Group id="contact-you" title="About you">
        <Field id="name" label="Your name" error={state.errors.name} icon={<IconUser />}>
          {(p) => (
            <input
              {...p}
              type="text"
              autoComplete="name"
              placeholder="Pema Wangmo"
              defaultValue={v.name}
              required
              className={input}
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="email" label="Email" error={state.errors.email} icon={<IconMail />}>
            {(p) => (
              <input
                {...p}
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                defaultValue={v.email}
                required
                className={input}
              />
            )}
          </Field>
          <Field id="phone" label="Phone (WhatsApp is fine)" error={state.errors.phone} icon={<IconPhone />}>
            {(p) => (
              <input
                {...p}
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+975 17 12 34 56"
                defaultValue={v.phone}
                required
                className={input}
              />
            )}
          </Field>
        </div>
      </Group>

      <Group id="contact-building" title="Your building">
        <Field id="buildingName" label="Building name" error={state.errors.buildingName} icon={<IconBuilding className={glyph} />}>
          {(p) => (
            <input
              {...p}
              type="text"
              autoComplete="organization"
              placeholder="Norbu Apartments"
              defaultValue={v.buildingName}
              required
              className={input}
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="location" label="Town or city" error={state.errors.location} icon={<IconPin className={glyph} />}>
            {(p) => (
              <input
                {...p}
                type="text"
                autoComplete="address-level2"
                placeholder="Thimphu"
                defaultValue={v.location}
                required
                className={input}
              />
            )}
          </Field>
          <Field
            id="unitCount"
            label="Number of units"
            error={state.errors.unitCount}
            hint="Flats or rooms you rent out."
            icon={<IconHash />}
          >
            {(p) => (
              <input
                {...p}
                type="number"
                inputMode="numeric"
                min={1}
                max={1000}
                placeholder="10"
                defaultValue={v.unitCount}
                required
                className={input}
              />
            )}
          </Field>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold text-slate-800">
            Anything we should know <span className="font-normal text-slate-500">(optional)</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            maxLength={2000}
            placeholder="How you collect rent today, or what you would like to fix."
            defaultValue={v.message}
            className={`${textarea} mt-1.5 resize-y py-3`}
          />
        </div>
      </Group>

      {/* Honeypot. Out of sight and out of the tab order; people never fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name="fax" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={pending}
          className={`${buttonStyles.primary} w-full !min-h-12 !text-base shadow-sm shadow-brand/30 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30`}
        >
          {pending ? (
            "Sending…"
          ) : (
            <>
              Send my details <IconSend className="size-5" />
            </>
          )}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <IconLock />
          We only use these details to reply to you. We do not share them.
        </p>
      </div>
    </form>
  );
}
