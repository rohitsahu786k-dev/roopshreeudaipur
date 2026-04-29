"use client";

import { useState } from "react";
import { Store, CreditCard, Truck, Bell, Users, Check } from "lucide-react";

const TABS = [
  { id: "store", label: "Store", icon: Store },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "staff", label: "Staff & Roles", icon: Users }
];

export default function SettingsClient() {
  const [activeTab, setActiveTab] = useState("store");
  const [saved, setSaved] = useState(false);

  const showSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0">
          <nav className="space-y-0.5">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "store" && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Store Information</h2>
              <div className="space-y-4">
                {[
                  { label: "Store Name", placeholder: "Roop Shree Udaipur", env: "STORE_NAME" },
                  { label: "Store Email", placeholder: "info@roopshreeudaipur.com", env: "STORE_EMAIL" },
                  { label: "Store Phone", placeholder: "+91 98765 43210", env: "STORE_PHONE" },
                  { label: "Store Address", placeholder: "123, Main Street, Udaipur, Rajasthan", env: "STORE_ADDRESS" },
                  { label: "Currency", placeholder: "INR", env: "DEFAULT_CURRENCY" }
                ].map(({ label, placeholder, env }) => (
                  <div key={env}>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
                    <input
                      placeholder={placeholder}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                    <p className="mt-1 text-xs text-gray-400">Set via environment variable: {env}</p>
                  </div>
                ))}
                <div className="pt-2">
                  <button
                    onClick={showSaved}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
                  >
                    {saved ? <Check className="h-4 w-4" /> : null}
                    {saved ? "Saved!" : "Save Settings"}
                  </button>
                  <p className="mt-2 text-xs text-gray-400">
                    Store settings are managed via environment variables. Update your .env file and restart the server.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Payment Gateways</h2>
              <div className="space-y-4">
                {[
                  { name: "Razorpay", keys: ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"], desc: "Cards, UPI, Wallets, NetBanking" },
                  { name: "PayPal", keys: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET"], desc: "International payments" },
                  { name: "GoKwik", keys: ["GOKWIK_APP_ID", "GOKWIK_APP_SECRET"], desc: "COD + BNPL solutions" }
                ].map(({ name, keys, desc }) => (
                  <div key={name} className="rounded-lg border border-gray-100 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-gray-900">{name}</span>
                      <span className="text-xs text-gray-500">{desc}</span>
                    </div>
                    {keys.map((key) => (
                      <div key={key} className="mt-2">
                        <label className="mb-1 block text-xs text-gray-500">{key}</label>
                        <input
                          type="password"
                          placeholder="Configured via .env"
                          disabled
                          className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-400"
                        />
                      </div>
                    ))}
                  </div>
                ))}
                <p className="text-xs text-gray-400">Configure payment keys in your .env file</p>
              </div>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Shipping Configuration</h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-100 p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Shiprocket</h3>
                  {["SHIPROCKET_EMAIL", "SHIPROCKET_PASSWORD"].map((key) => (
                    <div key={key} className="mt-2">
                      <label className="mb-1 block text-xs text-gray-500">{key}</label>
                      <input
                        type="password"
                        placeholder="Configured via .env"
                        disabled
                        className="w-full rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-400"
                      />
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-gray-100 p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Free Shipping Threshold</h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-500 text-sm">₹</span>
                    <input
                      type="number"
                      placeholder="999"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Email Notifications</h2>
              <div className="space-y-3">
                {[
                  { label: "New order placed", desc: "Notify admin when order is created" },
                  { label: "Order shipped", desc: "Send tracking info to customer" },
                  { label: "Low stock alert", desc: "Alert when product stock is low" },
                  { label: "New customer registration", desc: "Welcome email to new customers" },
                  { label: "Abandoned cart", desc: "Reminder for incomplete checkouts" }
                ].map(({ label, desc }) => (
                  <label key={label} className="flex items-start gap-3 cursor-pointer rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                    <input type="checkbox" defaultChecked className="mt-0.5 rounded border-gray-300 text-primary" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{label}</div>
                      <div className="text-xs text-gray-500">{desc}</div>
                    </div>
                  </label>
                ))}
                <p className="text-xs text-gray-400">Configure SMTP via SMTP_HOST, SMTP_USER, SMTP_PASS environment variables</p>
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-base font-semibold text-gray-900">Staff & Roles</h2>
              <div className="space-y-4">
                {[
                  { role: "Admin", desc: "Full access to all features", color: "bg-red-100 text-red-700" },
                  { role: "Manager", desc: "Can manage orders, inventory and shipping", color: "bg-blue-100 text-blue-700" },
                  { role: "User", desc: "Regular customer account", color: "bg-gray-100 text-gray-700" }
                ].map(({ role, desc, color }) => (
                  <div key={role} className="flex items-center gap-4 rounded-lg border border-gray-100 p-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${color}`}>{role}</span>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                ))}
                <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <p className="text-sm text-gray-700">
                    To assign admin or manager roles, use the <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">scripts/seed-admin.js</code> script
                    or directly update user roles in your MongoDB database.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
