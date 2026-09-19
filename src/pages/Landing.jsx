import React from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp, ArrowRight, GraduationCap, Users, BarChart3,
  BookOpen, ShieldCheck, Brain, Target, Rocket, Activity,
  LineChart, CandlestickChart, MessageCircle,
} from "lucide-react";

const ICONS = {
  Sparkles: TrendingUp, LineChart, CandlestickChart, Activity, Target, ShieldCheck, Brain, Rocket,
};

const FEATURES = [
  { icon: GraduationCap, title: "Pembelajaran Bertingkat", desc: "8 kelas tersusun dari pemula hingga advanced, dengan materi dan quiz di setiap kelas." },
  { icon: BarChart3, title: "Progress Tracking", desc: "Pantau perkembangan belajar dengan progress bar, statistik, dan rekomendasi kelas berikutnya." },
  { icon: Users, title: "Komunitas Trader", desc: "Diskusi langsung dengan member lain di community room secara real-time." },
  { icon: ShieldCheck, title: "Fokus Edukasi", desc: "Materi edukasi murni, tanpa klaim profit pasti. Belajar trading dengan benar." },
];

const ROADMAP = [
  { title: "Trading Bagi Pemula", level: "Pemula", icon: "Sparkles" },
  { title: "Dasar-Dasar Market", level: "Pemula", icon: "LineChart" },
  { title: "Candlestick & Price Action", level: "Menengah", icon: "CandlestickChart" },
  { title: "Technical Analysis", level: "Menengah", icon: "Activity" },
  { title: "Strategi Trading", level: "Menengah", icon: "Target" },
  { title: "Risk Management", level: "Lanjutan", icon: "ShieldCheck" },
  { title: "Psychology Trading", level: "Lanjutan", icon: "Brain" },
  { title: "Advanced Trading", level: "Lanjutan", icon: "Rocket" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-primary">
              <TrendingUp className="text-primary" width={18} height={18} />
            </div>
            <span className="text-xl font-bold tracking-tight">HASB<span className="text-primary">IFX</span></span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
              Mulai Belajar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <GraduationCap className="w-3.5 h-3.5" />
            Trading Academy Online
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
            HASB<span className="text-primary text-glow">IFX</span>
          </h1>
          <p className="text-xl sm:text-2xl font-semibold mt-4 text-foreground/90">
            Learn Trading. Build Your System.
          </p>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base sm:text-lg">
            Belajar trading dari dasar hingga tingkat lanjut secara terstruktur — dengan materi, quiz, dan komunitas.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity glow-primary">
              Mulai Belajar <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-secondary transition-colors">
              Login
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-12 text-center">
            <div><div className="text-3xl font-bold text-primary">8</div><div className="text-sm text-muted-foreground">Kelas</div></div>
            <div><div className="text-3xl font-bold text-primary">78+</div><div className="text-sm text-muted-foreground">Materi</div></div>
            <div><div className="text-3xl font-bold text-primary">8</div><div className="text-sm text-muted-foreground">Quiz</div></div>
            <div><div className="text-3xl font-bold text-primary">100%</div><div className="text-sm text-muted-foreground">Edukasi</div></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center">Kenapa Belajar di HASBIFX?</h2>
        <p className="text-muted-foreground text-center mt-3 max-w-lg mx-auto">Platform edukasi trading yang terstruktur, bukan sekadar kumpulan artikel.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roadmap */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold">Learning Roadmap</h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">8 kelas bertingkat — dari pemula hingga advanced trading.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-10">
          {ROADMAP.map((c, i) => {
            const Icon = ICONS[c.icon] || BookOpen;
            return (
              <div key={i} className="relative rounded-2xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
                <div className="absolute top-4 right-4 text-xs font-bold text-muted-foreground/40">0{i + 1}</div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-sm leading-snug pr-6">{c.title}</h3>
                <span className="inline-block mt-2 text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{c.level}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Community + Progress */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-8">
            <MessageCircle className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Community Discussion</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Diskusi dengan sesama trader, tanya jawab, dan belajar bersama di community room real-time.</p>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-8">
            <BarChart3 className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Progress Tracking</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">Lihat perkembangan belajar Anda, kelas yang selesai, dan rekomendasi kelas berikutnya.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-3xl border border-primary/30 bg-primary/5 p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-primary/5 blur-3xl" />
          <h2 className="text-2xl sm:text-3xl font-bold relative">Siap memulai perjalanan trading Anda?</h2>
          <p className="text-muted-foreground mt-3 relative">Buat akun gratis dan mulai belajar dari Class 1 hari ini.</p>
          <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium mt-6 hover:opacity-90 transition-opacity relative glow-primary">
            Mulai Belajar Sekarang <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-3 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          <ShieldCheck className="w-5 h-5 shrink-0 text-primary mt-0.5" />
          <p>Materi di HASBIFX dibuat untuk tujuan edukasi. Trading memiliki risiko kerugian dan tidak ada strategi yang menjamin keuntungan. Selalu lakukan riset dan gunakan manajemen risiko.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold">HASB<span className="text-primary">IFX</span></span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 HASBIFX. Platform edukasi trading.</p>
        </div>
      </footer>
    </div>
  );
}