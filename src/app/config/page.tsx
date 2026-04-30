"use client";

import { useEffect, useState } from "react";
import { EmojiPicker } from "@/components/EmojiPicker";
import {
  DEFAULT_CONFIG_NEW_USER,
  clearAll,
  clearToken,
  getConfig,
  getRunCache,
  getToken,
  setConfig,
  setRunCache,
  setToken,
} from "@/lib/storage";
import type { Anchor, DistanceUnit, MilestoneType, UserConfig } from "@/lib/types";

const MILESTONE_LABELS: Record<MilestoneType, { name: string; blurb: string }> = {
  "anchored-pr": {
    name: "Anchored PRs",
    blurb: "Fastest 5K / 10K / half / longest run since each anchor.",
  },
  cumulative: {
    name: "Cumulative landmarks",
    blurb: "Most-recent crossing + next-upcoming for each anchor.",
  },
  streak: {
    name: "Streaks & peak windows",
    blurb: "Longest run streak, current streak, biggest 7- and 30-day windows.",
  },
  "life-stage": {
    name: "Life stage",
    blurb: "Best efforts since you turned 30, 40, etc. (uses your birthdate).",
  },
  "block-over-block": {
    name: "Block vs block",
    blurb: "Compares each anchor's window vs the prior equivalent window.",
  },
};

const EMPTY_SLOTS = 3;

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
}

