// Browser-only state. SSR-safe: every helper checks for window before touching localStorage.
import { z } from "zod";
import type { Run, UserConfig } from "./types";

const TOKEN_KEY = "smashrun.token";
const CONFIG_KEY = "smashrun.config";
const RUNS_KEY = "smashrun.runs";

const AnchorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  emoji: z.string().optional(),
});

const ConfigSchema = z.object({
  displayName: z.string().min(1),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  distanceUnit: z.enum(["km", "mi"]).default("km"),
  anchors: z.array(AnchorSchema),
  enabledMilestones: z.object({
    "anchored-pr": z.boolean(),
    cumulative: z.boolean(),
    streak: z.boolean(),
    "life-stage": z.boolean(),
    "block-over-block": z.boolean(),
  }),
});

const RunSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  distanceMeters: z.number(),
  durationSeconds: z.number(),
  averageHeartRate: z.number().optional(),
  notes: z.string().optional(),
});

const RunCacheSchema = z.object({
  refreshedAt: z.string(),
  runs: z.array(RunSchema),
});

export type RunCache = z.infer<typeof RunCacheSchema>;

function browser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getToken(): string | null {
  if (!browser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (!browser()) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (!browser()) return;
  localStorage.removeItem(TOKEN_KEY);
}

export function getConfig(): UserConfig | null {
  if (!browser()) return null;
  const raw = localStorage.getItem(CONFIG_KEY);
  if (!raw) return null;
  try {
    return ConfigSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function setConfig(config: UserConfig): void {
  if (!browser()) return;
  const validated = ConfigSchema.parse(config);
  localStorage.setItem(CONFIG_KEY, JSON.stringify(validated));
}

export function getRunCache(): RunCache | null {
  if (!browser()) return null;
  const raw = localStorage.getItem(RUNS_KEY);
  if (!raw) return null;
  try {
    return RunCacheSchema.parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function setRunCache(runs: Run[]): RunCache {
  const cache: RunCache = { refreshedAt: new Date().toISOString(), runs };
  if (browser()) localStorage.setItem(RUNS_KEY, JSON.stringify(cache));
  return cache;
}

export function clearAll(): void {
  if (!browser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(RUNS_KEY);
}

export const DEFAULT_CONFIG_NEW_USER: UserConfig = {
  displayName: "Runner",
  distanceUnit: "km",
  anchors: [],
  enabledMilestones: {
    "anchored-pr": true,
    cumulative: true,
    streak: true,
    "life-stage": true,
    "block-over-block": true,
  },
};
