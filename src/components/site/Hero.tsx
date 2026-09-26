import type { Identity } from "@/content/site/types";

export function Hero({ identity }: { identity: Identity }) {
  return (
    <section id="proof" className="hero" aria-labelledby="hero-statement">
      <h1 id="hero-statement" className="hero-statement">{identity.heroHeadline}</h1>
      <p className="hero-subline">{identity.heroSubline}</p>
      <p className="hero-status">{identity.availability}</p>
      <div className="hero-actions">
        <a className="btn btn-primary" href="#work">See the work</a>
        <a className="btn" href="#contact">Contact</a>
      </div>
    </section>
  );
}
