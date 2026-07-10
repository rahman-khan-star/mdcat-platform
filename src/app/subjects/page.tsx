"use client";

import { useState } from "react";
import SubjectCard from "@/components/SubjectCard";
import SearchBar from "@/components/SearchBar";
import { subjects } from "@/data/mockData";
import { motion } from "framer-motion";

export default function SubjectsPage() {
  const [search, setSearch] = useState("");

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

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((subject, i) => (
            <SubjectCard key={subject.id} subject={subject} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-text-secondary">
              No subjects found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
