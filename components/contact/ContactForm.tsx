"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

const subjects = [
  "Order enquiry",
  "Product information",
  "Custom sizing / stitching",
  "Bridal consultation",
  "Returns & exchange",
  "Bulk / wholesale order",
  "Other"
];

type ContactResponse = {
  error?: string;
};

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("loading");
    setErrorMsg("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      const data = (await response.json()) as ContactResponse;
      if (!response.ok) {
        setErrorMsg(data.error ?? "Unable to send message");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMsg("Unable to connect to server. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 border border-green-200 bg-green-50 px-6 py-14 text-center">
        <CheckCircle2 size={40} className="text-green-600" />
        <div>
          <p className="text-lg font-bold uppercase tracking-wide text-green-800">Message Sent!</p>
          <p className="mt-2 text-sm text-green-700">Thank you for reaching out. Our team will reply within 24 hours.</p>
        </div>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-2 border border-green-300 px-5 py-2 text-xs font-bold uppercase tracking-wide text-green-700 hover:bg-green-100"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="cf-name" className="text-[11px] font-bold uppercase tracking-wide text-ink/60">Full Name *</label>
          <input
            id="cf-name"
            name="name"
            required
            placeholder="Your name"
            className="border border-black/15 bg-white px-4 py-3.5 text-sm transition focus:border-ink focus:outline-none"
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="cf-email" className="text-[11px] font-bold uppercase tracking-wide text-ink/60">Email Address *</label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="border border-black/15 bg-white px-4 py-3.5 text-sm transition focus:border-ink focus:outline-none"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="cf-phone" className="text-[11px] font-bold uppercase tracking-wide text-ink/60">Phone Number</label>
          <input
            id="cf-phone"
            name="phone"
            type="tel"
            placeholder="+91 00000 00000"
            className="border border-black/15 bg-white px-4 py-3.5 text-sm transition focus:border-ink focus:outline-none"
          />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="cf-subject" className="text-[11px] font-bold uppercase tracking-wide text-ink/60">Subject</label>
          <select
            id="cf-subject"
            name="subject"
            className="border border-black/15 bg-white px-4 py-3.5 text-sm transition focus:border-ink focus:outline-none"
          >
            {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="cf-message" className="text-[11px] font-bold uppercase tracking-wide text-ink/60">Message *</label>
        <textarea
          id="cf-message"
          name="message"
          required
          rows={5}
          placeholder="Tell us about your requirement - occasion, budget, size, timeline..."
          className="resize-none border border-black/15 bg-white px-4 py-3.5 text-sm transition focus:border-ink focus:outline-none"
        />
      </div>

      {status === "error" && (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center justify-center gap-2 bg-ink px-6 py-4 text-[12px] font-bold uppercase tracking-widest text-white transition hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={15} />
        {status === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
