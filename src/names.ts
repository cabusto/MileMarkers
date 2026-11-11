// Paste the lyrics between the backticks exactly as written. Each non-blank line becomes one
// activity name, used in order; blank lines (stanza breaks) are skipped. Nothing gets renamed while this is empty.
const LYRICS = `
`;

export const NAMES = LYRICS.split("\n").map((l) => l.trim()).filter(Boolean);
