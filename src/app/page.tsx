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
        <p className="text-sm text-black/60">
          By connecting, you let Creedok read and edit your Strava activities. We store only your Strava athlete
          ID and access tokens. You can disconnect at any time, and we delete your data when you do.
          See the <a href="/privacy" className="underline">privacy policy and terms</a>.
        </p>
        <a href="/api/auth/start" className="inline-block">
          {/* Official Strava asset, unmodified, per Strava's brand guidelines. */}
          <img src="/btn_strava_connect_with_orange.svg" alt="Connect with Strava" width={237} height={48} />
        </a>
      </section>

      <section className="space-y-3 text-black/70">
        <h2 className="text-xl font-semibold text-black">FAQ</h2>
        <p><strong>Will it rename everything?</strong> No. Only activities with Strava&rsquo;s default name. Name it yourself and Creedok leaves it alone.</p>
        <p><strong>What do you store?</strong> Your Strava athlete ID and access tokens, so Creedok can rename new activities. Nothing else.</p>
        <p><strong>How do I leave?</strong> Revoke Creedok in <a href="https://www.strava.com/settings/apps" className="underline">Strava under Settings → My Apps</a>. Creedok deletes your tokens as soon as Strava tells it you left. For written confirmation, email <a href="mailto:justinkwarren@gmail.com" className="underline">justinkwarren@gmail.com</a>.</p>
      </section>
    </div>
  );
}
