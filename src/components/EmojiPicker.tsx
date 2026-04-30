"use client";

import { useEffect, useRef, useState } from "react";

type EmojiGroup = { label: string; emojis: string[] };

const GROUPS: EmojiGroup[] = [
  {
    label: "Life",
    emojis: ["👶", "🤰", "💍", "🏠", "🎓", "🎂", "✈️", "❤️", "🐶", "🐱"],
  },
  {
    label: "Training",
    emojis: ["🏃", "🏃‍♀️", "🏃‍♂️", "🏗️", "🎯", "🏆", "🥇", "🥈", "🥉", "📈", "📊", "🔥"],
  },
  {
    label: "Energy",
    emojis: ["⚡", "💪", "🚀", "✨", "🌟", "💯", "🎉", "🎈", "🌿", "🪶"],
  },
  {
    label: "Place",
    emojis: ["🏔️", "🏖️", "🌲", "🌎", "🌅", "🌄", "🛣️", "🌍"],
  },
];

export function EmojiPicker({
  value,
  onChange,
  ariaLabel = "Choose emoji",
}: {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onMouse(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(emoji: string) {
    onChange(emoji);
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-lg border border-black/15 bg-white px-2 py-2 text-center text-lg leading-none hover:border-orange-400 focus:outline-none focus:border-orange-400"
      >
        {value || <span className="text-black/30">🏁</span>}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Emoji picker"
          className="absolute z-20 left-0 top-full mt-1 w-72 max-w-[80vw] rounded-xl border border-black/10 bg-white shadow-lg p-3 space-y-3"
        >
          {GROUPS.map((g) => (
            <div key={g.label}>
              <div className="text-[10px] uppercase tracking-widest text-black/40 mb-1">
                {g.label}
              </div>
              <div className="grid grid-cols-8 gap-1">
                {g.emojis.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => pick(e)}
                    className={`text-lg leading-none rounded p-1 hover:bg-black/5 ${
                      value === e ? "bg-orange-100 ring-1 ring-orange-300" : ""
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-black/10 pt-2 flex gap-2">
            <input
              type="text"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && custom.trim()) {
                  e.preventDefault();
                  pick(custom.trim());
                  setCustom("");
                }
              }}
              placeholder="Type your own…"
              className="flex-1 rounded border border-black/15 px-2 py-1 text-sm focus:outline-none focus:border-orange-400"
              maxLength={8}
            />
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              className="text-xs px-2 py-1 rounded border border-black/15 hover:bg-black/5"
            >
              None
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
