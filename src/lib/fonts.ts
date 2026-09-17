import { Noto_Serif_Tibetan } from "next/font/google";

/**
 * The Dzongkha half of the wordmark. Loaded rather than left to the device:
 * Tibetan script is not installed everywhere, and a missing font here turns
 * the app's own name into a row of empty boxes.
 */
export const tibetan = Noto_Serif_Tibetan({
  subsets: ["tibetan"],
  weight: ["700"],
  display: "swap",
  variable: "--font-tibetan",
});
