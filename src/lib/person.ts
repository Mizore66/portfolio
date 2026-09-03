import { LAB_ARTICLE } from "@/content/learned-evaluator";
import { resumeData } from "@/lib/data";
import { filedYearMonth } from "@/lib/filed";
import { exhibitTitle } from "@/lib/metrics";
import { SITE_URL } from "@/lib/site";

export const PERSON_NAME = "Anas Tarek Qumhiyeh";
export const PERSON_ALT_NAME = "Anas T. Qumhiyeh";

/** Handwritten. The sentence Google shows recruiters. */
export const META_DESCRIPTION =
  "The annotated career of Anas T. Qumhiyeh. Software engineer building payment, laboratory, and retrieval systems.";

export function personJsonLd(opts?: { jobTitle?: string; location?: string }) {
  const jobTitle = opts?.jobTitle || resumeData.headline;
  const location = opts?.location || resumeData.education.location;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: PERSON_NAME,
    alternateName: PERSON_ALT_NAME,
    url: SITE_URL,
    image: `${SITE_URL}/opengraph-image`,
    email: `mailto:${resumeData.email}`,
    jobTitle,
    description: resumeData.headline,
    homeLocation: {
      "@type": "Place",
      name: location,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bandar Sunway",
        addressRegion: "Selangor",
        addressCountry: "MY",
      },
    },
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

function projectDate(filed: string): string | undefined {
  return filedYearMonth(filed);
}

export function projectJsonLd(project: {
  name: string;
  slug: string;
  subtitle: string;
  meta: string;
  github: string;
  date: string;
}) {
  const author = {
    "@type": "Person" as const,
    name: PERSON_NAME,
    alternateName: PERSON_ALT_NAME,
  };
  const dateCreated = projectDate(project.date);
  if (project.github) {
    return {
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      name: exhibitTitle(project),
      description: project.meta,
      url: `${SITE_URL}/projects/${project.slug}`,
      codeRepository: project.github,
      author,
      ...(dateCreated ? { dateCreated, datePublished: dateCreated } : {}),
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: exhibitTitle(project),
    description: project.meta,
    url: `${SITE_URL}/projects/${project.slug}`,
    author,
    ...(dateCreated ? { dateCreated, datePublished: dateCreated } : {}),
  };
}

export function labArticleJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: LAB_ARTICLE.hed,
    description: LAB_ARTICLE.meta,
    datePublished: LAB_ARTICLE.datePublished,
    url: `${SITE_URL}${LAB_ARTICLE.href}`,
    author: {
      "@type": "Person",
      name: PERSON_NAME,
      alternateName: PERSON_ALT_NAME,
    },
  };
}
