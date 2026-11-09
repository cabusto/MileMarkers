# Creedok

Live at https://creedok.netlify.app. Renames Strava activities that still have their default name ("Morning Run", "Lunch Ride"…) to a Creed lyric. Activities you name yourself are left alone.

## How it works

1. An athlete clicks **Connect with Strava** (`/api/auth/start` → Strava OAuth → `/api/auth/callback`). Their tokens go into a Postgres `athletes` table.
2. Strava sends every new activity to `/api/webhook`. If the name is a Strava default, Creedok picks a name from [`src/names.ts`](src/names.ts) and updates the activity.
3. When an athlete revokes Creedok in Strava, the webhook deletes their row.

**Add the lyric(s) to `src/names.ts` yourself.** While the list is empty, nothing gets renamed.

## Setup

1. **Strava app** (strava.com/settings/api): set *Authorization Callback Domain* to your site's domain (`localhost` for dev).
2. **Database:** create a Postgres database (Neon works with the bundled driver) and run `schema.sql`.
3. **Env vars:** copy `.env.example` to `.env.local` for dev, and set the same vars in Netlify for prod.
4. **Deploy** to Netlify (the `netlify.toml` is ready), then create the webhook subscription once:

```bash
curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F client_id=$STRAVA_CLIENT_ID -F client_secret=$STRAVA_CLIENT_SECRET \
  -F callback_url=https://YOUR-SITE/api/webhook -F verify_token=$STRAVA_VERIFY_TOKEN
```

## Dev

```bash
npm install
npm run dev
npm test
```

Webhooks need a public URL, so test them against the deployed site (or a tunnel).
