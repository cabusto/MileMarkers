# More Notables

A small companion app for [Smashrun](https://smashrun.com) that surfaces personal milestones beyond the built-in Notables — things like "fastest 5K since baby was born," "1,000 km since I turned 40," or "biggest week of running ever."

The wall is called **Mile Markers**. The config page lets you define life anchors (baby, training block, age) that everything else is computed against.

## How it works

You paste a Smashrun access token. We pull your runs through a stateless proxy and compute milestones in your browser.

- **Your token lives in your browser only.** It's stored in `localStorage` on your device. It's never written to a database, never logged, never persisted on the server.
- The Netlify function at `/api/refresh` accepts your token in an `Authorization` header, uses it once to call Smashrun, returns the runs, and forgets it.
- All milestone computation runs client-side from your cached runs.
- "Clear all data" on the config page wipes everything from your browser.

There is no database. There is no shared state. Each friend's browser is its own world.

## Use the live app

Once deployed:

1. Open the site, click **Add your token**.
2. Get a token from the [Smashrun API Explorer](https://api.smashrun.com/v1/explorer): type `client` in the box at the top, click Connect, copy the access token.
3. Paste it into the config page and click **Connect & pull runs**.
4. Add anchors (e.g., "Since baby" 2021-05-09, "This training block" 2026-01-06, "Since turning 40" 2020-09-02), set your distance unit, save.

Tokens last about 60 days; rate limit is 250 requests/hour (well under what this app uses).

## Milestone types

Toggle each on/off in the config page.

- **Anchored PRs** — fastest 5K / 10K / half marathon / longest run since each anchor.
- **Cumulative landmarks** — most-recent crossing (e.g. "5,000 km since baby") + next-upcoming target ("4,112 km to 10,000 km").
- **Streaks & peak windows** — longest run streak, current streak (if live), biggest 7-day and 30-day rolling distance.
- **Life stage** — fastest 5K / 10K / HM / longest run since the most recent decade you turned (auto-derived from birthdate).
- **Block vs block** — for each anchor, compares the period since the anchor against the equivalent prior window. Highlights ≥10% distance shifts and ≥5s/km pace shifts.

## Run locally

```bash
npm install
npm run dev
# open http://localhost:3000
```

No environment variables needed — paste your token in the config page.

## Deploy

The `netlify.toml` is in the repo. Push to GitHub, connect on Netlify, that's it. No env vars to configure.

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create smashrun-more-notables --private --source=. --push
```

Then in Netlify: Add new site → Import an existing project → pick the repo.

## Architecture

```
src/
  app/
    page.tsx              Mile Markers wall (client component, reads localStorage)
    config/page.tsx       Config editor (client component, writes localStorage)
    api/refresh/route.ts  Stateless proxy: Authorization header → Smashrun → runs
    layout.tsx            Shell (header, footer)
  components/
    NotableCard.tsx       Gradient milestone card
    EmojiPicker.tsx       Curated emoji picker for anchors
  lib/
    types.ts              Run, Anchor, Notable, UserConfig
    storage.ts            localStorage helpers (token, config, run cache)
    notables/
      index.ts            Orchestrator
      anchored-prs.ts
      cumulative.ts
      streaks.ts
      life-stage.ts
      block-over-block.ts
      format.ts           Pace / distance / duration formatting
```

The milestone library is pure: each module is a `(runs, anchors) => Notable[]` function with no I/O or framework deps. Adding a new milestone type means writing one file and adding it to `index.ts`.

## Security notes

- `Content-Security-Policy` blocks external scripts (set in `next.config.mjs`).
- `Strict-Transport-Security`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
- Tokens are sent over HTTPS (Netlify) and never logged on the server side.
- Tokens in `localStorage` are XSS-vulnerable in principle. Mitigation is a strict CSP plus the fact that this app renders zero user-controlled HTML.
- If a token leaks, rotate it from your Smashrun account; the worst-case blast radius is read-only access to one user's run data.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Zod (config schema validation) · deployed on Netlify.
