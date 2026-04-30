"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Users, ChevronLeft, ChevronRight, MoreVertical, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt?: string;
  emailVerified: boolean;
};

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), ...(search && { search }) });
    const res = await fetch(`/api/admin/customers?${params}`);
    const data = await res.json();
    setCustomers(data.customers ?? []);
    setPagination(data.pagination ?? { total: 0, pages: 1 });
    setLoading(false);
  }, [page, search]);

  const toggleVerify = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailVerified: !currentStatus })
      });
      if (res.ok) {
        toast.success(`User ${!currentStatus ? "verified" : "unverified"}`);
        fetchCustomers();
      }
    } catch {
      toast.error("Failed to update user");
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("User deleted");
        fetchCustomers();
      }
    } catch {
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchCustomers, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchCustomers, search]);

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total customers</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, phone..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">No customers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                    <th className="px-4 py-3 text-left">Orders</th>
                    <th className="px-4 py-3 text-left">Total Spent</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{c.name}</p>
                            <p className="text-xs text-gray-500">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          c.emailVerified ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                        }`}>
                          {c.emailVerified ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                          {c.emailVerified ? "Verified" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {format(new Date(c.createdAt), "dd MMM yyyy")}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.totalOrders}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ₹{c.totalSpent?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="relative inline-block text-left">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === c._id ? null : c._id)}
                            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {activeMenu === c._id && (
                            <div className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-gray-100 bg-white p-1 shadow-lg">
                              <button 
                                onClick={() => { toggleVerify(c._id, c.emailVerified); setActiveMenu(null); }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                              >
                                {c.emailVerified ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                {c.emailVerified ? "Mark Unverified" : "Mark Verified"}
                              </button>
                              <button 
                                onClick={() => { deleteUser(c._id); setActiveMenu(null); }}
                                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Delete User
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
                <p className="text-sm text-gray-500">Page {page} of {pagination.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => p - 1)} disabled={page === 1} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50">
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <button onClick={() => setPage((p) => p + 1)} disabled={page === pagination.pages} className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40 hover:bg-gray-50">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
