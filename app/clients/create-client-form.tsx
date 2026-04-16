"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

export function CreateClientForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [audience, setAudience] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          industry,
          audience: audience || undefined,
          painPoints: painPoints || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Could not create client.");
        setPending(false);
        return;
      }
      setName("");
      setIndustry("");
      setAudience("");
      setPainPoints("");
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      className="mt-6 grid gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      onSubmit={onSubmit}
    >
      <div className="sm:col-span-2">
        <h2 className="font-serif text-lg font-semibold text-stone-900">
          Onboard a client
        </h2>
        <p className="text-sm text-stone-600">
          Add a brand workspace. You can switch the active client from the
          header.
        </p>
      </div>
      <div>
        <label
          className="text-xs font-medium uppercase tracking-wide text-stone-500"
          htmlFor="client-name"
        >
          Brand name
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none ring-blue-600 focus:ring-2"
          id="client-name"
          onChange={(ev) => setName(ev.target.value)}
          required
          value={name}
        />
      </div>
      <div>
        <label
          className="text-xs font-medium uppercase tracking-wide text-stone-500"
          htmlFor="client-industry"
        >
          Industry
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none ring-blue-600 focus:ring-2"
          id="client-industry"
          onChange={(ev) => setIndustry(ev.target.value)}
          required
          value={industry}
        />
      </div>
      <div className="sm:col-span-2">
        <label
          className="text-xs font-medium uppercase tracking-wide text-stone-500"
          htmlFor="client-audience"
        >
          Audience (optional)
        </label>
        <input
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none ring-blue-600 focus:ring-2"
          id="client-audience"
          onChange={(ev) => setAudience(ev.target.value)}
          value={audience}
        />
      </div>
      <div className="sm:col-span-2">
        <label
          className="text-xs font-medium uppercase tracking-wide text-stone-500"
          htmlFor="client-pain"
        >
          Pain points (optional)
        </label>
        <textarea
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-stone-900 outline-none ring-blue-600 focus:ring-2"
          id="client-pain"
          onChange={(ev) => setPainPoints(ev.target.value)}
          rows={2}
          value={painPoints}
        />
      </div>
      {error ? (
        <p className="text-sm text-red-600 sm:col-span-2" role="alert">
          {error}
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <button
          className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          disabled={pending}
          type="submit"
        >
          {pending ? "Saving…" : "Add client"}
        </button>
      </div>
    </form>
  );
}
