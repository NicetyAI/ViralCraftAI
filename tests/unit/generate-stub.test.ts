import { describe, expect, it } from "vitest";
import { buildConceptDrafts } from "@/server/concepts/generate-stub";

describe("buildConceptDrafts", () => {
  it("returns exactly the requested count within 2–6", () => {
    const drafts = buildConceptDrafts({
      industry: "SaaS",
      targetAudience: "Entrepreneurs",
      platform: "LinkedIn",
      comedyStyle: "Sarcastic",
      count: 6,
    });
    expect(drafts).toHaveLength(6);
  });

  it("includes card payload for UI", () => {
    const drafts = buildConceptDrafts({
      industry: "SaaS",
      targetAudience: "Entrepreneurs",
      platform: "LinkedIn",
      comedyStyle: "Sarcastic",
      count: 2,
    });
    expect(drafts[0]?.card.formatTag).toContain("Vertical");
    expect(drafts[0]?.card.platformTag).toBe("LinkedIn");
    expect(drafts[0]?.card.hashtags.length).toBeGreaterThan(0);
  });

  it("clamps count to valid range", () => {
    const low = buildConceptDrafts({
      industry: "Retail",
      targetAudience: "Homeowners",
      platform: "Facebook",
      comedyStyle: "Relatable cringe",
      count: 1,
    });
    expect(low.length).toBeGreaterThanOrEqual(2);

    const high = buildConceptDrafts({
      industry: "Retail",
      targetAudience: "Homeowners",
      platform: "Facebook",
      comedyStyle: "Relatable cringe",
      count: 99,
    });
    expect(high).toHaveLength(6);
  });
});
