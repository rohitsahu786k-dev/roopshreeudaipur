"use client";

import { Zap } from "lucide-react";

export function GoKwikCheckout({ amount }: { amount: string }) {
  return (
    <button
      type="button"
      className="focus-ring flex w-full items-center justify-center gap-2 rounded bg-primary px-5 py-3 font-bold text-white hover:bg-primary-dark"
      onClick={() => alert("Connect GoKwik merchant keys in .env.local to enable one-click checkout.")}
    >
      <Zap size={18} />
      GoKwik Checkout - {amount}
    </button>
  );
}
