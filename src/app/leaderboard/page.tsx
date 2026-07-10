"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Flame, BookOpen, Crown, TrendingUp } from "lucide-react";
import { LoadingState, ErrorState, EmptyState } from "@/components/DataStates";
import type { LeaderboardEntry } from "@/types";

interface UserRank {
  rank: number;
  totalScore: number;
  quizzesCompleted: number;
  streak: number;
  totalUsers: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [lbRes, rankRes] = await Promise.all([
        fetch("/api/leaderboard"),
        fetch("/api/student/rank"),
      ]);
      const lbJson = await lbRes.json();
      const rankJson = await rankRes.json();
      if (!lbJson.success) throw new Error(lbJson.error);
      setLeaderboard(lbJson.data);
      if (rankJson.success) setUserRank(rankJson.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

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

        {isLoading && <LoadingState message="Loading leaderboard..." />}
        {error && <ErrorState message={error} onRetry={fetchData} />}

        {!isLoading && !error && leaderboard.length === 0 && (
          <EmptyState message="No leaderboard data yet. Be the first to take a quiz!" />
        )}

        {!isLoading && !error && topThree.length > 0 && (
          <>
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
                      <span className={`text-2xl font-bold ${
                        actualIdx === 0 ? "text-warning" : actualIdx === 1 ? "text-text-secondary" : "text-amber-600"
                      }`}>
                        #{actualEntry.rank}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {rest.length > 0 && (
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
            )}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 rounded-2xl border-2 border-primary/20 bg-primary/5 p-6"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">
                      Your Current Ranking
                    </h3>
                    <p className="text-xs text-text-secondary">
                      {userRank && userRank.rank > 0
                        ? `You're ranked #${userRank.rank} out of ${userRank.totalUsers} students`
                        : "Take a quiz to get ranked!"}
                    </p>
                  </div>
                </div>
                {userRank && userRank.rank > 0 && (
                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <p className="text-xl font-bold text-primary">#{userRank.rank}</p>
                      <p className="text-xs text-text-secondary">Rank</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-emerald-500">{userRank.totalScore.toLocaleString()}</p>
                      <p className="text-xs text-text-secondary">Score</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-amber-500">{userRank.streak}d</p>
                      <p className="text-xs text-text-secondary">Streak</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
