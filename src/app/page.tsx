"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NotableCard } from "@/components/NotableCard";
import { computeNotables } from "@/lib/notables";
import {
  DEFAULT_CONFIG_NEW_USER,
  getConfig,
  getRunCache,
  getToken,
  setRunCache,
  type RunCache,
} from "@/lib/storage";
import type { UserConfig } from "@/lib/types";

function formatRefreshed(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const [config, setConfigState] = useState<UserConfig>(DEFAULT_CONFIG_NEW_USER);
  const [cache, setCacheState] = useState<RunCache | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(getToken());
    const c = getConfig();
    if (c) setConfigState(c);
    setCacheState(getRunCache());
    setHydrated(true);
  }, []);

  const notables = useMemo(() => {
    if (!cache) return [];
    return computeNotables(cache.runs, config);
  }, [cache, config]);

  async function handleRefresh() {
    if (!token) return;
    setRefreshing(true);
    setRefreshError(null);
    try {
      const res = await fetch("/api/refresh", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as { runs: Parameters<typeof setRunCache>[0]; refreshedAt: string };
      const next = setRunCache(data.runs);
      setCacheState(next);
    } catch (err) {
      setRefreshError(err instanceof Error ? err.message : "Refresh failed.");
    } finally {
      setRefreshing(false);
    }
  }

  if (!hydrated) return <div className="text-black/40">Loading…</div>;

  if (!token) {
    return (
      <div className="rounded-2xl border border-dashed border-black/20 p-10 max-w-xl mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to More Notables</h1>
        <p className="text-black/70">
          To see your notables, paste a Smashrun access token. Your token lives only in this browser
          — we never store it on our server.
        </p>
        <Link
          href="/config"
          className="inline-block rounded-lg bg-orange-500 text-white px-5 py-2 text-sm font-semibold hover:bg-orange-600"
        >
          Add your token →
        </Link>
      </div>
    );
  }

  if (!cache) {
    return (
      <div className="rounded-2xl border border-dashed border-black/20 p-10 max-w-xl mx-auto text-center space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Token saved — let&apos;s pull your runs</h1>
        <p className="text-black/70">No runs cached yet. Pull them from Smashrun to compute notables.</p>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-lg bg-orange-500 text-white px-5 py-2 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
        >
          {refreshing ? "Pulling…" : "Pull runs from Smashrun"}
        </button>
        {refreshError && <p className="text-sm text-rose-700">{refreshError}</p>}
      </div>
    );
  }

  const anchorById = new Map(config.anchors.map((a) => [a.id, a]));
  const grouped = new Map<string, typeof notables>();
  for (const n of notables) {
    const key = n.anchorId ?? `__${n.category}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(n);
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-sm uppercase tracking-widest text-black/50">Hi {config.displayName}</p>
        <h1 className="text-5xl font-bold tracking-tight">Mile Markers</h1>
        <p className="text-lg text-black/70">
          What stands out across your runs since the moments that matter.
        </p>
        <p className="text-sm text-black/50">
          {notables.length} notable{notables.length === 1 ? "" : "s"} computed from{" "}
          {cache.runs.length.toLocaleString()} runs · last refreshed{" "}
          {formatRefreshed(cache.refreshedAt)} ·{" "}
          <Link href="/config" className="underline underline-offset-4">
            edit anchors
          </Link>
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {refreshing ? "Pulling…" : "Refresh from Smashrun"}
          </button>
          {refreshError && <span className="text-sm text-rose-700">{refreshError}</span>}
        </div>
      </section>

      {notables.length === 0 && (
        <div className="rounded-xl border border-dashed border-black/20 p-10 text-center text-black/60">
          No notables yet — add some anchors on the{" "}
          <Link href="/config" className="underline">
            config
          </Link>{" "}
          page.
        </div>
      )}

      {[...grouped.entries()].map(([key, items]) => {
        const anchor = anchorById.get(key);
        const heading = anchor
          ? `${anchor.emoji ?? ""} ${anchor.name}`
          : items[0]?.category === "streak"
            ? "🔥 Streaks & volume"
            : items[0]?.category === "life-stage"
              ? "🎂 Life stage"
              : "✨ Other";
        return (
          <section key={key} className="space-y-4">
            <h2 className="text-lg font-semibold tracking-tight">{heading.trim()}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((n) => (
                <NotableCard key={n.id} notable={n} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
