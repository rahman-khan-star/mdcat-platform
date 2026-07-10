"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, X, Palette, BookOpen } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  total_topics: number;
  sort_order: number;
  created_at: string;
}

const COLORS = [
  "#2563eb", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState({ id: "", name: "", icon: "", description: "", color: "#2563eb", total_topics: 0, sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    const res = await fetch(`/api/admin/subjects?${params}`);
    const data = await res.json();
    if (data.success) {
      setSubjects(data.data);
      setTotalPages(data.pagination.totalPages);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const openCreate = () => {
    setEditing(null);
    setForm({ id: "", name: "", icon: "BookOpen", description: "", color: "#2563eb", total_topics: 0, sort_order: 0 });
    setShowModal(true);
    setError("");
  };

  const openEdit = (s: Subject) => {
    setEditing(s);
    setForm({ id: s.id, name: s.name, icon: s.icon, description: s.description, color: s.color, total_topics: s.total_topics, sort_order: s.sort_order });
    setShowModal(true);
    setError("");
  };

  const handleSave = async () => {
    if (!form.id || !form.name || !form.icon) {
      setError("ID, name, and icon are required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/admin/subjects/${editing.id}` : "/api/admin/subjects";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchSubjects();
      } else {
        setError(data.error || "Failed to save");
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject? This will also delete all associated quizzes and questions.")) return;
    const res = await fetch(`/api/admin/subjects/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchSubjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Subjects</h1>
          <p className="text-text-secondary">Manage MDCAT subjects</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Search subjects..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center shadow-sm border border-border">
          <BookOpen className="mx-auto h-12 w-12 text-text-secondary/30" />
          <p className="mt-4 text-text-secondary">No subjects found</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Subject</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">ID</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Topics</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Order</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-surface/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + "20" }}>
                          <Palette className="h-4 w-4" style={{ color: s.color }} />
                        </div>
                        <span className="font-medium text-text-primary">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{s.id}</td>
                    <td className="px-4 py-3 text-text-primary">{s.total_topics}</td>
                    <td className="px-4 py-3 text-text-primary">{s.sort_order}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(s.id)} className="rounded-lg p-1.5 text-text-secondary hover:bg-danger/5 hover:text-danger">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
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

      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text-primary">{editing ? "Edit Subject" : "Add Subject"}</h2>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 hover:bg-surface-hover"><X className="h-5 w-5" /></button>
              </div>

              {error && <div className="mb-4 rounded-xl bg-danger/5 p-3 text-sm text-danger">{error}</div>}

              <div className="space-y-4">
                {!editing && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">ID</label>
                    <input value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="e.g. biology" className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                )}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Biology" className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Icon (Lucide name)</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. BookOpen" className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {COLORS.map((c) => (
                        <button key={c} onClick={() => setForm({ ...form, color: c })} className={`h-8 w-8 rounded-lg border-2 transition-transform hover:scale-110 ${form.color === c ? "border-text-primary scale-110" : "border-transparent"}`} style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Total Topics</label>
                    <input type="number" value={form.total_topics} onChange={(e) => setForm({ ...form, total_topics: Number(e.target.value) })} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{saving ? "Saving..." : editing ? "Update" : "Create"}</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
