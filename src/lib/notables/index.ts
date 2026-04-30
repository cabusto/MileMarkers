import type { Notable, Run, UserConfig } from "../types";
import { anchoredPRs } from "./anchored-prs";
import { blockOverBlock } from "./block-over-block";
import { cumulativeLandmarks } from "./cumulative";
import { lifeStageNotables } from "./life-stage";
import { streakNotables } from "./streaks";

export function computeNotables(runs: Run[], config: UserConfig): Notable[] {
  const out: Notable[] = [];
  const enabled = config.enabledMilestones;

  if (enabled["anchored-pr"]) out.push(...anchoredPRs(runs, config.anchors));
  if (enabled.cumulative)
    out.push(...cumulativeLandmarks(runs, config.anchors, config.distanceUnit));
  if (enabled.streak) out.push(...streakNotables(runs));
  if (enabled["life-stage"]) out.push(...lifeStageNotables(runs, config.birthdate));
  if (enabled["block-over-block"]) out.push(...blockOverBlock(runs, config.anchors));

  out.sort((a, b) => b.date.localeCompare(a.date));
  return out;
}
