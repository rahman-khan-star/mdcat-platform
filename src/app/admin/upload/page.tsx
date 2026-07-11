"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Download } from "lucide-react";
import * as XLSX from "xlsx";

interface Quiz { id: string; title: string; }
interface ParsedRow {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string;
  _valid: boolean;
  _errors: string[];
}

export default function AdminUploadPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: Array<{ row: number; message: string }> } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/quizzes?limit=100")
      .then((r) => r.json())
      .then((d) => { if (d.success) setQuizzes(d.data); });
  }, []);

  const parseFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as Record<string, unknown>[];

        const parsed: ParsedRow[] = rows.map((row) => {
          const question = String(row.question || row.Question || "").trim();
          const optionA = String(row.option_a || row.OptionA || row.A || "").trim();
          const optionB = String(row.option_b || row.OptionB || row.B || "").trim();
          const optionC = String(row.option_c || row.OptionC || row.C || "").trim();
          const optionD = String(row.option_d || row.OptionD || row.D || "").trim();
          const correctAnswer = String(row.correct_answer || row.CorrectAnswer || row.answer || row.Answer || "").trim().toUpperCase();
          const explanation = String(row.explanation || row.Explanation || "").trim();

          const errors: string[] = [];
          if (!question) errors.push("Missing question");
          if (!optionA) errors.push("Missing option A");
          if (!optionB) errors.push("Missing option B");
          if (!optionC) errors.push("Missing option C");
          if (!optionD) errors.push("Missing option D");
          if (!["A", "B", "C", "D"].includes(correctAnswer)) errors.push(`Invalid answer: "${correctAnswer}"`);

          return {
            question,
            option_a: optionA,
            option_b: optionB,
            option_c: optionC,
            option_d: optionD,
            correct_answer: correctAnswer,
            explanation,
            _valid: errors.length === 0,
            _errors: errors,
          };
        });

        setParsedData(parsed);
      } catch {
        setParsedData([]);
      }
    };
    reader.readAsArrayBuffer(f);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) parseFile(f);
  };

  const handleImport = async () => {
    if (!file || !selectedQuiz) return;
    setImporting(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("quiz_id", selectedQuiz);

    try {
      const res = await fetch("/api/admin/upload/questions", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
        setParsedData([]);
        setFile(null);
      }
    } catch {
      setResult({ imported: 0, errors: [{ row: 0, message: "Upload failed" }] });
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedData.filter((r) => r._valid).length;
  const invalidCount = parsedData.filter((r) => !r._valid).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Bulk Upload Questions</h1>
        <p className="text-text-secondary">Import MCQs from CSV or Excel files</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-4">1. Select Quiz</h2>
        <select
          value={selectedQuiz}
          onChange={(e) => setSelectedQuiz(e.target.value)}
          className="w-full max-w-md rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
        >
          <option value="">Choose a quiz...</option>
          {quizzes.map((q) => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-4">2. Upload File</h2>
        <div
          className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) parseFile(f); }}
          />
          <FileSpreadsheet className="mx-auto h-12 w-12 text-text-secondary mb-3" />
          <p className="text-text-secondary mb-2">
            {file ? file.name : "Drag & drop your CSV or Excel file here"}
          </p>
          <p className="text-xs text-text-secondary mb-4">Supports .csv, .xlsx, .xls</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Upload className="h-4 w-4" /> Choose File
          </button>
        </div>

        {file && (
          <div className="mt-4 flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <span className="text-sm text-text-primary">{file.name}</span>
            <button onClick={() => { setFile(null); setParsedData([]); setResult(null); }} className="ml-auto text-text-secondary hover:text-danger">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {parsedData.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">3. Preview & Import</h2>
            <div className="flex gap-3 text-sm">
              <span className="text-emerald-600">{validCount} valid</span>
              {invalidCount > 0 && <span className="text-danger">{invalidCount} errors</span>}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">#</th>
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">Question</th>
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">A</th>
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">B</th>
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">C</th>
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">D</th>
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">Answer</th>
                  <th className="px-3 py-2 text-left font-medium text-text-secondary">Status</th>
                </tr>
              </thead>
              <tbody>
                {parsedData.map((row, i) => (
                  <tr key={i} className={`border-b border-border/50 ${row._valid ? "" : "bg-danger/5"}`}>
                    <td className="px-3 py-2 text-text-secondary">{i + 1}</td>
                    <td className="px-3 py-2 text-text-primary max-w-[200px] truncate">{row.question || "-"}</td>
                    <td className="px-3 py-2 text-text-primary max-w-[100px] truncate">{row.option_a || "-"}</td>
                    <td className="px-3 py-2 text-text-primary max-w-[100px] truncate">{row.option_b || "-"}</td>
                    <td className="px-3 py-2 text-text-primary max-w-[100px] truncate">{row.option_c || "-"}</td>
                    <td className="px-3 py-2 text-text-primary max-w-[100px] truncate">{row.option_d || "-"}</td>
                    <td className="px-3 py-2 text-text-primary">{row.correct_answer || "-"}</td>
                    <td className="px-3 py-2">
                      {row._valid ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <div className="group relative">
                          <AlertCircle className="h-4 w-4 text-danger cursor-help" />
                          <div className="hidden group-hover:block absolute z-10 bottom-full left-0 mb-1 w-48 rounded-lg bg-white p-2 text-xs text-danger shadow-lg border border-border">
                            {row._errors.join(", ")}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={!selectedQuiz || importing || validCount === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {importing ? "Importing..." : `Import ${validCount} Questions`}
          </button>
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-white p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-text-primary mb-3">Import Result</h2>
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-text-primary">{result.imported} questions imported successfully</span>
            </div>
            {result.errors.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-danger mb-2">{result.errors.length} rows had errors:</p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-text-secondary">Row {err.row}: {err.message}</p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-3">CSV Format Guide</h2>
        <p className="text-sm text-text-secondary mb-3">Your CSV/Excel file should have these columns:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-border rounded-xl">
            <thead>
              <tr className="bg-surface/50">
                <th className="px-3 py-2 text-left font-medium text-text-secondary">question</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary">option_a</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary">option_b</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary">option_c</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary">option_d</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary">correct_answer</th>
                <th className="px-3 py-2 text-left font-medium text-text-secondary">explanation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2 text-text-primary">What is 2+2?</td>
                <td className="px-3 py-2 text-text-primary">3</td>
                <td className="px-3 py-2 text-text-primary">4</td>
                <td className="px-3 py-2 text-text-primary">5</td>
                <td className="px-3 py-2 text-text-primary">6</td>
                <td className="px-3 py-2 text-text-primary">B</td>
                <td className="px-3 py-2 text-text-primary">Basic arithmetic</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          onClick={() => {
            const csv = "question,option_a,option_b,option_c,option_d,correct_answer,explanation\n\"What is 2+2?\",\"3\",\"4\",\"5\",\"6\",\"B\",\"Basic arithmetic\"";
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "question_template.csv";
            a.click();
          }}
          className="mt-4 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <Download className="h-4 w-4" /> Download CSV Template
        </button>
      </div>
    </div>
  );
}
