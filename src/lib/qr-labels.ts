/**
 * Text printed on the door cards, in Dzongkha and English.
 *
 * !! The `dz` strings are PLACEHOLDERS and must be replaced by a Dzongkha
 * !! speaker before anything is printed. They are written in Tibetan script
 * !! so the layout, line height and font fallback can be proofed, but their
 * !! wording is not verified. The QR page refuses to hide its proof banner
 * !! while `dzongkhaReviewed` is false.
 */
export const DZONGKHA_REVIEWED = false;

export const qrLabels = {
  /** Card heading: what this card is for. */
  heading: {
    dz: "ཁྱོད་རའི་གླ་ཁྲལ།",
    en: "Your rent & water",
  },
  /** The instruction, the one line a tenant actually needs to read. */
  instruction: {
    dz: "འདི་སྐེན་འབད།",
    en: "Scan this code",
  },
  /** Reassurance that no app or login is needed. */
  noLogin: {
    dz: "ཐོ་འགོད་མི་དགོ།",
    en: "No app, no password",
  },
  /** Printed small, for the person mounting the cards. */
  unitPrefix: {
    dz: "ཁྱིམ་གྲལ།",
    en: "Unit",
  },
} as const;

export type QrLabelKey = keyof typeof qrLabels;
