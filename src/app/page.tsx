import { content } from "@/content/site";
import { Hero } from "@/components/hero/Hero";

export default function Home() {
  const [first, ...rest] = content.identity.displayName.split(" ");
  const h = content.identity.heroHeadline, cut = h.indexOf(" survive");
  return (
    <main>
      <Hero first={first} last={rest.join(" ")} headline={[h.slice(0, cut), h.slice(cut + 1)]} />
    </main>
  );
}
