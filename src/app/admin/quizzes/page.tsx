"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, X, Eye, EyeOff } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  subject_id: string;
  question_count: number;
  duration_minutes: number;
  difficulty: string;
  is_active: boolean;
  created_at: string;
  subjects: { id: string; name: string };
}

interface Subject { id: string; name: string; }

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Quiz | null>(null);
  const [form, setForm] = useState({ title: "", subject_id: "", duration_minutes: 30, difficulty: "Medium", is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (filterSubject) params.set("subject", filterSubject);
    if (filterDifficulty) params.set("difficulty", filterDifficulty);
    const res = await fetch(`/api/admin/quizzes?${params}`);
    const data = await res.json();
    if (data.success) { setQuizzes(data.data); setTotalPages(data.pagination.totalPages); }
    setLoading(false);
  }, [page, search, filterSubject, filterDifficulty]);

  useEffect(() => {
    fetch("/api/admin/subjects?limit=100").then((r) => r.json()).then((d) => { if (d.success) setSubjects(d.data); });
  }, []);

  useEffect(() => { fetchQuizzes(); }, [fetchQuizzes]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", subject_id: subjects[0]?.id ?? "", duration_minutes: 30, difficulty: "Medium", is_active: true });
    setShowModal(true); setError("");
  };

  const openEdit = (q: Quiz) => {
    setEditing(q);
    setForm({ title: q.title, subject_id: q.subject_id, duration_minutes: q.duration_minutes, difficulty: q.difficulty, is_active: q.is_active });
    setShowModal(true); setError("");
  };

  const handleSave = async () => {
    if (!form.title || !form.subject_id) { setError("Title and subject are required"); return; }
    setSaving(true); setError("");
    try {
      const url = editing ? `/api/admin/quizzes/${editing.id}` : "/api/admin/quizzes";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { setShowModal(false); fetchQuizzes(); } else { setError(data.error || "Failed to save"); }
    } catch { setError("Failed to save"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this quiz? This will also delete all its questions.")) return;
    const res = await fetch(`/api/admin/quizzes/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchQuizzes();
  };

  const toggleActive = async (q: Quiz) => {
    await fetch(`/api/admin/quizzes/${q.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !q.is_active }) });
    fetchQuizzes();
  };

  const difficultyColor = (d: string) => d === "Easy" ? "bg-emerald-50 text-emerald-600" : d === "Medium" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Quizzes</h1>
          <p className="text-text-secondary">Manage quizzes and their settings</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark">
          <Plus className="h-4 w-4" /> Add Quiz
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input type="text" placeholder="Search quizzes..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={filterSubject} onChange={(e) => { setFilterSubject(e.target.value); setPage(1); }} className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterDifficulty} onChange={(e) => { setFilterDifficulty(e.target.value); setPage(1); }} className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />)}</div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center shadow-sm border border-border"><p className="text-text-secondary">No quizzes found</p></div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Subject</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Difficulty</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Questions</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Duration</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((q) => (
                  <tr key={q.id} className="border-b border-border/50 hover:bg-surface/30">
                    <td className="px-4 py-3 font-medium text-text-primary">{q.title}</td>
                    <td className="px-4 py-3 text-text-secondary">{q.subjects?.name}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColor(q.difficulty)}`}>{q.difficulty}</span></td>
                    <td className="px-4 py-3 text-text-primary">{q.question_count}</td>
                    <td className="px-4 py-3 text-text-primary">{q.duration_minutes}m</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(q)} className="rounded-lg p-1 hover:bg-surface-hover">
                        {q.is_active ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-text-secondary" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(q)} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-primary"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(q.id)} className="rounded-lg p-1.5 text-text-secondary hover:bg-danger/5 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
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
                <h2 className="text-lg font-bold text-text-primary">{editing ? "Edit Quiz" : "Add Quiz"}</h2>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 hover:bg-surface-hover"><X className="h-5 w-5" /></button>
              </div>
              {error && <div className="mb-4 rounded-xl bg-danger/5 p-3 text-sm text-danger">{error}</div>}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Biology Chapter 1" className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Subject</label>
                  <select value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                    <option value="">Select subject</option>
                    {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Difficulty</label>
                    <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Duration (min)</label>
                    <input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="is_active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                  <label htmlFor="is_active" className="text-sm text-text-primary">Active (visible to students)</label>
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
