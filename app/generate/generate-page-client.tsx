"use client";

import type { ConceptCardPayload } from "@/server/concepts/concept-card-types";
import {
  CONCEPT_CARD_VERSION,
  isConceptCardPayload,
} from "@/server/concepts/concept-card-types";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConceptCard } from "./concept-card";

const INDUSTRIES = [
  "Home services & HVAC",
  "Real estate",
  "Legal & professional services",
  "Healthcare & dental",
  "Fitness & wellness",
  "Food & beverage",
  "SaaS & B2B",
  "E-commerce & retail",
  "Automotive",
  "Finance & insurance",
  "Beauty & personal care",
  "Education & coaching",
] as const;

const AUDIENCES = [
  "Homeowners",
  "Small business owners",
  "Seniors/families",
  "Young professionals",
  "First-time homebuyers",
  "Property managers",
  "Couples/families",
  "Entrepreneurs",
] as const;

const PLATFORMS = [
  { id: "TikTok / Reels" as const, label: "TikTok / Reels", icon: "🎵" },
  { id: "YouTube Shorts" as const, label: "YouTube Shorts", icon: "▶️" },
  { id: "Facebook" as const, label: "Facebook", icon: "📘" },
  { id: "LinkedIn" as const, label: "LinkedIn", icon: "💼" },
];

const COMEDY_CARDS = [
  {
    value: "Relatable cringe" as const,
    emoji: "🎭",
    label: "Relatable cringe",
  },
  { value: "Sarcastic" as const, emoji: "😏", label: "Sarcastic" },
  {
    value: "Absurdist / exaggerated" as const,
    emoji: "🌀",
    label: "Absurdist / exaggerated",
  },
  { value: "Before vs after" as const, emoji: "🔄", label: "Before vs after" },
  {
    value: "Day-in-life parody" as const,
    emoji: "🎬",
    label: "Day-in-life parody",
  },
  {
    value: "Dramatic reenactment" as const,
    emoji: "🎤",
    label: "Dramatic reenactment",
  },
];

type ApiConcept = {
  id: string;
  title: string;
  summary: string | null;
  status: string;
  createdAt: string;
  metadata: unknown;
};

type Stage = 1 | 2 | 3 | 4;

function fallbackCard(c: ApiConcept): ConceptCardPayload {
  return {
    v: CONCEPT_CARD_VERSION,
    formatTag: "15–30s · Vertical",
    platformTag: "—",
    openingHook: `“${c.title.slice(0, 200)}${c.title.length > 200 ? "…" : ""}”`,
    sceneDirection: c.summary ?? "Scene direction will appear here.",
    captionPreview: `${c.title} 🔥 Save this angle.`,
    hashtags: ["#viralcraft", "#concepts", "#agency"],
    whyItWorks:
      "Hooks a recognizable pain point, then delivers a twist that fits native short-form pacing.",
  };
}

function getCard(c: ApiConcept): ConceptCardPayload {
  if (isConceptCardPayload(c.metadata)) {
    return c.metadata;
  }
  return fallbackCard(c);
}

