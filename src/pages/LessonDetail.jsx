import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { loadCurriculum, loadUserProgress } from "@/lib/learning";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Circle, Lightbulb, ClipboardList,
} from "lucide-react";

export default function LessonDetail() {
  const { classId, lessonId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [curriculum, up] = await Promise.all([loadCurriculum(), loadUserProgress()]);
      setData({ curriculum, up });
    })().catch(() => setData({ curriculum: { classes: [], lessons: [], quizzes: [], questions: [] }, up: { progress: [], quizResults: [] } }));
  }, [classId, lessonId]);

  const lesson = data?.curriculum.lessons.find((l) => l.id === lessonId);
  const cls = data?.curriculum.classes.find((c) => c.id === classId);
  const completedIds = data ? new Set(data.up.progress.filter((p) => p.completed).map((p) => p.lesson_id)) : new Set();
  const isComplete = completedIds.has(lessonId);
  const existingProgress = data?.up.progress.find((p) => p.lesson_id === lessonId);

  const classLessons = data ? data.curriculum.lessons.filter((l) => l.class_id === classId).sort((a, b) => a.order - b.order) : [];
  const currentIndex = classLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? classLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < classLessons.length - 1 ? classLessons[currentIndex + 1] : null;
  const classQuiz = data?.curriculum.quizzes.find((q) => q.class_id === classId);

  const handleToggleComplete = async () => {
    if (!data) return;
    setSaving(true);
    try {
      if (existingProgress) {
        await base44.entities.Progress.update(existingProgress.id, {
          completed: !isComplete,
          completed_at: !isComplete ? new Date().toISOString() : existingProgress.completed_at,
        });
      } else {
        await base44.entities.Progress.create({
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }
      // reload progress
      const up = await loadUserProgress();
      setData({ ...data, up });
    } catch (e) {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="p-6 lg:p-10 max-w-3xl mx-auto">
        <p className="text-muted-foreground">Materi tidak ditemukan.</p>
        <Link to={`/class/${classId}`} className="text-primary mt-2 inline-block">← Kembali</Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto">
      <Link to={`/class/${classId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> {cls?.title}
      </Link>

      <p className="text-xs text-primary mb-2">Materi {currentIndex + 1} dari {classLessons.length}</p>
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{lesson.title}</h1>

      {/* Content */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{lesson.content}</p>
      </div>

      {/* Key points */}
      {lesson.key_points && lesson.key_points.length > 0 && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-3">
            <Lightbulb className="w-4 h-4" /> Poin Penting
          </div>
          <ul className="space-y-2">
            {lesson.key_points.map((p, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground mt-4 px-1">
        Materi edukasi. Trading memiliki risiko kerugian dan tidak ada strategi yang menjamin keuntungan.
      </p>

      {/* Complete button */}
      <button
        onClick={handleToggleComplete}
        disabled={saving}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-all mt-6 ${
          isComplete
            ? "bg-primary/15 text-primary border border-primary/30"
            : "bg-primary text-primary-foreground hover:opacity-90 glow-primary"
        }`}
      >
        {saving ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isComplete ? (
          <><CheckCircle2 className="w-5 h-5" /> Selesai • Klik untuk batal</>
        ) : (
          <><Circle className="w-5 h-5" /> Tandai Selesai</>
        )}
      </button>

      {/* Prev / Next */}
      <div className="flex items-center justify-between gap-3 mt-4">
        {prevLesson ? (
          <Link to={`/class/${classId}/lesson/${prevLesson.id}`} className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors min-w-0">
            <ArrowLeft className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Sebelumnya</p>
              <p className="text-sm font-medium truncate">{prevLesson.title}</p>
            </div>
          </Link>
        ) : <div className="flex-1" />}
        {nextLesson ? (
          <Link to={`/class/${classId}/lesson/${nextLesson.id}`} className="flex-1 flex items-center gap-2 rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 transition-colors min-w-0 justify-end text-right">
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Berikutnya</p>
              <p className="text-sm font-medium truncate">{nextLesson.title}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </Link>
        ) : classQuiz ? (
          <Link to={`/class/${classId}/quiz`} className="flex-1 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3.5 hover:bg-primary/15 transition-colors min-w-0 justify-end text-right">
            <div className="min-w-0">
              <p className="text-[11px] text-primary">Selesai materi?</p>
              <p className="text-sm font-medium truncate text-primary">Kerjakan Quiz</p>
            </div>
            <ClipboardList className="w-4 h-4 text-primary shrink-0" />
          </Link>
        ) : <div className="flex-1" />}
      </div>
    </div>
  );
}