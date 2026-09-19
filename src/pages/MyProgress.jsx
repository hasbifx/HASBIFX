import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadCurriculum, loadUserProgress, computeOverallProgress, computeClassProgress } from "@/lib/learning";
import {
  TrendingUp, LineChart, CandlestickChart, Activity, Target, ShieldCheck, Brain, Rocket, BookOpen,
  Trophy, CheckCircle2, Award, ChevronRight,
} from "lucide-react";

const ICONS = {
  Sparkles: TrendingUp, LineChart, CandlestickChart, Activity, Target, ShieldCheck, Brain, Rocket,
};

export default function MyProgress() {
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
  const overall = computeOverallProgress(lessons, progress);
  const quizzesDone = quizResults.length;
  const avgScore = quizResults.length > 0
    ? Math.round(quizResults.reduce((s, r) => s + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / quizResults.length)
    : 0;
  const classesCompleted = classes.filter((c) => {
    const cp = computeClassProgress(c.id, lessons, progress, quizResults, quizzes);
    return cp.percent === 100 && cp.quizDone;
  }).length;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Progress Saya</h1>
        <p className="text-muted-foreground mt-1">Pantau perkembangan belajar Anda.</p>
      </div>

      {/* Overall */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm text-muted-foreground mb-1">Progress Belajar Keseluruhan</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{overall.percent}%</span>
            <span className="text-sm text-muted-foreground">{overall.done}/{overall.total} materi selesai</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden mt-3">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${overall.percent}%` }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="rounded-2xl border border-border bg-card p-5">
          <BookOpen className="w-5 h-5 text-primary mb-3" />
          <div className="text-2xl font-bold">{overall.done}</div>
          <div className="text-xs text-muted-foreground">Materi Selesai</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Trophy className="w-5 h-5 text-primary mb-3" />
          <div className="text-2xl font-bold">{quizzesDone}</div>
          <div className="text-xs text-muted-foreground">Quiz Selesai</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <Award className="w-5 h-5 text-primary mb-3" />
          <div className="text-2xl font-bold">{avgScore}%</div>
          <div className="text-xs text-muted-foreground">Rata-rata Skor</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <CheckCircle2 className="w-5 h-5 text-primary mb-3" />
          <div className="text-2xl font-bold">{classesCompleted}</div>
          <div className="text-xs text-muted-foreground">Kelas Lulus</div>
        </div>
      </div>

      {/* Per class */}
      <h2 className="text-lg font-bold mb-3">Detail per Kelas</h2>
      <div className="space-y-3">
        {classes.map((c) => {
          const cp = computeClassProgress(c.id, lessons, progress, quizResults, quizzes);
          const Icon = ICONS[c.icon] || BookOpen;
          return (
            <Link key={c.id} to={`/class/${c.id}`} className="block rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{c.title}</h3>
                    {cp.quizDone && <Trophy className="w-4 h-4 text-primary" />}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${cp.percent}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{cp.doneCount}/{cp.total}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-primary shrink-0">{cp.percent}%</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}