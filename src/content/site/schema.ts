import { SITE_URL } from "@/lib/site";
import { EDUCATION } from "./education";
import { IDENTITY } from "./identity";

export function personSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: IDENTITY.legalName,
    alternateName: IDENTITY.displayName,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    email: `mailto:${IDENTITY.email}`,
    telephone: IDENTITY.phone.tel,
    jobTitle: IDENTITY.currentRole.title,
    worksFor: { "@type": "Organization", name: IDENTITY.currentRole.employer },
    description: IDENTITY.summary,
    homeLocation: {
      "@type": "Place",
      name: IDENTITY.location,
      address: { "@type": "PostalAddress", addressLocality: "Bandar Sunway", addressRegion: "Selangor", addressCountry: "MY" },
    },
    alumniOf: { "@type": "CollegeOrUniversity", name: EDUCATION.institution },
    sameAs: [IDENTITY.github, IDENTITY.linkedin.replace(/\/$/, "")],
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: IDENTITY.displayName,
    url: SITE_URL,
    author: { "@type": "Person", name: IDENTITY.legalName },
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
