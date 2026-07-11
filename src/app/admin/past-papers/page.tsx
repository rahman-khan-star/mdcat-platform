"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Edit, Trash2, X, ExternalLink, Eye, EyeOff } from "lucide-react";

interface PastPaper {
  id: string;
  title: string;
  board: string;
  exam_type: string;
  year: number;
  subject: string;
  description: string;
  file_url: string;
  download_count: number;
  is_active: boolean;
  created_at: string;
}

const BOARDS = ["Federal Board", "Lahore Board", "Karachi Board", "Peshawar Board", "Multan Board", "Rawalpindi Board", "AJK Board", "Balochistan Board"];
const EXAM_TYPES = ["MDCAT", "ECAT", "CSS", "PMS", "NTS", "Matric", "Inter", "Other"];

export default function AdminPastPapersPage() {
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterBoard, setFilterBoard] = useState("");
  const [filterExamType, setFilterExamType] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PastPaper | null>(null);
  const [form, setForm] = useState({ title: "", board: "", exam_type: "", year: new Date().getFullYear(), subject: "", description: "", file_url: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (filterBoard) params.set("board", filterBoard);
    if (filterExamType) params.set("exam_type", filterExamType);
    const res = await fetch(`/api/admin/past-papers?${params}`);
    const data = await res.json();
    if (data.success) { setPapers(data.data); setTotalPages(data.pagination.totalPages); }
    setLoading(false);
  }, [page, search, filterBoard, filterExamType]);

  useEffect(() => { fetchPapers(); }, [fetchPapers]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", board: "", exam_type: "", year: new Date().getFullYear(), subject: "", description: "", file_url: "" });
    setShowModal(true); setError("");
  };

  const openEdit = (p: PastPaper) => {
    setEditing(p);
    setForm({ title: p.title, board: p.board, exam_type: p.exam_type, year: p.year, subject: p.subject, description: p.description || "", file_url: p.file_url || "" });
    setShowModal(true); setError("");
  };

  const handleSave = async () => {
    if (!form.title || !form.board || !form.exam_type) { setError("Title, board, and exam type are required"); return; }
    setSaving(true); setError("");
    try {
      const url = editing ? `/api/admin/past-papers/${editing.id}` : "/api/admin/past-papers";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { setShowModal(false); fetchPapers(); } else { setError(data.error || "Failed to save"); }
    } catch { setError("Failed to save"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this past paper?")) return;
    const res = await fetch(`/api/admin/past-papers/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchPapers();
  };

  const toggleActive = async (p: PastPaper) => {
    await fetch(`/api/admin/past-papers/${p.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !p.is_active }) });
    fetchPapers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Past Papers</h1>
          <p className="text-text-secondary">Manage past papers for students</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark">
          <Plus className="h-4 w-4" /> Add Past Paper
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <input type="text" placeholder="Search papers..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <select value={filterBoard} onChange={(e) => { setFilterBoard(e.target.value); setPage(1); }} className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
          <option value="">All Boards</option>
          {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
        <select value={filterExamType} onChange={(e) => { setFilterExamType(e.target.value); setPage(1); }} className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
          <option value="">All Exam Types</option>
          {EXAM_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-surface" />)}</div>
      ) : papers.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center shadow-sm border border-border"><p className="text-text-secondary">No past papers found</p></div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Board</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Year</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Subject</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Downloads</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-right font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-surface/30">
                    <td className="px-4 py-3 font-medium text-text-primary max-w-[200px] truncate">{p.title}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.board}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.exam_type}</td>
                    <td className="px-4 py-3 text-text-primary">{p.year}</td>
                    <td className="px-4 py-3 text-text-secondary">{p.subject || "-"}</td>
                    <td className="px-4 py-3 text-text-primary">{p.download_count}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(p)} className="rounded-lg p-1 hover:bg-surface-hover">
                        {p.is_active ? <Eye className="h-4 w-4 text-emerald-500" /> : <EyeOff className="h-4 w-4 text-text-secondary" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.file_url && (
                          <a href={p.file_url} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-primary">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button onClick={() => openEdit(p)} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-primary"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-text-secondary hover:bg-danger/5 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text-primary">{editing ? "Edit Past Paper" : "Add Past Paper"}</h2>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 hover:bg-surface-hover"><X className="h-5 w-5" /></button>
              </div>
              {error && <div className="mb-4 rounded-xl bg-danger/5 p-3 text-sm text-danger">{error}</div>}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. MDCAT 2024 (Solved)" className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Board</label>
                    <select value={form.board} onChange={(e) => setForm({ ...form, board: e.target.value })} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                      <option value="">Select board</option>
                      {BOARDS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Exam Type</label>
                    <select value={form.exam_type} onChange={(e) => setForm({ ...form, exam_type: e.target.value })} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                      <option value="">Select type</option>
                      {EXAM_TYPES.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Year</label>
                    <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-primary">Subject</label>
                    <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Physics" className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Optional description..." className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">File URL (PDF link)</label>
                  <input value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
