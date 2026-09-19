import { computeClassProgress } from "@/lib/learning";

// Current learning streak: consecutive days (ending today or yesterday) with >=1 lesson completed
export function computeStreak(progress) {
  const completed = progress.filter((p) => p.completed && p.completed_at);
  if (completed.length === 0) return 0;
  const days = new Set(completed.map((p) => new Date(p.completed_at).toDateString()));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(cursor.toDateString())) return 0;
  }
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computeAchievements(curriculum, up) {
  const { classes, lessons, quizzes } = curriculum;
  const { progress, quizResults } = up;
  const completedLessonIds = new Set(progress.filter((p) => p.completed).map((p) => p.lesson_id));
  const done = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const total = lessons.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  const classDone = (order) => {
    const cls = classes.find((c) => Number(c.order) === order);
    if (!cls) return false;
    const cp = computeClassProgress(cls.id, lessons, progress, quizResults, quizzes);
    return cp.percent === 100 && cp.quizDone;
  };

  const completedClassesCount = classes.filter((c) => {
    const cp = computeClassProgress(c.id, lessons, progress, quizResults, quizzes);
    return cp.percent === 100 && cp.quizDone;
  }).length;

  const allClassesDone = classes.length > 0 && completedClassesCount === classes.length;
  const streak = computeStreak(progress);

  const list = [
    { id: "first_step", emoji: "🎯", label: "First Step", desc: "Menyelesaikan lesson pertama", earned: done >= 1, progress: Math.min(done, 1), target: 1 },
    { id: "beginner", emoji: "📚", label: "Beginner", desc: "Menyelesaikan Class 1", earned: classDone(1), progress: classDone(1) ? 1 : 0, target: 1 },
    { id: "consistent", emoji: "🔥", label: "Consistent Learner", desc: "Belajar 7 hari berturut-turut", earned: streak >= 7, progress: Math.min(streak, 7), target: 7 },
    { id: "market_student", emoji: "🧠", label: "Market Student", desc: "Menyelesaikan Class 3", earned: classDone(3), progress: classDone(3) ? 1 : 0, target: 1 },
    { id: "advanced", emoji: "⚡", label: "Advanced", desc: "Menyelesaikan Class 8", earned: classDone(8), progress: classDone(8) ? 1 : 0, target: 1 },
    { id: "graduate", emoji: "🏆", label: "HASBIFX Graduate", desc: "Menyelesaikan seluruh kelas & quiz", earned: allClassesDone, progress: completedClassesCount, target: classes.length || 1 },
  ];
  const earnedCount = list.filter((a) => a.earned).length;
  return { list, earnedCount, totalCount: list.length, percent, streak };
}

export function isCertificateEligible(curriculum, up) {
  const { classes, lessons, quizzes } = curriculum;
  const { progress, quizResults } = up;
  if (classes.length === 0) return false;
  return classes.every((c) => {
    const cp = computeClassProgress(c.id, lessons, progress, quizResults, quizzes);
    return cp.percent === 100 && cp.quizDone;
  });
}

export function getCertificateId(userId) {
  const base = (userId || "XXXXXXXX").replace(/-/g, "").slice(0, 8).toUpperCase();
  return `HSBF-${base}-${new Date().getFullYear()}`;
}

export function getCompletionDate(curriculum, up) {
  const completed = up.progress.filter((p) => p.completed && p.completed_at);
  if (completed.length === 0) return null;
  return completed.map((p) => new Date(p.completed_at)).sort((a, b) => b - a)[0];
}