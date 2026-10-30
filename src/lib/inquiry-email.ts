import "server-only";

import { inquiryHtml, inquirySubject, inquiryText, type InquiryEmail } from "./inquiry-email-template";

export type { InquiryEmail };

/**
 * Emails a landing-page enquiry to ChimBill's own inbox through Resend.
 *
 * Sent as HTML with a plain-text twin. The HTML escapes everything a visitor typed,
 * so nothing they enter is ever interpreted as markup.
 * Reply-To is the visitor, so answering the email answers them.
 *
 * Returns false instead of throwing: the enquiry is already saved in Convex by
 * then, and a mail outage must not make the visitor think they were ignored.
 */
export async function emailInquiry(i: InquiryEmail): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("Enquiry not emailed: RESEND_API_KEY or INQUIRY_TO_EMAIL is not set.");
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.INQUIRY_FROM_EMAIL || "ChimBill <onboarding@resend.dev>",
        to: [to],
        reply_to: i.email,
        subject: inquirySubject(i),
        html: inquiryHtml(i),
        text: inquiryText(i),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("Enquiry email refused", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("Enquiry email failed", e);
    return false;
  }
}
