import type { Notable } from "@/lib/types";

const CATEGORY_STYLE: Record<Notable["category"], string> = {
  "anchored-pr": "from-orange-50 to-rose-50 border-orange-200",
  cumulative: "from-sky-50 to-indigo-50 border-sky-200",
  streak: "from-amber-50 to-yellow-50 border-amber-200",
  "life-stage": "from-fuchsia-50 to-pink-50 border-fuchsia-200",
  "block-over-block": "from-emerald-50 to-teal-50 border-emerald-200",
};

const CATEGORY_LABEL: Record<Notable["category"], string> = {
  "anchored-pr": "Anchored PR",
  cumulative: "Landmark",
  streak: "Streak",
  "life-stage": "Life stage",
  "block-over-block": "Block vs block",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function NotableCard({ notable }: { notable: Notable }) {
  return (
    <article
      className={`relative rounded-2xl border bg-gradient-to-br ${CATEGORY_STYLE[notable.category]} p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-3xl leading-none" aria-hidden>
          {notable.emoji ?? "✨"}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-black/50 font-semibold">
          {CATEGORY_LABEL[notable.category]}
        </span>
      </div>
      <h3 className="mt-3 font-semibold text-base leading-snug">{notable.title}</h3>
      <p className="mt-1 text-sm text-black/70 leading-snug">{notable.detail}</p>
      {notable.metric && (
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">{notable.metric.value}</span>
          <span className="text-[11px] uppercase tracking-widest text-black/50">
            {notable.metric.label}
          </span>
        </div>
      )}
      <div className="mt-3 text-[11px] text-black/50">{formatDate(notable.date)}</div>
    </article>
  );
}
