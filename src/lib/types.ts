export type Run = {
  id: string;
  startTime: string;
  distanceMeters: number;
  durationSeconds: number;
  averageHeartRate?: number;
  notes?: string;
};

export type Anchor = {
  id: string;
  name: string;
  date: string;
  emoji?: string;
};

export type MilestoneType =
  | "anchored-pr"
  | "cumulative"
  | "streak"
  | "life-stage"
  | "block-over-block";

export type DistanceUnit = "km" | "mi";

export type UserConfig = {
  displayName: string;
  birthdate?: string;
  distanceUnit: DistanceUnit;
  anchors: Anchor[];
  enabledMilestones: Record<MilestoneType, boolean>;
};

export type Notable = {
  id: string;
  category: MilestoneType;
  anchorId?: string;
  title: string;
  detail: string;
  metric?: { label: string; value: string };
  date: string;
  emoji?: string;
  runId?: string;
};

export const DEFAULT_ENABLED_MILESTONES: Record<MilestoneType, boolean> = {
  "anchored-pr": true,
  cumulative: true,
  streak: true,
  "life-stage": true,
  "block-over-block": true,
};
