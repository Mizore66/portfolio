# Rebuild brief: anasqumhiyeh.dev

This brief covers the personal portfolio of **Anas Tarek Qumhiyeh**.

**Sources**
- Production: `origin/master` at `3453993`, deployed 2026-09-05, assessed on 2026-09-25. The live site has never published a CMS edit, so everything it shows comes from content built into the code.
- The owner's two current résumés, provided on 2026-09-25 (§3.0).
- The owner's decisions, given on 2026-09-25 (§0).

## How to use this brief

- **§1–§5 are requirements.** §6 is the critique behind the rebuild. §7 is the design direction: **B. Analysis board** was chosen (D22). A and C stay for reference only.
- **The current visual design is not a spec.** Wherever this brief mentions a current design device, it is there as critique or as an option.
- **Content in §3 and the appendices is canonical.** Items marked **[dev]** are drafts or open points. Settle them with the owner during development; they don't block starting.
- **Every URL in §2 is fixed for SEO.** After launch, each one must return 200 or its stated redirect.
- **The rebuild is done** when every item in the launch checklist (§5.6) passes.

---

## 0. Owner decisions and open points

### 0.1 Decided (2026-09-25)

| # | Topic | Decision |
|---|---|---|
| D1 | Current role | **AI Engineer at Deriv since Jun 2026.** Before that: Software Engineer at Skribble Lab (Jan–Jun 2026). Both are missing from the current site. Content is in §3.3. |
| D2 | Chess engine | **Keep it playable.** The owner values the interactivity. §4.6 has the requirements. |
| D3 | AI-generated images | **Remove every one of them**: portraits, plates, patent engravings and background textures. §3.8 explains what replaces them. |
| D4 | New projects | **Add the projects built since April 2026.** Choose them and write their content with the owner during development (§3.4). |
| D5 | Numbers to cut | Review them **together during development**. §3.9 lists the proposed cuts. |
| D6 | Positioning | **A software engineer with professional experience, aiming for mid-level roles.** No "graduate", "junior" or "internships and contract roles" framing. |
| D7 | CMS | **Remove it.** Keep content as typed files in the repo (§4.4). After launch, `/admin` and `/api/cms-health` return 404. |
| D8 | Grades | **WAM 81.8, CGPA 3.78.** The site's 82.1 and 3.82 are wrong. |
| D9 | Public figures | **The Deriv and Skribble Lab figures are cleared** for public use. |
| D10 | Earlier roles | **Keep Western Digital, Setel and Petronas on the site, condensed** under "Earlier experience". |
| D11 | MirrorFi | **Align with the résumé:** team of 6. Anas built the strategy-builder page, the no-code interface and the MongoDB strategy schema. Drop the auto-rebalancing claim and the "architecture, implementation, and demo" line. |
| D12 | Gemini Teleportal | **Co-built with Kai (GitHub `Kaiz404`)**, who is the repo owner: https://github.com/Kaiz404/Teleportal. The work was done together. |
| D13 | Honours | **First Class Honours is confirmed.** Graduation is Apr 2026. |
| D14 | Relocation | **Open to relocating to Singapore or Australia only.** He is a Malaysian citizen, based in Bandar Sunway, and open to remote work. |
| D15 | Phone | **Show +60 11-12983-246** on the website (Contact, as a `tel:` link), on the résumé PDF, and as `telephone` in the Person JSON-LD. |
| D16 | FaultLine | **The Go rewrite is the canonical version.** It is due on `Mizore66/faultline` on 2026-09-25 or 26. Present FaultLine as Go, "rewritten from TypeScript". |
| D17 | Featured projects | **Exactly three: FaultLine, Gemini Teleportal, CircuitMindAI**, in that order. Every other project goes in the archive list. |
| D18 | Chess line | **Skribble Lab and Deriv are the next White moves** after the current line, taken from mainstream Italian Game theory. Deriv, the current role, is the deepest position on the board (Appendix A). |
| D19 | Chess mainline | **1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4 exd4 6. e5 d5 7. Bb5 Ne4 8. cxd4 Bb4+ 9. Bd2 Bxd2+ 10. Nbxd2 Bg4**, as the owner asked on 2026-09-25. Lichess name: "Italian Game: Classical Variation, Greco Gambit, Anderssen Variation". This replaces the earlier Max Lange choice (Appendix A). |
| D20 | Front page | **Lead with a statement about Anas, not a strip of numbers.** The owner's words: otherwise "this portfolio is a glorified resume". Every number moves beside the work it belongs to (§3.5, §3.7). |
| D21 | Hero statement | **Candidate 1.** Headline: "I like systems that have to survive measurement." It is followed by the subline in §3.1. |
| D22 | Design direction | **B. Analysis board** (§7). A and C are kept for reference only. |
| D23 | Chess details | **7. Bb5, 10. Nbxd2 and the move-to-career mapping in Appendix A are confirmed** (2026-09-25). The ECO code is still to be confirmed. |

### 0.2 To confirm with the owner during development [dev]

1. ~~Honours~~. Decided: see D13.
2. ~~Relocation~~. Decided: see D14.
3. ~~Phone number~~. Decided: see D15.
4. ~~FaultLine language~~. Decided: see D16.
5. ~~Hero statement wording~~. Decided: see D21.
6. **ECO code** for the D19 line (probably C54). Confirm it before printing it (D23).

---

## 1. Purpose, audience, main action

**Purpose.** Win mid-level software engineering roles. Show production experience across AI systems, payments and retrieval, where every number has an owner, a type and a date.

**Target roles [dev].** Mid-level software engineer in:
- backend and full-stack production services (Go, TypeScript, Python);
- AI and agent systems;
- fintech and digital commerce;
- data and platform engineering.

**Principles the owner set. Keep them in any design.**
- Recruiter-first.
- Facts and commentary are kept apart. The owner's phrase is "Moves are facts. Annotations are voice."
- Numbers have owners. Every metric says who produced it, where, when, and against what.
- Chess is content, never a lock. Every fact can be read without touching a board.
- No team sizes used to inflate, no fake live demos, no blog, no vanity counters. Stating a real team size to clarify scope is fine (MirrorFi).

**Audiences, ranked**
1. **Recruiters and talent partners** scan for about 30 seconds. They need:
   - who he is and what he builds, in one statement;
   - name, current role and level;
   - location, citizenship and relocation (Singapore or Australia);
   - contact details and the résumé;
   - within the first scroll, results attached to real work.
2. **Hiring managers and engineers doing a technical screen** read for 5–15 minutes. They need case studies with decisions, constraints, rejected alternatives and limitations, plus code where it is public.
3. **Peers and readers curious about chess and ML** come for the playable engine and the published negative result.

**Main action.** Email Anas at anasqumhiyeh@gmail.com. Secondary action: open the one-page résumé PDF. Tertiary actions: read a case study, or play the board.

**Measure it.** Send a Vercel Analytics custom event on each of these: email click, copy email, résumé open, case-study open, engine start.

---

## 2. Page inventory and URLs

### 2.1 Public pages

| URL | Page | Notes |
|---|---|---|
| `/` | Front page: identity, proof, selected work, experience, education, lab, about, contact | |
| `/opening-preparation` | The career told as an annotated chess game, with the playable board | Keep it. Appendix A has the content; extend it per §0.2.6. |
| `/projects/veridian` | Case study | Existing URL |
| `/projects/circuitmindai` | Case study | Existing URL |
| `/projects/mirrorfi` | Case study | Existing URL |
| `/projects/multi-agent-graphrag` | Case study | Existing URL |
| `/projects/financial-risk-predictor` | Case study | Existing URL |
| `/projects/distributed-lead-scorer` | Case study | Existing URL |
| `/projects/slm-distillation-engine` | Case study | Existing URL |
| `/projects/faultline` | Case study | **New** |
| `/projects/gemini-teleportal` | Case study | **New** |
| `/projects/<slug>` | Further post-April projects | **New.** Chosen in development (§3.4). Slugs are lowercase kebab-case. |
| `/lab/learned-evaluator` | Write-up of the chess-engine negative result | |
| `/colophon` | How the site was made, plus the engine's perft check | Body rewritten for the new design |
| `/print-edition` | One-page résumé PDF, US Letter | |
| `/print-edition?paper=a4` | The same résumé on A4 | |

Every existing project URL must keep resolving, even when a project is demoted to the archive.

### 2.2 Redirects

Define all of these statically, in `next.config.ts` `redirects()` or in the proxy. There is no CMS lookup any more.

| From | To | Status |
|---|---|---|
| `/about` | `/#about` | 308 |
| `/archive` | `/#work` | 308 |
| `https://www.anasqumhiyeh.dev/*` | `https://anasqumhiyeh.dev/*` (path and query kept) | Permanent |
| `https://anas-tarek-qumhiyeh.vercel.app/*` | `https://anasqumhiyeh.dev/*` | Permanent. **New:** today this host serves duplicate pages with a 200, and both résumés link to it. |
| `/?move=<id>` or `/?tape=1` | `/opening-preparation?<same query>` | 307/308 |

### 2.3 Other endpoints
- **Keep:** `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/icon`, and OG images for each project and for the lab.
- **Removed:** `/admin/*`, `/admin/export` and `/api/cms-health` return 404 after launch.
- **Unknown URLs** return HTTP 404 with a page that links to home, the résumé and contact.

### 2.4 Query parameters that must keep working
- `/?path=ml` and `/?path=product` filter the work list.
  - `ml` means ML / data systems. `product` means Product / backend.
  - New projects get a category too. A new category, such as "Developer tools" for FaultLine, may be added, but these two values must keep working.
- `/opening-preparation?move=<id>` keeps accepting all 17 existing ids (Appendix A), with `d4` as the default. New ids may be added.

### 2.5 Fragment ids that people may have shared (keep them)
- **`/`**
  - Sections: `#work`, `#proof` (now lands on the hero statement or the first results section), `#experience`, `#education`, `#lab`, `#about`, `#contact`.
  - Employers: `#monash-university`, `#western-digital`, `#setel`, `#petronas`, plus new `#deriv` and `#skribble-lab`.
  - Projects: `#veridian`, `#circuitmindai`, `#multi-agent-graphrag`.
  - Board and proof claims: `#the-game`, `#claim-setelDefects`, `#claim-monashRetrieval`, `#claim-leadThroughput`. A claim id that leaves the front page must still land on its claim, wherever that now lives.
- **`/`, legacy ids from the April 2026 site (nice to have):** `#projects` lands on the work section; `#skills` and `#hero` land at the top.
- **`/projects/*`:** `#measurement`, `#problem`, `#decision`, `#constraint`, `#example`, `#rejected`, `#apparatus`, `#line`, `#limitations`, `#retrospective`.
- **`/lab/learned-evaluator`:** `#hypothesis`, `#experiment`, `#result`, `#failed`, `#learned`.
- **`/opening-preparation`:** `#scoresheet`, `#lab`, and `#chapter-<id>` for each mainline id.

