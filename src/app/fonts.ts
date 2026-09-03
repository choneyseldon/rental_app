import { Noto_Serif_Tibetan } from "next/font/google";

/**
 * Dzongkha is written in Tibetan script, which most printers and machines do
 * not have a font for. Loading it explicitly means the door cards render the
 * same everywhere instead of falling back to boxes.
 */
export const notoSerifTibetan = Noto_Serif_Tibetan({
  weight: ["400", "700"],
  subsets: ["tibetan"],
  variable: "--font-noto-tibetan",
  display: "swap",
});
