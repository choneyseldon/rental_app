"use client";

import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { api } from "../../../../convex/_generated/api";

type Stage = "idle" | "compressing" | "ready" | "uploading" | "done" | "error";

/**
 * A Convex mutation against an unreachable deployment retries indefinitely and
 * never rejects, so without these ceilings the button sits on "Sending…"
 * forever. A tenant standing outside their door on a weak connection has to be
 * told it did not go through, not left guessing.
 *
 * A timeout that fires on a call which actually succeeded is safe: the retry is
 * refused server-side by the duplicate check, which says so plainly.
 */
const TIMEOUT_MS = { call: 15_000, upload: 60_000 };

class Timeout extends Error {}

function withTimeout<T>(work: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    work,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Timeout("timeout")), ms),
    ),
  ]);
}

/** Phone screenshots run 3-5MB; this is what gets them under a sane size. */
const COMPRESSION = {
  maxSizeMB: 0.6,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
};

export function PaymentUpload({
  token,
  type,
  suggestedAmount,
}: {
  token: string;
  type: "rent" | "water";
  suggestedAmount: number | null;
}) {
  const generateUploadUrl = useMutation(api.submissions.generateUploadUrl);
  const recordSubmission = useMutation(api.submissions.recordSubmission);

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>(
    suggestedAmount != null ? String(suggestedAmount) : "",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    setStage("idle");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0];
    if (!picked) return;

    setError(null);
    setStage("compressing");
    try {
      // Imported here rather than at module scope so the compression library
      // is only fetched once someone actually picks a file.
      const { default: compress } = await import("browser-image-compression");
      const compressed = await compress(picked, COMPRESSION);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(compressed);
      setPreviewUrl(URL.createObjectURL(compressed));
      setStage("ready");
    } catch {
      setError("Could not read that image. Try taking the screenshot again.");
      setStage("error");
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;

    const claimed = Number(amount);
    if (!Number.isFinite(claimed) || claimed <= 0) {
      setError("Enter the amount you paid.");
      return;
    }

    setError(null);
    setStage("uploading");
    try {
      const uploadUrl = await withTimeout(
        generateUploadUrl({ token, type }),
        TIMEOUT_MS.call,
      );

      const abort = new AbortController();
      const abortTimer = setTimeout(() => abort.abort(), TIMEOUT_MS.upload);
      let storageId: string;
      try {
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
          signal: abort.signal,
        });
        if (!res.ok) throw new Error("upload failed");
        ({ storageId } = (await res.json()) as { storageId: string });
      } finally {
        clearTimeout(abortTimer);
      }

      await withTimeout(
        recordSubmission({
          token,
          type,
          image: storageId as Parameters<typeof recordSubmission>[0]["image"],
          claimedAmount: claimed,
        }),
        TIMEOUT_MS.call,
      );

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setFile(null);
      setStage("done");
    } catch (e) {
      const offline = e instanceof Timeout || (e as Error)?.name === "AbortError";
      if (offline) {
        setError(
          "That did not go through. Check your internet and try again.",
        );
      } else {
        // Convex surfaces the mutation's own message, which is written for the
        // tenant ("already sent one this month"), so prefer it over a generic.
        const message = e instanceof Error ? e.message : "";
        setError(
          message.replace(/^\[.*?\]\s*/, "").trim() ||
            "Could not send it. Please try again.",
        );
      }
      setStage("error");
    }
  }

  if (stage === "done") {
    return (
      <div className="mt-4 rounded-xl bg-ok-soft p-4">
        <p className="text-lg font-semibold text-[#166534]">Sent.</p>
        <p className="text-sm text-[#166534]">
          The owner will check it and this page will update on its own.
        </p>
      </div>
    );
  }

  const busy = stage === "compressing" || stage === "uploading";

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      {previewUrl ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="The screenshot you chose"
            className="max-h-64 w-full rounded-xl border border-line bg-brand-tint object-contain"
          />
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 w-full touch-manipulation items-center justify-center rounded-xl border border-line bg-white text-base font-semibold hover:bg-brand-tint"
          >
            Choose a different picture
          </button>
        </div>
      ) : (
        <label className="flex min-h-14 w-full cursor-pointer touch-manipulation items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand/40 bg-brand-tint px-4 text-center text-base font-semibold text-brand hover:bg-brand-soft">
          {stage === "compressing" ? "Getting it ready…" : "Add payment screenshot"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={onPick}
            disabled={busy}
          />
        </label>
      )}

      {previewUrl ? (
        <div>
          <label
            htmlFor={`amount-${type}`}
            className="block text-sm font-semibold text-muted"
          >
            How much did you pay?
          </label>
          <input
            id={`amount-${type}`}
            type="number"
            // A water share is a split of the bill and carries chhertum, so a
            // whole-ngultrum step rejects the amount this field is pre-filled
            // with and the tenant cannot send anything at all.
            inputMode="decimal"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 min-h-12 w-full rounded-xl border border-line bg-white px-3 text-lg tabular-nums outline-none focus:border-brand"
          />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-base font-medium text-bad">
          {error}
        </p>
      ) : null}

      {previewUrl ? (
        <button
          type="submit"
          disabled={busy}
          className="inline-flex min-h-14 w-full touch-manipulation items-center justify-center rounded-xl bg-brand text-lg font-bold text-white transition-colors hover:bg-brand-strong disabled:opacity-50"
        >
          {stage === "uploading" ? "Sending…" : "Send to owner"}
        </button>
      ) : null}
    </form>
  );
}
