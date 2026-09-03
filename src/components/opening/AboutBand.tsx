import { getRenderableDocument } from "@/lib/cms/store";
import { POSITIONING } from "@/lib/metrics";

export async function AboutBand() {
  const site = await getRenderableDocument();
  return (
    <section id="about" data-testid="about-band" className="recruiter-band" aria-labelledby="about-heading">
      <p className="band-kicker">About</p>
      <h2 id="about-heading" className="band-title">
        {POSITIONING.aboutHeading}
      </h2>
      <p className="mt-4 max-w-[68ch] font-mono text-[12px] uppercase tracking-[0.08em] text-faded">
        {POSITIONING.seniority}
      </p>
      <p className="mt-6 max-w-[68ch] font-lora text-[16px] leading-[1.7] text-ink">
        {site.profile.followerBio || POSITIONING.followerBio}
      </p>
    </section>
  );
}
