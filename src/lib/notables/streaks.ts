import type { Notable, Run } from "../types";
import { formatDistance } from "./format";

const DAY_MS = 86_400_000;

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00Z").getTime();
  const db = new Date(b + "T00:00:00Z").getTime();
  return Math.round((db - da) / DAY_MS);
}

export function streakNotables(runs: Run[]): Notable[] {
  if (runs.length === 0) return [];
  const sorted = [...runs].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const days = Array.from(new Set(sorted.map((r) => dayKey(r.startTime)))).sort();
  const daySet = new Set(days);

  // Longest consecutive-day run streak
  let bestStreak = 1;
  let bestStreakEnd = days[0];
  let cur = 1;
  for (let i = 1; i < days.length; i++) {
    if (daysBetween(days[i - 1], days[i]) === 1) {
      cur++;
      if (cur > bestStreak) {
        bestStreak = cur;
        bestStreakEnd = days[i];
      }
    } else {
      cur = 1;
    }
  }

  const notables: Notable[] = [];
  if (bestStreak >= 3) {
    notables.push({
      id: `streak-longest-${bestStreakEnd}`,
      category: "streak",
      title: `${bestStreak}-day run streak`,
      detail: `Your longest consecutive-day run streak — ${bestStreak} days in a row, ending ${bestStreakEnd}.`,
      metric: { label: "Longest streak", value: `${bestStreak} days` },
      date: bestStreakEnd + "T12:00:00Z",
      emoji: "🔥",
    });
  }

  // Current streak: walks back from today/yesterday until a gap.
  const today = dayKey(new Date().toISOString());
  const yesterday = dayKey(new Date(Date.now() - DAY_MS).toISOString());
  let anchorDay: string | undefined;
  if (daySet.has(today)) anchorDay = today;
  else if (daySet.has(yesterday)) anchorDay = yesterday;

  if (anchorDay) {
    let currentStreak = 1;
    let probe = new Date(anchorDay + "T00:00:00Z").getTime() - DAY_MS;
    while (daySet.has(dayKey(new Date(probe).toISOString()))) {
      currentStreak++;
      probe -= DAY_MS;
    }
    if (currentStreak >= 3 && currentStreak !== bestStreak) {
      const live = anchorDay === today;
      notables.push({
        id: `streak-current-${anchorDay}`,
        category: "streak",
        title: `On a ${currentStreak}-day streak${live ? "" : " (yesterday)"}`,
        detail: live
          ? `You've run ${currentStreak} days in a row — keep it going.`
          : `You ran ${currentStreak} days in a row through yesterday — one more today and you're back on.`,
        metric: { label: "Current streak", value: `${currentStreak} days` },
        date: anchorDay + "T18:00:00Z",
        emoji: live ? "⚡" : "🟡",
      });
    } else if (currentStreak >= 3 && currentStreak === bestStreak) {
      // Active streak that ties or sets the all-time best — replace the longest card with a richer one.
      const idx = notables.findIndex((n) => n.id.startsWith("streak-longest-"));
      if (idx >= 0) notables.splice(idx, 1);
      notables.push({
        id: `streak-current-best-${anchorDay}`,
        category: "streak",
        title: `${currentStreak}-day streak — your longest ever`,
        detail: `Active streak just tied or set your all-time best. Keep it going.`,
        metric: { label: "Streak", value: `${currentStreak} days` },
        date: anchorDay + "T18:00:00Z",
        emoji: "🔥",
      });
    }
  }

  // Highest 7-day mileage window (rolling, by run)
  const peak = peakWindow(sorted, 7);
  if (peak) {
    notables.push({
      id: `peak-7d-${peak.endRun.id}`,
      category: "streak",
      title: `Biggest week of running`,
      detail: `Your highest rolling 7-day distance: ${formatDistance(peak.totalMeters)} ending on this run.`,
      metric: { label: "7-day", value: formatDistance(peak.totalMeters) },
      date: peak.endRun.startTime,
      emoji: "📈",
      runId: peak.endRun.id,
    });
  }

  // Highest 30-day mileage window
  const peak30 = peakWindow(sorted, 30);
  if (peak30) {
    notables.push({
      id: `peak-30d-${peak30.endRun.id}`,
      category: "streak",
      title: `Biggest month of running`,
      detail: `Your highest rolling 30-day distance: ${formatDistance(peak30.totalMeters)} ending on this run.`,
      metric: { label: "30-day", value: formatDistance(peak30.totalMeters) },
      date: peak30.endRun.startTime,
      emoji: "🚀",
      runId: peak30.endRun.id,
    });
  }

  return notables;
}

function peakWindow(
  sortedRuns: Run[],
  windowDays: number,
): { totalMeters: number; endRun: Run } | undefined {
  if (sortedRuns.length === 0) return undefined;
  const windowMs = windowDays * DAY_MS;
  let bestTotal = 0;
  let bestEnd: Run | undefined;
  let left = 0;
  let sum = 0;

  for (let right = 0; right < sortedRuns.length; right++) {
    sum += sortedRuns[right].distanceMeters;
    const rightTime = new Date(sortedRuns[right].startTime).getTime();
    while (left <= right && rightTime - new Date(sortedRuns[left].startTime).getTime() > windowMs) {
      sum -= sortedRuns[left].distanceMeters;
      left++;
    }
    if (sum > bestTotal) {
      bestTotal = sum;
      bestEnd = sortedRuns[right];
    }
  }

  if (!bestEnd) return undefined;
  return { totalMeters: bestTotal, endRun: bestEnd };
}
