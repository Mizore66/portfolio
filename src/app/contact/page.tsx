import type { Metadata } from "next";
import { content } from "@/content/site";
import { Contact, type ContactCopy } from "@/components/contact/Contact";

export const metadata: Metadata = { title: "Contact" };

type Copy = { move: string; yourMove: string; resume: string; buttons: string[]; clockLabels: string[]; clockZone: string; clockZoneLabel: string };
const C = (content.pageCopy as unknown as { contact: Copy }).contact;
const I = content.identity as unknown as { email: string; responseTime: string };
const U = content.links as unknown as { linkedin: string; github: string };

export default function Page() {
  const copy: ContactCopy = {
    move: C.move, yourMove: C.yourMove, email: I.email, reply: I.responseTime,
    // contact-a's four: Email, LinkedIn, GitHub, Résumé
    links: [
      { label: C.buttons[0], href: `mailto:${I.email}` },
      { label: C.buttons[2], href: U.linkedin, external: true },
      { label: C.buttons[3], href: U.github, external: true },
      { label: C.resume, href: "/resume" },
    ],
    you: C.clockLabels[0], anas: C.clockLabels[1], zone: C.clockZone, zoneLabel: C.clockZoneLabel,
  };
  return <Contact copy={copy} />;
}
