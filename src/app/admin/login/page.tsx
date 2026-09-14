"use client";

import { useActionState } from "react";
import { Brand, buttonStyles } from "@/components/ui";
import { logIn } from "../actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(logIn, null);

  return (
    <main className="grid min-h-screen place-items-center p-6">
      <form action={formAction} className="card w-full max-w-sm space-y-4 p-6">
        <Brand tagline="Manage Rentals. Effortlessly." />
        <div>
          <label htmlFor="passcode" className="block text-sm font-semibold">
            Passcode
          </label>
          <input
            id="passcode"
            name="passcode"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            className="mt-1 min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-brand"
          />
        </div>
        {state?.error ? (
          <p role="alert" className="text-sm font-medium text-bad">
            {state.error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className={`${buttonStyles.primary} w-full`}>
          {pending ? "Checking\u2026" : "Log in"}
        </button>
      </form>
    </main>
  );
}
