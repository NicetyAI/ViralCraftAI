import type { ConceptCardPayload } from "@/server/concepts/concept-card-types";
import { CONCEPT_CARD_VERSION } from "@/server/concepts/concept-card-types";

export type GenerateConceptInputs = {
  industry: string;
  targetAudience: string;
  platform: string;
  comedyStyle: string;
  painPoints?: string;
  count: number;
};

export type ConceptDraft = {
  title: string;
  summary: string;
  card: ConceptCardPayload;
};

const hooks = [
  "POV: Your {audience} finally snaps — we have receipts",
  "Nobody talks about this {industry} truth… until now",
  "If {industry} had honest commercials — Part {n}",
  "The {audience} group chat after one too many headaches",
  "Tell me you're in {industry} without telling me you're in {industry}",
  "This {industry} life hack is technically legal; emotionally, debatable",
];

const sceneBodies = [
  "Cold open: relatable frustration in 2 seconds. Cut to an over-the-top metaphor (props optional). One deadpan line of VO. End on logo + CTA with zero shame.",
  "Start mid-meltdown. Rewind 3 seconds. Reveal the tiny fix that changes everything — filmed like a prestige drama trailer.",
  "Fake tutorial: confident steps, chaotic B-roll, heroic confidence anyway. Final beat: audience realizes they've been roasted lovingly.",
  "Day-in-life parody: mundane tasks shot like a heist movie. Montage lands on a single punchline tied to your offer.",
];

function platformTag(platform: string): string {
  const map: Record<string, string> = {
    "TikTok / Reels": "TikTok",
    "YouTube Shorts": "Shorts",
    Facebook: "Facebook",
    LinkedIn: "LinkedIn",
  };
  return map[platform] ?? platform;
}

function buildHashtags(
  industry: string,
  comedyStyle: string,
  platform: string,
  i: number,
): string[] {
  const slug = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 24) || "brand";
  return [
    `#${slug(industry)}humor`,
    `#${slug(comedyStyle)}`,
    `#${slug(platform)}${i + 1}`,
  ];
}

export function buildConceptDrafts(input: GenerateConceptInputs): ConceptDraft[] {
  const { industry, targetAudience, platform, comedyStyle, painPoints } =
    input;
  const count = Math.min(6, Math.max(2, input.count));
  const pain = painPoints?.trim()
    ? ` We lean into: "${painPoints.trim().slice(0, 200)}".`
    : "";

  const out: ConceptDraft[] = [];
  for (let i = 0; i < count; i++) {
    const hookTpl = hooks[i % hooks.length]!;
    const title = hookTpl
      .replace(/\{audience\}/g, targetAudience.toLowerCase())
      .replace(/\{industry\}/g, industry)
      .replace(/\{n\}/g, String(i + 1));

    const openingHook = `“${title.length > 160 ? `${title.slice(0, 157)}…` : title}”`;
    const sceneDirection = `${sceneBodies[i % sceneBodies.length]!} Brand: ${industry} for ${targetAudience}.${pain}`;

    const captionPreview = `${title.split("—")[0]?.trim() ?? title} 😮‍💨✨ Drop a 🔥 if you've been there. ${platformTag(platform)} energy — sound on.`;

    const hashtags = buildHashtags(industry, comedyStyle, platform, i);

    const whyItWorks = `The joke lands because it mirrors a real ${targetAudience.toLowerCase()} moment, then twists it with ${comedyStyle.toLowerCase()} timing — perfect for ${platform.split("/")[0]?.trim() ?? platform} scroll-stops.`;

    const card: ConceptCardPayload = {
      v: CONCEPT_CARD_VERSION,
      formatTag: "15–30s · Vertical",
      platformTag: platformTag(platform),
      openingHook,
      sceneDirection,
      captionPreview,
      hashtags,
      whyItWorks,
    };

    const summary = [
      card.formatTag,
      card.platformTag,
      `Hook: ${openingHook}`,
      `Scene: ${sceneDirection.slice(0, 240)}…`,
    ].join("\n");

    out.push({ title, summary, card });
  }
  return out;
}
