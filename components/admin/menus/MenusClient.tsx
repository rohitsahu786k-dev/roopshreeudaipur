"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Check, ChevronDown, ChevronUp } from "lucide-react";

type MenuItem = {
  label: string;
  href?: string;
  icon?: string;
  sortOrder: number;
};

type Menu = {
  _id: string;
  name: string;
  placement: "header" | "footer" | "mobile" | "admin";
  items: MenuItem[];
  isActive: boolean;
};

const emptyMenu = (): Partial<Menu> => ({
  name: "",
  placement: "header",
  items: [],
  isActive: true
});

const emptyMenuItem = (): MenuItem => ({
  label: "",
  href: "",
  icon: "",
  sortOrder: 0
});

export default function MenusClient() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<Menu> | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);

  const fetchMenus = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/menus");
    const data = await res.json();
    setMenus(data.menus ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const openCreate = () => {
    setForm(emptyMenu());
    setEditId(null);
    setError("");
  };

  const openEdit = (menu: Menu) => {
    setForm({ ...menu });
    setEditId(menu._id);
    setError("");
  };

  const closeForm = () => {
    setForm(null);
    setEditId(null);
  };

  const save = async () => {
    if (!form?.name) {
      setError("Menu name is required");
      return;
    }
    if (!form?.placement) {
      setError("Placement is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editId ? `/api/admin/menus/${editId}` : "/api/admin/menus";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      closeForm();
      fetchMenus();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteMenu = async (id: string) => {
    if (!confirm("Delete this menu?")) return;
    const res = await fetch(`/api/admin/menus/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error);
      return;
    }
    fetchMenus();
  };

  const addMenuItem = () => {
    if (!form) return;
    const items = form.items || [];
    setForm({
      ...form,
      items: [...items, { ...emptyMenuItem(), sortOrder: items.length }]
    });
  };

  const removeMenuItem = (index: number) => {
    if (!form) return;
    const items = form.items || [];
    setForm({
      ...form,
      items: items.filter((_, i) => i !== index)
    });
  };

  const updateMenuItem = (index: number, updates: Partial<MenuItem>) => {
    if (!form) return;
    const items = form.items || [];
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], ...updates };
    setForm({ ...form, items: updatedItems });
  };

  const moveMenuItem = (index: number, direction: "up" | "down") => {
    if (!form) return;
    const items = form.items || [];
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const newItems = [...items];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];

    // Update sortOrder
    newItems.forEach((item, idx) => {
      item.sortOrder = idx;
    });

    setForm({ ...form, items: newItems });
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Loading menus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage header, footer, and navigation menus from backend
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          New Menu
        </button>
      </div>

      {/* Form Modal */}
      {form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editId ? "Edit Menu" : "Create New Menu"}
              </h2>
              <button
                onClick={closeForm}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Menu Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Menu Name *
                </label>
                <input
                  type="text"
                  value={form.name || ""}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="e.g., Main Header Menu, Footer Menu"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Placement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placement *
                </label>
                <select
                  value={form.placement || "header"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      placement: e.target.value as any
                    })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="header">Header</option>
                  <option value="footer">Footer</option>
                  <option value="mobile">Mobile</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive !== false}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Active
                </label>
              </div>

              {/* Menu Items */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Menu Items
                  </label>
                  <button
                    onClick={addMenuItem}
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  {(form.items || []).length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-4">
                      No menu items yet. Add one above.
                    </p>
                  ) : (
                    (form.items || []).map((item, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-gray-200 bg-white p-3 space-y-2"
                      >
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-1">
                            <input
                              type="text"
                              value={item.label || ""}
                              onChange={(e) =>
                                updateMenuItem(index, { label: e.target.value })
                              }
                              placeholder="Label (e.g., Shop, About)"
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveMenuItem(index, "up")}
                              disabled={index === 0}
                              className="rounded p-1 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => moveMenuItem(index, "down")}
                              disabled={
                                index === (form.items || []).length - 1
                              }
                              className="rounded p-1 hover:bg-gray-100 disabled:opacity-50"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeMenuItem(index)}
                              className="rounded p-1 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <input
                          type="text"
                          value={item.href || ""}
                          onChange={(e) =>
                            updateMenuItem(index, { href: e.target.value })
                          }
                          placeholder="URL (e.g., /shop, /about)"
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                        />

                        <input
                          type="text"
                          value={item.icon || ""}
                          onChange={(e) =>
                            updateMenuItem(index, { icon: e.target.value })
                          }
                          placeholder="Icon name (optional)"
                          className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={closeForm}
                className="rounded px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {saving ? "Saving..." : "Save Menu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menus List */}
      <div className="grid gap-4">
        {menus.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500 mb-3">No menus created yet</p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
            >
              <Plus className="h-4 w-4" />
              Create First Menu
            </button>
          </div>
        ) : (
          menus.map((menu) => (
            <div
              key={menu._id}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {menu.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        menu.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {menu.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      {menu.placement}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {menu.items.length} item{menu.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(menu)}
                    className="rounded p-2 text-gray-600 hover:bg-gray-100"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteMenu(menu._id)}
                    className="rounded p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Menu Items Preview */}
              {menu.items.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {menu.items.map((item, idx) => (
                      <span
                        key={idx}
                        className="text-sm px-3 py-1 rounded-full bg-gray-100 text-gray-700"
                      >
                        {item.label}
                        {item.href && (
                          <span className="text-gray-500 ml-1">
                            ({item.href})
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
