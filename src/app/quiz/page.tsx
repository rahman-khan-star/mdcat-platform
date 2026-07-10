"use client";

import { useState, useMemo } from "react";
import QuizCard from "@/components/QuizCard";
import SearchBar from "@/components/SearchBar";
import { quizzes, subjects } from "@/data/mockData";
import { motion } from "framer-motion";
import { Filter } from "lucide-react";

export default function QuizListPage() {
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const filtered = useMemo(() => {
    return quizzes.filter((q) => {
      const matchesSearch =
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.subject.toLowerCase().includes(search.toLowerCase());
      const matchesSubject =
        selectedSubject === "all" || q.subjectId === selectedSubject;
      const matchesDifficulty =
        selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  }, [search, selectedSubject, selectedDifficulty]);

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Quiz Library
          </h1>
          <p className="mt-2 text-text-secondary">
            Choose from {quizzes.length} practice quizzes across all subjects
          </p>
        </motion.div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search quizzes..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-white py-3 px-4 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full rounded-xl border border-border bg-white py-3 px-4 text-sm text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <div className="mt-2 text-sm text-text-muted">
          Showing {filtered.length} of {quizzes.length} quizzes
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quiz, i) => (
            <QuizCard key={quiz.id} quiz={quiz} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-text-secondary">
              No quizzes found matching your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
