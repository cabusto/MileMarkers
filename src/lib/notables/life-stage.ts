import type { Notable, Run } from "../types";
import { formatDuration, formatPace, paceSecondsPerKm, formatDistance } from "./format";

type Bracket = { label: string; min: number; max: number };

const BRACKETS: Bracket[] = [
  { label: "5K", min: 4_800, max: 5_300 },
  { label: "10K", min: 9_700, max: 10_500 },
  { label: "Half marathon", min: 20_900, max: 21_400 },
];

function decadeBoundaryAge(birthdate: string, asOf: Date): { age: number; date: Date } | undefined {
  const birth = new Date(birthdate);
  if (Number.isNaN(birth.getTime())) return undefined;

  const tentativeAge = asOf.getUTCFullYear() - birth.getUTCFullYear();
  const hasHadBirthday =
    asOf.getUTCMonth() > birth.getUTCMonth() ||
    (asOf.getUTCMonth() === birth.getUTCMonth() && asOf.getUTCDate() >= birth.getUTCDate());
  const currentAge = hasHadBirthday ? tentativeAge : tentativeAge - 1;
  const decadeAge = Math.floor(currentAge / 10) * 10;
  if (decadeAge < 10) return undefined;

  const decadeBirthday = new Date(
    Date.UTC(birth.getUTCFullYear() + decadeAge, birth.getUTCMonth(), birth.getUTCDate()),
  );
  return { age: decadeAge, date: decadeBirthday };
}

export function lifeStageNotables(runs: Run[], birthdate?: string): Notable[] {
  if (!birthdate || runs.length === 0) return [];
  const decade = decadeBoundaryAge(birthdate, new Date());
  if (!decade) return [];

  const decadeMs = decade.date.getTime();
  const sinceDecade = runs.filter((r) => new Date(r.startTime).getTime() >= decadeMs);
  if (sinceDecade.length === 0) return [];

  const decadeLabel = `${decade.age}s`;
  const notables: Notable[] = [];

  for (const bracket of BRACKETS) {
    const candidates = sinceDecade.filter(
      (r) => r.distanceMeters >= bracket.min && r.distanceMeters <= bracket.max,
    );
    if (candidates.length === 0) continue;

    const winner = candidates.reduce((best, r) =>
      paceSecondsPerKm(r.distanceMeters, r.durationSeconds) <
      paceSecondsPerKm(best.distanceMeters, best.durationSeconds)
        ? r
        : best,
    );
    const pace = paceSecondsPerKm(winner.distanceMeters, winner.durationSeconds);

    notables.push({
      id: `life-${decade.age}-${bracket.label.replace(/\s+/g, "-")}`,
      category: "life-stage",
      title: `Fastest ${bracket.label} of your ${decadeLabel}`,
      detail: `Best ${bracket.label} pace since you turned ${decade.age} — ${formatPace(pace)}.`,
      metric: { label: "Time", value: formatDuration(winner.durationSeconds) },
      date: winner.startTime,
      emoji: "🎂",
      runId: winner.id,
    });
  }

  // Longest run of the decade
  const longest = sinceDecade.reduce((best, r) =>
    r.distanceMeters > best.distanceMeters ? r : best,
  );
  notables.push({
    id: `life-${decade.age}-long`,
    category: "life-stage",
    title: `Longest run of your ${decadeLabel}`,
    detail: `Furthest single run since you turned ${decade.age} — ${formatDistance(longest.distanceMeters)}.`,
    metric: { label: "Distance", value: formatDistance(longest.distanceMeters) },
    date: longest.startTime,
    emoji: "🎂",
    runId: longest.id,
  });

  return notables;
}
