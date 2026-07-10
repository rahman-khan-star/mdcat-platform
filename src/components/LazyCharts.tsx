"use client";

import dynamic from "next/dynamic";
import { SkeletonChart } from "@/components/Skeleton";

const WeeklyChart = dynamic(
  () => import("@/components/Charts").then((mod) => mod.WeeklyChart),
  {
    loading: () => <SkeletonChart />,
    ssr: false,
  }
);

const SubjectPerformanceChart = dynamic(
  () => import("@/components/Charts").then((mod) => mod.SubjectChart),
  {
    loading: () => <SkeletonChart />,
    ssr: false,
  }
);

export { WeeklyChart, SubjectPerformanceChart };
