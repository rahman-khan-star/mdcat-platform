"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, GripVertical, ArrowLeft, Save } from "lucide-react";

interface Subject { id: string; name: string; }

interface QuestionForm {
  id: string;
  question_text: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

const createEmptyQuestion = (): QuestionForm => ({
  id: crypto.randomUUID(),
  question_text: "",
  options: ["", "", "", ""],
  correct_answer_index: 0,
  explanation: "",
});

export default function BulkQuizCreatorPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [duration, setDuration] = useState(30);
  const [isActive, setIsActive] = useState(true);
  const [questions, setQuestions] = useState<QuestionForm[]>([createEmptyQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/subjects?limit=100")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSubjects(d.data); });
  }, []);

  const addQuestion = () => {
    setQuestions([...questions, createEmptyQuestion()]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof QuestionForm, value: unknown) => {
    setQuestions(questions.map((q) => q.id === id ? { ...q, [field]: value } : q));
  };

  const updateOption = (id: string, index: number, value: string) => {
    setQuestions(questions.map((q) => {
      if (q.id !== id) return q;
      const newOptions = [...q.options];
      newOptions[index] = value;
      return { ...q, options: newOptions };
    }));
  };

  const moveQuestion = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("Quiz title is required"); return; }
    if (!subjectId) { setError("Subject is required"); return; }

    const validQuestions = questions.filter((q) => q.question_text.trim());
    if (validQuestions.length === 0) { setError("Add at least one question with text"); return; }

    for (const q of validQuestions) {
      if (q.options.some((o) => !o.trim())) {
        setError(`All 4 options are required for: "${q.question_text.slice(0, 50)}..."`);
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/quizzes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          subject_id: subjectId,
          difficulty,
          duration_minutes: duration,
          is_active: isActive,
          questions: validQuestions.map((q, i) => ({
            question_text: q.question_text,
            options: q.options,
            correct_answer_index: q.correct_answer_index,
            explanation: q.explanation,
            sort_order: i + 1,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin/quizzes");
      } else {
        setError(data.error || "Failed to create quiz");
      }
    } catch {
      setError("Failed to create quiz");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="rounded-lg p-2 hover:bg-surface-hover">
          <ArrowLeft className="h-5 w-5 text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Create Quiz with Questions</h1>
          <p className="text-text-secondary">Build a complete quiz in one go</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quiz Details</h2>
        {error && <div className="mb-4 rounded-xl bg-danger/5 p-3 text-sm text-danger">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Biology Chapter 1 Quiz"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-primary">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-primary">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm text-text-primary">Active (visible to students)</label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Questions ({questions.length})</h2>
          <button
            onClick={addQuestion}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> Add Question
          </button>
        </div>

        <AnimatePresence>
          {questions.map((q, index) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl bg-white p-5 shadow-sm border border-border"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="flex flex-col gap-1 pt-2">
                  <button
                    onClick={() => moveQuestion(index, -1)}
                    disabled={index === 0}
                    className="rounded p-0.5 text-text-secondary hover:bg-surface-hover disabled:opacity-30"
                  >
                    <GripVertical className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    onClick={() => moveQuestion(index, 1)}
                    disabled={index === questions.length - 1}
                    className="rounded p-0.5 text-text-secondary hover:bg-surface-hover disabled:opacity-30"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <textarea
                    value={q.question_text}
                    onChange={(e) => updateQuestion(q.id, "question_text", e.target.value)}
                    placeholder="Enter question text..."
                    rows={2}
                    className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  onClick={() => removeQuestion(q.id)}
                  disabled={questions.length <= 1}
                  className="rounded-lg p-2 text-text-secondary hover:bg-danger/5 hover:text-danger disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="ml-12 space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Options (click correct answer)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateQuestion(q.id, "correct_answer_index", i)}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            q.correct_answer_index === i
                              ? "bg-emerald-500 text-white"
                              : "bg-surface text-text-secondary hover:bg-surface-hover"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </button>
                        <input
                          value={opt}
                          onChange={(e) => updateOption(q.id, i, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + i)}`}
                          className="flex-1 rounded-xl border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-secondary">Explanation (optional)</label>
                  <input
                    value={q.explanation}
                    onChange={(e) => updateQuestion(q.id, "explanation", e.target.value)}
                    placeholder="Why is this the correct answer?"
                    className="w-full rounded-xl border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="flex justify-center">
          <button
            onClick={addQuestion}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-border px-6 py-3 text-sm font-medium text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Another Question
          </button>
        </div>
      </div>

      <div className="sticky bottom-0 rounded-2xl bg-white p-4 shadow-lg border border-border flex justify-end gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-surface-hover"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Creating..." : `Create Quiz (${questions.filter((q) => q.question_text.trim()).length} questions)`}
        </button>
      </div>
    </div>
  );
}
