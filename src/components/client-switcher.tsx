"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ClientRow = {
  id: string;
  name: string;
  industry: string;
};

type ClientsPayload = {
  clients: ClientRow[];
  activeClientId: string | null;
};

export function ClientSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [data, setData] = useState<ClientsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/clients", { cache: "no-store" });
      if (!res.ok) {
        setError("Could not load clients.");
        setData(null);
        return;
      }
      setData((await res.json()) as ClientsPayload);
    } catch {
      setError("Network error.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pathname === "/login") {
      setLoading(false);
      return;
    }
    void load();
  }, [load, pathname]);

  async function onSelect(clientId: string) {
    if (!clientId || switching) {
      return;
    }
    setSwitching(true);
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}/switch`, {
        method: "POST",
      });
      if (!res.ok) {
        setError("Could not switch client.");
        setSwitching(false);
        return;
      }
      await load();
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSwitching(false);
    }
  }

  if (pathname === "/login") {
    return null;
  }

  if (loading) {
    return (
      <span className="text-xs text-stone-500" data-testid="client-switcher">
        Clients…
      </span>
    );
  }

  if (error && !data?.clients.length) {
    return (
      <span className="text-xs text-red-600" data-testid="client-switcher">
        {error}
      </span>
    );
  }

  const clients = data?.clients ?? [];
  if (clients.length === 0) {
    return (
      <span className="text-xs text-stone-500" data-testid="client-switcher">
        No clients
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-2"
      data-testid="client-switcher"
    >
      <label className="sr-only" htmlFor="active-client">
        Active client
      </label>
      <select
        className="max-w-[200px] rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-xs font-medium text-stone-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 sm:max-w-xs"
        disabled={switching}
        id="active-client"
        onChange={(e) => void onSelect(e.target.value)}
        value={data?.activeClientId ?? ""}
      >
        <option disabled value="">
          Select client…
        </option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} — {c.industry}
          </option>
        ))}
      </select>
      {error ? (
        <span className="text-xs text-red-600" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
