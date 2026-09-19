import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { loadCurriculum, colorForUser, initials } from "@/lib/learning";
import {
  Shield, Users, MessageCircle, BookOpen, Trash2, Plus, Edit3, X, Check,
  ChevronDown, ChevronRight, BarChart3, AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const LEVELS = ["Pemula", "Menengah", "Lanjutan"];

export default function Admin() {
  const { user } = useAuth();
  const [tab, setTab] = useState("overview");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [curriculum, setCurriculum] = useState({ classes: [], lessons: [], quizzes: [], questions: [] });
  const [loading, setLoading] = useState(true);
  const [expandedClass, setExpandedClass] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const loadAll = async () => {
    const [u, msgs, curr] = await Promise.all([
      base44.entities.User.list(),
      base44.entities.ChatMessage.list("-created_date", 50),
      loadCurriculum(),
    ]);
    setUsers(u);
    setMessages(msgs);
    setCurriculum(curr);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role !== "admin") { setLoading(false); return; }
    loadAll().catch(() => setLoading(false));
  }, [user]);

  if (user?.role !== "admin") {
    return (
      <div className="p-6 lg:p-10 max-w-2xl mx-auto">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h1 className="text-xl font-bold">Akses Ditolak</h1>
          <p className="text-muted-foreground text-sm mt-1">Halaman ini khusus admin.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const deleteMessage = async (id) => {
    try {
      await base44.entities.ChatMessage.delete(id);
      setMessages((p) => p.filter((m) => m.id !== id));
      toast({ title: "Pesan dihapus" });
    } catch (e) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const deleteLesson = async (id) => {
    if (!confirm("Hapus materi ini?")) return;
    try {
      await base44.entities.Lesson.delete(id);
      const curr = await loadCurriculum();
      setCurriculum(curr);
      toast({ title: "Materi dihapus" });
    } catch (e) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Pengguna", icon: Users },
    { id: "content", label: "Konten", icon: BookOpen },
    { id: "quiz", label: "Quiz", icon: BookOpen },
    { id: "community", label: "Community", icon: MessageCircle },
  ];

  const deleteQuestion = async (id) => {
    if (!confirm("Hapus pertanyaan ini?")) return;
    try {
      await base44.entities.Question.delete(id);
      const curr = await loadCurriculum();
      setCurriculum(curr);
      toast({ title: "Pertanyaan dihapus" });
    } catch (e) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-primary" /> Admin Panel</h1>
        <p className="text-muted-foreground mt-1">Kelola pengguna, konten, dan komunitas.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* OVERVIEW */}
      {tab === "overview" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <Users className="w-5 h-5 text-primary mb-3" />
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-xs text-muted-foreground">Pengguna</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <BookOpen className="w-5 h-5 text-primary mb-3" />
            <div className="text-2xl font-bold">{curriculum.classes.length}</div>
            <div className="text-xs text-muted-foreground">Kelas</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <BookOpen className="w-5 h-5 text-primary mb-3" />
            <div className="text-2xl font-bold">{curriculum.lessons.length}</div>
            <div className="text-xs text-muted-foreground">Materi</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <MessageCircle className="w-5 h-5 text-primary mb-3" />
            <div className="text-2xl font-bold">{messages.length}</div>
            <div className="text-xs text-muted-foreground">Pesan (50 terakhir)</div>
          </div>
        </div>
      )}

      {/* USERS */}
      {tab === "users" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="p-4 font-medium">Pengguna</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: colorForUser(u.id) }}>
                          {initials(u.full_name || u.email)}
                        </div>
                        <span className="font-medium">{u.full_name || "—"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{u.email}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${u.role === "admin" ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">{u.created_date ? new Date(u.created_date).toLocaleDateString("id-ID") : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTENT */}
      {tab === "content" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Kelas & Materi</h2>
            <button onClick={() => setShowClassForm(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              <Plus className="w-4 h-4" /> Tambah Kelas
            </button>
          </div>

          {showClassForm && <ClassForm onClose={() => setShowClassForm(false)} onSaved={() => { setShowClassForm(false); loadAll(); }} />}

          <div className="space-y-2">
            {curriculum.classes.sort((a, b) => a.order - b.order).map((c) => {
              const classLessons = curriculum.lessons.filter((l) => l.class_id === c.id).sort((a, b) => a.order - b.order);
              const open = expandedClass === c.id;
              return (
                <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <button onClick={() => setExpandedClass(open ? null : c.id)} className="w-full flex items-center gap-3 p-4 hover:bg-secondary/40 transition-colors">
                    {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    <div className="flex-1 text-left">
                      <p className="text-xs text-muted-foreground">Class {c.order} • {c.level}</p>
                      <p className="font-semibold text-sm">{c.title}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{classLessons.length} materi</span>
                  </button>
                  {open && (
                    <div className="border-t border-border p-4 space-y-2 bg-background/30">
                      {classLessons.map((l) => (
                        <div key={l.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                          <span className="text-xs text-muted-foreground w-6">{l.order}</span>
                          <p className="text-sm flex-1">{l.title}</p>
                          <button onClick={() => setEditingLesson({ ...l, classId: c.id })} className="p-1.5 text-muted-foreground hover:text-primary"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => deleteLesson(l.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => { setEditingLesson({ class_id: c.id, classId: c.id, title: "", content: "", key_points: [] }); setShowLessonForm(true); }} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                        <Plus className="w-4 h-4" /> Tambah Materi
                      </button>
                    </div>
                  )}
                  {editingLesson && editingLesson.classId === c.id && (
                    <LessonForm
                      lesson={editingLesson}
                      onClose={() => setEditingLesson(null)}
                      onSaved={() => { setEditingLesson(null); loadAll(); }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUIZ */}
      {tab === "quiz" && (
        <div className="space-y-3">
          {curriculum.classes.sort((a, b) => a.order - b.order).map((c) => {
            const quiz = curriculum.quizzes.find((q) => q.class_id === c.id);
            const qs = curriculum.questions.filter((q) => q.quiz_id === quiz?.id);
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-border">
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Class {c.order}</p>
                    <p className="font-semibold text-sm">{quiz ? quiz.title : "Quiz " + c.title}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{qs.length} soal</span>
                  <button onClick={() => setEditingQuestion({ quiz_id: quiz?.id, classId: c.id, isNew: true, question: "", options: ["", "", "", ""], correct_answer: 0 })} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">
                    <Plus className="w-3.5 h-3.5" /> Tambah Soal
                  </button>
                </div>
                <div className="divide-y divide-border/50">
                  {qs.map((q, i) => (
                    <div key={q.id} className="flex items-start gap-3 p-4">
                      <span className="text-xs text-muted-foreground w-6 shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{q.question}</p>
                        <p className="text-xs text-primary mt-1">Jawaban: {String.fromCharCode(65 + q.correct_answer)}. {q.options[q.correct_answer]}</p>
                      </div>
                      <button onClick={() => setEditingQuestion({ ...q, classId: c.id, isNew: false })} className="p-1.5 text-muted-foreground hover:text-primary"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => deleteQuestion(q.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {qs.length === 0 && <p className="p-4 text-sm text-muted-foreground">Belum ada soal.</p>}
                </div>
                {editingQuestion && editingQuestion.classId === c.id && (
                  <QuestionForm
                    question={editingQuestion}
                    onClose={() => setEditingQuestion(null)}
                    onSaved={() => { setEditingQuestion(null); loadAll(); }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* COMMUNITY */}
      {tab === "community" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-sm">Moderasi Community</h2>
            <p className="text-xs text-muted-foreground">50 pesan terbaru. Hapus pesan yang melanggar aturan.</p>
          </div>
          <div className="divide-y divide-border/50 max-h-[60vh] overflow-y-auto">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-3 p-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ backgroundColor: m.avatar_color || colorForUser(m.created_by_id) }}>
                  {initials(m.user_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{m.user_name?.split("@")[0] || "Member"}</span>
                    <span className="text-xs text-muted-foreground">{m.created_date ? new Date(m.created_date).toLocaleString("id-ID") : ""}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-0.5 break-words">{m.message}</p>
                </div>
                <button onClick={() => deleteMessage(m.id)} className="p-1.5 text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {messages.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Belum ada pesan.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ClassForm({ onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Pemula");
  const [order, setOrder] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title) return;
    setSaving(true);
    try {
      await base44.entities.Class.create({ title, description, level, order: Number(order) || 0, icon: "BookOpen" });
      onSaved();
    } catch (e) {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-primary/30 bg-card p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Tambah Kelas</h3>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul kelas" className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi" rows={2} className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
        <div className="flex gap-2">
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50">
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <input value={order} onChange={(e) => setOrder(e.target.value)} placeholder="Urutan" type="number" className="w-28 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <button onClick={save} disabled={saving || !title} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Simpan</>}
        </button>
      </div>
    </div>
  );
}

function LessonForm({ lesson, onClose, onSaved }) {
  const isEdit = !!lesson.id;
  const [title, setTitle] = useState(lesson.title || "");
  const [content, setContent] = useState(lesson.content || "");
  const [keyPoints, setKeyPoints] = useState((lesson.key_points || []).join("\n"));
  const [order, setOrder] = useState(lesson.order || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title) return;
    setSaving(true);
    try {
      const payload = {
        class_id: lesson.class_id,
        title,
        content,
        key_points: keyPoints.split("\n").map((s) => s.trim()).filter(Boolean),
        order: Number(order) || 0,
      };
      if (isEdit) {
        await base44.entities.Lesson.update(lesson.id, payload);
      } else {
        await base44.entities.Lesson.create(payload);
      }
      onSaved();
    } catch (e) {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background/30 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{isEdit ? "Edit Materi" : "Tambah Materi"}</h3>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul materi" className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Konten materi" rows={4} className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
      <textarea value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} placeholder="Poin penting (satu per baris)" rows={3} className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
      <div className="flex gap-2">
        <input value={order} onChange={(e) => setOrder(e.target.value)} placeholder="Urutan" type="number" className="w-28 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
        <button onClick={save} disabled={saving || !title} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Simpan</>}
        </button>
      </div>
    </div>
  );
}

function QuestionForm({ question, onClose, onSaved }) {
  const isEdit = !question.isNew;
  const [text, setText] = useState(question.question || "");
  const [options, setOptions] = useState(question.options?.length ? question.options : ["", "", "", ""]);
  const [correct, setCorrect] = useState(question.correct_answer ?? 0);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!text || options.filter(Boolean).length < 2) return;
    setSaving(true);
    try {
      const payload = { quiz_id: question.quiz_id, question: text, options: options.map((o) => o || ""), correct_answer: Number(correct) };
      if (isEdit) {
        await base44.entities.Question.update(question.id, payload);
      } else {
        await base44.entities.Question.create(payload);
      }
      onSaved();
    } catch (e) {
      toast({ title: "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background/30 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">{isEdit ? "Edit Soal" : "Tambah Soal"}</h3>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Pertanyaan" className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50" />
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Pilihan jawaban (pilih jawaban benar):</p>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCorrect(i)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-semibold shrink-0 ${correct === i ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"}`}
            >
              {String.fromCharCode(65 + i)}
            </button>
            <input
              value={opt}
              onChange={(e) => setOptions(options.map((o, idx) => (idx === i ? e.target.value : o)))}
              placeholder={`Pilihan ${String.fromCharCode(65 + i)}`}
              className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
        ))}
      </div>
      <button onClick={save} disabled={saving || !text} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2">
        {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <><Check className="w-4 h-4" /> Simpan Soal</>}
      </button>
    </div>
  );
}