### 2.6 Sitemap and robots
- **Sitemap:** `/` (1.0), `/opening-preparation` (0.8), `/lab/learned-evaluator` (0.7), every project page (0.6), `/colophon` (0.3). Each lastmod comes from the content date.
- **Robots:** allow everything and point to the sitemap. No `/admin` rule is needed.

---

## 3. Content inventory

### 3.0 Source documents
- **Primary résumé:** `~/Downloads/Anas_Qumhiyeh_Resume.pdf`. It includes FaultLine (Jul 2026). Where the two résumés differ, it wins.
- **Secondary résumé:** `~/Downloads/Anas Tarek Qumhiyeh Resume NEXT.pdf`. It adds detail on CircuitMindAI and MirrorFi.

  **Note for the owner:** its email link points to `mailto:x@x.com`. Both résumés link "Portfolio" to the `vercel.app` host instead of `anasqumhiyeh.dev`.
- **The current site:** everything else, including the case studies and the lab.

### 3.1 Identity and contact

| Field | Content |
|---|---|
| Legal name | Anas Tarek Qumhiyeh. Used on the résumé, in JSON-LD and in the footer. |
| Display name | Recommended: "Anas Qumhiyeh". The site currently mixes "Anas T.", "A. T." and "Anas Tarek" (§3.9). |
| Current role | AI Engineer, Deriv (since Jun 2026) |
| Role line [dev] | Draft: "Software engineer building production services in Go, TypeScript and Python — AI customer support at Deriv, payments at Skribble Lab, graph retrieval at Monash." |
| Résumé summary (verbatim) | "Full-stack engineer building production services in Go, TypeScript and Python on PostgreSQL, Redis and Kubernetes, with digital-commerce experience in payment-gateway integration and merchant onboarding." |
| Tagline (keep) | "I like systems that have to survive measurement." |
| **Hero statement (D21)** | Headline: **"I like systems that have to survive measurement."** Subline: "Anas Qumhiyeh — AI Engineer at Deriv. I build production services in Go, TypeScript and Python, from payment gateways to support agents, and I publish the results, including the ones that lose." |

**Hero statement candidates considered.** The owner chose 1 (D21). The others are kept for reference, for example as section mottos.

1. **Chosen (D21).** Headline: **"I like systems that have to survive measurement."**

   Subline: "Anas Qumhiyeh — AI Engineer at Deriv. I build production services in Go, TypeScript and Python, from payment gateways to support agents, and I publish the results, including the ones that lose."

   These are his own words, and the whole site already proves them: the evidence labels on every number, and the chess engine's published loss.
