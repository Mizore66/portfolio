import { BoardBox } from "@/components/board/BoardBox";
import { LATEST_MOVE } from "@/content/site/game";
import { sectionNotation } from "@/content/site/sections";
import type { Identity } from "@/content/site/types";
import { BoardDiagram } from "@/lib/board/page";
import { ChessClock } from "./ChessClock";
import { CopyEmailButton } from "./CopyEmailButton";
import { SectionTitle } from "./SectionTitle";

/**
 * The ending (brief §4): the game's unfinished position, "your move". The
 * contact copy is the 11. … row of a scoresheet that arrives tilted and
 * settles as it scrolls in (from Illoca's folders; a CSS scroll-driven
 * animation, so no script); the board comes in at a low, raking angle
 * with White to move; a chess clock shows the visitor's time running and
 * Anas's in Malaysia (from Revelatio's two time zones).
 */
export function Contact({ identity }: { identity: Identity }) {
  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="scoresheet">
        <SectionTitle id="contact-title" {...sectionNotation("contact")}>
          {identity.contactHeading}
        </SectionTitle>
        <p>{identity.availability}</p>
        <ul className="inline-list">
          <li>{identity.location}</li>
          {identity.status.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <p className="note">{identity.responseTime}</p>
        <p className="contact-lines">
          <span className="claim-value">{identity.email}</span>
          <a href={`tel:${identity.phone.tel}`}>{identity.phone.display}</a>
        </p>
        <div className="hero-actions">
          <a className="btn btn-primary" href={`mailto:${identity.email}`} data-cursor="piece">
            Email
          </a>
          <CopyEmailButton email={identity.email} />
          <a className="btn" href={identity.linkedin} target="_blank" rel="me noopener noreferrer" data-cursor="piece">
            LinkedIn<span className="sr-only"> (opens in new tab)</span>
          </a>
          <a className="btn" href={identity.github} target="_blank" rel="me noopener noreferrer" data-cursor="piece">
            GitHub<span className="sr-only"> (opens in new tab)</span>
          </a>
        </div>
        <p className="resume-links">
          Résumé as PDF: <a href="/print-edition">US Letter</a> or <a href="/print-edition?paper=a4">A4</a>
        </p>
      </div>
      <div className="contact-board">
        <BoardBox id="contact-board" framing="raking" binding={{ kind: "fixed", nodeId: LATEST_MOVE }} initialNode={LATEST_MOVE}>
          <BoardDiagram />
        </BoardBox>
        <ChessClock zone="Asia/Kuala_Lumpur" name={identity.displayName.split(" ")[0]} />
      </div>
    </section>
  );
}
