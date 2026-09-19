import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadCurriculum, loadUserProgress } from "@/lib/learning";
import { computeAchievements } from "@/lib/achievements";
import { Lock, Flame } from "lucide-react";

export default function Achievements() {
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

  const { list, earnedCount, totalCount, streak } = computeAchievements(data.curriculum, data.up);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Achievement & Badges</h1>
        <p className="text-muted-foreground mt-1">Kumpulkan badge saat kamu belajar.</p>
      </div>

      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Badge diperoleh</p>
          <div className="text-3xl font-bold text-primary mt-1">{earnedCount}<span className="text-lg text-muted-foreground">/{totalCount}</span></div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground inline-flex items-center gap-1"><Flame className="w-4 h-4 text-orange-400" /> Streak</p>
          <div className="text-3xl font-bold mt-1">{streak}<span className="text-lg text-muted-foreground"> hari</span></div>
        </div>
      </div>

      {earnedCount === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center mb-6">
          <p className="text-sm text-muted-foreground">Mulai belajar untuk mendapatkan achievement pertamamu. 🚀</p>
          <Link to="/classes" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Mulai Belajar</Link>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {list.map((a) => (
          <div key={a.id} className={`rounded-2xl border p-5 flex items-center gap-4 transition-all ${a.earned ? "border-primary/30 bg-primary/5" : "border-border bg-card/60"}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${a.earned ? "bg-primary/15 border border-primary/30" : "bg-secondary/60 grayscale opacity-60"}`}>
              {a.earned ? a.emoji : <Lock className="w-6 h-6 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{a.label}</p>
                {a.earned && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">Diperoleh</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              {!a.earned && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary/60" style={{ width: `${Math.min(100, (a.progress / a.target) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{a.progress}/{a.target}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}