"use server";

import { ConvexError } from "convex/values";
import { api } from "../../convex/_generated/api";
import { adminClient } from "@/lib/convex-admin";
import type { ContactState } from "./_landing/contact-state";

// Characters that mean something inside a mailto: link (?subject=, &bcc=, a
// comma-separated list) are refused, so a stored address is only ever an address.
const EMAIL = /^[^\s@?&#%,;<>"]+@[^\s@?&#%,;<>"]+\.[^\s@?&#%,;<>"]{2,}$/;

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Takes an enquiry from the public landing page.
 *
 * Runs on our server so the Convex secret never reaches the browser: the
 * `submitInquiry` mutation refuses anything without it, which means a bot
 * cannot skip these checks by calling Convex directly.
 */
export async function sendInquiry(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    buildingName: text(formData, "buildingName"),
    location: text(formData, "location"),
    unitCount: text(formData, "unitCount"),
    message: text(formData, "message"),
  };

  // A honeypot: hidden from people, irresistible to form-filling bots. Pretend
  // it worked so the bot has nothing to learn from.
  // Named "fax", not "website" or "url", which browser autofill fills for real people.
  if (text(formData, "fax")) {
    return { status: "sent", errors: {}, values: {} };
  }

  const errors: ContactState["errors"] = {};
  if (values.name.length < 2) errors.name = "Enter your name.";
  if (!EMAIL.test(values.email)) errors.email = "Enter a valid email address, like name@example.com.";
  const phoneDigits = values.phone.replace(/\D/g, "");
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    errors.phone = "Enter a phone number we can reach you on.";
  }
  if (values.buildingName.length < 2) errors.buildingName = "Enter the name of your building.";
  if (values.location.length < 2) errors.location = "Enter the town or city.";
  const unitCount = Number(values.unitCount);
  if (!Number.isInteger(unitCount) || unitCount < 1 || unitCount > 1000) {
    errors.unitCount = "Enter how many units you rent out, as a whole number.";
  }
  if (Object.keys(errors).length > 0) return { status: "error", errors, values };

  try {
    const { client, secret } = adminClient();
    await client.mutation(api.admin.submitInquiry, {
      secret,
      name: values.name,
      email: values.email,
      phone: values.phone,
      buildingName: values.buildingName,
      location: values.location,
      unitCount,
      ...(values.message ? { message: values.message } : {}),
    });
  } catch (e) {
    // The mutation's own refusals are ConvexErrors written to be read; anything
    // else is an outage, which the visitor should not see the internals of.
    const readable = e instanceof ConvexError && typeof e.data === "string" ? e.data : "";
    return {
      status: "error",
      errors: {},
      formError:
        readable || "We could not send that just now. Please try again in a moment.",
      values,
    };
  }

  return { status: "sent", errors: {}, values: {} };
}
