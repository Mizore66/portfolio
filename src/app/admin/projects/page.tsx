import { AdminFrame } from "@/app/admin/layout";
import { resumeData } from "@/lib/data";

export default async function ProjectsEditor() {
  return (
    <AdminFrame title="Projects">
      <p className="max-w-[62ch] font-display text-[16px] text-ink">
        Project exhibits still compile from the published claim rows and the structured filings.
        Edit purpose and impact on the public ledger after the matching claim is valid; do not paste
        the same percentage into five fields.
      </p>
      <ul className="mt-6 space-y-3">
        {resumeData.projects.map((project) => (
          <li key={project.slug} className="border-2 border-ink p-4">
            <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-faded">{project.slug}</p>
            <p className="mt-1 font-display text-[18px]">{project.name}</p>
            <p className="mt-2 font-lora text-[15px]">{project.purpose}</p>
            <p className="metric-row mt-2">{project.impact}</p>
          </li>
        ))}
      </ul>
    </AdminFrame>
  );
}
