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
  return null;
}
