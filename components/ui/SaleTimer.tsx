"use client";

import { useEffect, useState } from "react";

type TimeLeft = { d: number; h: number; m: number; s: number };

function calcLeft(endsAt: string): TimeLeft {
  const diff = Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
  return {
    d: Math.floor(diff / 86400),
    h: Math.floor((diff % 86400) / 3600),
    m: Math.floor((diff % 3600) / 60),
    s: diff % 60
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

function Block({ value, label, dark }: { value: number; label: string; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`flex h-8 w-8 items-center justify-center text-sm font-mono font-bold tabular-nums sm:h-9 sm:w-9 sm:text-base ${dark ? "bg-white/15 text-white" : "bg-black text-white"}`}>
        {pad(value)}
      </span>
      <span className={`mt-0.5 text-[8px] uppercase tracking-wider ${dark ? "text-white/70" : "text-ink/55"}`}>{label}</span>
    </div>
  );
}

type SaleTimerProps = {
  endsAt: string;
  dark?: boolean;
  className?: string;
};

export function SaleTimer({ endsAt, dark = false, className = "" }: SaleTimerProps) {
  const [left, setLeft] = useState<TimeLeft>(() => calcLeft(endsAt));

  useEffect(() => {
    const id = setInterval(() => setLeft(calcLeft(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const total = left.d + left.h + left.m + left.s;
  if (!endsAt || total <= 0) return null;

  return (
    <div className={`flex items-end gap-1 sm:gap-1.5 ${className}`}>
      {left.d > 0 && (
        <>
          <Block value={left.d} label="days" dark={dark} />
          <span className={`mb-3.5 text-xs font-bold ${dark ? "text-white/50" : "text-ink/40"}`}>:</span>
        </>
      )}
      <Block value={left.h} label="hrs" dark={dark} />
      <span className={`mb-3.5 text-xs font-bold ${dark ? "text-white/50" : "text-ink/40"}`}>:</span>
      <Block value={left.m} label="min" dark={dark} />
      <span className={`mb-3.5 text-xs font-bold ${dark ? "text-white/50" : "text-ink/40"}`}>:</span>
      <Block value={left.s} label="sec" dark={dark} />
    </div>
  );
}
