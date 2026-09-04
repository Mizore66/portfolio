import { BROADSHEET } from "@/content/opening";
import type { CmsArticle } from "@/lib/cms/types";

export const COLOPHON_SLUG = "colophon";

export function ledgerArticles(): CmsArticle[] {
  return [
    {
      slug: COLOPHON_SLUG,
      kicker: BROADSHEET.colophonKicker,
      body: BROADSHEET.colophon,
      honestyKicker: BROADSHEET.colophonHonestyKicker,
      honesty: BROADSHEET.colophonHonesty,
      witnessKicker: BROADSHEET.colophonWitnessKicker,
      witnesses: BROADSHEET.colophonWitnesses,
      plate: "/plates/plate-inventor.jpg",
      plateCaption: "The inventor, on the stair — file photo.",
      plateAlt: "Halftone photograph: the engineer on a public escalator, looking toward the camera.",
      plateMedia: "",
    },
  ];
}

export function overlayArticle(slug: string, doc: { articles?: CmsArticle[] }): CmsArticle {
  const seed = ledgerArticles().find((row) => row.slug === slug) ?? ledgerArticles()[0]!;
  const row = doc.articles?.find((item) => item.slug === slug);
  const pick = (key: keyof CmsArticle) => {
    const value = row?.[key];
    return typeof value === "string" && value.trim() ? value : seed[key];
  };
  return {
    slug: seed.slug,
    kicker: pick("kicker"),
    body: pick("body"),
    honestyKicker: pick("honestyKicker"),
    honesty: pick("honesty"),
    witnessKicker: pick("witnessKicker"),
    witnesses: pick("witnesses"),
    plate: pick("plate"),
    plateCaption: pick("plateCaption"),
    plateAlt: pick("plateAlt"),
    plateMedia: pick("plateMedia"),
  };
}
