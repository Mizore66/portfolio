/** The host printed on the masthead. www 301s here. */
export const APEX_HOST = "anasqumhiyeh.dev";

/** If the request is on www, return the apex URL; otherwise null. */
export function wwwToApex(url: URL, hostHeader: string): URL | null {
  const host = hostHeader.split(":")[0].toLowerCase();
  if (host !== `www.${APEX_HOST}`) return null;
  const next = new URL(url.href);
  next.hostname = APEX_HOST;
  next.port = "";
  next.protocol = "https:";
  return next;
}
