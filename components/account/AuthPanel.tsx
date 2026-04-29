"use client";

import Link from "next/link";
import { Eye, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";

type Mode = "login" | "register";

type AuthResponse = {
  user?: {
    role: "user" | "manager" | "admin";
  };
  error?: string;
};

function destinationForRole(role: string) {
  if (role === "admin") return "/admin";
  if (role === "manager") return "/manager";
  return "/dashboard";
}

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setStatus("");

    const payload = Object.fromEntries(formData.entries());
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as AuthResponse;

      if (!response.ok || !data.user) {
        setStatus(data.error ?? "Authentication failed");
        return;
      }

      window.location.href = destinationForRole(data.user.role);
    } catch {
      setStatus("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-black/10 bg-white">
      <div className="grid grid-cols-2 border-b border-black/10">
        {(["login", "register"] as Mode[]).map((item) => (
          <button
            key={item}
            type="button"
            className={`focus-ring px-4 py-4 text-sm font-bold uppercase tracking-wide ${
              mode === item ? "bg-ink text-white" : "bg-white text-ink/60 hover:text-ink"
            }`}
            onClick={() => {
              setMode(item);
              setStatus("");
            }}
          >
            {item === "login" ? "Sign In" : "Create Account"}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">{mode === "login" ? "Welcome back" : "Join Roop Shree"}</p>
        <h2 className="mt-2 text-2xl font-semibold uppercase tracking-wide">{mode === "login" ? "Login to your account" : "Create your account"}</h2>
        <p className="mt-3 text-sm leading-6 text-ink/60">
          {mode === "login"
            ? "Access saved addresses, order tracking, wishlist, and faster checkout."
            : "Create an account for order tracking, saved details, and personalized recommendations."}
        </p>

        <form action={handleSubmit} className="mt-7 grid gap-4">
          {mode === "register" ? (
            <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/70">
              Full Name
              <span className="relative">
                <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
                <input name="name" required className="focus-ring w-full border border-black/15 px-10 py-3 text-sm font-medium normal-case tracking-normal" />
              </span>
            </label>
          ) : null}
          <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/70">
            Email Address
            <span className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
              <input name="email" type="email" autoComplete="email" required className="focus-ring w-full border border-black/15 px-10 py-3 text-sm font-medium normal-case tracking-normal" />
            </span>
          </label>
          <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/70">
            Password
            <span className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
              <input
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                className="focus-ring w-full border border-black/15 px-10 py-3 pr-11 text-sm font-medium normal-case tracking-normal"
              />
              <Eye className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
            </span>
          </label>
          {mode === "register" ? (
            <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/70">
              Phone Number
              <span className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
                <input name="phone" type="tel" autoComplete="tel" className="focus-ring w-full border border-black/15 px-10 py-3 text-sm font-medium normal-case tracking-normal" />
              </span>
            </label>
          ) : null}

          {mode === "login" ? (
            <div className="flex items-center justify-between gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 text-ink/60">
                <input type="checkbox" className="accent-primary" /> Remember me
              </label>
              <Link href="/contact-us" className="text-primary hover:underline">
                Need help?
              </Link>
            </div>
          ) : null}

          {status ? <p className="bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{status}</p> : null}
          <button type="submit" disabled={loading} className="focus-ring bg-primary px-5 py-3 font-bold uppercase tracking-wide text-white disabled:opacity-60">
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
