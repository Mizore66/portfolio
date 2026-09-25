import { EDUCATION } from "./education";
import { formatMonth, formatPeriod } from "./format";
import { IDENTITY } from "./identity";
import { LINE_NAME } from "./line";
import { PROJECTS } from "./projects";
import { ROLES } from "./roles";
import type { Project, Role } from "./types";

/**
 * The annotated career (brief Appendix A, D18, D19, D23).
 * White's moves are career, Black's are projects. Facts are roman, commentary is voice.
 */

export type GameNodeType = "mainline" | "variation" | "not-taken";

export type GameLink = { label: string; href: string };

export type GameNode = {
  id: string;
  parent: string | null;
  type: GameNodeType;
  /** Engine coordinates, e.g. "e2e4". Castling is the king move. Absent for start and outlook. */
  uci?: string;
  san: string;
  moveNumber: number;
  color: "w" | "b" | null;
  /** Informant symbol: !! ! !? ?! ? or empty. */
  sym: string;
  kind: string;
  title: string;
  fact: string;
  commentary: string;
  /** Authored eval from Appendix A. Annotation, not engine output. */
  eval?: number;
  links?: readonly GameLink[];
  /** Claim ids listed with the fact. */
  claims?: readonly string[];
  /** Career placement for the eval graph (brief §7 B). */
  career?: { kind: "role"; roleId: string } | { kind: "project"; slug: string } | { kind: "education" };
  puzzle?: { prompt: string; target: string; hit: string; miss: string };
  /** Commentary drafted in the rebuild; the owner rewrites it. */
  draft?: boolean;
};

export const DEFAULT_MOVE = "d4";
export const LATEST_MOVE = "faultline";

function role(id: string): Role {
  const r = ROLES.find((x) => x.id === id);
  if (!r) throw new Error(`Missing role: ${id}`);
  return r;
}

function project(slug: string): Project {
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) throw new Error(`Missing project: ${slug}`);
  return p;
}

function roleFact(id: string): string {
  const r = role(id);
  return `${r.employer}, ${r.title} (${r.kind}), ${formatPeriod(r.start, r.end)}. ${r.bullets[0]}`;
}

function projectFact(slug: string): string {
  const p = project(slug);
  return `${p.name}, ${p.subtitle}. ${p.origin}, ${formatMonth(p.date)}. ${p.purpose}`;
}

const roleLink = (id: string): GameLink => ({ label: role(id).employer, href: `/#${id}` });
const projectLink = (slug: string): GameLink => ({ label: project(slug).name, href: `/projects/${slug}` });

const CONTACT_LINKS: readonly GameLink[] = [
  { label: "Email", href: `mailto:${IDENTITY.email}` },
  { label: "GitHub", href: IDENTITY.github },
  { label: "LinkedIn", href: IDENTITY.linkedin },
  { label: "Résumé", href: "/print-edition" },
];

const e = EDUCATION;

