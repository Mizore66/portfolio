import type { Identity } from "@/content/site/types";

export function About({ identity }: { identity: Identity }) {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <h2 id="about-title">About</h2>
      {identity.about.map((para) => (
        <p key={para}>{para}</p>
      ))}
    </section>
  );
}
