"use client";

import { useEffect, useState, useCallback } from "react";
import { FileText, Download, Search, ExternalLink } from "lucide-react";

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
}

const BOARDS = ["Federal Board", "Lahore Board", "Karachi Board", "Peshawar Board", "Multan Board", "Rawalpindi Board", "AJK Board", "Balochistan Board"];

export default function PastPapersPage() {
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBoard, setFilterBoard] = useState("");
  const [filterExamType, setFilterExamType] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPapers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (filterBoard) params.set("board", filterBoard);
    if (filterExamType) params.set("exam_type", filterExamType);
    if (filterYear) params.set("year", filterYear);
    const res = await fetch(`/api/past-papers?${params}`);
    const data = await res.json();
    if (data.success) { setPapers(data.data); setTotalPages(data.pagination.totalPages); }
    setLoading(false);
  }, [page, filterBoard, filterExamType, filterYear]);

  useEffect(() => { fetchPapers(); }, [fetchPapers]);

  const trackDownload = async (id: string) => {
    await fetch(`/api/past-papers/${id}/download`, { method: "POST" });
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-text-primary">Past Papers</h1>
          <p className="mt-2 text-text-secondary">Download solved past papers for MDCAT, ECAT, and more</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {BOARDS.map((board) => (
            <button
              key={board}
              onClick={() => { setFilterBoard(filterBoard === board ? "" : board); setPage(1); }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                filterBoard === board
                  ? "bg-primary text-white"
                  : "bg-white text-text-secondary border border-border hover:border-primary hover:text-primary"
              }`}
            >
              {board}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={filterExamType}
            onChange={(e) => { setFilterExamType(e.target.value); setPage(1); }}
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">All Exam Types</option>
            <option value="MDCAT">MDCAT</option>
            <option value="ECAT">ECAT</option>
            <option value="CSS">CSS</option>
            <option value="Matric">Matric</option>
            <option value="Inter">Inter</option>
            <option value="NET">NET</option>
          </select>
          <select
            value={filterYear}
            onChange={(e) => { setFilterYear(e.target.value); setPage(1); }}
            className="rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : papers.length === 0 ? (
          <div className="rounded-2xl bg-white py-16 text-center shadow-sm border border-border">
            <FileText className="mx-auto h-12 w-12 text-text-secondary mb-3" />
            <p className="text-text-secondary">No past papers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map((paper) => (
              <div key={paper.id} className="rounded-2xl bg-white shadow-sm border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{paper.title}</h3>
                    <p className="text-xs text-text-secondary mt-0.5">{paper.exam_type} &middot; {paper.year}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="inline-flex rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-text-secondary">
                    {paper.board}
                  </span>
                  {paper.subject && (
                    <span className="inline-flex rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {paper.subject}
                    </span>
                  )}
                </div>

                {paper.description && (
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">{paper.description}</p>
                )}

                <div className="flex items-center gap-2 mt-auto">
                  {paper.file_url ? (
                    <a
                      href={paper.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackDownload(paper.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                      <Download className="h-4 w-4" /> View / Download PDF
                    </a>
                  ) : (
                    <span className="text-sm text-text-secondary">No file available</span>
                  )}
                  <span className="ml-auto text-xs text-text-secondary">{paper.download_count} downloads</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-white disabled:opacity-50">Previous</button>
            <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-white disabled:opacity-50">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
