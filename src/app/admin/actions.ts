"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  createAdminSession,
  destroyAdminSession,
  hasAdminSession,
  isPasscodeCorrect,
} from "@/lib/admin-session";
import { adminClient } from "@/lib/convex-admin";

/** The real authorization check. Every action below goes through it. */
async function requireAdmin(): Promise<void> {
  if (!(await hasAdminSession())) redirect("/admin/login");
}

export async function logIn(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  const passcode = formData.get("passcode");
  if (typeof passcode !== "string" || !isPasscodeCorrect(passcode)) {
    return { error: "Incorrect passcode." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logOut(): Promise<void> {
  await destroyAdminSession();
  redirect("/admin/login");
}

export async function saveUnit(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  await requireAdmin();

  const unitId = formData.get("unitId");
  if (typeof unitId !== "string") return { error: "Missing unit." };

  const rentRaw = formData.get("rentAmount");
  const rentAmount = Number(rentRaw);
  if (!Number.isFinite(rentAmount) || rentAmount < 0) {
    return { error: "Rent must be a number, zero or more." };
  }

  const { client, secret } = adminClient();
  try {
    await client.mutation(api.admin.updateUnit, {
      secret,
      unitId: unitId as Id<"units">,
      tenantName: String(formData.get("tenantName") ?? "").trim(),
      tenantPhone: String(formData.get("tenantPhone") ?? "").trim(),
      rentAmount,
      bpcConsumerNumber: String(formData.get("bpcConsumerNumber") ?? "").trim(),
      isOccupied: formData.get("isOccupied") === "on",
    });
  } catch {
    return { error: "Could not save. Check the Convex deployment is running." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/units");
  return null;
}

export async function rotateToken(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  await requireAdmin();

  const unitId = formData.get("unitId");
  if (typeof unitId !== "string") return { error: "Missing unit." };

  const { client, secret } = adminClient();
  try {
    await client.mutation(api.admin.rotateToken, {
      secret,
      unitId: unitId as Id<"units">,
    });
  } catch {
    return { error: "Could not rotate the token." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/units");
  return null;
}

export async function reviewSubmission(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  await requireAdmin();

  const submissionId = formData.get("submissionId");
  const decision = formData.get("decision");
  if (
    typeof submissionId !== "string" ||
    (decision !== "approved" && decision !== "rejected")
  ) {
    return { error: "Missing submission." };
  }

  const note = String(formData.get("adminNote") ?? "").trim();
  if (decision === "rejected" && !note) {
    return { error: "Say why it was rejected, so the tenant can fix it." };
  }

  const { client, secret } = adminClient();
  try {
    await client.mutation(api.admin.reviewSubmission, {
      secret,
      submissionId: submissionId as Id<"submissions">,
      decision,
      ...(note ? { adminNote: note } : {}),
    });
  } catch (e) {
    // The mutation's own messages are written to be read ("Already approved…"),
    // so surface them rather than a generic failure.
    const message = e instanceof Error ? e.message : "";
    return {
      error: message.replace(/^\[.*?\]\s*/, "").trim() || "Could not save that decision.",
    };
  }

  revalidatePath("/admin/review");
  revalidatePath("/admin");
  revalidatePath("/admin/units");
  return null;
}

/**
 * Saves the bill total and, optionally, the photo of the paper bill.
 *
 * The bytes travel through here rather than straight from the browser to
 * Convex: requesting an upload URL needs ADMIN_API_SECRET, and that must not
 * reach a client bundle. The photo is compressed in the browser first, so the
 * server action body stays well inside its limit.
 */
export async function saveWaterBill(
  _prev: { error: string } | null,
  formData: FormData,
): Promise<{ error: string } | null> {
  await requireAdmin();

  const total = Number(formData.get("total"));
  if (!Number.isFinite(total) || total <= 0) {
    return { error: "Enter the bill total." };
  }

  const photo = formData.get("photo");
  const hasPhoto = photo instanceof File && photo.size > 0;

  const { client, secret } = adminClient();
  try {
    let image: Id<"_storage"> | undefined;

    if (hasPhoto) {
      const uploadUrl = await client.mutation(api.admin.generateBillUploadUrl, {
        secret,
      });
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": photo.type || "application/octet-stream" },
        body: await photo.arrayBuffer(),
      });
      if (!res.ok) return { error: "Could not upload the bill photo." };
      ({ storageId: image } = (await res.json()) as { storageId: Id<"_storage"> });
    }

    await client.mutation(api.admin.setWaterBill, { secret, total, image });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    return {
      error:
        message.replace(/^\[.*?\]\s*/, "").trim() || "Could not save the bill.",
    };
  }

  revalidatePath("/admin/water");
  return null;
}

/** Freezes the split and makes it visible to every tenant. */
export async function publishWaterBill(
  _prev: { error: string } | null,
  _formData: FormData,
): Promise<{ error: string } | null> {
  await requireAdmin();

  const { client, secret } = adminClient();
  try {
    await client.mutation(api.admin.publishWaterBill, { secret });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    return {
      error:
        message.replace(/^\[.*?\]\s*/, "").trim() ||
        "Could not publish the bill.",
    };
  }

  revalidatePath("/admin/water");
  revalidatePath("/admin");
  revalidatePath("/admin/units");
  return null;
}
