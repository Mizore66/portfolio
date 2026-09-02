export type DeskEvent =
  | { type: "board"; id: string; san: string; evalCp: number | null }
  | { type: "section"; id: string }
  | { type: "project"; slug: string | null };

export const DESK_EVENT = "opening:desk";

export const PROJECT_DESK: Record<string, { san: string; datum: string; node: string }> = {
  veridian: { san: "5. d4", datum: "lower-carbon recommendation", node: "d4" },
  circuitmindai: { san: "3…Bc5", datum: "vision and voice, unmeasured quality", node: "bc5" },
  "multi-agent-graphrag": { san: "5…d6", datum: "+35% vs vector-only, sample unfiled", node: "closed" },
  mirrorfi: { san: "4…Nf6", datum: "Megahack grand prize", node: "nf6" },
  "financial-risk-predictor": { san: "1…Nf6", datum: "0.87 AUC-ROC", node: "alekhine" },
  "distributed-lead-scorer": { san: "2…d5", datum: "100M-event capacity", node: "elephant" },
  "slm-distillation-engine": { san: "5…Bb6", datum: "70B → 3B student", node: "bb6" },
};

export const SECTION_MOVE: Record<string, string> = {
  work: "d4",
  experience: "nc6",
  lab: "start",
  about: "e5",
  contact: "re1",
};

export function emitDesk(detail: DeskEvent) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<DeskEvent>(DESK_EVENT, { detail }));
}
