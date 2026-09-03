"use client";

import { useActionState } from "react";
import { logIn } from "../actions";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(logIn, null);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form action={formAction} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Admin</h1>

        <label htmlFor="passcode" className="block text-sm font-medium">
          Passcode
        </label>
        <input
          id="passcode"
          name="passcode"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          className="min-h-12 w-full rounded-lg border border-neutral-400 px-4 text-base"
        />

        {state?.error ? (
          <p role="alert" className="text-sm text-red-700">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full rounded-lg bg-neutral-900 px-4 font-medium text-white disabled:opacity-60"
        >
          {pending ? "Checking…" : "Log in"}
        </button>
      </form>
    </main>
  );
}
