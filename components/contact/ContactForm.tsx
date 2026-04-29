"use client";

import { useState } from "react";

type ContactResponse = {
  error?: string;
};

export function ContactForm() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      const data = (await response.json()) as ContactResponse;

      if (!response.ok) {
        setStatus(data.error ?? "Unable to send message");
        return;
      }

      setStatus("Message sent successfully.");
    } catch {
      setStatus("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="grid gap-4 rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <label className="grid gap-2 text-sm font-semibold">
        Name
        <input name="name" required className="focus-ring rounded border border-black/15 px-3 py-3" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input name="email" type="email" required className="focus-ring rounded border border-black/15 px-3 py-3" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Message
        <textarea name="message" required className="focus-ring min-h-32 rounded border border-black/15 px-3 py-3" />
      </label>
      {status ? <p className="rounded bg-neutral px-3 py-2 text-sm font-semibold text-ink/75">{status}</p> : null}
      <button type="submit" disabled={loading} className="focus-ring rounded bg-primary px-5 py-3 font-bold text-white disabled:opacity-60">
        {loading ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
