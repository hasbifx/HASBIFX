import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { loadCurriculum, loadUserProgress } from "@/lib/learning";
import {
  ArrowLeft, ArrowRight, CheckCircle2, XCircle, Trophy, RotateCcw, ClipboardList, Award,
} from "lucide-react";

export default function QuizPage() {
  const { classId } = useParams();
  const [data, setData] = useState(null);
  const [stage, setStage] = useState("intro"); // intro | taking | result
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

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
  const quiz = data.curriculum.quizzes.find((q) => q.class_id === classId);
  const questions = data.curriculum.questions.filter((q) => q.quiz_id === quiz?.id);

  if (!quiz || questions.length === 0) {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <Link to={`/class/${classId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> {cls?.title}
        </Link>
        <p className="text-muted-foreground">Quiz belum tersedia untuk kelas ini.</p>
      </div>
    );
  }

  const score = questions.reduce((s, q) => s + (answers[q.id] === q.correct_answer ? 1 : 0), 0);
  const total = questions.length;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percent >= 70;

  const start = () => { setStage("taking"); setCurrent(0); setAnswers({}); };

  const finish = async () => {
    setSaving(true);
    try {
      await base44.entities.QuizResult.create({
        quiz_id: quiz.id,
        class_id: classId,
        score,
        total,
        completed_at: new Date().toISOString(),
      });
      const up = await loadUserProgress();
      setData({ ...data, up });
    } catch (e) {
      // ignore
    } finally {
      setSaving(false);
      setStage("result");
    }
  };

  const q = questions[current];

  // INTRO
  if (stage === "intro") {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-2xl mx-auto">
        <Link to={`/class/${classId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {cls?.title}
        </Link>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mx-auto mb-5">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">{quiz.title}</h1>
            <p className="text-muted-foreground mt-2">{total} pertanyaan • Pilih jawaban terbaik</p>
            <button onClick={start} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium mt-6 hover:opacity-90 transition-opacity glow-primary">
              Mulai Quiz <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RESULT
  if (stage === "result") {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-2xl mx-auto">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${passed ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
            {passed ? <Trophy className="w-8 h-8" /> : <Award className="w-8 h-8" />}
          </div>
          <h1 className="text-2xl font-bold">{passed ? "Selamat! 🎉" : "Terus Berlatih!"}</h1>
          <p className="text-muted-foreground mt-1">Skor Anda</p>
          <div className="text-5xl font-bold text-primary mt-2">{score}/{total}</div>
          <p className={`text-sm font-medium mt-1 ${passed ? "text-primary" : "text-muted-foreground"}`}>{percent}% {passed ? "• Lulus" : "• Belum lulus (min 70%)"}</p>

          {/* Review */}
          <div className="text-left mt-6 space-y-2">
            {questions.map((qq, i) => {
              const userAns = answers[qq.id];
              const correct = userAns === qq.correct_answer;
              return (
                <div key={qq.id} className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="flex items-start gap-2.5">
                    {correct ? <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{i + 1}. {qq.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">Jawaban Anda: <span className={correct ? "text-primary" : "text-destructive"}>{qq.options[userAns] ?? "—"}</span></p>
                      {!correct && <p className="text-xs text-primary mt-0.5">Jawaban benar: {qq.options[qq.correct_answer]}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
            <button onClick={start} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-sm font-medium hover:bg-secondary transition-colors">
              <RotateCcw className="w-4 h-4" /> Ulangi Quiz
            </button>
            <Link to={`/class/${classId}`} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
              Kembali ke Kelas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // TAKING
  const answered = answers[q.id] !== undefined;
  const isLast = current === total - 1;

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-2xl mx-auto">
      <Link to={`/class/${classId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Keluar
      </Link>

      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-muted-foreground shrink-0">{current + 1}/{total}</span>
        <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${((current) / total) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-lg font-semibold mb-5">{q.question}</h2>
        <div className="space-y-2.5">
          {q.options.map((opt, i) => {
            const selected = answers[q.id] === i;
            return (
              <button
                key={i}
                onClick={() => setAnswers({ ...answers, [q.id]: i })}
                className={`w-full text-left flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background/50 hover:border-primary/40 text-foreground/90"
                }`}
              >
                <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold shrink-0 ${
                  selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end mt-5">
        <button
          onClick={() => (isLast ? finish() : setCurrent(current + 1))}
          disabled={!answered || saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed glow-primary"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : isLast ? (
            "Selesai & Lihat Skor"
          ) : (
            <>Selanjutnya <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}