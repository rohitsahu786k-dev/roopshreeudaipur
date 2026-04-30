"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useState } from "react";

type Mode = "login" | "register" | "verify" | "forgot" | "reset";

type AuthResponse = {
  user?: {
    role: "user" | "manager" | "admin";
  };
  error?: string;
  requiresVerification?: boolean;
  email?: string;
  debugToken?: string;
};

function destinationForRole(role: string) {
  if (role === "admin") return "/admin";
  if (role === "manager") return "/manager";
  return "/dashboard";
}

export function AuthPanel() {
  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setStatus("");
    setSuccess("");

    const payload = Object.fromEntries(formData.entries());
    let endpoint = "";
    
    switch (mode) {
      case "login": endpoint = "/api/auth/login"; break;
      case "register": endpoint = "/api/auth/register"; break;
      case "verify": endpoint = "/api/auth/verify-email"; break;
      case "forgot": endpoint = "/api/auth/forgot-password"; break;
      case "reset": endpoint = "/api/auth/reset-password"; break;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "verify" ? { ...payload, email } : mode === "reset" ? { ...payload, token: resetToken } : payload)
      });
      const data = (await response.json()) as AuthResponse;

      if (!response.ok) {
        if (data.requiresVerification) {
          setEmail(data.email ?? "");
          setMode("verify");
          setStatus("Please verify your email to continue.");
        } else {
          setStatus(data.error ?? "Operation failed");
        }
        return;
      }

      if (mode === "register") {
        setEmail(payload.email as string);
        setMode("verify");
        setSuccess("OTP sent to your email!");
        return;
      }

      if (mode === "forgot") {
        setSuccess("If an account exists, a reset link/token has been sent.");
        if (data.debugToken) {
          console.log("Debug Token:", data.debugToken);
          setResetToken(data.debugToken);
          setMode("reset");
        }
        return;
      }

      if (mode === "reset") {
        setMode("login");
        setSuccess("Password reset successfully. Please login.");
        return;
      }

      if (data.user) {
        window.location.href = destinationForRole(data.user.role);
      }
    } catch {
      setStatus("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-black/10 bg-white">
      {mode !== "verify" && mode !== "forgot" && mode !== "reset" && (
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
                setSuccess("");
              }}
            >
              {item === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>
      )}

      <div className="p-6 md:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
          {mode === "login" ? "Welcome back" : 
           mode === "register" ? "Join Roop Shree" : 
           mode === "verify" ? "Verification" : 
           mode === "forgot" ? "Reset Password" : "New Password"}
        </p>
        <h2 className="mt-2 text-2xl font-semibold uppercase tracking-wide">
          {mode === "login" ? "Login to your account" : 
           mode === "register" ? "Create your account" : 
           mode === "verify" ? "Verify your email" : 
           mode === "forgot" ? "Forgot Password" : "Set New Password"}
        </h2>
        
        <form action={handleSubmit} className="mt-7 grid gap-4">
          {mode === "login" || mode === "register" ? (
            <>
              {mode === "register" && (
                <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/70">
                  Full Name
                  <span className="relative">
                    <UserRound className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
                    <input name="name" required className="focus-ring w-full border border-black/15 px-10 py-3 text-sm font-medium normal-case tracking-normal" />
                  </span>
                </label>
              )}
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
                    type={showPassword ? "text" : "password"}
                    required
                    className="focus-ring w-full border border-black/15 px-10 py-3 pr-11 text-sm font-medium normal-case tracking-normal"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/35 hover:text-ink">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>
              {mode === "register" && (
                <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/70">
                  Phone Number
                  <span className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
                    <input name="phone" type="tel" className="focus-ring w-full border border-black/15 px-10 py-3 text-sm font-medium normal-case tracking-normal" />
                  </span>
                </label>
              )}
              {mode === "login" && (
                <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                  <label className="flex items-center gap-2 text-ink/60">
                    <input type="checkbox" className="accent-primary" /> Remember me
                  </label>
                  <button type="button" onClick={() => setMode("forgot")} className="text-primary hover:underline">
                    Forgot Password?
                  </button>
                </div>
              )}
            </>
          ) : mode === "verify" ? (
            <>
              <p className="text-sm text-gray-500">We&apos;ve sent a 6-digit code to {email}.</p>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/70">
                Enter OTP
                <input name="otp" required maxLength={6} className="focus-ring w-full border border-black/15 px-4 py-3 text-center text-lg font-bold tracking-[0.5em]" />
              </label>
            </>
          ) : mode === "forgot" ? (
            <>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/70">
                Email Address
                <span className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
                  <input name="email" type="email" required className="focus-ring w-full border border-black/15 px-10 py-3 text-sm font-medium" />
                </span>
              </label>
              <button type="button" onClick={() => setMode("login")} className="text-left text-xs font-semibold text-gray-500 hover:text-primary">
                Back to Login
              </button>
            </>
          ) : (
            <>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/70">
                Reset Token
                <input name="token" defaultValue={resetToken} required className="focus-ring w-full border border-black/15 px-4 py-3 text-sm font-medium" />
              </label>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-wide text-ink/70">
                New Password
                <span className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/35" size={18} />
                  <input name="password" type="password" required className="focus-ring w-full border border-black/15 px-10 py-3 text-sm font-medium" />
                </span>
              </label>
            </>
          )}

          {status && <p className="bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{status}</p>}
          {success && <p className="bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">{success}</p>}
          
          <button type="submit" disabled={loading} className="focus-ring bg-primary px-5 py-3 font-bold uppercase tracking-wide text-white disabled:opacity-60">
            {loading ? "Please wait..." : 
             mode === "login" ? "Sign In" : 
             mode === "register" ? "Create Account" : 
             mode === "verify" ? "Verify Now" : 
             mode === "forgot" ? "Send Reset Link" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
