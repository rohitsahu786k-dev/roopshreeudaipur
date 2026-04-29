"use client";

import { Bell, Search, Menu, LogOut, User } from "lucide-react";
import { useState } from "react";
import type { SessionUser } from "@/lib/auth";

type Props = {
  user: SessionUser;
  onMenuToggle: () => void;
};

export default function AdminHeader({ user, onMenuToggle }: Props) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/account";
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products, orders, customers..."
            className="w-64 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
          <kbd className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-500">⌘K</kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden font-medium text-gray-700 md:block">{user.name}</span>
            <span className="hidden rounded bg-gray-100 px-1.5 py-0.5 text-xs capitalize text-gray-500 md:block">
              {user.role}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
              <div className="border-b border-gray-100 p-3">
                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
              </div>
              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
