"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

// Project token is public by design (it only allows sending events).
const KEY = "phc_JKGFCan0aKL776prwNNfl4PDB3pzAsVnVWl5Y3n2WZr";

// Anonymous and cookieless: never identify athletes or send Strava data (see /privacy).
export default function Analytics() {
  useEffect(() => {
    if (location.hostname === "localhost") return;
    posthog.init(KEY, {
      api_host: "https://us.i.posthog.com",
      persistence: "memory",
      autocapture: false,
      disable_session_recording: true,
      // CSP blocks external scripts, and we use no flags or surveys; keep PostHog to sending events.
      disable_external_dependency_loading: true,
      advanced_disable_flags: true,
    });

    // Strava's OAuth callback sends athletes back to /?connected=1 or /?error=<reason>.
    const q = new URLSearchParams(location.search);
    const result = q.get("connected") ? "connected" : q.get("error");
    if (result) posthog.capture("connect_result", { result });

    // Links tagged data-event="name" in server components send that event when clicked.
    const onClick = (e: MouseEvent) => {
      const name = (e.target as Element).closest<HTMLElement>("[data-event]")?.dataset.event;
      if (name) posthog.capture(name, {}, { send_instantly: true, transport: "sendBeacon" }); // survives the navigation
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
