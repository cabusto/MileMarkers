import type { Anchor, Notable, Run } from "../types";
import { formatDistance, formatPace, paceSecondsPerKm } from "./format";

const DAY_MS = 86_400_000;

export function blockOverBlock(runs: Run[], anchors: Anchor[]): Notable[] {
  const notables: Notable[] = [];
  const now = Date.now();

  for (const anchor of anchors) {
    const anchorMs = new Date(anchor.date).getTime();
    if (anchorMs > now) continue;

    const blockMs = now - anchorMs;
    if (blockMs < 14 * DAY_MS) continue; // need at least two weeks of data

    const priorStartMs = anchorMs - blockMs;
    const current = runs.filter((r) => {
      const t = new Date(r.startTime).getTime();
      return t >= anchorMs && t <= now;
    });
    const prior = runs.filter((r) => {
      const t = new Date(r.startTime).getTime();
      return t >= priorStartMs && t < anchorMs;
    });

    if (current.length === 0 || prior.length === 0) continue;

    const currentMeters = current.reduce((s, r) => s + r.distanceMeters, 0);
    const priorMeters = prior.reduce((s, r) => s + r.distanceMeters, 0);
    const distanceDelta = currentMeters - priorMeters;
    const distancePct = (distanceDelta / priorMeters) * 100;

    if (Math.abs(distancePct) >= 10) {
      const direction = distanceDelta > 0 ? "more" : "less";
      const emoji = distanceDelta > 0 ? "📊" : "🪶";
      notables.push({
        id: `bob-distance-${anchor.id}`,
        category: "block-over-block",
        anchorId: anchor.id,
        title: `${direction === "more" ? "Bigger" : "Lighter"} block: ${anchor.name}`,
        detail: `${formatDistance(Math.abs(distanceDelta))} ${direction} than the previous equivalent window (${distancePct >= 0 ? "+" : ""}${distancePct.toFixed(1)}%).`,
        metric: { label: "Total", value: formatDistance(currentMeters) },
        date: new Date(now).toISOString(),
        emoji,
      });
    }

    const currentPace = avgPace(current);
    const priorPace = avgPace(prior);
    const paceDelta = currentPace - priorPace;
    if (Math.abs(paceDelta) >= 5) {
      const faster = paceDelta < 0;
      notables.push({
        id: `bob-pace-${anchor.id}`,
        category: "block-over-block",
        anchorId: anchor.id,
        title: `${faster ? "Faster" : "Easier"} on average: ${anchor.name}`,
        detail: `Average pace ${faster ? "dropped" : "rose"} by ${Math.abs(paceDelta).toFixed(0)}s/km vs the prior window.`,
        metric: { label: "Avg pace", value: formatPace(currentPace) },
        date: new Date(now).toISOString(),
        emoji: faster ? "⚡" : "🌿",
      });
    }
  }

  return notables;
}

function avgPace(runs: Run[]): number {
  const totalMeters = runs.reduce((s, r) => s + r.distanceMeters, 0);
  const totalSeconds = runs.reduce((s, r) => s + r.durationSeconds, 0);
  if (totalMeters === 0) return 0;
  return paceSecondsPerKm(totalMeters, totalSeconds);
}
