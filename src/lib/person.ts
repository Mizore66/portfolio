import { resumeData } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export const PERSON_NAME = "Anas Tarek Qumhiyeh";
export const PERSON_ALT_NAME = "Anas T. Qumhiyeh";

/** Handwritten. The sentence Google shows recruiters. */
export const META_DESCRIPTION =
  "The annotated career of Anas T. Qumhiyeh. Software engineer focused on ML infrastructure and data-intensive systems.";

export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PERSON_NAME,
    alternateName: PERSON_ALT_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    email: `mailto:${resumeData.email}`,
    jobTitle: "Software engineer",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: resumeData.education.school,
    },
    sameAs: [`https://${resumeData.github}`, `https://${resumeData.linkedin.replace(/\/$/, "")}`],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Opening Preparation",
    url: SITE_URL,
    description: META_DESCRIPTION,
    author: {
      "@type": "Person",
      name: PERSON_NAME,
      alternateName: PERSON_ALT_NAME,
    },
  };
}
