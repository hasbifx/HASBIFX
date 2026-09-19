import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadCurriculum, loadUserProgress, computeClassProgress } from "@/lib/learning";
import {
  BookOpen, TrendingUp, LineChart, CandlestickChart, Activity,
  Target, ShieldCheck, Brain, Rocket, ChevronRight, Trophy, Lock,
} from "lucide-react";

const ICONS = {
  Sparkles: TrendingUp, LineChart, CandlestickChart, Activity, Target, ShieldCheck, Brain, Rocket,
};

const LEVEL_STYLES = {
  Pemula: "bg-primary/10 text-primary border-primary/20",
  Menengah: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Lanjutan: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function Classes() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [curriculum, up] = await Promise.all([loadCurriculum(), loadUserProgress()]);
      setData({ curriculum, up });
    })().catch(() => setData({ curriculum: { classes: [], lessons: [], quizzes: [], questions: [] }, up: { progress: [], quizResults: [] } }));
  }, []);

  if (!data) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const { classes, lessons, quizzes } = data.curriculum;
  const { progress, quizResults } = data.up;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Kelas</h1>
        <p className="text-muted-foreground mt-1">8 kelas bertingkat dari pemula hingga advanced.</p>
      </div>

      <div className="space-y-3">
        {classes.map((c) => {
          const cp = computeClassProgress(c.id, lessons, progress, quizResults, quizzes);
          const Icon = ICONS[c.icon] || BookOpen;
          const isComplete = cp.percent === 100 && cp.quizDone;
          return (
            <Link
              key={c.id}
              to={`/class/${c.id}`}
              className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Class {c.order}</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border ${LEVEL_STYLES[c.level] || ""}`}>{c.level}</span>
                    {isComplete && (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                        <Trophy className="w-3 h-3" /> Selesai
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mt-1 group-hover:text-primary transition-colors">{c.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${cp.percent}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{cp.doneCount}/{cp.total} • {cp.percent}%</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}