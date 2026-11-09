import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { exchangeToken } from "@/lib/strava";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const code = p.get("code");
  const back = (q: string) => NextResponse.redirect(new URL(`/?${q}`, process.env.URL ?? req.url));

  // Missing code = athlete hit Cancel; state mismatch = forged/stale callback.
  if (!code || p.get("state") !== req.cookies.get("oauth_state")?.value) return back("error=cancelled");
  if (!(p.get("scope") ?? "").includes("activity:write")) return back("error=scope");

  const t = await exchangeToken({ code, grant_type: "authorization_code" });
  await db()`insert into athletes (id, access_token, refresh_token, expires_at)
             values (${t.athlete!.id}, ${t.access_token}, ${t.refresh_token}, ${t.expires_at})
             on conflict (id) do update set access_token = excluded.access_token,
               refresh_token = excluded.refresh_token, expires_at = excluded.expires_at`;

  const res = back("connected=1");
  res.cookies.delete("oauth_state");
  return res;
}
