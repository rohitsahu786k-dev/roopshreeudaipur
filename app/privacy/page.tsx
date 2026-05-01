import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Roop Shree",
  description: "Learn how we handle your data and protect your privacy.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold uppercase tracking-wide text-ink">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink/60">Last updated: May 2026</p>
      </div>

      <div className="prose prose-sm max-w-none text-ink/80 prose-headings:font-semibold prose-headings:uppercase prose-headings:text-ink">
        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us. This information may include: name, email, phone number, postal address, profile picture, payment method, items requested (for delivery services), and other information you choose to provide.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We may use the information we collect about you to:</p>
        <ul>
          <li>Provide, maintain, and improve our Services.</li>
          <li>Process transactions and send related information.</li>
          <li>Send administrative messages, security alerts, and support messages.</li>
          <li>Respond to your comments, questions, and requests.</li>
        </ul>

        <h2>3. Data Security</h2>
        <p>We use reasonable security measures to protect the confidentiality of personal information under our control and appropriately limit access to it. However, no data transmission over the Internet can be guaranteed to be 100% secure.</p>
      </div>
    </main>
  );
}