2. **"I build software that has to hold up — at the pump, on the lab floor, in the support queue."**

   Concrete: three real places his systems ran (Setel's fuel-pump checkout, Western Digital's lab, Deriv's support system). It is the most human option, and a recruiter can picture it.
3. **"I ship systems, then measure them — and publish the result either way."**

   The strongest statement of character. The −143 Elo lab write-up is the proof.
4. **"Moves are facts. Annotations are voice."**

   The owner's chess principle. It is memorable, but cryptic to a recruiter without context, so it works better as a section motto than as the hero.

**Rules for the hero statement**
- It sits first on the page, above everything else.
- It carries personality; the name and current role sit directly under it.
- No number appears in it. Numbers are proof, and proof sits beside the work.
| Availability [dev] | Draft: "AI Engineer at Deriv since June 2026. Open to conversations about mid-level software engineering roles." |
| Location and status | "Malaysian citizen · Bandar Sunway, Selangor · open to remote · open to relocating to Singapore or Australia" (D14). Name the two countries exactly; do not write "open to relocation" on its own. |
| Response time | "Usually replies within two business days (MYT)." |
| Contact heading [dev] | Draft: "Hiring a software engineer for backend, full-stack, or AI-systems work? Write to me." |
| Email | anasqumhiyeh@gmail.com |
| LinkedIn | https://linkedin.com/in/anasqumhiyeh/ |
| GitHub | https://github.com/Mizore66 (link with `rel="me"`) |
| Phone | +60 11-12983-246. Show it on the site as a `tel:` link, on the PDF, and in JSON-LD (D15). |

**Retire** the old seniority line, "Internships and contract roles in payments, lab operations, and university-policy retrieval…", because it conflicts with D6. Write a new one in development.

**About [dev].** Rewrite it around the current roles. Two things carry over:
- The chess sentence: "I've played chess since I was a teenager…"
- The clarity about scope: which work was done in a team, and which was solo.

**Written but never rendered.** The owner may use any of these.
- "I'm interested in teams building reliable ML and data systems in fintech or infrastructure-heavy products."
- "At Setel, payment-engine defects could travel to checkout at the pump, so the tests had to survive that path."
- "At Western Digital, operators had to walk stations when the board was silent, so the dashboard had to carry live status."

### 3.2 Education

| Field | Value |
|---|---|
| Institution | Monash University (Malaysia campus), Bandar Sunway, Selangor, Malaysia |
| Degree | Bachelor of Engineering (Honours), Software Engineering, Minor in Artificial Intelligence |
| Graduated | Apr 2026 |
| Awards | First Class Honours · Best Graduate Award · Dean's List (D13) |
| Grades | **WAM 81.8 · CGPA 3.78** (confirmed, D8). The current site's 82.1 / 3.82 are wrong. |

### 3.3 Experience (newest first)

**Deriv — AI Engineer** · `#deriv`
- Jun 2026 – Present. Tech: Go, FastAPI, Next.js, Kafka, Terraform, AWS EKS/EC2. The secondary résumé also lists Deepagents.
- What he did:
  - Cut customer-support (CX) costs by about 80%, and raised average customer satisfaction from 5/10 to 8/10, by shipping a full-stack customer-support system that proactively resolves user issues.
  - Built a Go microservice that unifies data from 4–6 internal services into a single response for the customer-support system. It was designed for about 8,000–10,000 requests a day and is **now running in staging**.
  - Built and operates Kafka- and API-based ingestion pipelines that handle about 20,000 complex events a day, so they can be reliably analysed downstream.
  - Built evaluation and debugging harnesses that reproduce failures and capture environment signals, cutting time-to-fix for production failures by about 50%.
  - Updated the team's Terraform configurations, cutting costs on maintained AWS resources by about 10–30% while scaling existing infrastructure and provisioning new services.

**Skribble Lab — Software Engineer** · `#skribble-lab`
- Jan 2026 – Jun 2026. Tech: Laravel, PostgreSQL, Redis, Docker.
- What he did:
  - Owned the Xendit payment-gateway integration end to end, from requirements review through production support, enabling 5+ merchants to accept bank transfer, card and e-wallet payments.
  - Designed and shipped a merchant onboarding module for product and payment setup, and onboarded the primary client, Chung Ling Private High School (CLPHS), which serves 3,000+ students and parents.
  - Proactively hunted integration breakage and production defects, cutting weekly production errors by about 80%: from 16 of high or medium severity to 3 of low severity.

**Monash University — Full-Stack AI Engineer (Contract)** · `#monash-university`
- Nov 2025 – Feb 2026. Research contract, Faculty of IT. Tech: FastAPI, Neo4j, Next.js, LangGraph.
- Scope: "I owned the GraphRAG retrieval path and distilled SLM; the faculty's administration tools were outside my scope."
- What he did:
  - Built and independently owned a FastAPI and Neo4j graph service for university regulations, with a self-correcting Text-to-Cypher loop. It improved relational-policy retrieval accuracy by 45% over vector-only search.
  - Automated university-wide prerequisite and credit-transfer rule resolution through hybrid retrieval: embeddings plus multi-hop graph queries.
  - Profiled and simplified the reasoning pipeline, distilling it into a graph-logic SLM. This halved inference latency (−50%) and surfaced contradictory policy data for administrators; the examples are confidential.
- This clarification must appear: "+45% is the Monash contract on university regulations. +35% is the independent GraphRAG project on a separate university handbook and policy archive. Same comparison — vector-only — different corpus."

**Earlier experience** (on the site but not on the current résumés; kept and condensed, D10)

- **Western Digital — Full-stack Engineer (Contract)** · `#western-digital`
  - Feb 2025 – Dec 2025. Tech: Next.js, ASP.NET, PostgreSQL, Docker.
  - Built the lab-operations dashboard used by 50+ lab staff, with role-based station records.
  - A WebSocket carried station-status and model-inference updates, so operators could read the board instead of walking stations. UI-visible latency was under 100 ms.
  - −40% manual station-checking.
- **Setel — Software Engineer Intern** · `#setel`
  - Jul 2025 – Dec 2025. Tech: Docker, Kubernetes, React, Node.js, MongoDB, Swagger, NestJS.
  - Authorization and capture of stored payment methods on the payment engine.
  - Documented checkout and capture so a new developer could follow the path without a walkthrough.
  - 92.5% unit-test coverage on checkout and capture.
  - −40% production defects on that path, a separate observation from the coverage.
- **Petronas — Project Engineer Intern** · `#petronas`
  - Nov 2024 – Feb 2025. Tech: MATLAB, Python, MathCAD.
  - Replaced MATLAB-dependent back-end calculation and reporting functions with Python packages, removing paid runtime dependencies.
  - Wrote post-release acceptance cases for the migrated features.
  - Presented usability findings to department leadership.

**Overlap note (state it once, plainly).** Western Digital (Feb–Dec 2025) overlapped with Setel (Jul–Dec 2025) and with study. The Monash contract (Nov 2025–Feb 2026) overlapped with the start of Skribble Lab (Jan 2026). Graduation came in Apr 2026, and Deriv began in Jun 2026. Recruiters will ask about this.

### 3.4 Projects

**Structure.** Every case study has the same sections in the same order: result and evidence → problem → decision → constraint → example → considered / rejected → architecture → what was built → limitations → what I would change now → links.

**New projects** can launch with a shorter case study: result, problem, decision, what was built, links. Fill in the full sections with the owner.

**Grouping**
- **Featured (D17), exactly three, in this order:** FaultLine, Gemini Teleportal, CircuitMindAI. Three is the limit: it fits one row on desktop and one scroll on mobile, and more cards dilute the scan.
- **Archive / supporting:** Veridian, Multi-Agent GraphRAG, MirrorFi, Financial Risk Predictor, Distributed Lead Scorer, plus any new projects that aren't featured.
- **Lab:** SLM Distillation Engine.

#### FaultLine — Regression & Leak-Evidence CLI · `/projects/faultline` (new)
- **Filing:** Jul 2026. Solo. Suggested category: Developer tools.
- **Repo:** https://github.com/Mizore66/faultline. Its GitHub description: "Evidence-first replay and proof for agent-assisted regressions."
- **Before launch:** confirm the repo's default branch contains the Go rewrite (D16) and that GitHub reports Go as the main language.
- **Tech:** Go (rewritten from TypeScript), Docker, GitHub Actions, Sigstore.
- **What was built:**
  - A solo Go CLI that replays a frozen, human-reviewed check across Git history in Docker sandboxes. It pinpoints the first reliable PASS→FAIL commit in 1–5 minutes.
  - It automates investigation, minimisation and CI attestation with GitHub Actions and Sigstore. This saves 1–3 hours per regression investigation compared with manual bisecting, on small-to-medium projects.
  - Adversarial secret scanning with 8 detection rules plus an entropy heuristic, and fail-closed verification. Together they block credential leaks from proof artifacts.
- **Case-study sections:** [dev].

#### Gemini Teleportal — Voice-Controlled Desktop AI Agent · `/projects/gemini-teleportal` (new)
- **Filing:** Mar 2026, for the Gemini Live Agent Challenge.
- **Team:** co-built by Anas and Kai (GitHub `Kaiz404`), working on the tasks together (D12).
- **Repo:** https://github.com/Kaiz404/Teleportal. It is public and owned by Kai; the main language is Python, and it was created on 2026-03-06.
  - Every commit in the repo is attributed to `Kaiz404`. The case study must therefore say plainly: "Built together with Kai; the repository is under his account." A reviewer who checks the commit log should find the explanation already on the page.
- **Tech:** Next.js, TypeScript, Python, Gemini Live API, WebRTC, Firebase, Cloud Run.
- **What was built:**
  - A ReAct agent that clicks exact UI element ids from the Windows UI Automation tree and from annotated screenshots, with perceptual-hash verification. It completed 90%+ of demo desktop tasks unaided.
  - Phone audio and screen video are streamed over WebRTC to the Gemini Live API. The agent acts on spoken commands within about 2–5 seconds. Pairing needs no configuration, using Google OAuth and Firestore signalling.
  - A GitHub Actions and Cloud Build pipeline that auto-deploys every frontend change to Cloud Run.
- **Case-study sections:** [dev].

#### Other post-April projects to review with the owner [dev]

| Repo | Created | Language | Description (from GitHub) |
|---|---|---|---|
| `propdesk` | 2026-07-30 | Python | "PropDesk — Naive RAG vs StreamRAG support copilot for a fictional prop firm (NorthPeak Funding)" |
| `market-sentinel` | 2026-05-02 | Python | "Autonomous Financial Intelligence Agent - ReAct loop with LangChain, Groq, yfinance, DuckDuckGo and Streamlit." |
| `Economy-News-Pipeline` | 2026-04-30 | Python | none |
| `RexCheck` | 2026-04-27 | Python | none |

Exclude `DerivTechnicalInterview` by default, since it is interview code.

#### CircuitMindAI — PCB Inspection · `/projects/circuitmindai`
- **Filing:** Mar 2026. Independent. Category: Product / backend. Evidence type: Capability.
- **Repo:** https://github.com/Mizore66/CircuitMindAI. The Express API is in `backend-js/` and the Next.js UI is in `frontend/`.
- **Tech:** Next.js, Amazon Bedrock (Nova Pro, Nova Sonic), Express, Amazon OpenSearch Serverless, GitHub Actions, ECS Fargate, ECR, ALB.
- **Summary**
  - Purpose: "Images in, voice-guided inspection steps out, with cached results for network loss."
  - Result: the detector capability is implemented. Detection quality (precision, latency, confusion) was never measured.
- **What was built:**
  - A multi-modal GenAI pipeline: Nova Pro handles vision-based fault detection, and Nova Sonic provides low-latency, two-way voice guidance for the technician.
  - A decoupled Next.js frontend with an Express REST API.
  - GitHub Actions builds and pushes Docker images to ECR and updates ECS Fargate on every push. An Application Load Balancer and Auto Scaling keep it available and cost-efficient.
  - A local cache that holds the inspection when the network drops.
- **Case study**
  - Problem: "An operator inspecting a board needs to see the copper fault and hear inspection guidance, including when the network drops. A detector that fails with connectivity loss is not dependable enough for the inspection floor."
  - Decision: "Vision on the board and voice for the operator … results are cached locally so the floor can keep working when the network drops."
  - Constraint: "The inspection has to survive a dropped network."
  - Example: "Input: a board image and operator audio. Output: a fault overlay on the copper, with inspection guidance still audible when the network drops."
  - Considered / rejected: a server-only detector, rejected because it would fail when connectivity drops.
  - What I would change now: measure precision, latency and confusion.
- **Architecture:** ECS Fargate. Main path: Next.js (UI) → Express (API). Branches: Bedrock Nova (vision and voice) and OpenSearch (index). Beside the path: GitHub Actions (CI/CD to ECR).

#### Veridian — MLOps Tradeoff Engine · `/projects/veridian`
- **Filing:** Apr 2026. Independent, sole builder. Category: ML / data systems. Source: private archive. Evidence type: Controlled evaluation.
- **Tech:** Python, Terraform, BigQuery, GCP Vertex AI, GitLab Duo, MCP.
- **Summary**
  - Purpose: "Intercepts Terraform and Kubernetes and recommends a lower-carbon compute configuration before provisioning or a demand-driven scale event."
  - Result: rewrite as a plain line (§3.9). The claims are 99.9% observed uptime and −15% cloud emissions, both from Cloud Run evaluations against the default unscheduled Cloud Run service. Neither is a production SLO.
- **What was built:**
  - GitLab Duo plus MCP intercept Terraform and Kubernetes changes.
  - Vertex AI recommends a quantised, lower-carbon compute configuration.
  - BigQuery holds the ESG ledger, off the request path.
- **Case study**
  - Problem: "Selecting compute after provisioning or a demand-driven scale event means remediation arrives after the expensive decision has already been made."
  - Decision: "Inspect Terraform before provisioning. Vertex AI recommends a lower-carbon compute configuration. The carbon ledger stays off the request path."
  - Constraint: "The ledger had to stay off the request path so a slow or missing carbon number could not stall a provision."
  - Example: "Input: a Terraform intent. Output: a recommended compute configuration, with the carbon ledger written beside the request, not on it."
  - Considered / rejected: putting the ledger on the request path, which would stall provisioning; and selecting compute after provisioning, which arrives too late.
  - Limitations: the evaluation period, sample size and emissions-calculation source were not recorded.
  - What I would change now: record those three items.
- **Architecture:** Cloud Run. Main path: GitLab Duo + MCP → Vertex AI. Beside the path: BigQuery (ESG ledger) and Python (glue).

#### Multi-Agent GraphRAG — Policy-corpus retrieval · `/projects/multi-agent-graphrag`
- **Filing:** Oct 2025. Independent, sole builder. Category: ML / data systems. Source: private archive. Evidence type: Controlled evaluation.
- **Tech:** LangGraph, Neo4j, Vector DB, Knowledge Graphs, RAG.
- **Summary**
  - Purpose: "LangGraph over an independent university handbook and policy archive, with a vector fallback."
  - Result: +35% retrieval accuracy versus vector-only, on the independent archive. This is **not** the Monash corpus.
- **What was built:**
  - Agents write Cypher and check it.
  - Global-to-local retrieval for questions that span the whole handbook.
  - Ambiguous questions fall back to a broader semantic search.
- **Case study**
  - Problem: "A question about prerequisites has to walk the graph, not only the nearest paragraph."
  - Decision: "The graph is the structured path for prerequisites and policy; the vector store is the fallback when no valid graph path is returned."
  - Constraint: "Prerequisites and credit-transfer are edges, not another vector-only retrieval dump."
  - Example: "Input: a policy question. Output: a neighbourhood of clauses from the independent handbook archive."
  - Considered / rejected: vector-only retrieval as the primary path.
  - Limitations: the query set, scoring rule and denominator were not recorded; this is not Recall@k.
  - What I would change now: record them.
- **Architecture:** LangGraph orchestrates. Branches: Neo4j (structured) and a vector DB (unstructured).
- **Must appear:** the +45% / +35% clarification (§3.3).

#### MirrorFi — Solana Vault Strategy Platform · `/projects/mirrorfi`
- **Filing:** May 2025. **Grand Prize, Solana Megahack 2025, out of 150+ teams.** Built in a **team of 6** (D11). Category: Product / backend.
- **Repo:** https://github.com/Mizore66/MirrorFi.
- **Tech:** Next.js, ShadCN, MongoDB, Solana, Node.js.
- **Purpose:** a DeFi web app for visually designing, sharing and executing multi-protocol Solana yield strategies in one click, through a no-code interface.
- **Anas's part, from the résumé:**
  - Built the strategy-builder page and its no-code interface, covering Drift, Jupiter and Meteora.
  - Designed the MongoDB schema that stores user-made strategies so others can share and copy them.
- **Case study**
  - Problem: three protocol integrations, and a hand-off that lived in a document.
  - Decision: "One schematic that builds, shares, and executes."
  - Constraint: a hackathon weekend.
  - Limitations: the public repository is the remaining artifact.
- **Remove (D11):** the site's current role line, "architecture, implementation, and demo", and the auto-rebalancing claim.

#### Financial Risk Predictor — ML Risk Assessment · `/projects/financial-risk-predictor`
- **Filing:** Jul 2025. Independent. Category: ML / data systems. Private archive. Evidence type: Controlled evaluation.
- **Tech:** TensorFlow, XGBoost, LightGBM, BentoML, SHAP, Kafka.
- **Summary**
  - Purpose: "Daily credit-risk scores that have to be interpreted, served, and retrained."
  - Result: 0.87 AUC-ROC, from an offline evaluation with no published comparator.
- **Case study**
  - Problem: "Daily credit scores that a desk has to interpret, serve, and retrain — not a notebook that dies after the plot."
  - Decision: LightGBM and XGBoost, with SHAP explaining each score, served through BentoML. Kafka carries a daily retrain without taking the API down.
  - Considered / rejected: a single offline notebook.
  - Limitations: dataset size, split, leakage controls and prevalence were not recorded.
- **Architecture:** Kafka → LightGBM / XGBoost → BentoML. Beside the path: SHAP.

#### Distributed Lead Scorer — Large-Scale Data Mining Pipeline · `/projects/distributed-lead-scorer`
- **Filing:** May 2025. Independent. Category: ML / data systems. Private archive. Evidence type: Capacity benchmark.
- **Tech:** PySpark, PyTorch DDP, Deep Interest Network.
- **Summary**
  - Purpose: "Scores conversion on a hundred million events a day, with checkpoints so a failed hour can resume."
  - Result: a 100M-event/day capacity benchmark. This measures capacity, not sustained traffic.
- **Case study**
  - Decision: PySpark for features, and a Deep Interest Network on PyTorch DDP for scoring.
  - Constraint: a failed hour resumes from the last completed slice.
  - Considered / rejected: restarting the whole hour.
  - Limitations: cluster size, input distribution and runtime were not recorded.
- **Architecture:** PySpark → PyTorch DDP.

#### SLM Distillation Engine — Knowledge Distillation & Fine-Tuning · `/projects/slm-distillation-engine`
- **Filing:** Jul 2025. Laboratory experiment. Private archive.
- **Tech:** PyTorch, QLoRA, DeepSpeed, FlashAttention.
- **Result:** a 70B teacher distilled into a 3B student using QLoRA, DeepSpeed and FlashAttention. No speed-up is claimed, because tokens/second, hardware and batch size were not measured.
- **Must say:** the −50% latency belongs to the Monash contract SLM, **not** to this project.

### 3.5 Claims ledger

Every number on the site is registered with an **evidence type**:

- **Production** — measured on a live production system.
- **Controlled evaluation** — measured against a baseline in a controlled test.
- **Controlled benchmark** — a controlled head-to-head benchmark.
- **Capacity benchmark** — how much the system can handle, not sustained traffic.
- **Capability** — implemented, but not measured.

A new type, **Award** (for the MirrorFi Grand Prize), is proposed [dev].

Show the type next to the number everywhere the number appears. Keep "~" wherever the source says "about".

| id | Display | Type | Owner | Date | Context |
|---|---|---|---|---|---|
| derivCxCost | ~80% lower CX cost | Production | Deriv | 2026 | Customer-support system. CSAT also went from 5/10 to 8/10 (derivCsat). Cleared for publication (D9). |
| derivCsat | CSAT 5/10 → 8/10 | Production | Deriv | 2026 | Average customer satisfaction |
| derivEvents | ~20,000 complex events/day | Production | Deriv | 2026 | Kafka and API ingestion pipelines |
| derivTimeToFix | ~50% faster time-to-fix | Production | Deriv | 2026 | Evaluation and debugging harnesses |
| derivAwsCost | ~10–30% lower AWS cost | Production | Deriv | 2026 | Terraform on maintained resources |
| derivGoService | 4–6 services → one response, sized for ~8–10k req/day | Capability | Deriv | 2026 | **In staging, not production** |
| skribbleErrors | Weekly production errors 16 → 3 (~80%) | Production | Skribble Lab | 2026 | From high/medium severity to low severity |
| skribbleMerchants | 5+ merchants on Xendit | Production | Skribble Lab | 2026 | Bank transfer, card, e-wallet |
| skribbleReach | 3,000+ students and parents | Production | Skribble Lab | 2026 | CLPHS onboarding |
| monashRetrieval | +45% retrieval vs vector-only | Controlled evaluation | Monash University contract | 2026-02 | University regulations corpus |
| slmLatency | −50% inference latency | Controlled evaluation | Monash contract SLM | 2026-02 | Not the SLM Distillation Engine |
| faultlineLocate | First PASS→FAIL commit in 1–5 min | Controlled evaluation | FaultLine | 2026-07 | Small-to-medium projects |
| faultlineSaved | 1–3 h saved per investigation | Controlled evaluation | FaultLine | 2026-07 | Compared with manual bisecting |
| teleportalTasks | 90%+ of demo desktop tasks | Controlled evaluation | Gemini Teleportal (with Kai) | 2026-03 | A demo task set, not general use |
| teleportalLatency | ~2–5 s from voice to action | Controlled evaluation | Gemini Teleportal (with Kai) | 2026-03 | |
| mirrorfiPrize | Grand Prize, Solana Megahack 2025 | Award (proposed) | MirrorFi, team of 6 | 2025-05 | Out of 150+ teams |
| graphragRetrieval | +35% retrieval vs vector-only | Controlled evaluation | Multi-Agent GraphRAG | 2025-10 | Independent archive, not Monash |
| setelDefects | −40% production defects | Production | Setel | 2025-12 | Separate from the 92.5% coverage |
| setelCoverage | 92.5% unit-test coverage | Controlled evaluation | Setel | 2025-12 | Checkout and capture |
| wdOversight | −40% manual oversight | Controlled evaluation | Western Digital | 2025-12 | Lab dashboard, 50+ staff |
| leadThroughput | 100M-event capacity benchmark | Capacity benchmark | Distributed Lead Scorer | 2025-05 | Not sustained traffic |
| veridianUptime | 99.9% observed uptime | Controlled evaluation | Veridian | 2026-04 | Cloud Run evaluation, not an SLO |
| veridianEmissions | −15% cloud emissions | Controlled evaluation | Veridian | 2026-04 | Compared with default unscheduled Cloud Run |
| riskAuc | 0.87 AUC-ROC | Controlled evaluation | Financial Risk Predictor | 2025-07 | Offline evaluation, no comparator |
| slmInference | 70B → 3B student | Controlled evaluation | SLM Distillation Engine | 2025-07 | No speed-up claimed |
| gateC | −143 Elo @ 50k nodes | Controlled benchmark | Chess engine lab | 2026-09-03 | 128 games, SPRT h0 (Appendix B) |

- **No metrics strip on the front page (D20).** Each number appears next to the work it belongs to:
  - the Deriv entry carries derivCxCost and derivCsat;
  - the Skribble Lab entry carries skribbleErrors;
  - each featured card carries one result line:
    - FaultLine: faultlineLocate;
    - Gemini Teleportal: teleportalTasks;
    - CircuitMindAI: its capability line.
- **Old claim anchors keep working.** Links like `#claim-setelDefects`, `#claim-monashRetrieval` and `#claim-leadThroughput` must still land on their claim, wherever it now lives.
- **Method notes.** Each claim has one "method notes" field listing what was not recorded. Show it once per claim, behind a disclosure; it is never repeated in body copy.

### 3.6 Skills (from the primary résumé)

| Group | Skills |
|---|---|
| Languages | Go, TypeScript, Python, JavaScript, SQL, PHP, C#, HTML/CSS |
| Frontend | React, Next.js, Tailwind CSS, ShadCN, jQuery |
| Backend and APIs | Go, Node.js, NestJS, FastAPI, Laravel, ASP.NET, REST APIs, WebSockets, WebRTC, Kafka, microservices |
| Data | PostgreSQL, Redis, MySQL, MongoDB, Neo4j, Elasticsearch |
| Cloud and DevOps | Kubernetes (AWS EKS), Docker, AWS (EC2, EKS), Google Cloud (Cloud Run, Cloud Build, Firestore), Terraform, ArgoCD, GitHub Actions, GitLab CI/CD, Grafana, Loki |
| AI/ML | LangGraph, PyTorch, TensorFlow, pandas, NumPy |

Show skills on the site, not only in the PDF.

### 3.7 What each page carries

Order is at the designer's discretion unless stated.

**`/`, the front page**
- Hero:
  - the **statement** (§3.1), first on the page;
  - then the name, current role and a one-sentence subline.
  - No metrics in the hero (D20).
- Results appear in context: on the experience entries and the featured cards, each with its evidence type, owner, date and a one-line method.
- Availability, plus two calls to action: see the work, and contact. GitHub and LinkedIn links.
- Selected work: the featured projects as cards (origin · date · category, evidence type, name and subtitle, purpose, result, a case-study link, and a source link where there is a repo), followed by the archive list.
  - Include the `?path=` filter. It shows counts and announces the filtered count to screen readers.
- Experience:
  - Deriv, Skribble Lab and Monash in full.
  - Earlier experience condensed.
  - The overlap note.
  - The +45% / +35% clarification.
- Skills (§3.6).
- Education (§3.2).
- Lab:
  - The engine teaser: "The learned evaluator underperformed PeSTO by 143.3 ±35.4 Elo at 50,000 nodes/move across 128 games." and "I published the loss, the confidence interval, and what failed."
  - An entry point to the playable board.
  - A link to the SLM Distillation project.
- About (§3.1).
- Contact:
  - The heading, availability, location, citizenship, remote and relocation status (Singapore or Australia), response time, and the email address as selectable text.
  - The phone number as a `tel:` link (D15).
  - Actions: Email, Copy email (the label shows "Copied" for about 4 s), LinkedIn, GitHub, Résumé (Letter), Résumé (A4).
- Footer: legal name, and links to the colophon and to `/opening-preparation`.

**`/opening-preparation`**
- Intro:
  - Title "Opening Preparation".
  - "A playable career timeline told through an Italian Game."
  - "The résumé is literal; the chess is annotation."
- The line: chapters, positions, facts and commentary (Appendix A), extended to cover Skribble Lab and Deriv (§0.2.6).
- The puzzle at 4…Nf6: "White to move — find the break." The answer is d4. A hit shows "!! — found over the board." A miss shows "A developing move. The break was d4. — Ed."
- The board and engine (§4.6).
- Closing lines: "The scoresheet stands." and "What the next move writes is still to be played."

**`/projects/<slug>`:** the §3.4 content, using the section order given there. Also:
- a breadcrumb (Home / Work / Name) and a back link that keeps any `?path=`;
- previous/next project;
- a copy-link control on every section heading;
- real screenshots or recordings where they exist (§3.8).

**`/lab/learned-evaluator`:** Appendix B in full, with the playable board and the Handcrafted/Learned toggle embedded or linked.

**`/colophon`**
- Rewrite for the new design. It should state the typefaces, the colours, how content is published (files in the repo, reviewed on preview deployments), and what the tests check.
- Keep the engine's perft self-check: depth 1 = 20, depth 2 = 400, depth 3 = 8902 nodes.

**`/print-edition`:** the one-page PDF mirrors the owner's primary résumé.
- Name, the summary line, citizenship, location, remote and relocation (Singapore or Australia), email, site (`anasqumhiyeh.dev`), LinkedIn and GitHub.
- Education and awards.
- Technical skills.
- Experience: Deriv, Skribble Lab, Monash.
- Projects: FaultLine, Gemini Teleportal, or whichever are featured.
- Phone number (D15).

**404:** "The page you requested was a misprint." / "The front page still holds the work." It links to home, the résumé and contact. The copy can change with the design direction. It must return HTTP 404 and have its own title and canonical.

### 3.8 Media assets

**Removed (D3).** Every AI-generated image goes:
- all `plates/clip-*.jpg`, `impression-philidor.jpg` and `plate-*.jpg`;
- every `figures/fig-*.webp/.avif` patent engraving;
- `newsprint-collage.*` and `newsprint-grain.*`.

**Kept only if nothing better is supplied:** `plates/plate-inventor.jpg`, the one real photo. It shows mostly an escalator and only the top of Anas's head. Better: the owner supplies a real portrait, or the site has none.

**Replacement imagery.** Everything is real or drawn from data.
- **Real screenshots or recordings of public projects,** supplied by the owner during development. For example: a FaultLine terminal session, the CircuitMindAI UI, a Gemini Teleportal demo clip.
- **Architecture diagrams drawn as SVG** from each project's architecture data in §3.4.
- **The chess board and the lab's Elo figure,** both rendered from data.
- **OG images generated from page content:** name and role, or the page title. No hard-coded year.

**Engine files (keep, §4.6):**
- `engine/nnue-lichess-cc0-768x2x256-32-1-2026-08-29.bin`
- `engine/nnue.wasm`

**Drop:** the two unused `engine/*.bin` nets, the `*.svg` boilerplate and the default `favicon.ico`. Redesign the icon with the new identity.

### 3.9 Content defects to fix during the rebuild

**Honesty and attribution**
1. **Chess-experiment disclosure.** What was tested as "learned" is material plus an NNUE residual clamped to ±60 centipawns. Say so, and present data quality and this integration design as equally plausible causes (Appendix B). The owner confirms the wording.
2. **Attribution.**
   - Credit the PeSTO evaluation tables (Ronald Friederich).
   - Check the licence of the chess-piece artwork. The current label, "public domain", is probably wrong: the Cburnett set is multi-licensed (GFDL, BSD, GPL, CC BY-SA). Attribute it properly or replace it.
   - Keep this statement: "Lichess eval database, CC0-1.0. No Stockfish network weights are copied."
3. **"2200-anchored" engine strength is self-declared.** Drop it, or label it "self-estimated club strength".
4. **MirrorFi scope** must match the résumé (§3.4).

**Hedging (proposed cuts; review in development, D5)**

5. Give each claim one context line (type · owner · date · baseline) and at most one caveat sentence. Put "not recorded" details in that claim's method notes. The current copy has about 32 "not filed / unfiled" phrases.
6. Proposed cuts:
   - "An unnamed 15% lift was withdrawn"
   - "A −30% inference latency … also noted"
   - "A 98% test-pass note was also recorded"
   - "Hours of pipeline latency were cut to minutes…"
   - "No live host. The case study on this page is the remaining public artifact." (printed on every project)
   - "If GitHub is blocked on this network…"
   - "A REST API for the line, not a slogan about performance."
   - "Kind: Capability as filed — not a numbered experiment"
7. Rewrite Veridian's result line. The current one reads like an internal note: "Implemented recommendation engine; −15% emissions is a separate Cloud Run evaluation".

**Contradictions**

8. The SLM Distillation content prints the Monash −50% latency inside its own facts. Keep that figure only under Monash.
9. **The chess narrative scrambles the chronology.**
   - Setel is played before Western Digital, and Setel is missing from the chapter list.
   - The flagship position merges Veridian with the Monash contract.
   - The entity labels are wrong: 4. O-O is labelled Setel, and 5. d4 is labelled Monash.
   - Any real chronology shown on the site must be correct. If the moves are thematic rather than chronological, say so once.
10. **Year index.** Monash started in Nov 2025, not 2026. Petronas ran until Feb 2025.
11. **Petronas headline.** The newspaper-style headline says "Software Engineering Intern"; the role was Project Engineer Intern. The fake headlines are being dropped anyway (§4.9).
12. **Grades on the current site are wrong.** It shows WAM 82.1 and CGPA 3.82, and graduation in May 2026. The correct values are WAM 81.8, CGPA 3.78 and Apr 2026 (D8). Fix them everywhere they appear: education section, résumé PDF, JSON-LD and the chess `e4` fact.

**Copy glitches**

13. Template glitches:
    - "PySpark over 100M-event capacity benchmark".
    - The Setel chess fact repeats its metric twice in a row.
    - Evidence-type labels leak into prose.
    - The lab meta has a double negative: "lost −143.3".
14. Rewrite the multi-dash bullet chains as plain sentences, as in §3.3.
15. Use en-GB throughout. The site is `lang="en-GB"` but mixes "behavior", "catalog", "authorization" and "Resume/résumé/Résumé". Pick one form of the contest name: "Solana Megahack 2025".
16. Use one display name, "Anas Qumhiyeh". Use the legal name, "Anas Tarek Qumhiyeh", in formal places.
17. The résumé PDF strips "−", "→", "±" and "é". The new PDF must render them.

---

## 4. Functionality that must survive

### 4.1 Forms
- There are **no forms anywhere.** Contact is a mailto link plus a copy-to-clipboard button. Keep it that way.

### 4.2 Résumé PDF (must survive)
- Served at `GET /print-edition` (US Letter) and `GET /print-edition?paper=a4` (A4), as inline `application/pdf`.
- Filename: `Anas-Tarek-Qumhiyeh-resume.pdf`. Headers: `Cache-Control: no-store`, plus a stable ETag.
- It must fit on **one page**. It must be a tagged PDF with a structure tree, headings and `Lang en-GB`. The PDF title is "Anas Tarek Qumhiyeh — Résumé".
- Text must be selectable and links clickable. It must parse cleanly in ATS systems. Embed a font so "−", "→", "±" and "é" render.
- Generate it from the same content files as the site. Its content is listed in §3.7.
- Entry points:
  - the "Résumé" item in the primary navigation;
  - Contact (Letter and A4);
  - the 404 page;
  - the closing chapter of `/opening-preparation`.

### 4.3 Analytics and integrations
- **Vercel Web Analytics** (`@vercel/analytics`): cookieless, loaded only on Vercel, so no consent banner is needed. Add the custom events from §1.
- **No other third parties at runtime.** Fonts are self-hosted, with no calls to Google Fonts. The Groq AI chat from the April 2026 site stays removed.
- **Vercel Blob and Postgres go** with the CMS (§5.1).

### 4.4 Content as files (replaces the CMS)
- **One source.** Keep all content in typed files in the repo, for example `content/*.ts` or MDX. That single source feeds every page, the PDF, the JSON-LD, the sitemap and the OG images.
- **Publishing.** Changes go live with a git push. Each pull request gets a Vercel preview deployment for review.
- **Redirects** are static configuration (§2.2).
- **The old CMS guards become unit tests over the content files:**
  - every number displayed is registered in the claims ledger, with a type, owner and date;
  - the hero contains no metric (D20), and each featured card shows at most one result line;
  - +45% and +35% never appear merged, and −50% appears only under Monash;
  - the lab headline and teaser contain "underperformed PeSTO";
  - the chess PGN in the content equals the canonical mainline;
  - project slugs are unique kebab-case, and meta descriptions are 160 characters or fewer.
- **Test data invariants, not prose.** Avoid regexes over copy and greps over source files.

### 4.5 SEO (must survive)
- **Metadata**
  - Every page has its own title, description and canonical URL on `https://anasqumhiyeh.dev`. The site is `lang="en-GB"`. Open Graph and a Twitter large-image card on every page.
  - Project pages use OG type `article`. Each `?move=` page gets a title for its position.
  - Descriptions are at most 160 characters, and every project has a unique title, description and date.
- **JSON-LD**
  - `Person` on every page:
    - name "Anas Tarek Qumhiyeh", alternateName "Anas Qumhiyeh";
    - email, url, image;
    - jobTitle "AI Engineer", with `worksFor` Deriv [dev];
    - homeLocation: Bandar Sunway, Selangor, MY;
    - alumniOf Monash University;
    - telephone +60 11-12983-246;
    - sameAs GitHub and LinkedIn.
  - `WebSite` on every page.
  - One node per project: `SoftwareSourceCode` with `codeRepository` if public, otherwise `CreativeWork`.
  - `Article` for the lab post (datePublished 2026-08-29).
  - Escape `<` in JSON-LD output.
- **Crawling:** the sitemap and robots rules in §2.6. Unknown paths return a real 404.

### 4.6 Chess engine and lab (keep playable, D2)

**Why it exists.** It demonstrates end-to-end ML engineering:
- an engine written from scratch;
- an NNUE trained on CC0 Lichess evaluations;
- quantisation-aware export;
- WASM inference;
- an SPRT harness;
- a **published negative result** with error bars and a control (Gate A: 0.0 Elo, 17–66–17, every colour-swapped pair 1–1).

**Handover.** Vendor these unchanged. **Do not rewrite them.** The −143.3 Elo result is valid only for this exact engine, search and net.
- The engine: move generation, alpha-beta search, PeSTO and learned evaluations, the NNUE loader and the WASM glue. About 2,600 LOC of TypeScript, with its tests.
- `native/nnue.rs`. It builds with `rustc --target wasm32-unknown-unknown`, and the `.wasm` is committed.
- The weights `nnue-lichess-cc0-768x2x256-32-1-2026-08-29.bin` (410 KB raw, about 184 KB gzipped) and `nnue.wasm` (6.4 KB).
- `training/`: the Python pipeline, plus provenance, holdout, guards and data-source docs.
- `matches/*.json`: the match receipts.
- **Owner guards:**
  - Do not retrain the net.
  - Do not run 50,000-game matches.
  - Do not delete PeSTO.
  - Any change to eval or search needs an `sprt:` line in the commit message.

**Visitor features**
- A board showing the annotated positions, with previous/next controls.
- **Legal-move play with an engine reply.**
- A live engine panel with a Handcrafted (PeSTO) / Learned toggle, the principal variation, and search depth and nodes/second.
- Deep links through `?move=`.
- Each position's authored eval is labelled as annotation, not engine output.

**Required changes**
- The engine starts only when the visitor asks. No infinite autoplay loop anywhere.
- The weights are fetched only after the engine starts or Learned is chosen. The front page loads no engine assets up front.
- The search runs in a Web Worker and pauses when the tab is hidden. The engine's reply must not block the main thread.
- Keyboard move entry, for example selecting a square with the arrow keys and Enter.
- The position is exposed as text for screen readers. The facts stay readable without the board.

### 4.7 Security (must survive)
- **Strict CSP with a per-request nonce:**
  - `default-src 'self'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, `object-src 'none'`;
  - `script-src 'self' 'nonce-…' 'wasm-unsafe-eval' https://va.vercel-scripts.com`, with no script `unsafe-inline` and no `unsafe-eval` in production;
  - `worker-src 'self' blob:`;
  - `connect-src 'self'` plus the Vercel analytics hosts.
- **Headers:**
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **Caching:** a page carrying a nonce must never be served from a cache with a stale nonce.

### 4.8 Behaviours to keep
- Every page is readable with JavaScript off and with CSS off.
- Deep links scroll to their target, and browser back navigation restores the position.
- The email address is selectable text.
- Print styles keep figures whole.
- The work filter is done with links.

### 4.9 Drop
- The CMS and admin.
- The classifieds (Errata, Situations Wanted), the weather toggle, the "Set by hand" stamp, the full-page "desk collage" animation, and hover previews.
- The fake newspaper headlines.
- Every AI-generated image (§3.8).

---

## 5. Technical constraints

### 5.1 Hosting and deploy
- **Vercel** project, connected to GitHub `Mizore66/portfolio`. Pushes to `master` deploy to production; branches get preview deployments.
- **Domain:** `anasqumhiyeh.dev`, registered at **Porkbun. Do not transfer it.**
- **DNS:** `A @ 76.76.21.21` and `CNAME www → cname.vercel-dns.com`. The apex is primary.
- **Add** a redirect from the `*.vercel.app` alias to the apex (§2.2).
- **Add CI:** GitHub Actions running lint, typecheck, unit tests and end-to-end tests on every pull request.
- **Decommission the CMS after launch. This is an owner action; confirm each step.**
  1. Before shutting it down, download `/admin/export` once to confirm no unpublished draft is lost. The live site has always shown the built-in content, so the store is expected to hold nothing of value.
  2. Remove these environment variables from Vercel: `CMS_SESSION_SECRET`, `ADMIN_PASSWORD_HASH`, `ADMIN_PASSWORD`, `ADMIN_TOTP_SECRET`, `DATABASE_URL` and the `POSTGRES_*` variables, `BLOB_READ_WRITE_TOKEN`.
  3. Delete the Vercel Blob store and the Postgres database (Supabase through the Vercel Marketplace).

### 5.2 Stack
- Current stack: **Next.js 16.2.4** (App Router), **React 19.2.4**, TypeScript 5, Tailwind CSS 4, ESLint 9. Keep it.
- **Next 16 differs from older Next.js.**
  - Middleware lives in `src/proxy.ts`.
  - The owner's rule: read `node_modules/next/dist/docs/` before writing code, and follow its deprecation notices.
- Web Workers are bundled with `new Worker(new URL(…, import.meta.url), { type: "module" })`. Check that this works under Turbopack.
- **Runtime dependencies after the CMS goes:** `@vercel/analytics`, `clsx` and `tailwind-merge`, plus the vendored engine. Drop `@vercel/blob`, `postgres` and `hash-wasm`.
- The engine's unit tests call out to `python3`. The WASM rebuild needs `rustc` with the `wasm32-unknown-unknown` target; this is not part of `next build`.

### 5.3 Environment variables

| Variable | Needed |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Always. Defaults to `https://anasqumhiyeh.dev`. |
| `VERCEL`, `VERCEL_ENV`, `NODE_ENV`, `CI` | Set by the platform |

### 5.4 Performance bar

The bar is to match or beat the 2026-08-29 production Lighthouse run.

| | Performance | Accessibility | Best practices | SEO |
|---|---|---|---|---|
| Desktop (current) | 99 | 100 | 100 | 100 |
| Mobile (current) | 90 | 100 | 100 | 100 |

- **Mobile LCP target: 2.5 s or less.** It is 3.3 s today. CLS stays about 0, and TBT stays under 100 ms.
- No engine weights, WASM or workers load until the engine is started.
- Fonts are self-hosted and preloaded for the first viewport. Today they are lazy-loaded 4 s after load.
- On a 375 × 812 viewport, sticky chrome takes at most about 12% of the height. Today it takes about 30%.

### 5.5 Accessibility bar
- **Automated:** axe reports zero violations on every public page.
- **Layout:**
  - No horizontal overflow from 320 to 1920 px, or at zoomed viewports (640×400, 320×200, 844×390).
  - The front page stays under about 14,000 px tall at 390 px wide.
  - On mobile, work comes before any board in reading order.
- **Semantics:**
  - Exactly one header, one main and one footer.
  - Skip links are present.
  - Headings run in order: H1, then H2, then H3.
- **Interaction:**
  - Touch targets are at least 44 px on mobile and at least 32 px on desktop.
  - Focus is always visible.
  - Evidence types and statuses are never shown by colour alone.
  - Dialogs trap focus and close on Esc.
- **Preferences:**
  - `prefers-reduced-motion` means nothing animates on its own.
  - Forced-colours mode works.
  - Save-Data suppresses decorative loads.

### 5.6 Launch checklist (the definition of done)
- [ ] Every §0.2 item is confirmed with the owner, or its default is applied.
- [ ] The front page opens with the chosen hero statement, and the hero has no metrics strip (D20).
- [ ] Every URL in §2.1 returns 200. Every redirect in §2.2 returns the stated status.
- [ ] `/admin`, `/api/cms-health` and unknown paths return 404.
- [ ] Every fragment id in §2.5 lands on its content.
- [ ] Every §3 item is present on its page, every §3.9 fix is applied, and no AI-generated image remains.
- [ ] The résumé PDF passes §4.2 in both paper sizes and matches the primary résumé's content.
- [ ] The content-invariant tests in §4.4 pass.
- [ ] The JSON-LD validates in a structured-data tester.
- [ ] The §4.7 headers are present on live responses.
- [ ] The engine is playable, starts only on request, and works by keyboard.
- [ ] The chess line reaches Skribble Lab and Deriv. Every move is legal and matches verified theory.
- [ ] The FaultLine repo shows the Go rewrite.
- [ ] The phone number appears in Contact, on the PDF and in JSON-LD.
- [ ] The §5.4 and §5.5 bars pass on production.
- [ ] The analytics events fire.
- [ ] The CMS environment variables and stores are decommissioned (§5.1).

---

## 6. Critique of the current site

### 6.1 What is weak (most serious first)

1. **The site is seven months behind its owner.** It omits the current role (Deriv), the previous role (Skribble Lab), the strongest production numbers (~80% CX cost, weekly errors 16 → 3) and the newest projects (FaultLine, Gemini Teleportal). It still reads "Open to…" and is framed around internships.
2. **The concept costs recruiters the first screen.**
   - The first line is "Edition 2026 · C50 · Italian Game · anasqumhiyeh.dev · Moves are facts · Annotations are voice".
   - Readers must decode section names ("Columns", "Correspondence", "About the annotator", "filings"), a "C50" stamp and chess glyphs (! !! !? ?!).
   - Three metaphors are stacked: chess, a Victorian broadsheet and 19th-century patents, plus classified ads, a weather toggle and a "set by hand" stamp.
3. **The second-loudest number on the front page is a loss.** "Learned · −143 Elo" sits beside the proof strip, and the board autoplays in an endless loop with the evaluator that lost.
4. **The hedging undercuts the honesty thesis.** About 32 "not filed / unfiled" phrases, and withdrawn numbers still printed. Readers remember the disclaimers, not the results.
5. **The images contradict the thesis, and they look poor.**
   - Every image is AI-generated.
   - Portraits of Anas are captioned "file photo".
   - Fake 1959 newspapers name invented people.
   - The alt text describes things that are not in the images.
6. **The visual language is a common default.** Cream paper (`#f6eedc`), Baskerville, an oxblood accent, hairline rules, zero radius and tracked mono kickers are now the most common look for generated "editorial" sites.
7. **Mobile is cramped and slow.**
   - Sticky chrome takes about 30% of a phone screen.
   - Fonts swap in 4 s after load.
   - Mobile LCP is 3.3 s.
   - Every front-page visit downloads about 184 KB of engine weights.
   - The engine search never pauses.
8. **The career is told four times** (front page, scoresheet, About, PDF), each slightly differently, and the chess move order scrambles the chronology.
9. **There is too little to verify.** Five of the seven listed projects are a "private project archive", and GitHub links go to the profile page.
10. **The engineering is far beyond what the site needs.** A custom CMS never published to production and has security defects (Appendix C). Tests that match prose with regexes make every copy edit a fight.

### 6.2 What is worth keeping
1. **The evidence taxonomy:** Production / Controlled evaluation / Controlled benchmark / Capacity benchmark / Capability, with an owner, baseline and date for every claim.
2. **The playable engine and the published negative result,** with error bars, the SPRT stopping rule and a calibrated control.
3. **The case-study skeleton:** problem → decision → constraint → example → considered / rejected → limitations → what I'd change.
4. **Careful disambiguation:** the Monash +45% versus the independent +35%, and "numbers have owners".
5. **Facts separated from commentary.** "Moves are facts, annotations are voice" works as a content principle.
6. **The quality floor:**
   - axe-clean, and readable without JavaScript or CSS;
   - works in forced-colours mode;
   - no overflow at 320 px, and reduced motion respected;
   - deep links everywhere, and desktop Lighthouse at 99.
7. **A one-page, tagged, ATS-friendly résumé PDF in two paper sizes.**
8. **A contact section that answers recruiter questions up front:** location, status, response time, and a copy-email button.
9. **Chess as a genuine personal interest.**

---

## 7. Design directions

All three directions avoid the current look. They also avoid the other two clusters generated sites fall into: near-black with a single acid-green or vermilion accent, and dense broadsheet columns.

Every direction must meet all of the following:
- The first phone screen opens with **the hero statement**, then the name, current role and contact. Results appear within the first scroll, beside their work. There is no metrics strip in the hero (D20).
- Evidence types stay visible next to their numbers.
- The fact/commentary split is expressed somehow.
- The playable board is present, but never gates a fact.

**Chosen: B. Analysis board (D22).** Build B. Sections A and C are kept only as reference.

**Conditions that come with B**
- The engine starts only when the visitor asks. No engine assets load on page load, which keeps mobile within the §5.4 budget.
- The first screen works on its own: the statement, name, role and contact are all readable without touching the board.
- On mobile, the board pane collapses to the eval-bar strip. Work comes before the board in reading order (§5.5).

### A. Datasheet

**Thesis.** Present the engineer the way a well-made component is specified: every figure ships with its test conditions.

- **Mood:** exact, calm, confident, quietly technical. Swiss-industrial, not retro.
- **Typography:** one engineered grotesk used at several widths. Condensed for headings and table heads, normal width for reading, and tabular mono figures for every number. Heavy weight only on the name and key figures. Candidates: **Archivo** (variable width) with **Martian Mono** for numerals.
- **Colour:**

  | Role | Name | Hex |
  |---|---|---|
  | Background | cool white | `#F5F7F8` |
  | Text | graphite | `#1B1F24` |
  | Rules | rule grey | `#C9CFD4` |
  | Links and actions | calibration blue | `#1D4ED8` |
  | Caveat markers only | tolerance amber | `#B7791F` |

- **Layout:**
  - The front page reads like page 1 of a datasheet:
    - The hero statement set as the datasheet's one-line **"Description"**, the largest type on the page.
    - Name and current role under it.
    - The specification tables start below the fold: in Experience, where each role has a "Characteristics" table (Result · Type · Owner · Date), and in each application note.
    - "Applications": the target roles.
    - "Operating conditions": citizenship, location, remote, relocation (Singapore · Australia), response time.
  - Projects become numbered **application notes**, each with a block diagram drawn from its architecture data.
  - Experience becomes a revision-history table.
  - The playable board lives in the Lab as the one interactive "evaluation board".
  - Desktop has two columns. On mobile, tables reflow into stacked rows.

```
 DESCRIPTION
 I like systems that have to survive measurement.
 ───────────────────────────────────────────────────────────────────────────
 ANAS QUMHIYEH · AI Engineer, Deriv                       Résumé   Contact
 Go · TypeScript · Python production services, published results included
 APPLICATIONS  mid-level SWE · backend/full-stack · AI systems · fintech
 ───────────────────────────────────────────────────────────────────────────
 CHARACTERISTICS (Experience)   Result          Type        Owner    Date
                                ~80% CX cost    Production  Deriv    2026
 ───────────────────────────────────────────────────────────────────────────
 APPLICATION NOTES   AN-01 FaultLine   AN-02 Teleportal   AN-03 CircuitMindAI
 EVALUATION BOARD    [ Start engine ]  Handcrafted | Learned  −143 Elo note
```

- **Signature:** the specification table and its footnote markers. The evidence taxonomy becomes the column recruiters skim and engineers trust, and the caveats become structure instead of defensive prose.
- **References:**
  - Texas Instruments and Analog Devices product datasheets;
  - Teenage Engineering product guides;
  - Braun manuals from the Dieter Rams era;
  - the density of Stripe's API reference.
- **Rationale:** measurement discipline is the differentiator. The datasheet is the genre where readers *expect* every figure to carry its conditions, and it is the fastest direction for a recruiter to scan.
- **Risk:** it can feel cold. Counter it with the tagline, the About section and the "what I'd change now" lines, set in the same family's italic.

### B. Analysis board (chosen)

**Thesis.** Chess as a working tool the reader uses, not a costume the site wears.

- **Mood:** focused, playful and nerdy-confident, like a good post-game analysis session.
- **Typography:**
  - A crisp UI grotesk for facts.
  - A screen-reading italic **only** for commentary. Roman is fact, italic is voice.
  - A mono with chess figurine glyphs for notation and numbers.
  - Candidates: **Schibsted Grotesk**, **Literata Italic**, **Commit Mono**.
- **Colour:** no wood and no paper. Eval bars stay pure black and white.

  | Role | Name | Hex |
  |---|---|---|
  | Text | slate ink | `#14181D` |
  | Board light square | board light | `#E4E8EC` |
  | Board dark square | board dark | `#7D8A99` |
  | Arrows, commentary marks, focus | annotation violet | `#6D3FD6` |

- **Layout:**
  - On desktop, a two-pane analysis layout: a wide reading pane, plus a persistent board pane holding the board, eval bar and move list.
  - On mobile, the board pane collapses to a slim eval-bar strip at the top edge that doubles as reading progress. Tap it to open the board.
  - The front page leads with the hero statement, then the name, current role and contact. The board stays idle until "Start engine".

```
 ┌──────────────────────────────────┬──────────────────┐
 │ I like systems that have to      │  ▓ board ▓       │
 │ survive measurement.             │  eval ▮          │
 │ Anas Qumhiyeh · AI Engineer,Deriv│                  │
 │ ──────────────────────────────── │  1.e4 e5 2.Nf3…  │
 │ career eval graph ~~•~~•~•~~•~~• │  [Start engine]  │
 │ chapter text (roman = fact)      │                  │
 │   commentary (italic = voice)    │                  │
 └──────────────────────────────────┴──────────────────┘
```

- **Signature:** the **eval graph** repurposed as the career timeline.
  - The x-axis is real time, from Nov 2024 to now.
  - Roles and projects are points, and overlapping engagements appear as parallel spans.
  - Clicking a point jumps to its chapter and sets the board.
  - Deriv sits at the right edge, as the current position.
- **Chess rules:**
  - Facts never sit behind interaction.
  - The engine starts only when asked.
  - Moves can be entered from the keyboard.
  - The Handcrafted / Learned toggle sits next to the −143 result.
- **References:**
  - the lichess.org analysis board and its study chapters;
  - the ChessBase notation pane;
  - Chessable's interactive courses;
  - scroll-linked explainers from the NYT and The Pudding.
- **Rationale:** it keeps the interactivity the owner likes and makes it useful. It also fixes today's problems:
  - one metaphor instead of three;
  - the loss is no longer the headline;
  - time is real time, not move order.
- **Risk:** the highest build cost and the tightest performance budget.

### C. Operations board

**Thesis.** Anas builds systems that people read and depend on under pressure: support agents, payment paths, pipelines. Lay the portfolio out like the signage and network diagrams operators trust.

- **Mood:** clear, systematic and optimistic, like well-run public infrastructure.
- **Typography:** a signage sans for headings and labels, a legibility-first face for body text, and a mono for codes and status. Candidates: **Overpass**, **Atkinson Hyperlegible Next**, **Overpass Mono**.
- **Colour:** four line colours encode domain, not decoration. Every colour is always paired with a text label.

  | Role | Name | Hex |
  |---|---|---|
  | Background | white | `#FFFFFF` |
  | Text and signage | signage navy | `#0B2545` |
  | Domain line | payments | `#E0A100` |
  | Domain line | AI systems | `#C8362B` |
  | Domain line | retrieval | `#6B3FA0` |
  | Domain line | platform and data | `#00857C` |

- **Layout:**
  - The front page opens on a **status board**:
    - name, and "AI Engineer · Deriv";
    - "Status: open to mid-level SWE conversations";
    - response time and location.
  - This board is the one place a split-flap-style reveal may play once. Under reduced motion it is static.
  - Below it sits a **network diagram** in the Beck/Vignelli style:
    - lines are domains;
    - stations are roles and projects, in time order along each line;
    - interchanges are where work crossed domains.
  - On mobile it becomes a vertical strip map.
  - The chess lab is its own "Experiments" line, and the board lives at that station.

```
 ┌─ STATUS ─────────────────────────────────────────────┐
 │ I LIKE SYSTEMS THAT HAVE TO SURVIVE MEASUREMENT.     │
 │ ANAS QUMHIYEH · AI ENGINEER · DERIV                  │
 │ OPEN TO     mid-level software engineering roles     │
 │ REPLIES     within 2 business days (MYT)             │
 └──────────────────────────────────────────────────────┘
   payments   ●─Setel──●─Skribble Lab──●MirrorFi
   AI systems ●─Teleportal──●══Deriv (now)
   retrieval  ●─GraphRAG──●══Monash
   platform   ●─Lead Scorer──●─FaultLine──●═Deriv
   experiments●─Engine lab (play ▸)
```

- **Signature:** the career network map. It encodes things that are true: the domains, where they overlap, and the order of work.
- **References:**
  - Harry Beck's London Underground diagram;
  - Massimo Vignelli's 1972 New York subway diagram and the NYCTA Graphics Standards Manual;
  - Kinneir and Calvert's Transport signage;
  - Solari split-flap departure boards.
- **Rationale:** operational systems are the owner's recurring subject:
  - a customer-support system that resolves issues proactively;
  - payments across bank transfer, card and e-wallet;
  - a dashboard that replaced walking to lab stations.

  Wayfinding is the vernacular of systems people depend on, which is the job this portfolio does for a recruiter.
- **Risk:** the map turns decorative. It must stay navigation, and the list view must carry every piece of information on its own.

---

## Appendix A: `/opening-preparation`, the annotated line

**The game:** the Italian Game (ECO C50).
- **Old mainline (the current site):** 1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. O-O Nf6 5. d4 exd4 6. Re1. It is replaced by the D19 line below.
- **Variations:**
  - 1…Nf6 after 1. e4;
  - 2…d5, and a declined 2…d6, after 2. Nf3;
  - 5…d6 and 5…Bb6 after 5. d4.

**Keep these ids resolving:** `start`, `e4`, `alekhine`, `e5`, `nf3`, `elephant`, `philidor`, `nc6`, `bc4`, `bc5`, `oo`, `nf6`, `d4`, `closed`, `bb6`, `exd4`, `re1`. The default is `d4`.

**The new mainline (D18, D19). Checked 2026-09-25.**

1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. **c3** Nf6 5. d4 exd4 6. e5 d5 7. Bb5 Ne4 8. cxd4 Bb4+ 9. Bd2 Bxd2+ 10. Nbxd2 Bg4

- **Legality:** every move checked with python-chess.
- **The owner's notation, as corrected:**
  - "7. Bb6" is illegal. It was read as **7. Bb5**, the book move; confirm.
  - "10. Nxd2" is ambiguous. It was read as **10. Nbxd2**, the book move; confirm.
  - 9…Bxd2 gives check, so it is written 9…Bxd2+.
- **Name:** Lichess calls the position after 8…Bb4+ "Italian Game: Classical Variation, Greco Gambit, Anderssen Variation". The ECO code is probably C54; confirm it before printing it.
- **Naming copy:** replace every "C50" label (the start fact, the nav stamp, the intro) with the confirmed name and code.
- **The Max Lange line** (6. e5 after 4. O-O) is no longer used.

**Mapping, confirmed by the owner (D23).** White's moves are career, Black's are projects, and dates run in order.

| Move | id | Content | Date |
|---|---|---|---|
| 4. c3 | `c3` | **Practice: reliability before the break.** Carries the old 4. O-O "Castling" content: c3 literally prepares d4. | |
| 4…Nf6 | `nf6` | MirrorFi, plus the puzzle "White to move — find the break" (the answer is still 5. d4). | May 2025 |
| 5. d4 | `d4` | Veridian | Apr 2026 |
| 5…exd4 | `exd4` | Filed results | |
| 6. e5 | `e5-push` | **Monash contract** (`e5` is already taken by 1…e5) | Nov 2025 – Feb 2026 |
| 6…d5 | `d5` | Annotation only | |
| 7. Bb5 | `skribble-lab` | **Skribble Lab**, Software Engineer | Jan – Jun 2026 |
| 7…Ne4 | `teleportal` | **Gemini Teleportal**, built with Kai | Mar 2026 |
| 8. cxd4 | `graduation` | **Graduation**: First Class Honours, Best Graduate Award | Apr 2026 |
| 8…Bb4+ | `bb4-check` | Annotation only | |
| 9. Bd2 | `bd2` | Annotation only | |
| 9…Bxd2+ | `bxd2` | Annotation only | |
| 10. Nbxd2 | `deriv` | **Deriv**, AI Engineer: the deepest White move, and the current role | Jun 2026 – present |
| 10…Bg4 | `faultline` | **FaultLine**, the latest project | Jul 2026 |
| 11. … | `outlook` | **Outlook and contact:** "The next move is still to be written." | now |

"Annotation only" moves carry a short line of commentary and no career fact.

**Old ids after the switch**

The old mainline castled on move 4. The new one plays 4. c3.
- `oo`, `re1`: keep a compact variation, 4. O-O Nf6 5. d4 exd4 6. Re1, so that `?move=oo` and `?move=re1` still show exactly the old boards. The old Outlook text moves to `outlook`.
- `nf6`, `d4`, `closed`, `bb6`, `exd4` stay as ids, but now sit in the c3 line. Their boards differ slightly: a pawn on c3, and the king not castled. Every such URL still resolves.
- `start`, `e4`, `alekhine`, `e5`, `nf3`, `elephant`, `philidor`, `nc6`, `bc4` and `bc5` are unchanged.

**Also required**
- Verify every move with the engine's legal-move generator.
- Update the canonical-PGN test (§4.4).
- Keep all 17 existing ids resolving.
- Fix the chronology and the label defects (§3.9 item 9).

**How to read the entries.** Each entry is id · move · kind · title. The **fact** is the literal record, and the **commentary** is personal voice. Update the facts from §3.

- **start** · — · Start · "Opening Preparation"
  - Fact: "The Italian Game, C50. Jobs as moves; annotations as voice."
  - Commentary: "What follows is the game I actually played — jobs as moves, annotations as voice. Chess is the content, never the lock."
- **e4** · 1. e4! · Education · "The University Opening"
  - Fact: education (§3.2).
  - Commentary: "Every open game starts by occupying the centre. I opened with software engineering — not because it was the only file, but because it was the one that let both bishops out."
- **alekhine** · 1…Nf6!? (variation) · Project · "The ML Defence"
  - Fact: Financial Risk Predictor.
  - Commentary: "I built models that had to be interpreted, deployed, and retrained every morning — not fitted once for a screenshot. The knight invites the centre forward: the ML line rather than the systems line."
- **e5** · 1…e5 · Identity · "Meeting e4 with e5"
  - Fact: "The classical answer: product engineering on one wing, the data path on the other."
  - Commentary: "The classical answer. I did not decline into a closed system. Product engineering on one wing, the data path on the other."
- **nf3** · 2. Nf3 · Internship · "First Developed Piece"
  - Fact: Petronas.
  - Commentary: "Knights before bishops, they say. Petronas was the first industry square — I replaced MATLAB-dependent back-end calculation and reporting functions with Python packages, then wrote post-release acceptance cases for the migrated features."
- **elephant** · 2…d5! (variation) · Project · "The Elephant Gambit"
  - Fact: Distributed Lead Scorer.
  - Commentary: "A hundred million events a day had to keep moving even when a job died mid-run. 2…d5 is that impatience, with the checkpoint so the sacrifice is not a bluff."
- **philidor** · 2…d6?! (declined line, drawn dashed) · Road not taken · "The Philidor, Declined"
  - Fact: "After Petronas the MATLAB world was still there — MathCAD, department code, a quieter engineering path with licences already paid."
  - Commentary: "2…d6 keeps the position closed. I developed the knight instead. The dashed line is honest: I could have stayed in the MATLAB world, licences already paid. The other life stays on the page as a ghost — visible, declined, and not a regret. I did not stay."
- **nc6** · 2…Nc6 · Internship · "Defending the Pawn"
  - Fact: Setel.
  - Commentary: "Payment-engine defects could travel all the way to checkout at the pump. I sat on that square and made sure the pawn could not be taken for free."
- **bc4** · 3. Bc4 · Contract · "Pointing at f7"
  - Fact: Western Digital.
  - Commentary: "The Italian bishop looks at the weakest point in the castled position. At WD the weakness was watching lab systems by hand. I put a bishop there."
- **bc5** · 3…Bc5 · Project · "Quiet Italian"
  - Fact: CircuitMindAI.
  - Commentary: "CircuitMind sees faults in the copper and talks back over a live voice channel. Black develops the same way — vision on the board, voice on the file."
- **oo** · 4. O-O! · Practice · "Castling"
  - Fact: "Reliability before the break: Setel 92.5% coverage; WD role-based access; Veridian Cloud Run evaluation: 99.9% observed uptime."
  - Commentary: "Castling is not a retreat. It is the move that says king safety before the central break. I ship the same way — tests and access control before the spectacular sacrifice."
- **nf6** · 4…Nf6! · Project · "The Knight Comes In"
  - Fact: MirrorFi.
  - Commentary: "Grand prize is a symbol. The work was a product: shareable vault lines, a schema people could copy. Then the last minor piece develops."
  - This is where the puzzle sits.
- **d4** · 5. d4!! · Flagship · "The Central Break"
  - Fact: Veridian only; move the Monash material to Monash.
  - Commentary: "You castle, then you break the centre. d4 is the move this scoresheet hangs on: agents that intercept infrastructure, a graph that actually understands prerequisites, measurements instead of demos. The double-exclaim is Informant's, not mine — but I played it."
- **closed** · 5…d6 (variation) · Project · "The Closed Centre"
  - Fact: Multi-Agent GraphRAG.
  - Commentary: "Prerequisites and credit-transfer live as edges, not another vector-only retrieval. Black can refuse the capture and keep the centre closed — the graph is that kind of patience."
- **bb6** · 5…Bb6 (variation) · Project · "Tucking the Bishop"
  - Fact: SLM Distillation Engine.
  - Commentary: "Distillation keeps GraphRAG retrieval on a smaller piece, cheaper to keep on the board. The Italian bishop steps back to b6 and still looks at the same diagonal."
- **exd4** · 5…exd4 · Method · "Taking on d4"
  - Fact: the list of filed results.
  - Commentary: "I would rather show the graph than the slogan. Accepting the pawn is accepting that the numbers have owners."
- **re1** · 6. Re1 · Outlook · "The Open File"
  - Fact: "The scoresheet stands. What the next move writes is still to be played."
  - Commentary: "Rooks belong on the open file. The work already points there; the next move is still to be written."
  - Links: email, GitHub, LinkedIn, résumé.

**Authored evals.** Label these as annotation, not engine output.

| Position | Eval |
|---|---|
| start | +0.20 |
| e4 | +0.35 |
| e5 | +0.30 |
| nf3 | +0.40 |
| nc6 | +0.35 |
| bc4 | +0.50 |
| bc5 | +0.45 |
| oo | +0.55 |
| nf6 | +0.50 |
| d4 | +1.60 |
| exd4 | +0.70 |
| re1 | +0.80 |

---

## Appendix B: `/lab/learned-evaluator`, full text

**Metadata**
- Published 2026-08-29. The SPRT was continued on 2026-09-03.
- Net id: `nnue-lichess-cc0-768x2x256-32-1-2026-08-29`. Opening suite: `openings-v1`.

**Header**
- **Headline:** "The learned evaluator underperformed PeSTO by 143.3 ±35.4 Elo at 50,000 nodes/move across 128 games"
- **Dek:** "N = 128 games. SPRT terminated for H0." Soften the causal line per the change below.
- **Result line:** "sprt: −143.3 ±35.4 Elo @ 50000 nodes, 128 games, LLR −2.99 (h0)"
- **Tagline (may keep):** "Result: Black was unconvinced."

**Hypothesis**
> "Two evaluations, one search: would the playing 768×2×256 net — trained on 20 million quiet CC0 Lichess cloud evals, depth-12 labels — beat handcrafted PeSTO at the same node budget?"

**Experiment**
> "Same search implementation. Fixed 50 000 nodes a move. The first 100 games on the fifty-opening suite stopped short of a bound (LLR −2.33 vs ±2.94). A continuation wrapped the suite until SPRT hit a bound. H0 = 0 Elo, H1 = +10 Elo."

**Result:** "−143.3 ±35.4 Elo"

**What failed**
> "LEARNED scored 2 wins, 74 draws, 52 losses in 128 games. LLR −2.99 against bounds ±2.94 terminated for H0. Gate A at the same cap was 0.0 Elo (17–66–17, every pair 1–1), so the −143 is not a colour or adjudication artefact. The retrained net lost harder at 50k than the v1 128 did at 1k. Causal ablations that isolate model capacity, training recipe, or features were not run."

**What I learned**
> "A loss at the spec cap is still a result. Do not compare Gate C at 50 000 nodes with the earlier −100 at 1 000 nodes — that was the v1 128. Do not rematch this net: a new net still has to pass the data and progress gates first."

**Figure: Elo by gate**

| Match | Elo | Games |
|---|---|---|
| Gate A · 50k (handcrafted vs itself) | 0.0 | 100 |
| Gate C · 256 | −143.3 | 128 |

**Required changes (the owner confirms the wording)**
1. Disclose that "Learned" means material plus the NNUE output clamped to ±60 centipawns.
2. Present data quality **and** that integration design as candidate causes.
3. Drop the "2200" anchor, or label it as self-estimated.
4. Credit PeSTO (Ronald Friederich), and include the Lichess CC0 statement.
5. Embed or link the playable board with the Handcrafted/Learned toggle, so readers can compare the two evaluations themselves.
6. Link to the match receipts and training provenance if the owner makes them public.

**Repo-only facts the owner may publish:** on the holdout set, the net's correlation is r = 0.64 with Stockfish and r = 0.70 with PeSTO, with a mean absolute error of 168 cp. The net was trained on 20.04 M positions (35.4 M read, minimum depth 12, 3 epochs).

---

## Appendix C: current defects that must not be carried over

These are live issues, found during this audit, in the site the rebuild replaces. Most of them disappear with the CMS.

1. **Draft previews can be publicly cached.** Public HTML is shared-cacheable (`s-maxage=60, stale-while-revalidate=600`) while also depending on the preview cookies, and cached HTML reuses the CSP nonce.
2. **Revoked admin sessions keep working** for up to 8 hours, because admin gating skips the server-side revocation check.
3. **Silent data loss.** A failed read from the content store returns an empty store, and the next publish overwrites all history.
4. **The health endpoint lies.** `/api/cms-health` is public and reports "ok" from environment variables alone, even when the database is down.
5. **Hosting and asset gaps:**
   - The `*.vercel.app` alias serves duplicate content.
   - The 404 page inherits the home page's canonical.
   - The default Next.js favicon ships alongside the real icon.

**Until the rebuild ships:** don't use `/admin`. To end every existing admin session at once, set a new `ADMIN_PASSWORD_HASH` in Vercel; this is optional.
