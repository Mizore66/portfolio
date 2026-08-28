/** Informant glyphs — title text for visitors who do not read chess notation. */
export const INFORMANT: Record<string, string> = {
  "!!": "brilliant move",
  "!": "good move",
  "!?": "interesting move",
  "?!": "dubious move",
  "?": "mistake",
  "∞": "unclear position",
};

export function informantTitle(sym: string): string | undefined {
  return INFORMANT[sym];
}
