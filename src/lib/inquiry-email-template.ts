export type InquiryEmail = {
  name: string;
  email: string;
  phone: string;
  buildingName: string;
  location: string;
  unitCount: number;
  message?: string;
};

const BRAND = "#1f5c8b";
const INK = "#0f172a";
const MUTED = "#64748b";
const LINE = "#e2e8f0";

/** Every visitor-typed value goes through this before it reaches the HTML. */
const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Header values must be one line; a pasted newline cannot add a header. */
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

const units = (n: number) => `${n} ${n === 1 ? "unit" : "units"}`;

function receivedAt(now: Date): string {
  return `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Thimphu",
  }).format(now)} (Bhutan time)`;
}

export function inquirySubject(i: InquiryEmail): string {
  return oneLine(`New enquiry from ${i.name}: ${i.buildingName}, ${i.location}`);
}

export function inquiryText(i: InquiryEmail, now = new Date()): string {
  return [
    "NEW CHIMBILL ENQUIRY",
    "",
    `${i.name} has asked about ChimBill for ${i.buildingName} in ${i.location} (${units(i.unitCount)}).`,
    "",
    "CONTACT",
    `  Name:   ${i.name}`,
    `  Email:  ${i.email}`,
    `  Phone:  ${i.phone}`,
    "",
    "BUILDING",
    `  Name:   ${i.buildingName}`,
    `  Town:   ${i.location}`,
    `  Units:  ${i.unitCount}`,
    "",
    "MESSAGE",
    i.message ? i.message : "No message was left.",
    "",
    "--",
    `Received ${receivedAt(now)}. Reply to this email to answer ${i.name} directly.`,
  ].join("\n");
}

function row(label: string, valueHtml: string): string {
  return `<tr>
<td style="padding:10px 0;border-top:1px solid ${LINE};width:120px;font-size:13px;color:${MUTED};vertical-align:top;">${label}</td>
<td style="padding:10px 0;border-top:1px solid ${LINE};font-size:15px;color:${INK};vertical-align:top;">${valueHtml}</td>
</tr>`;
}

function section(title: string, rows: string): string {
  return `<p style="margin:28px 0 4px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND};">${title}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>`;
}

export function inquiryHtml(i: InquiryEmail, now = new Date()): string {
  const phoneHref = i.phone.replace(/[^\d+]/g, "");
  const link = (href: string, text: string) =>
    `<a href="${esc(href)}" style="color:${BRAND};text-decoration:underline;">${esc(text)}</a>`;

  const message = i.message
    ? `<div style="margin-top:8px;padding:14px 16px;background:#f8fafc;border-left:3px solid ${BRAND};border-radius:4px;font-size:15px;line-height:1.6;color:${INK};white-space:pre-wrap;">${esc(i.message)}</div>`
    : `<p style="margin:8px 0 0;font-size:15px;color:${MUTED};">No message was left.</p>`;

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f1f5f9;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(`${i.name} · ${i.buildingName}, ${i.location} · ${units(i.unitCount)}`)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<tr><td style="background:${BRAND};padding:22px 32px;">
<div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.01em;">ChimBill</div>
<div style="margin-top:2px;font-size:13px;color:#cfe0ee;">New enquiry from the website</div>
</td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0;font-size:22px;line-height:1.3;color:${INK};">${esc(i.name)} would like to know more about ChimBill</h1>
<p style="margin:10px 0 0;font-size:15px;line-height:1.6;color:#334155;">${esc(i.buildingName)} in ${esc(i.location)}, with ${esc(units(i.unitCount))} to manage.</p>
${section(
  "Contact",
  row("Name", esc(i.name)) +
    row("Email", link(`mailto:${i.email}`, i.email)) +
    row("Phone", phoneHref ? link(`tel:${phoneHref}`, i.phone) : esc(i.phone)),
)}
${section(
  "Building",
  row("Building", esc(i.buildingName)) + row("Town or city", esc(i.location)) + row("Units", String(i.unitCount)),
)}
<p style="margin:28px 0 0;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND};">Message</p>
${message}
</td></tr>
<tr><td style="padding:18px 32px;background:#f8fafc;border-top:1px solid ${LINE};font-size:12px;line-height:1.6;color:${MUTED};">
Received ${esc(receivedAt(now))}.<br>Reply to this email to answer ${esc(i.name)} directly.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
