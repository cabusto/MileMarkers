import { NextRequest, NextResponse } from "next/server";

export function GET(req: NextRequest) {
  const state = crypto.randomUUID();
  const url = new URL("https://www.strava.com/oauth/authorize");
  url.search = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    response_type: "code",
    // Netlify's URL is the public site; nextUrl.origin there is the branch host, where the state cookie isn't visible.
    redirect_uri: `${process.env.URL ?? req.nextUrl.origin}/api/auth/callback`,
    approval_prompt: "auto",
    scope: "activity:read_all,activity:write",
    state,
  }).toString();
  const res = NextResponse.redirect(url);
  res.cookies.set("oauth_state", state, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/" });
  return res;
}
