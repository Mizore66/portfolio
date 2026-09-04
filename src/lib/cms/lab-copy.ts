import { LAB_ARTICLE } from "@/content/learned-evaluator";
import type { CmsLabCopy } from "@/lib/cms/types";

export function ledgerLab(): CmsLabCopy {
  return {
    hed: LAB_ARTICLE.hed,
    dek: LAB_ARTICLE.dek,
    teaser: LAB_ARTICLE.teaser,
    meta: LAB_ARTICLE.meta,
    resultJoke: LAB_ARTICLE.resultJoke,
    hypothesisHed: LAB_ARTICLE.hypothesisHed,
    hypothesis: LAB_ARTICLE.hypothesis,
    experimentHed: LAB_ARTICLE.experimentHed,
    experiment: LAB_ARTICLE.experiment,
    failedHed: LAB_ARTICLE.failedHed,
    failed: LAB_ARTICLE.failed,
    learnedHed: LAB_ARTICLE.learnedHed,
    learned: LAB_ARTICLE.learned,
  };
}

export function overlayLab(doc: { lab?: CmsLabCopy }) {
  const seed = ledgerLab();
  const row = doc.lab;
  const pick = (key: keyof CmsLabCopy) => {
    const value = row?.[key];
    return typeof value === "string" && value.trim() ? value : seed[key];
  };
  return {
    ...LAB_ARTICLE,
    hed: pick("hed"),
    dek: pick("dek"),
    teaser: pick("teaser"),
    meta: pick("meta"),
    resultJoke: pick("resultJoke"),
    hypothesisHed: pick("hypothesisHed"),
    hypothesis: pick("hypothesis"),
    experimentHed: pick("experimentHed"),
    experiment: pick("experiment"),
    failedHed: pick("failedHed"),
    failed: pick("failed"),
    learnedHed: pick("learnedHed"),
    learned: pick("learned"),
  };
}
