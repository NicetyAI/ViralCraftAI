export const CONCEPT_CARD_VERSION = 1 as const;

export type ConceptCardPayload = {
  v: typeof CONCEPT_CARD_VERSION;
  formatTag: string;
  platformTag: string;
  openingHook: string;
  sceneDirection: string;
  captionPreview: string;
  hashtags: string[];
  whyItWorks: string;
};

export function isConceptCardPayload(
  value: unknown,
): value is ConceptCardPayload {
  if (!value || typeof value !== "object") {
    return false;
  }
  const o = value as Record<string, unknown>;
  return (
    o.v === CONCEPT_CARD_VERSION &&
    typeof o.formatTag === "string" &&
    typeof o.platformTag === "string" &&
    typeof o.openingHook === "string" &&
    typeof o.sceneDirection === "string" &&
    typeof o.captionPreview === "string" &&
    Array.isArray(o.hashtags) &&
    typeof o.whyItWorks === "string"
  );
}
