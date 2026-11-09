import { db } from "./db";
import { isDefaultName, pickName, withAttribution } from "./rename";
import { NAMES } from "@/names";

const STRAVA = "https://www.strava.com";

type Tokens = { access_token: string; refresh_token: string; expires_at: number; athlete?: { id: number } };

export async function exchangeToken(params: Record<string, string>): Promise<Tokens> {
  const res = await fetch(`${STRAVA}/oauth/token`, {
    method: "POST",
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      ...params,
    }),
  });
  if (!res.ok) throw new Error(`Strava token request failed: ${res.status}`);
  return res.json();
}

async function accessTokenFor(athleteId: number): Promise<string | null> {
  const sql = db();
  const [row] = await sql`select access_token, refresh_token, expires_at from athletes where id = ${athleteId}`;
  if (!row) return null;
  if (Number(row.expires_at) > Date.now() / 1000 + 60) return row.access_token;
  const t = await exchangeToken({ grant_type: "refresh_token", refresh_token: row.refresh_token });
  await sql`update athletes set access_token = ${t.access_token}, refresh_token = ${t.refresh_token},
            expires_at = ${t.expires_at} where id = ${athleteId}`;
  return t.access_token;
}

export async function renameIfDefault(athleteId: number, activityId: number) {
  const newName = pickName(NAMES);
  if (!newName) return;
  const token = await accessTokenFor(athleteId);
  if (!token) return;
  const url = `${STRAVA}/api/v3/activities/${activityId}`;
  const headers = { Authorization: `Bearer ${token}` };

  const get = await fetch(url, { headers });
  if (!get.ok) throw new Error(`Strava activity fetch failed: ${get.status}`);
  const { name, description } = await get.json();
  if (!isDefaultName(name)) return; // athlete named it themselves

  const put = await fetch(url, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName, description: withAttribution(description) }),
  });
  if (!put.ok) throw new Error(`Strava rename failed: ${put.status}`);
}
