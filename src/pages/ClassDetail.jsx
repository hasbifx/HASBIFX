import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { loadCurriculum, loadUserProgress, computeClassProgress } from "@/lib/learning";
import {
  ArrowLeft, CheckCircle2, Circle, ChevronRight, Trophy, ClipboardList,
  TrendingUp, LineChart, CandlestickChart, Activity, Target, ShieldCheck, Brain, Rocket, BookOpen,
} from "lucide-react";

const ICONS = {
  Sparkles: TrendingUp, LineChart, CandlestickChart, Activity, Target, ShieldCheck, Brain, Rocket,
};

export default function ClassDetail() {
  const { classId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [curriculum, up] = await Promise.all([loadCurriculum(), loadUserProgress()]);
      setData({ curriculum, up });
    })().catch(() => setData({ curriculum: { classes: [], lessons: [], quizzes: [], questions: [] }, up: { progress: [], quizResults: [] } }));
  }, [classId]);

  if (!data) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const cls = data.curriculum.classes.find((c) => c.id === classId);
  if (!cls) {
    return (
      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <p className="text-muted-foreground">Kelas tidak ditemukan.</p>
        <Link to="/classes" className="text-primary mt-2 inline-block">← Kembali ke kelas</Link>
      </div>
    );
  }

  const cp = computeClassProgress(cls.id, data.curriculum.lessons, data.up.progress, data.up.quizResults, data.curriculum.quizzes);
  const Icon = ICONS[cls.icon] || BookOpen;
  const completedIds = new Set(data.up.progress.filter((p) => p.completed).map((p) => p.lesson_id));

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <Link to="/classes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Semua Kelas
      </Link>

      {/* Header */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
            <Icon className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Class {cls.order} • {cls.level}</p>
            <h1 className="text-xl sm:text-2xl font-bold mt-1">{cls.title}</h1>
            <p className="text-muted-foreground mt-2 text-sm">{cls.description}</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 max-w-xs h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${cp.percent}%` }} />
              </div>
              <span className="text-sm text-muted-foreground">{cp.doneCount}/{cp.total} materi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons */}
      <h2 className="text-lg font-bold mb-3">Materi Pembelajaran</h2>
      <div className="space-y-2">
        {cp.classLessons.sort((a, b) => a.order - b.order).map((l, idx) => {
          const done = completedIds.has(l.id);
          return (
            <Link
              key={l.id}
              to={`/class/${cls.id}/lesson/${l.id}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-primary/40 transition-colors group"
            >
              <div className="shrink-0">
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/40" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{idx + 1}</p>
                <p className="font-medium text-sm group-hover:text-primary transition-colors">{l.title}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Quiz */}
      {cp.classQuiz && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{cp.classQuiz.title}</h3>
              <p className="text-sm text-muted-foreground">Uji pemahaman Anda</p>
            </div>
            {cp.quizDone && (
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary">
                <Trophy className="w-3.5 h-3.5" /> {cp.bestScore}/{cp.total || ""}
              </span>
            )}
          </div>
          <Link
            to={`/class/${cls.id}/quiz`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity mt-3"
          >
            {cp.quizDone ? "Ulangi Quiz" : "Mulai Quiz"} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}