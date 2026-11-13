import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { renameIfDefault } from "@/lib/strava";

export const dynamic = "force-dynamic";

// Strava calls this once when the webhook subscription is created.
export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get("hub.verify_token") !== process.env.STRAVA_VERIFY_TOKEN) return new Response("Forbidden", { status: 403 });
  return Response.json({ "hub.challenge": p.get("hub.challenge") });
}

// shortcut: renames inline; Strava wants a reply within 2s and retries otherwise (a retry is harmless,
// the name is no longer a default). Move to a background job if renames start timing out.
export async function POST(req: NextRequest) {
  // Strava doesn't sign events; the key in the registered callback_url proves the sender (athlete IDs are public).
  if (req.nextUrl.searchParams.get("key") !== process.env.STRAVA_VERIFY_TOKEN) return new Response("Forbidden", { status: 403 });
  const e = await req.json();
  if (e.object_type === "activity" && e.aspect_type === "create") {
    await renameIfDefault(e.owner_id, e.object_id);
  } else if (e.object_type === "athlete" && e.updates?.authorized === "false") {
    await db()`delete from athletes where id = ${e.owner_id}`; // athlete revoked access in Strava
  }
  return new Response("ok");
}
