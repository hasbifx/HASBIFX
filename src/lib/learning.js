import { base44 } from "@/api/base44Client";

// Load all classes with their lessons and quizzes, sorted
export async function loadCurriculum() {
  const classes = await base44.entities.Class.list();
  classes.sort((a, b) => a.order - b.order);
  const lessons = await base44.entities.Lesson.list();
  const quizzes = await base44.entities.Quiz.list();
  const questions = await base44.entities.Question.list();
  return { classes, lessons, quizzes, questions };
}

// Load current user's progress + quiz results
export async function loadUserProgress() {
  const [progress, quizResults] = await Promise.all([
    base44.entities.Progress.list(),
    base44.entities.QuizResult.list(),
  ]);
  return { progress, quizResults };
}

// Compute per-class progress: completed lesson ids set, percent, quiz done
export function computeClassProgress(classId, lessons, progress, quizResults, quizzes) {
  const classLessons = lessons.filter((l) => l.class_id === classId);
  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lesson_id)
  );
  const doneCount = classLessons.filter((l) => completedLessonIds.has(l.id)).length;
  const total = classLessons.length;
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0;
  const classQuiz = quizzes.find((q) => q.class_id === classId);
  const quizDone = classQuiz
    ? quizResults.some((r) => r.quiz_id === classQuiz.id)
    : false;
  const bestScore = classQuiz
    ? quizResults
        .filter((r) => r.quiz_id === classQuiz.id)
        .reduce((max, r) => Math.max(max, r.score), 0)
    : 0;
  return { doneCount, total, percent, quizDone, bestScore, classQuiz, classLessons };
}

// Overall progress across all lessons
export function computeOverallProgress(lessons, progress) {
  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lesson_id)
  );
  const done = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const total = lessons.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
}

// Find next incomplete lesson for "continue learning"
export function findNextLesson(lessons, progress, classes) {
  const completedLessonIds = new Set(
    progress.filter((p) => p.completed).map((p) => p.lesson_id)
  );
  // iterate classes in order, then lessons in order
  for (const cls of classes) {
    const classLessons = lessons
      .filter((l) => l.class_id === cls.id)
      .sort((a, b) => a.order - b.order);
    for (const l of classLessons) {
      if (!completedLessonIds.has(l.id)) {
        return { lesson: l, classId: cls.id, className: cls.title };
      }
    }
  }
  return null;
}

// Find last studied lesson (most recent completed)
export function findLastLesson(lessons, progress, classes) {
  const completed = progress
    .filter((p) => p.completed && p.completed_at)
    .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));
  if (completed.length === 0) return null;
  const last = completed[0];
  const lesson = lessons.find((l) => l.id === last.lesson_id);
  if (!lesson) return null;
  const cls = classes.find((c) => c.id === lesson.class_id);
  return { lesson, className: cls?.title, completedAt: last.completed_at };
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4", "#ef4444", "#84cc16"];
export function colorForUser(id) {
  if (!id) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function initials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}