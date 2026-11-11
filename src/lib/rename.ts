// Strava's auto names: "<time of day> <sport>", e.g. "Morning Run", "Evening E-Bike Ride".
// shortcut: English-locale defaults only; add other languages if non-English athletes connect.
export const isDefaultName = (name: string) =>
  /^(Morning|Lunch|Afternoon|Evening|Night)( [A-Z][A-Za-z-]*){1,3}$/.test(name.trim());

// Strava descriptions are plain text; it only turns full https:// URLs into links.
// utm_source lets PostHog count visitors who came from an activity.
export const ATTRIBUTION = "Named by Creedok · https://creedok.netlify.app/?utm_source=strava";

// Keeps whatever the athlete wrote; adds the attribution once, on its own line.
export const withAttribution = (description: string | null | undefined) => {
  const d = (description ?? "").trimEnd();
  if (d.includes(ATTRIBUTION)) return d;
  return d ? `${d}\n\n${ATTRIBUTION}` : ATTRIBUTION;
};

// Each athlete walks the list top to bottom, then starts over.
export const nameAt = (names: string[], i: number) => (names.length ? names[i % names.length] : null);
