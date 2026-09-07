/**
 * Builds a wa.me link for a tenant reminder.
 *
 * wa.me needs digits only, including country code and no leading +. Bhutan is
 * +975 and mobile numbers are 8 digits, so a bare local number is assumed to
 * be Bhutanese. Anything that cannot be made into a plausible number returns
 * null, so the UI can disable the nudge rather than offer a link that opens
 * WhatsApp on nothing.
 */
const BHUTAN_CC = "975";

export function toWhatsAppNumber(raw: string): string | null {
  if (!raw) return null;

  const hadPlus = raw.trim().startsWith("+");
  let digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  // 00 as an international prefix, e.g. 00975 17 12 34 56
  if (!hadPlus && digits.startsWith("00")) digits = digits.slice(2);

  if (digits.startsWith(BHUTAN_CC) && digits.length === BHUTAN_CC.length + 8) {
    // Reject a landline reached this way too: the subscriber part is the same
    // number, so it fails for the same reason as the bare form below.
    return digits[BHUTAN_CC.length] === "0" ? null : digits;
  }
  // A bare 8-digit Bhutanese mobile. A leading 0 marks a landline area code,
  // and +975 followed by 0 is not a valid number — WhatsApp would open on
  // nothing, so it is better to report failure and let the UI disable the nudge.
  if (digits.length === 8 && !digits.startsWith("0")) return BHUTAN_CC + digits;
  // Explicitly international and long enough to be a real number.
  if (hadPlus && digits.length >= 10 && digits.length <= 15) return digits;

  return null;
}

export function whatsAppLink(raw: string, message: string): string | null {
  const number = toWhatsAppNumber(raw);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
