// Paste the lyrics between the backticks exactly as written. Each non-blank line becomes one
// activity name, used in order; blank lines (stanza breaks) are skipped. Nothing gets renamed while this is empty.
const LYRICS = `Please come now, I think I'm falling, I'm holding on to all I think is safe
It seems I found the road to nowhere and I'm trying to escape
I yelled back when I heard thunder, but I'm down to one last breath
And with it, let me say, let me say

Hold me now
I'm six feet from the edge and I'm thinking
"Maybe six feet ain't so far down"

I'm looking down, now that it's over, reflecting on all of my mistakes
I thought I found the road to somewhere, somewhere in His grace
I cried out "Heaven save me", but I'm down to one last breath
And with it, let me say, let me say

Hold me now
I'm six feet from the edge and I'm thinking
"Maybe six feet ain't so far down"
Hold me now
I'm six feet from the edge and I'm thinking
"Maybe six feet ain't so far down"
I'm so far down

Sad eyes follow me
But I still believe there's something left for me
So please, come stay with me
'Cause I still believe there's something left for you and me
For you and me, for you and me

Hold me now
I'm six feet from the edge and I'm thinking

Hold me now
I'm six feet from the edge and I'm thinking
"Maybe six feet ain't so far down"
Hold me now
I'm six feet from the edge and I'm thinking
"Maybe six feet ain't so far down"
I'm so far down

Please come now, I think I'm falling
I'm holding on to all I think is safe
`;

export const NAMES = LYRICS.split("\n").map((l) => l.trim()).filter(Boolean);
