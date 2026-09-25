import { expect, test } from "@playwright/test";

test.describe("round four artifacts", () => {
  test("the résumé is not cached for an hour", async ({ request }) => {
    const pdf = await request.get("/print-edition");
    expect(pdf.ok()).toBe(true);
    expect(pdf.headers()["cache-control"]).toMatch(/no-store/);
    expect(pdf.headers().etag).toMatch(/resume-/);
  });
});

