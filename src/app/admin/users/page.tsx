"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Users as UsersIcon, TrendingUp, Trophy, BookOpen } from "lucide-react";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  study_streak: number;
  created_at: string;
  quizzesCompleted: number;
  avgScore: number;
  bestScore: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/users?${params}`);
    const data = await res.json();
    if (data.success) { setUsers(data.data); setTotalPages(data.pagination.totalPages); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <p className="text-text-secondary">View user accounts and progress</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input type="text" placeholder="Search users by name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />)}</div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center shadow-sm border border-border">
          <UsersIcon className="mx-auto h-12 w-12 text-text-secondary/30" />
          <p className="mt-4 text-text-secondary">No users found</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">User</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary"><div className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> Quizzes</div></th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary"><div className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Avg Score</div></th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary"><div className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" /> Best</div></th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Streak</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-surface/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-text-primary">{u.full_name || "Unnamed"}</p>
                        <p className="text-xs text-text-secondary">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.role === "admin" ? "bg-danger/10 text-danger" : "bg-surface text-text-secondary"}`}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-text-primary">{u.quizzesCompleted}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${u.avgScore >= 60 ? "text-emerald-600" : u.avgScore > 0 ? "text-rose-600" : "text-text-secondary"}`}>{u.avgScore > 0 ? `${u.avgScore}%` : "\u2014"}</span>
                    </td>
                    <td className="px-4 py-3 text-text-primary">{u.bestScore > 0 ? `${u.bestScore}%` : "\u2014"}</td>
                    <td className="px-4 py-3">
                      {u.study_streak > 0 ? <span className="inline-flex items-center gap-1 text-amber-600">{u.study_streak}d</span> : <span className="text-text-secondary">{"\u2014"}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50">Previous</button>
          <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-hover disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
