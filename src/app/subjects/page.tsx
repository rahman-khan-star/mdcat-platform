"use client";

import { useState, useEffect } from "react";
import SubjectCard from "@/components/SubjectCard";
import SearchBar from "@/components/SearchBar";
import { LoadingState, ErrorState, EmptyState } from "@/components/DataStates";
import { motion } from "framer-motion";
import type { Subject } from "@/types";

export default function SubjectsPage() {
  const [search, setSearch] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subjects");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubjects(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load subjects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Subjects
          </h1>
          <p className="mt-2 text-text-secondary">
            Master every subject for your MDCAT preparation
          </p>
        </motion.div>

        <div className="mt-8 max-w-md">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search subjects..."
          />
        </div>

        {isLoading && <LoadingState message="Loading subjects..." />}
        {error && <ErrorState message={error} onRetry={fetchSubjects} />}

        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState message="No subjects found matching your search." />
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((subject, i) => (
              <SubjectCard key={subject.id} subject={subject} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
