"use client";

import Link from "next/link";
import { Bell, Heart, Home, KeyRound, LogOut, MapPin, PackageCheck, Settings, ShoppingBag, Trash2, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCommerce } from "@/components/providers/CommerceProvider";

type Profile = {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  pendingEmail?: string;
  pendingPhone?: string;
  settings?: AccountSettings;
};

type Address = {
  id: string;
  label: string;
  type: "shipping" | "billing";
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  landmark: string;
  is_default: boolean;
};

type AccountOrder = {
  id: string;
  order_id: string;
  date: string;
  items: unknown[];
  total_amount: number;
  payment_status: string;
  order_status: string;
  invoice_url?: string;
  packing_slip_url?: string;
  tracking_url?: string;
  can_cancel: boolean;
};

type AccountSettings = {
  notifications?: {
    orderEmail?: boolean;
    orderWhatsapp?: boolean;
    offerEmail?: boolean;
    offerWhatsapp?: boolean;
  };
  loyaltyPoints?: number;
  storeCredit?: number;
};

type Tab = "profile" | "addresses" | "orders" | "wishlist" | "cart" | "settings";

const nav: Array<{ id: Tab; label: string; icon: typeof UserRound }> = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "orders", label: "Orders", icon: PackageCheck },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "cart", label: "Cart", icon: ShoppingBag },
  { id: "settings", label: "Settings", icon: Settings }
];

