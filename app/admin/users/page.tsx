"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RefreshCw, Send, UserCheck, UserX, ChevronUp, ChevronDown } from "lucide-react";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  user_number?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<"id" | "full_name">("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [page, setPage] = useState(0);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) {
      setUsers(data.map((u, i) => ({ ...u, user_number: i + 1 })));
    }
    setLoading(false);
  };

  const toggleSort = (field: "id" | "full_name") => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === users.length) setSelected(new Set());
    else setSelected(new Set(users.map(u => u.id)));
  };

  const sorted = [...users].sort((a, b) => {
    const av = sortField === "id" ? (a.user_number ?? 0) : a.full_name;
    const bv = sortField === "id" ? (b.user_number ?? 0) : b.full_name;
    return sortDir === "asc"
      ? (typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number))
      : (typeof bv === "string" ? bv.localeCompare(av as string) : (bv as number) - (av as number));
  });

  const paginated = sorted.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
  const totalPages = Math.ceil(sorted.length / rowsPerPage);

  const handleEnable = async () => {
    for (const id of selected) {
      await supabase.from("users").update({ status: "Enabled" }).eq("id", id);
    }
    fetchUsers();
    setSelected(new Set());
  };

  const SortIcon = ({ field }: { field: string }) =>
    sortField === field
      ? (sortDir === "asc" ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />)
      : <ChevronUp size={14} className="inline ml-1 opacity-30" />;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold text-[#1a2e5a] mb-1">Users</h1>
      <div className="w-16 h-1 bg-[#c8ff00] rounded mb-8" />

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          disabled={selected.size === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Send size={14} />
          RESEND WELCOME EMAIL
        </button>
        <button
          onClick={handleEnable}
          disabled={selected.size === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ENABLE
        </button>
        <div className="ml-auto">
          <button onClick={fetchUsers} className="p-2 text-gray-400 hover:text-gray-700 transition">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="w-12 px-4 py-4">
                <input
                  type="checkbox"
                  checked={selected.size === users.length && users.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
              </th>
              <th
                className="px-4 py-4 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900 select-none w-24"
                onClick={() => toggleSort("id")}
              >
                id <SortIcon field="id" />
              </th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Roles</th>
              <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-4">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-400">No users found</td>
              </tr>
            ) : (
              paginated.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition ${selected.has(user.id) ? "bg-blue-50" : ""}`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{user.user_number}</td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{user.full_name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{user.email || "—"}</td>
                  <td className="px-4 py-4 text-sm text-gray-600 capitalize">{user.role}</td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-medium ${
                      user.status === "Enabled" ? "text-gray-700" : "text-red-500"
                    }`}>
                      {user.status || "Enabled"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 gap-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <span className="text-sm text-gray-600">
            {page * rowsPerPage + 1}–{Math.min((page + 1) * rowsPerPage, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
            >‹</button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 transition"
            >›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
