/** Production origin. Override with NEXT_PUBLIC_SITE_URL when the custom domain is bound. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://anasqumhiyeh.com").replace(
  /\/$/,
  "",
);

export const SITE_HOST = (() => {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return "anasqumhiyeh.com";
  }
})();
