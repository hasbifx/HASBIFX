import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { loadCurriculum, loadUserProgress, computeOverallProgress, findLastLesson, colorForUser, initials } from "@/lib/learning";
import {
  Mail, Calendar, BookOpen, Trophy, Award, TrendingUp, Edit3, Check, X, Shield, Star,
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.full_name || "");
  }, [user]);

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

  const overall = computeOverallProgress(data.curriculum.lessons, data.up.progress);
  const lastLesson = findLastLesson(data.curriculum.lessons, data.up.progress, data.curriculum.classes);
  const quizzesDone = data.up.quizResults.length;
  const avgScore = quizzesDone > 0
    ? Math.round(data.up.quizResults.reduce((s, r) => s + (r.total > 0 ? (r.score / r.total) * 100 : 0), 0) / quizzesDone)
    : 0;
  const joinDate = user?.created_date ? new Date(user.created_date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "-";

  // Badges
  const badges = [];
  if (overall.done >= 1) badges.push({ icon: Star, label: "Langkah Pertama", desc: "Selesaikan 1 materi" });
  if (overall.percent >= 25) badges.push({ icon: TrendingUp, label: "Pemula Konsisten", desc: "25% progress" });
  if (quizzesDone >= 1) badges.push({ icon: Award, label: "Quiz Master", desc: "Selesaikan 1 quiz" });
  if (overall.percent >= 50) badges.push({ icon: BookOpen, label: "Setengah Jalan", desc: "50% progress" });
  if (overall.percent === 100) badges.push({ icon: Trophy, label: "Lulus Penuh", desc: "100% materi" });
  if (user?.role === "admin") badges.push({ icon: Shield, label: "Admin", desc: "Akses admin" });

  const saveName = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe({ full_name: name });
      setEditing(false);
      window.location.reload();
    } catch (e) {
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      {/* Header card */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shrink-0"
            style={{ backgroundColor: colorForUser(user?.id) }}
          >
            {initials(user?.full_name || user?.email)}
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            {editing ? (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/50 border border-border rounded-lg px-3 py-1.5 text-lg font-bold focus:outline-none focus:border-primary/50"
                  autoFocus
                />
                <button onClick={saveName} disabled={saving} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
                  {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditing(false); setName(user?.full_name || ""); }} className="p-1.5 rounded-lg border border-border hover:bg-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-xl sm:text-2xl font-bold">{user?.full_name || "Member"}</h1>
                <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground hover:text-primary">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground justify-center sm:justify-start">
              <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {user?.email}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Bergabung {joinDate}</span>
            </div>
            {user?.role === "admin" && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/15 text-primary mt-3">
                <Shield className="w-3 h-3" /> Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Progress Belajar</p>
          <span className="text-2xl font-bold text-primary">{overall.percent}%</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${overall.percent}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{overall.done} dari {overall.total} materi selesai</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
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
          <TrendingUp className="w-5 h-5 text-primary mb-3" />
          <div className="text-2xl font-bold truncate">{lastLesson ? lastLesson.className?.split(" ")[0] : "-"}</div>
          <div className="text-xs text-muted-foreground">Kelas Terakhir</div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">Achievement</h2>
        <Link to="/achievements" className="text-xs text-primary hover:underline">Lihat semua</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.length > 0 ? badges.map((b, i) => {
          const Icon = b.icon;
          return (
            <div key={i} className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{b.label}</p>
                <p className="text-xs text-muted-foreground truncate">{b.desc}</p>
              </div>
            </div>
          );
        }) : (
          <p className="text-sm text-muted-foreground col-span-full">Selesaikan materi untuk membuka achievement.</p>
        )}
      </div>
    </div>
  );
}