/** Stable fragment ids for desks a recruiter might deep-link. `#setel` stays `#setel`. */
export function companyAnchor(company: string): string {
  return company
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
