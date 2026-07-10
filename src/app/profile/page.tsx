"use client";

import { motion } from "framer-motion";
import {
  User,
  Mail,
  Calendar,
  Award,
  BookOpen,
  Target,
  Flame,
  Clock,
  Edit3,
  Camera,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden"
        >
          <div className="relative h-32 bg-gradient-to-r from-primary to-secondary sm:h-40">
            <button className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-white/90 px-4 py-2 text-xs font-medium text-text-primary shadow-sm backdrop-blur-sm transition-colors hover:bg-white">
              <Camera className="h-3.5 w-3.5" />
              Change Cover
            </button>
          </div>

          <div className="relative px-6 pb-6 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
              <div className="-mt-12 flex sm:-mt-16">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-primary text-3xl font-bold text-white shadow-lg sm:h-32 sm:w-32 sm:text-4xl">
                    AK
                  </div>
                  <button className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-text-muted shadow-sm transition-colors hover:text-primary">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex-1 sm:mt-0 sm:pb-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-text-primary">
                    Ahmed Khan
                  </h1>
                  <button className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-primary">
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  Pre-med student | MDCAT 2026 aspirant
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-text-secondary">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                ahmed.khan@email.com
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Joined Jan 2026
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4" />
                Rank #15
              </span>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, label: "Quizzes Taken", value: "47", color: "#2563eb" },
            { icon: Target, label: "Avg. Score", value: "78.5%", color: "#10b981" },
            { icon: Flame, label: "Best Streak", value: "12 days", color: "#f59e0b" },
            { icon: Clock, label: "Study Time", value: "86h 45m", color: "#8b5cf6" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
              <p className="mt-4 text-2xl font-bold text-text-primary">
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-text-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-white p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-text-primary">
              Personal Information
            </h3>
            <div className="mt-4 space-y-4">
              {[
                { label: "Full Name", value: "Ahmed Khan" },
                { label: "Email", value: "ahmed.khan@email.com" },
                { label: "Phone", value: "+92 300 123 4567" },
                { label: "City", value: "Lahore" },
                { label: "Target Year", value: "MDCAT 2026" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <span className="text-sm font-medium text-text-primary">{item.value}</span>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full rounded-xl border border-border bg-surface py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-surface-hover">
              Edit Profile
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-white p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-text-primary">
              Achievements
            </h3>
            <div className="mt-4 space-y-3">
              {[
                { title: "First Quiz", desc: "Completed your first quiz", emoji: "First Step" },
                { title: "Perfect Score", desc: "Scored 100% on a quiz", emoji: "Gold" },
                { title: "Week Warrior", desc: "7-day study streak", emoji: "Fire" },
                { title: "Biology Master", desc: "Scored 90%+ in Biology", emoji: "Science" },
              ].map((achievement, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl bg-surface p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                    {achievement.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {achievement.title}
                    </p>
                    <p className="text-xs text-text-muted">{achievement.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
