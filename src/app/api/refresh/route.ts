import { NextResponse } from "next/server";
import type { Run } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SMASHRUN = "https://api.smashrun.com/v1";
const PAGE_SIZE = 200;

type BriefRecord = {
  activityId: number;
  duration: number;
  distance: number;
  startDateTimeLocal: string;
};

type UserInfo = {
  id: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  unitDistance?: "k" | "m";
};

function deny(status: number, message: string) {
  // Deliberately terse — never echo the user's token or full upstream body.
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.toLowerCase().startsWith("bearer ")) {
    return deny(401, "Missing or malformed Authorization header.");
  }

  // Basic shape check before we hit Smashrun, so we don't burn rate-limit on garbage.
  const token = auth.slice(7).trim();
  if (token.length < 20 || token.length > 200) {
    return deny(400, "Token shape looks wrong.");
  }

  const upstreamHeaders = { Authorization: auth };

  // 1) /userinfo — confirms the token works and gives us display prefs.
  const userRes = await fetch(`${SMASHRUN}/my/userinfo`, {
    headers: upstreamHeaders,
    cache: "no-store",
  });
  if (userRes.status === 401) return deny(401, "Smashrun rejected the token (expired or invalid).");
  if (!userRes.ok) return deny(502, `Smashrun userinfo failed (${userRes.status}).`);
  const userInfo = (await userRes.json()) as UserInfo;

  // 2) Paginate /briefs.
  const runs: Run[] = [];
  let page = 0;
  while (true) {
    const res = await fetch(
      `${SMASHRUN}/my/activities/search/briefs?page=${page}&count=${PAGE_SIZE}`,
      { headers: upstreamHeaders, cache: "no-store" },
    );
    if (res.status === 401) return deny(401, "Smashrun rejected the token mid-fetch.");
    if (res.status === 429) return deny(429, "Rate limit hit on Smashrun. Try again later.");
    if (!res.ok) return deny(502, `Smashrun briefs failed (${res.status}).`);

    const briefs = (await res.json()) as BriefRecord[];
    if (!Array.isArray(briefs) || briefs.length === 0) break;
    for (const b of briefs) {
      runs.push({
        id: String(b.activityId),
        startTime: b.startDateTimeLocal,
        distanceMeters: Math.round(b.distance * 1000),
        durationSeconds: Math.round(b.duration),
      });
    }
    if (briefs.length < PAGE_SIZE) break;
    page += 1;
  }

  return NextResponse.json({
    refreshedAt: new Date().toISOString(),
    userInfo: {
      firstName: userInfo.firstName,
      userName: userInfo.userName,
      unitDistance: userInfo.unitDistance,
    },
    runs,
  });
}
