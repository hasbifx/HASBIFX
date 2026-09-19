import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadCurriculum, loadUserProgress, computeClassProgress } from "@/lib/learning";
import { Lock, CheckCircle2, ArrowDown, Play, Trophy } from "lucide-react";

export default function LearningRoadmap() {
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

  const statuses = classes.map((c, i) => {
    const cp = computeClassProgress(c.id, lessons, progress, quizResults, quizzes);
    const completed = cp.percent === 100 && cp.quizDone;
    let unlocked = i === 0;
    if (i > 0) {
      const prev = classes[i - 1];
      const prevCp = computeClassProgress(prev.id, lessons, progress, quizResults, quizzes);
      unlocked = prevCp.percent === 100 && prevCp.quizDone;
    }
    return { cls: c, cp, completed, unlocked, index: i };
  });

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Learning Roadmap</h1>
        <p className="text-muted-foreground mt-1">Perjalanan belajar terstruktur dari pemula hingga mahir.</p>
      </div>

      <div className="flex flex-col items-center">
        <div className="px-4 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-semibold border border-primary/30">START</div>
        <ArrowDown className="w-5 h-5 text-muted-foreground/50 my-1" />
      </div>

      {statuses.map((s) => {
        const { cls, cp, completed, unlocked, index } = s;
        return (
          <div key={cls.id}>
            <div className={`relative rounded-2xl border p-5 transition-all ${
              completed ? "border-primary/40 bg-primary/5"
              : unlocked ? "border-border bg-card"
              : "border-border/60 bg-card/40 opacity-70"
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                  completed ? "bg-primary text-primary-foreground"
                  : unlocked ? "bg-primary/15 text-primary border border-primary/30"
                  : "bg-secondary text-muted-foreground"
                }`}>
                  {completed ? <CheckCircle2 className="w-6 h-6" /> : unlocked ? cls.order : <Lock className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Class {cls.order}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{cls.level}</span>
                    {completed && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary inline-flex items-center gap-1"><Trophy className="w-3 h-3" /> Selesai</span>}
                    {!unlocked && !completed && <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground inline-flex items-center gap-1"><Lock className="w-3 h-3" /> Terkunci</span>}
                  </div>
                  <h3 className="font-semibold mt-1">{cls.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{cls.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span>{cp.total} materi</span>
                    <span>•</span>
                    <span>{cp.percent}% selesai</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden mt-2">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${cp.percent}%` }} />
                  </div>
                </div>
              </div>
              {unlocked && !completed && (
                <Link to={`/class/${cls.id}`} className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary border border-primary/30 text-sm font-medium hover:bg-primary/15 transition-colors">
                  <Play className="w-4 h-4" /> {cp.doneCount > 0 ? "Lanjutkan" : "Mulai Kelas"}
                </Link>
              )}
              {completed && (
                <Link to={`/class/${cls.id}/quiz`} className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                  Review Quiz
                </Link>
              )}
            </div>
            {index < statuses.length - 1 && (
              <div className="flex justify-center my-1">
                <ArrowDown className={`w-5 h-5 ${completed ? "text-primary/50" : "text-muted-foreground/30"}`} />
              </div>
            )}
          </div>
        );
      })}

      <div className="flex flex-col items-center mt-1">
        <ArrowDown className="w-5 h-5 text-muted-foreground/50 my-1" />
        <div className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">HASBIFX GRADUATE 🏆</div>
      </div>
    </div>
  );
}