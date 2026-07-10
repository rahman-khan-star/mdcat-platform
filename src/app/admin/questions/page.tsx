"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, X, ChevronDown, ChevronUp } from "lucide-react";

interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
  sort_order: number;
  quizzes: { id: string; title: string };
}

interface Quiz { id: string; title: string; }

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuiz, setFilterQuiz] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Question | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ quiz_id: "", question_text: "", options: ["", "", "", ""], correct_answer_index: 0, explanation: "", sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "15" });
    if (filterQuiz) params.set("quiz_id", filterQuiz);
    const res = await fetch(`/api/admin/questions?${params}`);
    const data = await res.json();
    if (data.success) { setQuestions(data.data); setTotalPages(data.pagination.totalPages); }
    setLoading(false);
  }, [page, filterQuiz]);

  useEffect(() => {
    fetch("/api/admin/quizzes?limit=100").then((r) => r.json()).then((d) => { if (d.success) setQuizzes(d.data); });
  }, []);

  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  const openCreate = () => {
    setEditing(null);
    setForm({ quiz_id: filterQuiz || quizzes[0]?.id || "", question_text: "", options: ["", "", "", ""], correct_answer_index: 0, explanation: "", sort_order: 0 });
    setShowModal(true); setError("");
  };

  const openEdit = (q: Question) => {
    setEditing(q);
    setForm({ quiz_id: q.quiz_id, question_text: q.question_text, options: Array.isArray(q.options) && q.options.length === 4 ? [...q.options] : ["", "", "", ""], correct_answer_index: q.correct_answer_index, explanation: q.explanation, sort_order: q.sort_order });
    setShowModal(true); setError("");
  };

  const handleSave = async () => {
    if (!form.quiz_id || !form.question_text) { setError("Quiz and question text are required"); return; }
    if (form.options.some((o) => !o.trim())) { setError("All 4 options are required"); return; }
    setSaving(true); setError("");
    try {
      const url = editing ? `/api/admin/questions/${editing.id}` : "/api/admin/questions";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) { setShowModal(false); fetchQuestions(); } else { setError(data.error || "Failed to save"); }
    } catch { setError("Failed to save"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) fetchQuestions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Questions</h1>
          <p className="text-text-secondary">Manage quiz questions</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark">
          <Plus className="h-4 w-4" /> Add Question
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <select value={filterQuiz} onChange={(e) => { setFilterQuiz(e.target.value); setPage(1); }} className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
          <option value="">All Quizzes</option>
          {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-surface" />)}</div>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center shadow-sm border border-border"><p className="text-text-secondary">No questions found</p></div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q.id} className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-surface/30" onClick={() => setExpanded(expanded === q.id ? null : q.id)}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{q.question_text}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{q.quizzes?.title}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(q); }} className="rounded-lg p-1.5 text-text-secondary hover:bg-surface-hover hover:text-primary"><Edit className="h-4 w-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }} className="rounded-lg p-1.5 text-text-secondary hover:bg-danger/5 hover:text-danger"><Trash2 className="h-4 w-4" /></button>
                  {expanded === q.id ? <ChevronUp className="h-4 w-4 text-text-secondary" /> : <ChevronDown className="h-4 w-4 text-text-secondary" />}
                </div>
              </div>
              <AnimatePresence>
                {expanded === q.id && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="border-t border-border px-4 py-3 space-y-2">
                      {(q.options as string[]).map((opt, i) => (
                        <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${i === q.correct_answer_index ? "bg-emerald-50 text-emerald-700 font-medium" : "bg-surface/50 text-text-primary"}`}>
                          <span className="font-mono text-xs text-text-secondary">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                          {i === q.correct_answer_index && <span className="ml-auto text-xs font-medium text-emerald-600">Correct</span>}
                        </div>
                      ))}
                      {q.explanation && (
                        <div className="rounded-lg bg-primary/5 px-3 py-2 text-sm text-text-secondary">
                          <span className="font-medium text-primary">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-text-primary">{editing ? "Edit Question" : "Add Question"}</h2>
                <button onClick={() => setShowModal(false)} className="rounded-lg p-1.5 hover:bg-surface-hover"><X className="h-5 w-5" /></button>
              </div>
              {error && <div className="mb-4 rounded-xl bg-danger/5 p-3 text-sm text-danger">{error}</div>}
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Quiz</label>
                  <select value={form.quiz_id} onChange={(e) => setForm({ ...form, quiz_id: e.target.value })} className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none">
                    <option value="">Select quiz</option>
                    {quizzes.map((q) => <option key={q.id} value={q.id}>{q.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Question Text</label>
                  <textarea value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} rows={3} placeholder="Enter the question..." className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Options (click correct answer)</label>
                  <div className="space-y-2">
                    {form.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button type="button" onClick={() => setForm({ ...form, correct_answer_index: i })} className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${form.correct_answer_index === i ? "bg-emerald-500 text-white" : "bg-surface text-text-secondary hover:bg-surface-hover"}`}>{String.fromCharCode(65 + i)}</button>
                        <input value={opt} onChange={(e) => { const n = [...form.options]; n[i] = e.target.value; setForm({ ...form, options: n }); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-primary">Explanation</label>
                  <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={2} placeholder="Why is this the correct answer?" className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
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
