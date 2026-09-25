import type { Metadata } from "next";
import Link from "next/link";
import { AnalysisBoard } from "@/components/game/AnalysisBoard";
import { CaseSection } from "@/components/site/CaseSection";
import { EloChart } from "@/components/site/EloChart";
import { SiteJsonLd } from "@/components/site/SiteJsonLd";
import { enginePliesTo } from "@/content/site/game-tree";
import { IDENTITY } from "@/content/site/identity";
import { LAB_ARTICLE as A } from "@/content/site/lab";
import { SITE_URL } from "@/lib/site";

const PATH = "/lab/learned-evaluator";

export const metadata: Metadata = {
  title: "The learned evaluator lost to PeSTO by 143 Elo · Anas Qumhiyeh",
  description: A.description,
  alternates: { canonical: PATH },
  openGraph: { title: A.title, description: A.description, type: "article", url: PATH, publishedTime: A.datePublished, modifiedTime: A.dateModified },
  twitter: { card: "summary_large_image", title: A.title, description: A.description },
};

export default function LearnedEvaluatorPage() {
  return (
    <main id="main" className="case">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <ol>
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/#lab">Lab</Link>
          </li>
          <li aria-current="page">Learned evaluator</li>
        </ol>
      </nav>
      <header className="case-header">
        <p className="card-meta">
          <span>Published 29 Aug 2026</span>
          <span>SPRT continued 3 Sep 2026</span>
        </p>
        <h1 className="case-title lab-title">{A.title}</h1>
        <p className="case-purpose">{A.dek}</p>
        <p className="claim-value lab-result">{A.resultLine}</p>
        <p className="annotation">{A.tagline}</p>
      </header>

      <CaseSection id="hypothesis" title="Hypothesis">
        <p>{A.hypothesis}</p>
        <p className="note">
          What “Learned” means here: {A.disclosure.replace(/^What was tested as “Learned” is not the net alone: /, "")}
        </p>
      </CaseSection>
      <CaseSection id="experiment" title="Experiment">
        <p>{A.experiment}</p>
        <p className="note">
          Net <span className="claim-value">{A.netId}</span>, opening suite <span className="claim-value">{A.suiteId}</span>.
        </p>
      </CaseSection>
      <CaseSection id="result" title="Result">
        <p className="case-purpose">
          <span className="claim-value">{A.result}</span> <span className="claim-type">Controlled benchmark</span>
        </p>
        <EloChart gates={A.gates} />
      </CaseSection>
      <CaseSection id="failed" title="What failed">
        <p>{A.failed}</p>
        <p>{A.causes}</p>
      </CaseSection>
      <CaseSection id="learned" title="What I learned">
        <p>{A.learned}</p>
      </CaseSection>
      <CaseSection id="try-it" title="Compare the two evaluations">
        <p>
          The same board and search as the match. Start the engine, then switch between Handcrafted and Learned to see where they
          disagree.
        </p>
        <AnalysisBoard basePlies={enginePliesTo("d4")} positionKey="lab-d4" label="Position after 5. d4" initialMode="learned" size="wide" />
      </CaseSection>
      <CaseSection id="credits" title="Credits">
        <ul className="role-bullets">
          {A.credits.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </CaseSection>
      <SiteJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: A.title,
          description: A.description,
          datePublished: A.datePublished,
          dateModified: A.dateModified,
          url: `${SITE_URL}${PATH}`,
          author: { "@type": "Person", name: IDENTITY.legalName, url: SITE_URL },
        }}
      />
    </main>
  );
}