function emptyAddress(): Partial<Address> {
  return {
    label: "Home",
    type: "shipping",
    full_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    country: "India",
    postal_code: "",
    landmark: "",
    is_default: false
  };
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function AccountDashboardClient() {
  const { wishlist, removeFromWishlist, moveWishlistToCart, cartItems, formatMoney } = useCommerce();
  const [active, setActive] = useState<Tab>("profile");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<Partial<Address> | null>(null);
  const [editAddressId, setEditAddressId] = useState("");
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [orderStatus, setOrderStatus] = useState("");
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [otp, setOtp] = useState("");
  const settings = profile?.settings ?? {};
  const notificationSettings = settings.notifications ?? {};

  const orderCount = orders.length;
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const summary = useMemo(
    () => [
      { label: "Orders", value: orderCount },
      { label: "Wishlist", value: wishlist.length },
      { label: "Cart items", value: totalCartItems },
      { label: "Store credit", value: formatMoney(settings.storeCredit ?? 0) }
    ],
    [formatMoney, orderCount, settings.storeCredit, totalCartItems, wishlist.length]
  );

  async function loadAccount() {
    setLoading(true);
    const [profileRes, addressRes, orderRes] = await Promise.all([
      fetch("/api/account/profile", { cache: "no-store" }),
      fetch("/api/account/addresses", { cache: "no-store" }),
      fetch(`/api/account/orders?limit=10${orderStatus ? `&status=${orderStatus}` : ""}`, { cache: "no-store" })
    ]);

    if (profileRes.ok) setProfile((await profileRes.json()).profile);
    if (addressRes.ok) setAddresses((await addressRes.json()).addresses ?? []);
    if (orderRes.ok) setOrders((await orderRes.json()).orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadAccount();
  }, [orderStatus]);

  async function submitProfile(formData: FormData) {
    setStatus("");
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    const data = await response.json();
    setStatus(response.ok ? (data.verificationRequired ? "Verification code generated for changed email or phone." : "Profile updated.") : data.error);
    if (response.ok) setProfile(data.profile);
  }

  async function submitOtp() {
    const response = await fetch("/api/account/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp })
    });
    const data = await response.json();
    setStatus(response.ok ? "Contact detail verified." : data.error);
    if (response.ok) setProfile(data.profile);
  }

  async function saveAddress() {
    if (!addressForm) return;
    const response = await fetch(editAddressId ? `/api/account/addresses/${editAddressId}` : "/api/account/addresses", {
      method: editAddressId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addressForm)
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? "Address saved." : data.error ?? "Unable to save address.");
    setAddressForm(null);
    setEditAddressId("");
    await loadAccount();
  }

  async function deleteAddress(id: string) {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    await loadAccount();
  }

  async function changePassword() {
    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordForm)
    });
    const data = await response.json().catch(() => ({}));
    setStatus(response.ok ? "Password changed. Other sessions were invalidated." : data.error ?? "Unable to change password.");
    if (response.ok) setPasswordForm({ currentPassword: "", newPassword: "" });
  }

  async function updateNotifications(next: AccountSettings["notifications"]) {
    const response = await fetch("/api/account/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications: next })
    });
    const data = await response.json();
    if (response.ok) setProfile((current) => (current ? { ...current, settings: data.settings } : current));
  }

  async function cancelOrder(id: string) {
    const response = await fetch(`/api/account/orders/${id}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: "Cancelled from account dashboard" })
    });
    setStatus(response.ok ? "Order cancelled." : "Unable to cancel order.");
    await loadAccount();
  }

  async function reorder(id: string) {
    const response = await fetch(`/api/account/orders/${id}/reorder`, { method: "POST" });
    setStatus(response.ok ? "Items were added to your cart." : "Unable to reorder.");
  }

  async function logoutAll() {
    await fetch("/api/account/logout-all", { method: "POST" });
    window.location.href = "/account";
  }

  async function requestDeletion() {
    if (!confirm("Request account deletion? You will be signed out.")) return;
    await fetch("/api/account/settings", { method: "DELETE" });
    window.location.href = "/account";
  }

  return (
    <section className="bg-[#f8f8f8]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">My Account</p>
            <h1 className="mt-2 text-4xl font-semibold uppercase tracking-wide">Account Dashboard</h1>
            <p className="mt-2 text-sm text-ink/60">Manage profile, addresses, orders, wishlist, cart, and preferences.</p>
          </div>
          <Link href="/shop" className="focus-ring bg-ink px-5 py-3 text-sm font-bold uppercase tracking-wide text-white">
            Continue Shopping
          </Link>
        </div>

        {status ? <div className="mb-5 border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary">{status}</div> : null}

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit border border-black/10 bg-white p-3 lg:sticky lg:top-28">
            <div className="border-b border-black/10 p-3">
              <p className="font-bold">{profile?.name ?? "Account"}</p>
              <p className="mt-1 text-xs text-ink/55">{profile?.email}</p>
            </div>
            <nav className="mt-3 grid gap-1">
              {nav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={`focus-ring flex items-center gap-3 px-3 py-3 text-left text-sm font-bold uppercase tracking-wide ${
                    active === item.id ? "bg-ink text-white" : "hover:bg-neutral"
                  }`}
                >
                  <item.icon size={17} /> {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="min-w-0">
            {loading ? <div className="border border-black/10 bg-white p-10 text-center font-semibold">Loading account...</div> : null}

            {!loading && active === "profile" ? (
              <div className="grid gap-5">
                <div className="grid gap-4 md:grid-cols-4">
                  {summary.map((item) => (
                    <div key={item.label} className="border border-black/10 bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-ink/45">{item.label}</p>
                      <p className="mt-2 text-xl font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
                <form action={submitProfile} className="grid gap-4 border border-black/10 bg-white p-5 md:grid-cols-2">
                  <h2 className="md:col-span-2 text-lg font-semibold uppercase tracking-wide">Profile Info</h2>
                  <input name="name" defaultValue={profile?.name} placeholder="Name" className="focus-ring border border-black/15 px-3 py-3 text-sm" />
                  <input name="phone" defaultValue={profile?.phone} placeholder="Phone" className="focus-ring border border-black/15 px-3 py-3 text-sm" />
                  <input name="email" type="email" defaultValue={profile?.email} placeholder="Email" className="focus-ring border border-black/15 px-3 py-3 text-sm" />
                  <input name="currentPassword" type="password" placeholder="Current password for email change" className="focus-ring border border-black/15 px-3 py-3 text-sm" />
                  <input name="avatar" defaultValue={profile?.avatar} placeholder="Avatar URL" className="focus-ring border border-black/15 px-3 py-3 text-sm md:col-span-2" />
                  <button className="focus-ring bg-primary px-5 py-3 text-sm font-bold uppercase text-white md:w-fit">Save Profile</button>
                </form>
                {(profile?.pendingEmail || profile?.pendingPhone) ? (
                  <div className="border border-black/10 bg-white p-5">
                    <h2 className="text-lg font-semibold uppercase tracking-wide">Verify Contact Update</h2>
                    <div className="mt-4 flex gap-2">
                      <input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Enter OTP" className="focus-ring min-w-0 flex-1 border border-black/15 px-3 py-3 text-sm" />
                      <button type="button" onClick={submitOtp} className="focus-ring bg-ink px-5 py-3 text-sm font-bold uppercase text-white">Verify</button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!loading && active === "addresses" ? (
              <div className="border border-black/10 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold uppercase tracking-wide">Addresses</h2>
                  <button type="button" onClick={() => { setAddressForm(emptyAddress()); setEditAddressId(""); }} className="focus-ring bg-ink px-4 py-2 text-xs font-bold uppercase text-white">Add Address</button>
                </div>
                {addressForm ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {[
                      ["full_name", "Full name"], ["phone", "Phone"], ["address_line1", "Address line 1"], ["address_line2", "Address line 2"],
                      ["city", "City"], ["state", "State"], ["country", "Country"], ["postal_code", "Postal code"], ["landmark", "Landmark"]
                    ].map(([key, label]) => (
                      <input key={key} value={String(addressForm[key as keyof Address] ?? "")} onChange={(event) => setAddressForm((current) => ({ ...current, [key]: event.target.value }))} placeholder={label} className="focus-ring border border-black/15 px-3 py-3 text-sm" />
                    ))}
                    <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={Boolean(addressForm.is_default)} onChange={(event) => setAddressForm((current) => ({ ...current, is_default: event.target.checked }))} /> Default address</label>
                    <div className="flex gap-2 md:col-span-2">
                      <button type="button" onClick={saveAddress} className="focus-ring bg-primary px-5 py-3 text-sm font-bold uppercase text-white">Save</button>
                      <button type="button" onClick={() => setAddressForm(null)} className="focus-ring border border-black/15 px-5 py-3 text-sm font-bold uppercase">Cancel</button>
                    </div>
                  </div>
                ) : null}
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {addresses.length === 0 ? <div className="md:col-span-2 border border-black/10 p-8 text-center text-sm text-ink/60">No addresses saved yet.</div> : null}
                  {addresses.map((address) => (
                    <article key={address.id} className="border border-black/10 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">{address.full_name}</p>
                          <p className="mt-1 text-sm text-ink/60">{address.address_line1}, {address.city}, {address.state} {address.postal_code}</p>
                          <p className="mt-1 text-sm text-ink/60">{address.phone}</p>
                          {address.is_default ? <p className="mt-2 text-xs font-bold uppercase text-primary">Default</p> : null}
                        </div>
                        <div className="flex gap-1">
                          <button type="button" onClick={() => { setEditAddressId(address.id); setAddressForm(address); }} className="focus-ring border border-black/15 px-3 py-2 text-xs font-bold uppercase">Edit</button>
                          <button type="button" onClick={() => deleteAddress(address.id)} className="focus-ring border border-black/15 p-2 text-ink/50 hover:text-primary"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {!loading && active === "orders" ? (
              <div className="border border-black/10 bg-white p-5">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                  <h2 className="text-lg font-semibold uppercase tracking-wide">Orders</h2>
                  <select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} className="focus-ring border border-black/15 px-3 py-2 text-sm">
                    <option value="">All statuses</option>
                    {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </div>
                <div className="mt-5 overflow-hidden border border-black/10">
                  {orders.length === 0 ? <div className="p-10 text-center text-sm text-ink/60">No orders yet.</div> : null}
                  {orders.map((order) => (
                    <div key={order.id} className="grid gap-3 border-b border-black/10 p-4 last:border-b-0 md:grid-cols-[1fr_auto]">
                      <div>
                        <p className="font-bold">{order.order_id}</p>
                        <p className="mt-1 text-sm text-ink/60">{formatDate(order.date)} · {order.items.length} item(s) · {order.order_status.replace(/_/g, " ")}</p>
                        <p className="mt-1 text-sm font-bold text-primary">{formatMoney(order.total_amount)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        {order.tracking_url ? <Link href={order.tracking_url} target="_blank" className="focus-ring border border-black/15 px-3 py-2 text-xs font-bold uppercase">Track</Link> : null}
                        {order.invoice_url ? <Link href={order.invoice_url} download className="focus-ring border border-black/15 px-3 py-2 text-xs font-bold uppercase">Invoice</Link> : null}
                        {order.packing_slip_url ? <Link href={order.packing_slip_url} download className="focus-ring border border-black/15 px-3 py-2 text-xs font-bold uppercase">Packing Slip</Link> : null}
                        <button type="button" onClick={() => reorder(order.id)} className="focus-ring bg-ink px-3 py-2 text-xs font-bold uppercase text-white">Reorder</button>
                        {order.can_cancel ? <button type="button" onClick={() => cancelOrder(order.id)} className="focus-ring border border-black/15 px-3 py-2 text-xs font-bold uppercase text-ink/60">Cancel</button> : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {!loading && active === "wishlist" ? (
              <div className="border border-black/10 bg-white p-5">
                <h2 className="text-lg font-semibold uppercase tracking-wide">Wishlist</h2>
                <div className="mt-5 grid gap-3">
                  {wishlist.length === 0 ? <div className="border border-black/10 p-8 text-center text-sm text-ink/60">No wishlist items yet.</div> : null}
                  {wishlist.map((product) => (
                    <div key={product.slug} className="flex items-center justify-between gap-3 border border-black/10 p-3">
                      <div>
                        <p className="font-bold">{product.name}</p>
                        <p className="text-sm text-primary">{formatMoney(product.price)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => moveWishlistToCart([product.slug], { removeAfterAdd: true })} className="focus-ring bg-ink px-3 py-2 text-xs font-bold uppercase text-white">Move</button>
                        <button type="button" onClick={() => removeFromWishlist(product.slug)} className="focus-ring border border-black/15 px-3 py-2 text-xs font-bold uppercase">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {!loading && active === "cart" ? (
              <div className="border border-black/10 bg-white p-5">
                <h2 className="text-lg font-semibold uppercase tracking-wide">Active Cart</h2>
                {cartItems.length === 0 ? <div className="mt-5 border border-black/10 p-8 text-center text-sm text-ink/60">Your cart is empty.</div> : null}
                <div className="mt-5 grid gap-3">
                  {cartItems.map((item) => (
                    <div key={item.variant_id} className="flex justify-between gap-3 border border-black/10 p-3">
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-ink/60">Qty {item.quantity} · {item.size} / {item.color}</p>
                      </div>
                      <p className="font-bold text-primary">{formatMoney(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4">
                  <p className="font-bold">Subtotal {formatMoney(cartSubtotal)}</p>
                  <Link href="/cart" className="focus-ring bg-primary px-4 py-2 text-xs font-bold uppercase text-white">View Cart</Link>
                </div>
              </div>
            ) : null}

            {!loading && active === "settings" ? (
              <div className="grid gap-5">
                <div className="border border-black/10 bg-white p-5">
                  <h2 className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wide"><Bell size={18} /> Notifications</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {[
                      ["orderEmail", "Order updates by email"],
                      ["orderWhatsapp", "Order updates by WhatsApp"],
                      ["offerEmail", "Offers by email"],
                      ["offerWhatsapp", "Offers by WhatsApp"]
                    ].map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={Boolean(notificationSettings[key as keyof typeof notificationSettings])}
                          onChange={(event) => updateNotifications({ ...notificationSettings, [key]: event.target.checked })}
                          className="accent-primary"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border border-black/10 bg-white p-5">
                  <h2 className="flex items-center gap-2 text-lg font-semibold uppercase tracking-wide"><KeyRound size={18} /> Change Password</h2>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} placeholder="Current password" className="focus-ring border border-black/15 px-3 py-3 text-sm" />
                    <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} placeholder="New password" className="focus-ring border border-black/15 px-3 py-3 text-sm" />
                    <button type="button" onClick={changePassword} className="focus-ring bg-ink px-5 py-3 text-sm font-bold uppercase text-white md:w-fit">Change Password</button>
                  </div>
                </div>
                <div className="border border-black/10 bg-white p-5">
                  <h2 className="text-lg font-semibold uppercase tracking-wide">Account Actions</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button type="button" onClick={logoutAll} className="focus-ring inline-flex items-center gap-2 border border-black/15 px-4 py-3 text-sm font-bold uppercase"><LogOut size={16} /> Logout All Devices</button>
                    <button type="button" onClick={requestDeletion} className="focus-ring border border-red-200 px-4 py-3 text-sm font-bold uppercase text-red-700">Request Deletion</button>
                  </div>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </section>
  );
}
