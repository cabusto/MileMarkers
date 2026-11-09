// Strava's auto names: "<time of day> <sport>", e.g. "Morning Run", "Evening E-Bike Ride".
// shortcut: English-locale defaults only; add other languages if non-English athletes connect.
export const isDefaultName = (name: string) =>
  /^(Morning|Lunch|Afternoon|Evening|Night)( [A-Z][A-Za-z-]*){1,3}$/.test(name.trim());

export const ATTRIBUTION = "Named by Creedok · creedok.netlify.app";

// Keeps whatever the athlete wrote; adds the attribution once, on its own line.
export const withAttribution = (description: string | null | undefined) => {
  const d = (description ?? "").trimEnd();
  if (d.includes(ATTRIBUTION)) return d;
  return d ? `${d}\n\n${ATTRIBUTION}` : ATTRIBUTION;
};

export const pickName =(names: string[]) =>
  names.length ? names[Math.floor(Math.random() * names.length)] : null;