export default function ConfigPage() {
  const [hydrated, setHydrated] = useState(false);
  const [config, setConfigState] = useState<UserConfig>(DEFAULT_CONFIG_NEW_USER);
  const [tokenInput, setTokenInput] = useState("");
  const [tokenSaved, setTokenSaved] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    const t = getToken();
    setTokenSaved(t);
    if (t) setTokenInput(t);
    const c = getConfig();
    if (c) setConfigState(c);
    setHydrated(true);
  }, []);

  async function connectAndPull() {
    setBusy(true);
    setMessage(null);
    try {
      const trimmed = tokenInput.trim();
      const res = await fetch("/api/refresh", {
        method: "POST",
        headers: { Authorization: `Bearer ${trimmed}` },
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }
      const data = (await res.json()) as {
        refreshedAt: string;
        userInfo: { firstName?: string; userName?: string; unitDistance?: "k" | "m" };
        runs: Parameters<typeof setRunCache>[0];
      };
      setToken(trimmed);
      setTokenSaved(trimmed);
      setRunCache(data.runs);

      // Hydrate sensible defaults from /userinfo on first connect.
      const next = { ...config };
      let touchedConfig = false;
      if (config.displayName === DEFAULT_CONFIG_NEW_USER.displayName) {
        const name = data.userInfo.firstName ?? data.userInfo.userName;
        if (name) {
          next.displayName = name;
          touchedConfig = true;
        }
      }
      if (data.userInfo.unitDistance === "m" && config.distanceUnit === "km") {
        next.distanceUnit = "mi";
        touchedConfig = true;
      }
      if (touchedConfig) {
        setConfig(next);
        setConfigState(next);
      }
      setMessage(`Connected. Pulled ${data.runs.length.toLocaleString()} runs.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Connect failed.");
    } finally {
      setBusy(false);
    }
  }

  function disconnect() {
    clearToken();
    setTokenInput("");
    setTokenSaved(null);
    setMessage("Token cleared.");
  }

  function clearEverything() {
    if (!confirm("This deletes your token, anchors, and cached runs from this browser. Continue?")) return;
    clearAll();
    setTokenInput("");
    setTokenSaved(null);
    setConfigState(DEFAULT_CONFIG_NEW_USER);
    setMessage("All local data cleared.");
  }

  function saveLocalConfig() {
    setConfig(config);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }

  function updateAnchor(idx: number, patch: Partial<Anchor>) {
    const next = [...config.anchors];
    next[idx] = { ...next[idx], ...patch };
    setConfigState({ ...config, anchors: next });
  }

  function commitNewAnchorsFromForm() {
    // Drop empty rows, generate ids for new ones.
    const cleaned: Anchor[] = config.anchors
      .filter((a) => a.name.trim() && /^\d{4}-\d{2}-\d{2}$/.test(a.date))
      .map((a) => ({
        ...a,
        id: a.id || `${slug(a.name)}-${Math.random().toString(36).slice(2, 6)}`,
      }));
    setConfigState({ ...config, anchors: cleaned });
  }

  if (!hydrated) {
    return <div className="text-black/40">Loading…</div>;
  }

  const slots = [...config.anchors];
  while (slots.length < config.anchors.length + EMPTY_SLOTS) {
    slots.push({ id: "", name: "", date: "", emoji: "" });
  }

  const cache = getRunCache();

  return (
    <div className="space-y-10 max-w-2xl">
      <section className="rounded-2xl border border-black/10 bg-white p-5 space-y-4">
        <header>
          <h2 className="text-xl font-semibold tracking-tight">Smashrun connection</h2>
          {tokenSaved ? (
            <p className="text-sm text-black/60 mt-1">
              Token saved in this browser.
              {cache && (
                <>
                  {" "}
                  {cache.runs.length.toLocaleString()} runs cached, last refreshed{" "}
                  {new Date(cache.refreshedAt).toLocaleString()}.
                </>
              )}
            </p>
          ) : (
            <p className="text-sm text-black/60 mt-1">
              Paste a Smashrun access token to pull your runs. We never store it on the server —
              it lives only in this browser.
            </p>
          )}
        </header>

        <details className="text-sm bg-black/5 rounded-lg p-3">
          <summary className="cursor-pointer font-medium">How do I get a token?</summary>
          <ol className="mt-2 ml-5 list-decimal space-y-1 text-black/70">
            <li>
              Go to the{" "}
              <a
                href="https://api.smashrun.com/v1/explorer"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                Smashrun API Explorer
              </a>
            </li>
            <li>Type <code className="bg-white px-1 rounded">client</code> in the box at the top, click Connect</li>
            <li>Click the copy button next to the access token</li>
            <li>Paste it below</li>
          </ol>
          <p className="mt-2 text-xs text-black/50">
            Tokens last ~60 days. Rate limit is 250 requests/hour.
          </p>
        </details>

        <div className="flex gap-2">
          <input
            type={showToken ? "text" : "password"}
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste access token"
            className="flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange-400"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setShowToken((s) => !s)}
            className="rounded-lg border border-black/15 px-3 py-2 text-xs font-medium hover:bg-black/5"
          >
            {showToken ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy || !tokenInput.trim()}
            onClick={connectAndPull}
            className="rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
          >
            {busy ? "Connecting…" : tokenSaved ? "Save & refresh runs" : "Connect & pull runs"}
          </button>
          {tokenSaved && (
            <button
              type="button"
              onClick={disconnect}
              className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-black/5"
            >
              Disconnect
            </button>
          )}
          <button
            type="button"
            onClick={clearEverything}
            className="rounded-lg border border-rose-300 text-rose-700 px-4 py-2 text-sm font-semibold hover:bg-rose-50"
          >
            Clear all data
          </button>
          {message && <span className="self-center text-sm text-black/70">{message}</span>}
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-semibold tracking-tight">Profile</h2>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-black/50">Display name</span>
            <input
              type="text"
              value={config.displayName}
              onChange={(e) => setConfigState({ ...config, displayName: e.target.value })}
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-black/50">Birthdate</span>
            <input
              type="date"
              value={config.birthdate ?? ""}
              onChange={(e) =>
                setConfigState({ ...config, birthdate: e.target.value || undefined })
              }
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-widest text-black/50">Distance unit</span>
            <select
              value={config.distanceUnit}
              onChange={(e) =>
                setConfigState({ ...config, distanceUnit: e.target.value as DistanceUnit })
              }
              className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
            >
              <option value="km">Kilometers</option>
              <option value="mi">Miles</option>
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-semibold tracking-tight">Anchors</h2>
          <p className="text-black/60 text-sm mt-1">
            Add things like &ldquo;Since baby&rdquo;, &ldquo;Since I turned 35&rdquo;, &ldquo;This training block&rdquo;.
            Empty rows are ignored. Clear an existing row to delete it.
          </p>
        </header>
        <div className="space-y-2">
          {slots.map((a, i) => (
            <div
              key={a.id || `empty-${i}`}
              className="grid grid-cols-[2.5rem_1fr_10rem] sm:grid-cols-[3rem_1fr_12rem] gap-2 items-center"
            >
              <EmojiPicker
                value={a.emoji}
                onChange={(emoji) => {
                  if (i < config.anchors.length) updateAnchor(i, { emoji });
                  else
                    setConfigState({
                      ...config,
                      anchors: [
                        ...config.anchors,
                        { id: "", name: "", date: "", emoji },
                      ],
                    });
                }}
                ariaLabel={`Emoji for ${a.name || "new anchor"}`}
              />
              <input
                type="text"
                value={a.name}
                onChange={(e) => {
                  if (i < config.anchors.length) updateAnchor(i, { name: e.target.value });
                  else
                    setConfigState({
                      ...config,
                      anchors: [
                        ...config.anchors,
                        { id: "", name: e.target.value, date: "", emoji: a.emoji },
                      ],
                    });
                }}
                placeholder="Since baby"
                aria-label="Anchor name"
                className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
              <input
                type="date"
                value={a.date}
                onChange={(e) => {
                  if (i < config.anchors.length) updateAnchor(i, { date: e.target.value });
                  else
                    setConfigState({
                      ...config,
                      anchors: [
                        ...config.anchors,
                        { id: "", name: a.name, date: e.target.value, emoji: a.emoji },
                      ],
                    });
                }}
                aria-label="Anchor date"
                className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <header>
          <h2 className="text-xl font-semibold tracking-tight">Milestone types</h2>
        </header>
        <div className="space-y-2">
          {(Object.keys(MILESTONE_LABELS) as MilestoneType[]).map((t) => (
            <label
              key={t}
              className="flex items-start gap-3 rounded-lg border border-black/10 bg-white p-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={config.enabledMilestones[t]}
                onChange={(e) =>
                  setConfigState({
                    ...config,
                    enabledMilestones: { ...config.enabledMilestones, [t]: e.target.checked },
                  })
                }
                className="mt-1"
              />
              <span>
                <span className="font-medium block">{MILESTONE_LABELS[t].name}</span>
                <span className="text-sm text-black/60">{MILESTONE_LABELS[t].blurb}</span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <div className="flex gap-3 items-center">
        <button
          type="button"
          onClick={() => {
            commitNewAnchorsFromForm();
            saveLocalConfig();
          }}
          className="rounded-lg bg-black text-white px-5 py-2 text-sm font-semibold hover:bg-black/80"
        >
          Save changes
        </button>
        <a
          href="/"
          className="rounded-lg border border-black/15 px-5 py-2 text-sm font-semibold hover:bg-black/5"
        >
          Back to Mile Markers
        </a>
        {savedFlash && <span className="text-sm text-emerald-700">Saved.</span>}
      </div>
    </div>
  );
}
