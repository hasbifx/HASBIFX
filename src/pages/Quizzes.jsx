import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadCurriculum, loadUserProgress } from "@/lib/learning";
import { ClipboardList, Trophy, ChevronRight, CheckCircle2 } from "lucide-react";

export default function Quizzes() {
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

  const { classes, quizzes, questions } = data.curriculum;
  const { quizResults } = data.up;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Quiz</h1>
        <p className="text-muted-foreground mt-1">Uji pemahaman Anda di setiap kelas.</p>
      </div>

      <div className="space-y-3">
        {classes.map((c) => {
          const quiz = quizzes.find((q) => q.class_id === c.id);
          if (!quiz) return null;
          const qCount = questions.filter((q) => q.quiz_id === quiz.id).length;
          const results = quizResults.filter((r) => r.quiz_id === quiz.id);
          const done = results.length > 0;
          const best = results.reduce((m, r) => Math.max(m, r.score), 0);
          const bestTotal = results[0]?.total || qCount;
          return (
            <Link
              key={c.id}
              to={`/class/${c.id}/quiz`}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Class {c.order}</p>
                <h3 className="font-semibold group-hover:text-primary transition-colors">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{qCount} pertanyaan</p>
              </div>
              {done ? (
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    <Trophy className="w-4 h-4" /> {best}/{bestTotal}
                  </span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ) : (
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}