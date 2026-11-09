const MESSAGES: Record<string, string> = {
  connected: "You're in. Post an activity with Strava's default name and watch what happens.",
  cancelled: "Connection cancelled. No harm done.",
  scope: "Creedok needs permission to edit your activities. Try again and leave that box ticked.",
};

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const { connected, error } = await searchParams;
  const message = connected ? MESSAGES.connected : error && MESSAGES[error];

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Your activities deserve a power ballad.</h1>
        <p className="text-lg text-black/70">
          Connect Strava. Run, ride or walk like normal. If you leave the default name (&ldquo;Morning Run&rdquo;),
          Creedok swaps it for a Creed lyric.
        </p>
        {message && <p role="status" className="rounded-lg bg-black/5 px-4 py-3">{message}</p>}
        <a
          href="/api/auth/start"
          className="inline-block rounded-lg bg-[#FC4C02] px-6 py-3 font-semibold text-white hover:opacity-90"
        >
          Connect with Strava
        </a>
      </section>

      <section className="space-y-3 text-black/70">
        <h2 className="text-xl font-semibold text-black">FAQ</h2>
        <p><strong>Will it rename everything?</strong> No. Only activities with Strava&rsquo;s default name. Name it yourself and Creedok leaves it alone.</p>
        <p><strong>What do you store?</strong> Your Strava athlete ID and access tokens, so Creedok can rename new activities. Nothing else.</p>
        <p><strong>How do I leave?</strong> Revoke Creedok in Strava under Settings → My Apps. Creedok deletes your tokens as soon as Strava tells it you left.</p>
      </section>
    </div>
  );
}
