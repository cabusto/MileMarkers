import type { Anchor, DistanceUnit, Notable, Run } from "../types";

const KM_LANDMARKS = [50, 100, 250, 500, 1000, 2500, 5000, 10000];
const MI_LANDMARKS = [50, 100, 250, 500, 1000, 2500, 5000, 10000];

const METERS_PER_MILE = 1609.344;

export function cumulativeLandmarks(
  runs: Run[],
  anchors: Anchor[],
  unit: DistanceUnit,
): Notable[] {
  const notables: Notable[] = [];
  const landmarks = unit === "mi" ? MI_LANDMARKS : KM_LANDMARKS;
  const unitMeters = unit === "mi" ? METERS_PER_MILE : 1000;
  const unitLabel = unit === "mi" ? "mi" : "km";

  for (const anchor of anchors) {
    const anchorMs = new Date(anchor.date).getTime();
    const sinceAnchor = runs
      .filter((r) => new Date(r.startTime).getTime() >= anchorMs)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (sinceAnchor.length === 0) continue;

    // Replay runs to find the latest crossing date for each threshold.
    let total = 0;
    const crossingDate = new Map<number, { runId: string; date: string }>();
    for (const run of sinceAnchor) {
      const before = total;
      total += run.distanceMeters;
      for (const t of landmarks) {
        const target = t * unitMeters;
        if (before < target && total >= target && !crossingDate.has(t)) {
          crossingDate.set(t, { runId: run.id, date: run.startTime });
        }
      }
    }

    // Most-recent crossing: the highest threshold crossed.
    const crossed = [...crossingDate.keys()].sort((a, b) => b - a);
    if (crossed.length > 0) {
      const top = crossed[0];
      const meta = crossingDate.get(top)!;
      notables.push({
        id: `cum-crossed-${anchor.id}-${top}`,
        category: "cumulative",
        anchorId: anchor.id,
        title: `${top.toLocaleString()} ${unitLabel} since ${anchor.name.toLowerCase()}`,
        detail: `You crossed ${top.toLocaleString()} cumulative ${unitLabel} since ${anchor.name.toLowerCase()} on this run.`,
        metric: { label: "Cumulative", value: `${top.toLocaleString()} ${unitLabel}` },
        date: meta.date,
        emoji: anchor.emoji ?? "🛣️",
        runId: meta.runId,
      });
    }

    // Next-upcoming threshold: smallest landmark not yet crossed.
    const upcoming = landmarks.find((t) => !crossingDate.has(t));
    if (upcoming) {
      const target = upcoming * unitMeters;
      const remaining = target - total;
      const remainingDisplay =
        unit === "mi" ? remaining / METERS_PER_MILE : remaining / 1000;
      const remainingStr =
        remainingDisplay >= 100
          ? remainingDisplay.toFixed(0)
          : remainingDisplay.toFixed(1);
      const totalDisplay = unit === "mi" ? total / METERS_PER_MILE : total / 1000;
      const lastRunDate = sinceAnchor[sinceAnchor.length - 1].startTime;
      notables.push({
        id: `cum-upcoming-${anchor.id}-${upcoming}`,
        category: "cumulative",
        anchorId: anchor.id,
        title: `${remainingStr} ${unitLabel} to ${upcoming.toLocaleString()} ${unitLabel}`,
        detail: `${totalDisplay.toFixed(0)} ${unitLabel} cumulative since ${anchor.name.toLowerCase()} — next milestone is ${upcoming.toLocaleString()} ${unitLabel}.`,
        metric: { label: "To go", value: `${remainingStr} ${unitLabel}` },
        date: lastRunDate,
        emoji: "🎯",
      });
    }
  }

  return notables;
}
