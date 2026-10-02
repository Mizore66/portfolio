import { heroProps, rolesProps, workProps, labProps, contactProps } from "@/content/pages";
import { Hero } from "@/components/hero/Hero";
import { RolesIndex } from "@/components/roles/RolesIndex";
import { WorkIndex } from "@/components/work/WorkIndex";
import { Others } from "@/components/work/Others";
import { Lab } from "@/components/lab/Lab";
import { Contact } from "@/components/contact/Contact";
import { OnePage } from "@/components/home/OnePage";

/**
 * The one page (owner direction, 2026-09-29): Hero, Roles, Work, the Lab's opening and Play, and Contact, reached by
 * the nav or by scrolling. Each section keeps its approved key frame; the seam follows the scroll between them.
 */
export default function Home() {
  const w = workProps(), lab = labProps();
  return (
    <main id="main" tabIndex={-1} className="home">
      <OnePage />
      <Hero {...heroProps()} />
      <RolesIndex {...rolesProps()} />
      <WorkIndex pieces={w.pieces} />
      <Others {...w.others} />
      <Lab copy={lab.copy} tree={lab.tree} section />
      <Contact copy={contactProps()} />
    </main>
  );
}