export const GAME: readonly GameNode[] = [
  {
    id: "start",
    parent: null,
    type: "mainline",
    san: "",
    moveNumber: 0,
    color: null,
    sym: "",
    kind: "Start",
    title: "Opening Preparation",
    fact: `${LINE_NAME}. Jobs as moves; annotations as voice.`,
    commentary:
      "What follows is the game I actually played — jobs as moves, annotations as voice. Chess is the content, never the lock.",
    eval: 0.2,
  },
  {
    id: "e4",
    parent: "start",
    type: "mainline",
    uci: "e2e4",
    san: "e4",
    moveNumber: 1,
    color: "w",
    sym: "!",
    kind: "Education",
    title: "The University Opening",
    fact: `${e.degree}, ${e.minor}. ${e.institution}, ${e.location}. ${e.honours.join(", ")}. Graduated ${formatMonth(e.graduated)}. WAM ${e.wam}, CGPA ${e.cgpa}.`,
    commentary:
      "Every open game starts by occupying the centre. I opened with software engineering — not because it was the only file, but because it was the one that let both bishops out.",
    eval: 0.35,
    links: [{ label: "Education", href: "/#education" }],
  },
  {
    id: "alekhine",
    parent: "e4",
    type: "variation",
    uci: "g8f6",
    san: "Nf6",
    moveNumber: 1,
    color: "b",
    sym: "!?",
    kind: "Project",
    title: "The ML Defence",
    fact: projectFact("financial-risk-predictor"),
    commentary:
      "I built models that had to be interpreted, deployed, and retrained every morning — not fitted once for a screenshot. The knight invites the centre forward: the ML line rather than the systems line.",
    links: [projectLink("financial-risk-predictor")],
    claims: ["riskAuc"],
    career: { kind: "project", slug: "financial-risk-predictor" },
  },
  {
    id: "e5",
    parent: "e4",
    type: "mainline",
    uci: "e7e5",
    san: "e5",
    moveNumber: 1,
    color: "b",
    sym: "",
    kind: "Identity",
    title: "Meeting e4 with e5",
    fact: "The classical answer: product engineering on one wing, the data path on the other.",
    commentary:
      "The classical answer. I did not decline into a closed system. Product engineering on one wing, the data path on the other.",
    eval: 0.3,
  },
  {
    id: "nf3",
    parent: "e5",
    type: "mainline",
    uci: "g1f3",
    san: "Nf3",
    moveNumber: 2,
    color: "w",
    sym: "",
    kind: "Internship",
    title: "First Developed Piece",
    fact: roleFact("petronas"),
    commentary:
      "Knights before bishops, they say. Petronas was the first industry square — I replaced MATLAB-dependent back-end calculation and reporting functions with Python packages, then wrote post-release acceptance cases for the migrated features.",
    eval: 0.4,
    links: [roleLink("petronas")],
    career: { kind: "role", roleId: "petronas" },
  },
  {
    id: "elephant",
    parent: "nf3",
    type: "variation",
    uci: "d7d5",
    san: "d5",
    moveNumber: 2,
    color: "b",
    sym: "!",
    kind: "Project",
    title: "The Elephant Gambit",
    fact: projectFact("distributed-lead-scorer"),
    commentary:
      "A hundred million events a day had to keep moving even when a job died mid-run. 2…d5 is that impatience, with the checkpoint so the sacrifice is not a bluff.",
    links: [projectLink("distributed-lead-scorer")],
    claims: ["leadThroughput"],
    career: { kind: "project", slug: "distributed-lead-scorer" },
  },
  {
    id: "philidor",
    parent: "nf3",
    type: "not-taken",
    uci: "d7d6",
    san: "d6",
    moveNumber: 2,
    color: "b",
    sym: "?!",
    kind: "Road not taken",
    title: "The Philidor, Declined",
    fact: "After Petronas the MATLAB world was still there — MathCAD, department code, a quieter engineering path with licences already paid.",
    commentary:
      "2…d6 keeps the position closed. I developed the knight instead. The dashed line is honest: I could have stayed in the MATLAB world, licences already paid. The other life stays on the page as a ghost — visible, declined, and not a regret. I did not stay.",
  },
  {
    id: "nc6",
    parent: "nf3",
    type: "mainline",
    uci: "b8c6",
    san: "Nc6",
    moveNumber: 2,
    color: "b",
    sym: "",
    kind: "Internship",
    title: "Defending the Pawn",
    fact: roleFact("setel"),
    commentary:
      "Payment-engine defects could travel all the way to checkout at the pump. I sat on that square and made sure the pawn could not be taken for free.",
    eval: 0.35,
    links: [roleLink("setel")],
    claims: ["setelCoverage", "setelDefects"],
    career: { kind: "role", roleId: "setel" },
  },
  {
    id: "bc4",
    parent: "nc6",
    type: "mainline",
    uci: "f1c4",
    san: "Bc4",
    moveNumber: 3,
    color: "w",
    sym: "",
    kind: "Contract",
    title: "Pointing at f7",
    fact: roleFact("western-digital"),
    commentary:
      "The Italian bishop looks at the weakest point in the castled position. At WD the weakness was watching lab systems by hand. I put a bishop there.",
    eval: 0.5,
    links: [roleLink("western-digital")],
    claims: ["wdOversight"],
    career: { kind: "role", roleId: "western-digital" },
  },
  {
    id: "bc5",
    parent: "bc4",
    type: "mainline",
    uci: "f8c5",
    san: "Bc5",
    moveNumber: 3,
    color: "b",
    sym: "",
    kind: "Project",
    title: "Quiet Italian",
    fact: projectFact("circuitmindai"),
    commentary:
      "CircuitMind sees faults in the copper and talks back over a live voice channel. Black develops the same way — vision on the board, voice on the file.",
    eval: 0.45,
    links: [projectLink("circuitmindai")],
    career: { kind: "project", slug: "circuitmindai" },
  },
  {
    id: "c3",
    parent: "bc5",
    type: "mainline",
    uci: "c2c3",
    san: "c3",
    moveNumber: 4,
    color: "w",
    sym: "",
    kind: "Practice",
    title: "Reliability before the break",
    fact: "Reliability before the break: 92.5% unit-test coverage on Setel's checkout and capture; a live-status dashboard for 50+ Western Digital lab staff; 99.9% observed uptime in Veridian's Cloud Run evaluation.",
    commentary:
      "c3 is the quiet move that makes d4 possible. I ship the same way: tests and access control first, so the break has something behind it.",
    claims: ["setelCoverage", "veridianUptime"],
    draft: true,
  },
  {
    id: "nf6",
    parent: "c3",
    type: "mainline",
    uci: "g8f6",
    san: "Nf6",
    moveNumber: 4,
    color: "b",
    sym: "!",
    kind: "Project",
    title: "The Knight Comes In",
    fact: `${projectFact("mirrorfi")} Grand Prize, Solana Megahack 2025, in a team of 6.`,
    commentary:
      "Grand prize is a symbol. The work was a product: shareable vault lines, a schema people could copy. Then the last minor piece develops.",
    eval: 0.5,
    links: [projectLink("mirrorfi")],
    career: { kind: "project", slug: "mirrorfi" },
    puzzle: {
      prompt: "White to move — find the break.",
      target: "d2d4",
      hit: "!! — found over the board.",
      miss: "A developing move. The break was d4. — Ed.",
    },
  },
  {
    id: "d4",
    parent: "nf6",
    type: "mainline",
    uci: "d2d4",
    san: "d4",
    moveNumber: 5,
    color: "w",
    sym: "!!",
    kind: "Flagship",
    title: "The Central Break",
    fact: `${projectFact("veridian")} ${project("veridian").result.line}.`,
    commentary:
      "You prepare with c3, then you break the centre. d4 is the move this scoresheet hangs on: agents that intercept infrastructure, measurements instead of demos. The double-exclaim is Informant’s, not mine — but I played it.",
    eval: 1.6,
    links: [projectLink("veridian")],
    claims: ["veridianEmissions"],
    career: { kind: "project", slug: "veridian" },
    draft: true,
  },
  {
    id: "closed",
    parent: "d4",
    type: "variation",
    uci: "d7d6",
    san: "d6",
    moveNumber: 5,
    color: "b",
    sym: "",
    kind: "Project",
    title: "The Closed Centre",
    fact: projectFact("multi-agent-graphrag"),
    commentary:
      "Prerequisites and credit-transfer live as edges, not another vector-only retrieval. Black can refuse the capture and keep the centre closed — the graph is that kind of patience.",
    links: [projectLink("multi-agent-graphrag")],
    claims: ["graphragRetrieval"],
    career: { kind: "project", slug: "multi-agent-graphrag" },
  },
  {
    id: "bb6",
    parent: "d4",
    type: "variation",
    uci: "c5b6",
    san: "Bb6",
    moveNumber: 5,
    color: "b",
    sym: "",
    kind: "Project",
    title: "Tucking the Bishop",
    fact: projectFact("slm-distillation-engine"),
    commentary:
      "Distillation keeps GraphRAG retrieval on a smaller piece, cheaper to keep on the board. The Italian bishop steps back to b6 and still looks at the same diagonal.",
    links: [projectLink("slm-distillation-engine")],
    career: { kind: "project", slug: "slm-distillation-engine" },
  },
  {
    id: "exd4",
    parent: "d4",
    type: "mainline",
    uci: "e5d4",
    san: "exd4",
    moveNumber: 5,
    color: "b",
    sym: "",
    kind: "Method",
    title: "Taking on d4",
    fact: "The results on this site, each with its owner, evidence type and date:",
    commentary:
      "I would rather show the graph than the slogan. Accepting the pawn is accepting that the numbers have owners.",
    eval: 0.7,
    claims: ["derivCxCost", "skribbleErrors", "monashRetrieval", "faultlineLocate", "teleportalTasks", "setelDefects", "gateC"],
  },
  {
    id: "e5-push",
    parent: "exd4",
    type: "mainline",
    uci: "e4e5",
    san: "e5",
    moveNumber: 6,
    color: "w",
    sym: "!",
    kind: "Contract",
    title: "Gaining Space",
    fact: roleFact("monash-university"),
    commentary:
      "6. e5 gains space and asks the knight a question. The Monash contract asked university regulations one: could a graph answer a prerequisite instead of guessing from the nearest paragraph?",
    links: [roleLink("monash-university")],
    claims: ["monashRetrieval", "slmLatency"],
    career: { kind: "role", roleId: "monash-university" },
    draft: true,
  },
  {
    id: "d5",
    parent: "e5-push",
    type: "mainline",
    uci: "d7d5",
    san: "d5",
    moveNumber: 6,
    color: "b",
    sym: "",
    kind: "Annotation",
    title: "The Counter-Strike",
    fact: "Black strikes back in the centre instead of retreating the knight.",
    commentary: "Every good position invites a counter. The answer is to keep developing.",
    draft: true,
  },
  {
    id: "skribble-lab",
    parent: "d5",
    type: "mainline",
    uci: "c4b5",
    san: "Bb5",
    moveNumber: 7,
    color: "w",
    sym: "",
    kind: "Full-time",
    title: "The Pin",
    fact: roleFact("skribble-lab"),
    commentary:
      "The bishop pins before it trades. At Skribble Lab I held one path, payments, end to end until it stopped breaking.",
    links: [roleLink("skribble-lab")],
    claims: ["skribbleErrors", "skribbleMerchants"],
    career: { kind: "role", roleId: "skribble-lab" },
    draft: true,
  },
  {
    id: "teleportal",
    parent: "skribble-lab",
    type: "mainline",
    uci: "f6e4",
    san: "Ne4",
    moveNumber: 7,
    color: "b",
    sym: "!",
    kind: "Project",
    title: "The Outpost",
    fact: `${projectFact("gemini-teleportal")} Built together with Kai.`,
    commentary:
      "The knight jumps into the centre with support behind it. Teleportal was built with Kai, and the square only held because both of us covered it.",
    links: [projectLink("gemini-teleportal")],
    claims: ["teleportalTasks"],
    career: { kind: "project", slug: "gemini-teleportal" },
    draft: true,
  },
  {
    id: "graduation",
    parent: "teleportal",
    type: "mainline",
    uci: "c3d4",
    san: "cxd4",
    moveNumber: 8,
    color: "w",
    sym: "",
    kind: "Education",
    title: "Taking Back the Centre",
    fact: `Graduated ${formatMonth(e.graduated)}: ${e.degree}, ${e.institution}. ${e.honours.join(", ")}.`,
    commentary: "White takes the pawn back and the centre with it. Graduating closed the file that 1. e4 opened.",
    links: [{ label: "Education", href: "/#education" }],
    career: { kind: "education" },
    draft: true,
  },
  {
    id: "bb4-check",
    parent: "graduation",
    type: "mainline",
    uci: "c5b4",
    san: "Bb4+",
    moveNumber: 8,
    color: "b",
    sym: "",
    kind: "Annotation",
    title: "Check",
    fact: "The bishop gives check.",
    commentary: "The position asks for an answer before anything else.",
    draft: true,
  },
  {
    id: "bd2",
    parent: "bb4-check",
    type: "mainline",
    uci: "c1d2",
    san: "Bd2",
    moveNumber: 9,
    color: "w",
    sym: "",
    kind: "Annotation",
    title: "The Calm Block",
    fact: "White blocks the check with a developing move.",
    commentary: "The calm answer is usually the right one.",
    draft: true,
  },
  {
    id: "bxd2",
    parent: "bd2",
    type: "mainline",
    uci: "b4d2",
    san: "Bxd2+",
    moveNumber: 9,
    color: "b",
    sym: "",
    kind: "Annotation",
    title: "The Trade",
    fact: "Black trades bishops, with check.",
    commentary: "Trading keeps the tension honest. White recaptures next.",
    draft: true,
  },
  {
    id: "deriv",
    parent: "bxd2",
    type: "mainline",
    uci: "b1d2",
    san: "Nbxd2",
    moveNumber: 10,
    color: "w",
    sym: "",
    kind: "Full-time",
    title: "The Deepest Move",
    fact: roleFact("deriv"),
    commentary:
      "The recapture develops the last minor piece. Deriv is the deepest White move on the board so far, and the current one.",
    links: [roleLink("deriv")],
    claims: ["derivCxCost", "derivCsat"],
    career: { kind: "role", roleId: "deriv" },
    draft: true,
  },
  {
    id: "faultline",
    parent: "deriv",
    type: "mainline",
    uci: "c8g4",
    san: "Bg4",
    moveNumber: 10,
    color: "b",
    sym: "",
    kind: "Project",
    title: "The Pin That Waits",
    fact: projectFact("faultline"),
    commentary:
      "The bishop pins the knight and waits. FaultLine does the same with a regression: it holds one question still until the history answers it.",
    links: [projectLink("faultline")],
    claims: ["faultlineLocate"],
    career: { kind: "project", slug: "faultline" },
    draft: true,
  },
  {
    id: "outlook",
    parent: "faultline",
    type: "mainline",
    san: "…",
    moveNumber: 11,
    color: "w",
    sym: "",
    kind: "Outlook",
    title: "The Open File",
    fact: "The scoresheet stands. What the next move writes is still to be played.",
    commentary: "Rooks belong on the open file. The work already points there; the next move is still to be written.",
    links: CONTACT_LINKS,
  },
  // The castled line the site used before September 2026, kept so ?move=oo and ?move=re1 still land.
  {
    id: "oo",
    parent: "bc5",
    type: "variation",
    uci: "e1g1",
    san: "O-O",
    moveNumber: 4,
    color: "w",
    sym: "!",
    kind: "Practice",
    title: "Castling",
    fact: "The earlier mainline castled here. It is kept as a variation so older links still land.",
    commentary:
      "Castling is not a retreat. It is the move that says king safety before the central break. I ship the same way — tests and access control before the spectacular sacrifice.",
    eval: 0.55,
  },
  {
    id: "oo-nf6",
    parent: "oo",
    type: "variation",
    uci: "g8f6",
    san: "Nf6",
    moveNumber: 4,
    color: "b",
    sym: "",
    kind: "Annotation",
    title: "The Knight Comes In",
    fact: "Part of the earlier castled line.",
    commentary: "The same knight, one move later in the story.",
    draft: true,
  },
  {
    id: "oo-d4",
    parent: "oo-nf6",
    type: "variation",
    uci: "d2d4",
    san: "d4",
    moveNumber: 5,
    color: "w",
    sym: "",
    kind: "Annotation",
    title: "The Break, Castled",
    fact: "Part of the earlier castled line.",
    commentary: "The same break, with the king already tucked away.",
    draft: true,
  },
  {
    id: "oo-exd4",
    parent: "oo-d4",
    type: "variation",
    uci: "e5d4",
    san: "exd4",
    moveNumber: 5,
    color: "b",
    sym: "",
    kind: "Annotation",
    title: "Taking on d4",
    fact: "Part of the earlier castled line.",
    commentary: "Black accepts, as in the mainline.",
    draft: true,
  },
  {
    id: "re1",
    parent: "oo-exd4",
    type: "variation",
    uci: "f1e1",
    san: "Re1",
    moveNumber: 6,
    color: "w",
    sym: "",
    kind: "Outlook",
    title: "The Open File",
    fact: "The earlier mainline ended here. The outlook now sits after 10…Bg4.",
    commentary: "The rook still belongs on the open file; the game simply went further.",
    eval: 0.8,
    links: [{ label: "Go to the outlook", href: "/opening-preparation?move=outlook" }],
    draft: true,
  },
];
