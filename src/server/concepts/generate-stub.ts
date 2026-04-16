export type GenerateConceptInputs = {
  industry: string;
  targetAudience: string;
  platform: string;
  comedyStyle: string;
  painPoints?: string;
  count: number;
};

const hooks = [
  "POV: Your {audience} finally snaps (in the funniest way possible)",
  "Nobody talks about this {industry} truth… until now",
  "If {industry} had honest commercials — Part {n}",
  "The {audience} group chat after one too many headaches",
  "Tell me you're in {industry} without telling me you're in {industry}",
  "This {industry} 'life hack' is technically legal. Emotionally? Debatable.",
];

const beats = [
  "Open with an impossibly relatable cold open, escalate with one absurd visual metaphor, land on a punchy CTA.",
  "Start mid-meltdown, rewind 3 seconds, reveal the tiny fix that changes everything.",
  "Use deadpan VO while on-screen chaos gets progressively more theatrical.",
  "Fake tutorial energy: confident steps, zero actual competence, heroic confidence anyway.",
];

export function buildConceptDrafts(
  input: GenerateConceptInputs,
): Array<{ title: string; summary: string }> {
  const { industry, targetAudience, platform, comedyStyle, painPoints } =
    input;
  const count = Math.min(6, Math.max(2, input.count));
  const pain = painPoints?.trim()
    ? ` Audience gripe we lean into: "${painPoints.trim().slice(0, 280)}".`
    : "";

  const out: Array<{ title: string; summary: string }> = [];
  for (let i = 0; i < count; i++) {
    const hookTpl = hooks[i % hooks.length]!;
    const title = hookTpl
      .replace(/\{audience\}/g, targetAudience.toLowerCase())
      .replace(/\{industry\}/g, industry)
      .replace(/\{n\}/g, String(i + 1));

    const beat = beats[i % beats.length]!;
    const summary = [
      `**Format:** ${platform} native vertical, ~15–30s.`,
      `**Comedy angle:** ${comedyStyle}.`,
      `**Beat:** ${beat}`,
      `**Brand context:** ${industry} for ${targetAudience}.${pain}`,
    ].join("\n");

    out.push({ title, summary });
  }
  return out;
}
