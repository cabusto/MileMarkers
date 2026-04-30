import type { Anchor, Notable, Run } from "../types";
import { formatDistance, formatDuration, formatPace, paceSecondsPerKm } from "./format";

type DistanceBracket = {
  label: string;
  minMeters: number;
  maxMeters: number;
};

const BRACKETS: DistanceBracket[] = [
  { label: "5K", minMeters: 4_800, maxMeters: 5_300 },
  { label: "10K", minMeters: 9_700, maxMeters: 10_500 },
  { label: "Half marathon", minMeters: 20_900, maxMeters: 21_400 },
  { label: "Long run", minMeters: 18_000, maxMeters: 100_000 },
];

export function anchoredPRs(runs: Run[], anchors: Anchor[]): Notable[] {
  const notables: Notable[] = [];

  for (const anchor of anchors) {
    const anchorMs = new Date(anchor.date).getTime();
    const runsSinceAnchor = runs.filter((r) => new Date(r.startTime).getTime() >= anchorMs);
    if (runsSinceAnchor.length === 0) continue;

    for (const bracket of BRACKETS) {
      const candidates = runsSinceAnchor.filter(
        (r) => r.distanceMeters >= bracket.minMeters && r.distanceMeters <= bracket.maxMeters,
      );
      if (candidates.length === 0) continue;

      // For race brackets (5K/10K/HM): fastest pace wins.
      // For "Long run": longest distance wins.
      let winner: Run;
      let metric: { label: string; value: string };
      let detail: string;

      if (bracket.label === "Long run") {
        winner = candidates.reduce((best, r) =>
          r.distanceMeters > best.distanceMeters ? r : best,
        );
        metric = { label: "Distance", value: formatDistance(winner.distanceMeters) };
        detail = `Longest run since ${anchor.name.toLowerCase()} — ${formatDistance(winner.distanceMeters)} in ${formatDuration(winner.durationSeconds)}.`;
      } else {
        winner = candidates.reduce((best, r) =>
          paceSecondsPerKm(r.distanceMeters, r.durationSeconds) <
          paceSecondsPerKm(best.distanceMeters, best.durationSeconds)
            ? r
            : best,
        );
        const pace = paceSecondsPerKm(winner.distanceMeters, winner.durationSeconds);
        metric = { label: "Time", value: formatDuration(winner.durationSeconds) };
        detail = `Fastest ${bracket.label} since ${anchor.name.toLowerCase()} — ${formatPace(pace)}.`;
      }

      notables.push({
        id: `pr-${anchor.id}-${bracket.label.replace(/\s+/g, "-")}`,
        category: "anchored-pr",
        anchorId: anchor.id,
        title: `${bracket.label} best · ${anchor.name}`,
        detail,
        metric,
        date: winner.startTime,
        emoji: anchor.emoji ?? "🏆",
        runId: winner.id,
      });
    }
  }

  return notables;
}
