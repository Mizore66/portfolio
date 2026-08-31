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

function projectDate(filed: string): string | undefined {
  const t = Date.parse(`${filed} 1`);
  if (Number.isNaN(t)) return undefined;
  return new Date(t).toISOString().slice(0, 7);
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
      name: `${project.name} — ${project.subtitle}`,
      description: project.meta,
      url: `${SITE_URL}/projects/${project.slug}`,
      codeRepository: project.github,
      author,
      ...(dateCreated ? { dateCreated } : {}),
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${project.name} — ${project.subtitle}`,
    description: project.meta,
    url: `${SITE_URL}/projects/${project.slug}`,
    author,
    ...(dateCreated ? { dateCreated } : {}),
  };
}
