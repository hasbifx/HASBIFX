import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { loadCurriculum, loadUserProgress, computeOverallProgress, findNextLesson, findLastLesson, computeClassProgress } from "@/lib/learning";
import {
  ArrowRight, BookOpen, CheckCircle2, TrendingUp, Trophy,
  Clock, Sparkles, ChevronRight, Map, Award, NotebookPen, CandlestickChart,
} from "lucide-react";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-bold mt-4">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
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
  const nextLesson = findNextLesson(lessons, progress, classes);
  const lastLesson = findLastLesson(lessons, progress, classes);
  const classesCompleted = classes.filter((c) => {
    const cp = computeClassProgress(c.id, lessons, progress, quizResults, quizzes);
    return cp.percent === 100 && cp.quizDone;
  }).length;
  const quizzesDone = quizResults.length;

  const firstName = (user?.full_name || user?.email || "Member").split("@")[0].split(" ")[0];

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-sm text-muted-foreground">Selamat datang di HASBIFX 👋</p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">Halo, {firstName}!</h1>
      </div>

      {/* Progress hero */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Progress Belajar</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-primary">{overall.percent}%</span>
              <span className="text-sm text-muted-foreground">{overall.done}/{overall.total} materi</span>
            </div>
            <div className="w-full max-w-xs h-2.5 rounded-full bg-secondary overflow-hidden mt-3">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${overall.percent}%` }} />
            </div>
          </div>
          {nextLesson ? (
            <Link to={`/class/${nextLesson.classId}/lesson/${nextLesson.lesson.id}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity glow-primary shrink-0">
              Lanjutkan Belajar <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary/15 text-primary font-medium border border-primary/30">
              <Trophy className="w-4 h-4" /> Semua materi selesai!
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard icon={BookOpen} label="Total Kelas" value={classes.length} accent="bg-primary/10 text-primary" />
        <StatCard icon={CheckCircle2} label="Kelas Selesai" value={classesCompleted} accent="bg-primary/10 text-primary" />
        <StatCard icon={TrendingUp} label="Materi Selesai" value={overall.done} accent="bg-primary/10 text-primary" />
        <StatCard icon={Trophy} label="Quiz Selesai" value={quizzesDone} accent="bg-primary/10 text-primary" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Last studied */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Clock className="w-4 h-4" /> Kelas Terakhir Dipelajari
          </div>
          {lastLesson ? (
            <Link to={`/class/${lastLesson.lesson.class_id}/lesson/${lastLesson.lesson.id}`} className="block group">
              <p className="text-xs text-primary mb-1">{lastLesson.className}</p>
              <h3 className="font-semibold group-hover:text-primary transition-colors">{lastLesson.lesson.title}</h3>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground mt-3 group-hover:text-primary transition-colors">
                Lanjutkan <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ) : (
            <div>
              <p className="text-muted-foreground text-sm">Belum ada materi yang dipelajari.</p>
              <Link to="/classes" className="inline-flex items-center gap-1 text-sm text-primary mt-3">
                Mulai dari awal <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Recommended next */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Sparkles className="w-4 h-4" /> Rekomendasi Kelas Berikutnya
          </div>
          {nextLesson ? (
            <Link to={`/class/${nextLesson.classId}/lesson/${nextLesson.lesson.id}`} className="block group">
              <p className="text-xs text-primary mb-1">{nextLesson.className}</p>
              <h3 className="font-semibold group-hover:text-primary transition-colors">{nextLesson.lesson.title}</h3>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground mt-3 group-hover:text-primary transition-colors">
                Mulai <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ) : (
            <p className="text-muted-foreground text-sm">Anda telah menyelesaikan semua materi. Luar biasa! 🎉</p>
          )}
        </div>
      </div>

      {/* Trading tools */}
      <h2 className="text-lg font-bold mt-10 mb-4">Trading Tools</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
        {[
          { to: "/journal", icon: NotebookPen, label: "Trading Journal" },
          { to: "/practice", icon: CandlestickChart, label: "Practice" },
          { to: "/roadmap", icon: Map, label: "Roadmap" },
          { to: "/achievements", icon: Award, label: "Achievement" },
        ].map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.to} to={q.to} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/40 transition-colors group">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <p className="text-sm font-medium group-hover:text-primary transition-colors">{q.label}</p>
            </Link>
          );
        })}
      </div>

      {/* Class overview */}
      <h2 className="text-lg font-bold mt-10 mb-4">Progress per Kelas</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        {classes.map((c) => {
          const cp = computeClassProgress(c.id, lessons, progress, quizResults, quizzes);
          return (
            <Link key={c.id} to={`/class/${c.id}`} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Class {c.order}</span>
                {cp.quizDone && <Trophy className="w-4 h-4 text-primary" />}
              </div>
              <h3 className="font-semibold text-sm mb-3 group-hover:text-primary transition-colors">{c.title}</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${cp.percent}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-9 text-right">{cp.percent}%</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}