// Strava's auto names: "<time of day> <sport>", e.g. "Morning Run", "Evening E-Bike Ride".
// shortcut: English-locale defaults only; add other languages if non-English athletes connect.
export const isDefaultName = (name: string) =>
  /^(Morning|Lunch|Afternoon|Evening|Night)( [A-Z][A-Za-z-]*){1,3}$/.test(name.trim());

export const pickName = (names: string[]) =>
  names.length ? names[Math.floor(Math.random() * names.length)] : null;
