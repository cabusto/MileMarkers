import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy and terms · Creedok" };

const CONTACT = "justinkwarren@gmail.com";

export default function Privacy() {
  return (
    <article className="space-y-6 text-black/80 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-black [&_a]:underline">
      <h1 className="text-3xl font-bold tracking-tight text-black">Privacy policy and terms</h1>
      <p className="text-sm text-black/50">Last updated 9 November 2026</p>

      <h2>What we collect</h2>
      <p>
        When you connect Strava, Strava sends us your athlete ID and an access token and a refresh token.
        That is all we store. We don&rsquo;t store your activities, location, name, email or anything else from your profile.
      </p>

      <h2>How we collect and use it</h2>
      <p>
        You give consent through Strava&rsquo;s own authorization screen. Strava then notifies us when you create an
        activity. We fetch that activity to check its name (without storing it), and if it&rsquo;s still Strava&rsquo;s default (like &ldquo;Morning Run&rdquo;),
        we change it and add a short &ldquo;Named by Creedok&rdquo; line to the end of its description, keeping anything you
        wrote there. We use your data for nothing else. We don&rsquo;t share or sell it, and we don&rsquo;t use it for
        analytics, advertising or AI.
      </p>

      <h2>Where it&rsquo;s stored</h2>
      <p>
        Tokens are stored in a Postgres database hosted by Neon (US East). The site runs on Netlify. These providers
        process data only to run Creedok.
      </p>

      <h2>Withdrawing consent and deleting your data</h2>
      <p>
        Revoke Creedok at any time in <a href="https://www.strava.com/settings/apps">Strava under Settings → My Apps</a>.
        Strava tells us right away, and we permanently delete your athlete ID and tokens. You can also ask us to
        delete your data, or to tell you what we hold about you, by emailing <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        We&rsquo;ll reply in writing to confirm once the deletion is complete.
      </p>

      <h2>Strava</h2>
      <p>
        Creedok uses the Strava API and is not developed, sponsored or endorsed by Strava. Strava may monitor and collect
        data about how Creedok uses the Strava API, and may use that data for any business purpose under the{" "}
        <a href="https://www.strava.com/legal/privacy">Strava Privacy Policy</a>. That policy controls in any conflict with this one.
      </p>

      <h2>Terms of use</h2>
      <p>
        Creedok is free and provided &ldquo;as is&rdquo;. On behalf of ourselves and our third-party service providers
        (including Strava, Netlify and Neon), we disclaim all warranties, including implied warranties of
        merchantability, fitness for a particular purpose and non-infringement. Neither we nor those providers are
        liable for any consequential, special, punitive or indirect damages from your use of Creedok.
      </p>

      <h2>Contact</h2>
      <p>Questions or support: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </article>
  );
}
