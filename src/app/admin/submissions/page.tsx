"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";

interface Submission {
  id: string;
  score: number;
  correct_count: number;
  total_questions: number;
  time_taken_seconds: number;
  passed: boolean;
  created_at: string;
  profiles: { id: string; full_name: string; email: string };
  quizzes: { id: string; title: string; subjects: { name: string } };
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuiz, setFilterQuiz] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (filterQuiz) params.set("quiz_id", filterQuiz);
    const res = await fetch(`/api/admin/submissions?${params}`);
    const data = await res.json();
    if (data.success) { setSubmissions(data.data); setTotalPages(data.pagination.totalPages); }
    setLoading(false);
  }, [page, filterQuiz]);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}m ${s % 60}s`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Submissions</h1>
        <p className="text-text-secondary">View all quiz submissions</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        <input type="text" placeholder="Filter by quiz ID..." value={filterQuiz} onChange={(e) => { setFilterQuiz(e.target.value); setPage(1); }} className="w-full rounded-xl border border-border bg-white py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(10)].map((_, i) => <div key={i} className="h-14 animate-pulse rounded-xl bg-surface" />)}</div>
      ) : submissions.length === 0 ? (
        <div className="rounded-2xl bg-white py-12 text-center shadow-sm border border-border"><p className="text-text-secondary">No submissions found</p></div>
      ) : (
        <div className="rounded-2xl bg-white shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">User</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Quiz</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Subject</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Score</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Correct</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-surface/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-text-primary">{s.profiles?.full_name || "Unknown"}</p>
                        <p className="text-xs text-text-secondary">{s.profiles?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-primary">{s.quizzes?.title}</td>
                    <td className="px-4 py-3 text-text-secondary">{s.quizzes?.subjects?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.score >= 60 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{s.score}%</span>
                    </td>
                    <td className="px-4 py-3 text-text-primary">{s.correct_count}/{s.total_questions}</td>
                    <td className="px-4 py-3 text-text-secondary">{formatTime(s.time_taken_seconds)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${s.passed ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>{s.passed ? "Passed" : "Failed"}</span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
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
