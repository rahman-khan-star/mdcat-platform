"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, BookOpen, Medal, Crown, TrendingUp } from "lucide-react";
import { leaderboardData } from "@/data/mockData";

export default function LeaderboardPage() {
  const topThree = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);

  const rankColors = ["text-warning", "text-text-secondary", "text-amber-600"];
  const rankBgs = ["bg-warning/10", "bg-surface", "bg-amber-600/10"];

  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-warning/10">
            <Trophy className="h-8 w-8 text-warning" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-text-primary sm:text-4xl">
            Leaderboard
          </h1>
          <p className="mt-2 text-text-secondary">
            See how you rank among fellow MDCAT aspirants
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex items-end justify-center gap-4 sm:gap-6"
        >
          {topThree.map((entry, i) => {
            const heights = ["h-28 sm:h-32", "h-20 sm:h-24", "h-16 sm:h-20"];
            const order = [1, 0, 2];
            const actualEntry = topThree[order[i]];
            const actualIdx = order[i];

            return (
              <motion.div
                key={actualEntry.rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="relative">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white ${
                      actualIdx === 0
                        ? "bg-gradient-to-br from-warning to-amber-600"
                        : actualIdx === 1
                        ? "bg-gradient-to-br from-text-secondary to-slate-500"
                        : "bg-gradient-to-br from-amber-600 to-amber-800"
                    }`}
                  >
                    {actualEntry.avatar}
                  </div>
                  {actualIdx === 0 && (
                    <Crown className="absolute -top-3 left-1/2 h-6 w-6 -translate-x-1/2 text-warning" />
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold text-text-primary">
                  {actualEntry.name}
                </p>
                <p className="text-xs text-text-secondary">
                  {actualEntry.score.toLocaleString()} pts
                </p>
                <div
                  className={`mt-3 w-24 rounded-t-xl sm:w-28 ${heights[i]} flex items-center justify-center rounded-t-xl ${
                    actualIdx === 0
                      ? "bg-gradient-to-t from-warning/20 to-warning/5"
                      : actualIdx === 1
                      ? "bg-gradient-to-t from-text-secondary/20 to-text-secondary/5"
                      : "bg-gradient-to-t from-amber-600/20 to-amber-600/5"
                  }`}
                >
                  <span className={`text-2xl font-bold ${rankColors[actualIdx]}`}>
                    #{actualEntry.rank}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="mt-10 rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 border-b border-border bg-surface px-6 py-3 text-xs font-medium text-text-muted">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Student</div>
            <div className="col-span-2 text-right">Score</div>
            <div className="col-span-2 text-right hidden sm:block">Quizzes</div>
            <div className="col-span-2 text-right hidden sm:block">Streak</div>
          </div>

          {rest.map((entry, i) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="grid grid-cols-12 items-center gap-4 border-b border-border/50 px-6 py-4 last:border-0 transition-colors hover:bg-surface/50"
            >
              <div className="col-span-1">
                <span className="text-sm font-bold text-text-muted">
                  #{entry.rank}
                </span>
              </div>
              <div className="col-span-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {entry.avatar}
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {entry.name}
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm font-bold text-text-primary">
                  {entry.score.toLocaleString()}
                </span>
              </div>
              <div className="col-span-2 text-right hidden sm:block">
                <span className="flex items-center justify-end gap-1 text-sm text-text-secondary">
                  <BookOpen className="h-3.5 w-3.5" />
                  {entry.quizzesCompleted}
                </span>
              </div>
              <div className="col-span-2 text-right hidden sm:block">
                <span className="flex items-center justify-end gap-1 text-sm text-text-secondary">
                  <Flame className="h-3.5 w-3.5 text-warning" />
                  {entry.streak}d
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 rounded-2xl border-2 border-primary/20 bg-primary/5 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">
                Your Current Ranking
              </h3>
              <p className="text-xs text-text-secondary">
                You&apos;re ranked <span className="font-bold text-primary">#15</span> out of 2,450 students. Keep practicing to climb higher!
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