export function GeneratePageClient() {
  const [stage, setStage] = useState<Stage>(1);
  const [industryKey, setIndustryKey] = useState<string>(INDUSTRIES[0]!);
  const [customIndustryOpen, setCustomIndustryOpen] = useState(false);
  const [industryCustom, setIndustryCustom] = useState("");
  const [targetAudience, setTargetAudience] =
    useState<(typeof AUDIENCES)[number]>("Homeowners");
  const [platform, setPlatform] =
    useState<(typeof PLATFORMS)[number]["id"]>("TikTok / Reels");
  const [comedyStyle, setComedyStyle] =
    useState<(typeof COMEDY_CARDS)[number]["value"]>("Relatable cringe");
  const [painPoints, setPainPoints] = useState("");
  const [conceptCount, setConceptCount] = useState<2 | 4 | 6>(4);

  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [activeClientName, setActiveClientName] = useState<string | null>(
    null,
  );
  const [clientsLoading, setClientsLoading] = useState(true);

  const [concepts, setConcepts] = useState<ApiConcept[]>([]);
  const [videoConceptId, setVideoConceptId] = useState<string | null>(null);
  const [contentConceptId, setContentConceptId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadClients = useCallback(async () => {
    setClientsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients", { cache: "no-store" });
      if (!res.ok) {
        setActiveClientId(null);
        setActiveClientName(null);
        return;
      }
      const data = (await res.json()) as {
        clients: Array<{ id: string; name: string }>;
        activeClientId: string | null;
      };
      setActiveClientId(data.activeClientId);
      const name = data.clients.find((c) => c.id === data.activeClientId)
        ?.name;
      setActiveClientName(name ?? null);
    } catch {
      setActiveClientId(null);
      setActiveClientName(null);
    } finally {
      setClientsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const industryEffective = customIndustryOpen
    ? industryCustom.trim()
    : industryKey;

  const previewLines = useMemo(
    () => [
      { k: "Industry / service", v: industryEffective || "—" },
      { k: "Audience", v: targetAudience },
      { k: "Platform", v: platform },
      { k: "Comedy style", v: comedyStyle },
      {
        k: "Pain points",
        v: painPoints.trim() || "Optional — add for sharper jokes",
      },
      { k: "Concept count", v: String(conceptCount) },
    ],
    [
      comedyStyle,
      conceptCount,
      industryEffective,
      painPoints,
      platform,
      targetAudience,
    ],
  );

  const visibleConcepts = useMemo(
    () => concepts.filter((c) => c.status !== "ARCHIVED"),
    [concepts],
  );

  const videoConcept = concepts.find((c) => c.id === videoConceptId);
  const contentConcept = concepts.find((c) => c.id === contentConceptId);

  async function patchConceptStatus(id: string, status: "ACTIVE" | "ARCHIVED") {
    const res = await fetch(`/api/concepts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      concept?: ApiConcept;
    };
    if (!res.ok) {
      setError(data.error ?? "Could not update concept.");
      return;
    }
    if (data.concept) {
      setConcepts((prev) =>
        prev.map((c) => (c.id === id ? data.concept! : c)),
      );
    }
  }

  async function onGenerate() {
    setError(null);
    if (!activeClientId) {
      setError("Select an active client in the header before generating.");
      return;
    }
    if (customIndustryOpen && !industryCustom.trim()) {
      setError('Add a custom industry or turn off "+ Custom".');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/generate-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: activeClientId,
          industry: industryKey,
          industryIsCustom: customIndustryOpen,
          industryCustom: customIndustryOpen ? industryCustom : undefined,
          targetAudience,
          platform,
          comedyStyle,
          painPoints: painPoints.trim() || undefined,
          conceptCount,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        concepts?: ApiConcept[];
      };
      if (!res.ok) {
        setError(data.error ?? "Generation failed.");
        return;
      }
      setConcepts(data.concepts ?? []);
      setVideoConceptId(null);
      setContentConceptId(null);
      setStage(2);
    } catch {
      setError("Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  const stageTitle =
    stage === 1
      ? "Input"
      : stage === 2
        ? "Concept cards"
        : stage === 3
          ? "Generate video"
          : "Generate content";

  function resetAll() {
    setStage(1);
    setConcepts([]);
    setVideoConceptId(null);
    setContentConceptId(null);
    setError(null);
  }

  return (
    <div className="relative min-h-screen bg-stone-100">
      {submitting && stage === 1 ? (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-stone-900/60 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600" />
          <p className="mt-6 font-serif text-xl font-semibold text-white">
            Generating concepts…
          </p>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-stone-900">
              Concept engine
            </h1>
            <p className="mt-1 text-stone-600">
              Stage {stage} of 4 — <span className="font-medium">{stageTitle}</span>
            </p>
          </div>
          {stage > 1 ? (
            <button
              className="text-sm font-medium text-blue-700 hover:underline"
              onClick={resetAll}
              type="button"
            >
              ← Start over
            </button>
          ) : null}
        </div>

        {stage === 1 ? (
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:p-8">
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                Brief
              </h2>

              <div className="mt-6 space-y-8">
                <section>
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                    Industry / service
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {INDUSTRIES.map((ind) => (
                      <button
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          !customIndustryOpen && industryKey === ind
                            ? "border-amber-600 bg-amber-50 text-amber-950"
                            : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300"
                        }`}
                        key={ind}
                        onClick={() => {
                          setIndustryKey(ind);
                          setCustomIndustryOpen(false);
                        }}
                        type="button"
                      >
                        {ind}
                      </button>
                    ))}
                    <button
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        customIndustryOpen
                          ? "border-amber-600 bg-amber-50 text-amber-950"
                          : "border-dashed border-stone-300 bg-white text-stone-600 hover:border-amber-400"
                      }`}
                      onClick={() => setCustomIndustryOpen((v) => !v)}
                      type="button"
                    >
                      + Custom
                    </button>
                  </div>
                  {customIndustryOpen ? (
                    <input
                      className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none ring-amber-500 focus:ring-2"
                      onChange={(e) => setIndustryCustom(e.target.value)}
                      placeholder="Describe your niche…"
                      value={industryCustom}
                    />
                  ) : null}
                </section>

                <section>
                  <label
                    className="text-xs font-bold uppercase tracking-widest text-stone-500"
                    htmlFor="audience"
                  >
                    Target audience
                  </label>
                  <select
                    className="mt-3 w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 outline-none ring-amber-500 focus:ring-2"
                    id="audience"
                    onChange={(e) =>
                      setTargetAudience(e.target.value as (typeof AUDIENCES)[number])
                    }
                    value={targetAudience}
                  >
                    {AUDIENCES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </section>

                <section>
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                    Platform
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {PLATFORMS.map((p) => (
                      <button
                        className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition ${
                          platform === p.id
                            ? "border-amber-600 bg-amber-50 text-amber-950"
                            : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300"
                        }`}
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        type="button"
                      >
                        <span aria-hidden>{p.icon}</span>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                    Comedy style
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {COMEDY_CARDS.map((c) => (
                      <button
                        className={`flex items-start gap-3 rounded-2xl border p-4 text-left text-sm transition ${
                          comedyStyle === c.value
                            ? "border-amber-600 bg-amber-50 shadow-sm"
                            : "border-stone-200 bg-stone-50 hover:border-stone-300"
                        }`}
                        key={c.value}
                        onClick={() => setComedyStyle(c.value)}
                        type="button"
                      >
                        <span className="text-2xl leading-none" aria-hidden>
                          {c.emoji}
                        </span>
                        <span className="font-medium text-stone-900">
                          {c.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label
                    className="text-xs font-bold uppercase tracking-widest text-stone-500"
                    htmlFor="pain"
                  >
                    Specific pain points{" "}
                    <span className="font-normal normal-case text-stone-400">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    className="mt-3 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm text-stone-900 outline-none ring-amber-500 focus:ring-2"
                    id="pain"
                    onChange={(e) => setPainPoints(e.target.value)}
                    placeholder="Describe frustrations your audience commonly faces…"
                    rows={4}
                    value={painPoints}
                  />
                </section>

                <section>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                      Concepts to generate
                    </p>
                    <span className="font-serif text-2xl font-bold text-amber-800">
                      {conceptCount}
                    </span>
                  </div>
                  <input
                    className="mt-3 h-2 w-full cursor-pointer accent-amber-600"
                    max={6}
                    min={2}
                    onChange={(e) =>
                      setConceptCount(Number(e.target.value) as 2 | 4 | 6)
                    }
                    step={2}
                    type="range"
                    value={conceptCount}
                  />
                  <div className="mt-1 flex justify-between text-xs text-stone-500">
                    <span>2</span>
                    <span>4</span>
                    <span>6</span>
                  </div>
                </section>

                <section className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
                    Active client
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {clientsLoading ? (
                      <span className="text-sm text-stone-500">Loading…</span>
                    ) : activeClientId && activeClientName ? (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-950">
                        {activeClientName}
                      </span>
                    ) : (
                      <span className="text-sm text-amber-800">
                        No active client — use the header switcher.
                      </span>
                    )}
                  </div>
                </section>

                {error ? (
                  <p className="text-sm text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  className="w-full rounded-2xl bg-amber-500 py-4 text-center text-base font-bold tracking-wide text-stone-900 shadow-md transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={
                    submitting ||
                    clientsLoading ||
                    !activeClientId ||
                    (customIndustryOpen && !industryCustom.trim())
                  }
                  onClick={() => void onGenerate()}
                  type="button"
                >
                  Generate Concepts →
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/80 p-6 lg:p-8">
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                Live preview
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                Your selections summarized — cards appear in Stage 2 after
                generate.
              </p>
              <ul className="mt-8 space-y-4">
                {previewLines.map((line) => (
                  <li
                    className="border-b border-stone-100 pb-4 last:border-0"
                    key={line.k}
                  >
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">
                      {line.k}
                    </p>
                    <p className="mt-1 text-sm font-medium text-stone-800">
                      {line.v}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {stage === 2 ? (
          <div>
            <p className="mb-6 max-w-2xl text-stone-600">
              Review each concept. Use the menu to save or discard. Generate
              video or content independently — each opens its own stage.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {visibleConcepts.map((c, idx) => (
                <ConceptCard
                  card={getCard(c)}
                  index={idx}
                  key={c.id}
                  onDiscard={() => void patchConceptStatus(c.id, "ARCHIVED")}
                  onGenerateContent={() => {
                    setContentConceptId(c.id);
                    setStage(4);
                  }}
                  onGenerateVideo={() => {
                    setVideoConceptId(c.id);
                    setStage(3);
                  }}
                  onSave={() => void patchConceptStatus(c.id, "ACTIVE")}
                  title={c.title}
                />
              ))}
            </div>
            {visibleConcepts.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
                No concepts left — generate again from Stage 1.
              </p>
            ) : null}
          </div>
        ) : null}

        {stage === 3 && videoConcept ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:p-8">
            <h2 className="font-serif text-2xl font-semibold text-stone-900">
              Stage 3 — Generate video
            </h2>
            <p className="mt-1 text-stone-600">
              KIE / video pipeline will plug in here. Working concept:{" "}
              <span className="font-medium text-stone-800">
                {videoConcept.title}
              </span>
            </p>
            <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-950">
              <p className="font-medium">Preview fields (from card)</p>
              <p className="mt-2 text-amber-900/90">
                {getCard(videoConcept).formatTag} ·{" "}
                {getCard(videoConcept).platformTag}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-stone-900 hover:bg-amber-400"
                type="button"
              >
                Start video job (coming soon)
              </button>
              <button
                className="rounded-xl border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
                onClick={() => {
                  setStage(2);
                  setVideoConceptId(null);
                }}
                type="button"
              >
                Back to concept cards
              </button>
            </div>
          </div>
        ) : null}

        {stage === 4 && contentConcept ? (
          <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm lg:p-8">
            <h2 className="font-serif text-2xl font-semibold text-stone-900">
              Stage 4 — Generate content
            </h2>
            <p className="mt-1 text-stone-600">
              Captions, hashtags, and 30-day schedule will wire here. Concept:{" "}
              <span className="font-medium text-stone-800">
                {contentConcept.title}
              </span>
            </p>
            <div className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6 text-sm text-blue-950">
              <p className="font-medium">Caption preview</p>
              <p className="mt-2 whitespace-pre-wrap text-blue-900/90">
                {getCard(contentConcept).captionPreview}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                className="rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800"
                type="button"
              >
                Generate content pack (coming soon)
              </button>
              <button
                className="rounded-xl border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
                onClick={() => {
                  setStage(2);
                  setContentConceptId(null);
                }}
                type="button"
              >
                Back to concept cards
              </button>
            </div>
          </div>
        ) : null}

        {stage === 3 && !videoConcept ? (
          <p className="text-stone-600">
            Concept not found.{" "}
            <button
              className="font-medium text-blue-700 underline"
              onClick={() => setStage(2)}
              type="button"
            >
              Back
            </button>
          </p>
        ) : null}
        {stage === 4 && !contentConcept ? (
          <p className="text-stone-600">
            Concept not found.{" "}
            <button
              className="font-medium text-blue-700 underline"
              onClick={() => setStage(2)}
              type="button"
            >
              Back
            </button>
          </p>
        ) : null}
      </div>
    </div>
  );
}
