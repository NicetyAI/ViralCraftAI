"use client";

import type { ConceptCardPayload } from "@/server/concepts/concept-card-types";
import { useEffect, useRef, useState } from "react";

type ConceptCardProps = {
  card: ConceptCardPayload;
  title: string;
  index: number;
  onGenerateVideo: () => void;
  onGenerateContent: () => void;
  onSave: () => void;
  onDiscard: () => void;
};

export function ConceptCard({
  card,
  title,
  index,
  onGenerateVideo,
  onGenerateContent,
  onSave,
  onDiscard,
}: ConceptCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <article
      className="concept-card-enter flex flex-col rounded-2xl border border-zinc-600/80 bg-gradient-to-b from-zinc-900 to-zinc-950 p-5 shadow-xl"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-200">
            {card.formatTag}
          </span>
          <span className="rounded-full bg-amber-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-200">
            {card.platformTag}
          </span>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            onClick={() => setMenuOpen((o) => !o)}
            type="button"
          >
            <span className="sr-only">Concept actions</span>
            <span aria-hidden className="text-lg leading-none">
              ⋯
            </span>
          </button>
          {menuOpen ? (
            <div className="absolute right-0 z-20 mt-1 min-w-[140px] rounded-xl border border-zinc-600 bg-zinc-900 py-1 shadow-lg">
              <button
                className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-white/10"
                onClick={() => {
                  setMenuOpen(false);
                  onSave();
                }}
                type="button"
              >
                Save
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-sm text-red-300 hover:bg-white/10"
                onClick={() => {
                  setMenuOpen(false);
                  onDiscard();
                }}
                type="button"
              >
                Discard
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <h3
        className="mt-4 text-[18px] font-semibold leading-snug text-white"
        style={{ fontFamily: "var(--font-syne), ui-sans-serif, system-ui" }}
      >
        {title}
      </h3>

      <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Opening Hook
        </p>
        <p className="mt-2 text-sm italic leading-relaxed text-zinc-100">
          {card.openingHook}
        </p>
      </div>

      <div className="mt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Scene Direction
        </p>
        <p className="mt-2 text-sm leading-relaxed text-zinc-300">
          {card.sceneDirection}
        </p>
      </div>

      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-200/80">
          Caption Preview
        </p>
        <p className="mt-2 text-sm leading-relaxed text-amber-50">
          {card.captionPreview}
        </p>
      </div>

      <p className="mt-4 text-sm text-amber-200/90">
        {card.hashtags.map((h) => (
          <span className="mr-2 inline-block" key={h}>
            {h}
          </span>
        ))}
      </p>

      <p className="mt-4 border-t border-white/10 pt-4 text-sm text-zinc-400">
        <span className="font-medium text-zinc-300">Why it works: </span>
        {card.whyItWorks}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          className="flex-1 min-w-[140px] rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-900 shadow transition hover:bg-amber-400"
          onClick={onGenerateVideo}
          type="button"
        >
          Generate Video
        </button>
        <button
          className="flex-1 min-w-[140px] rounded-xl border border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
          onClick={onGenerateContent}
          type="button"
        >
          Generate Content
        </button>
      </div>
    </article>
  );
}
