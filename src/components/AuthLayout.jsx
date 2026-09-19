import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />

      {/* Brand panel - desktop */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative">
        <Link to="/" className="flex items-center gap-2.5 w-fit">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center glow-primary">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            HASB<span className="text-primary">IFX</span>
          </span>
        </Link>
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight tracking-tight">
            Learn Trading.<br />
            <span className="text-primary">Build Your System.</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Belajar trading dari dasar hingga tingkat lanjut secara terstruktur, dengan materi, quiz, dan komunitas.
          </p>
          <div className="flex gap-6 mt-8">
            <div>
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-xs text-muted-foreground">Kelas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">78+</div>
              <div className="text-xs text-muted-foreground">Materi</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-xs text-muted-foreground">Quiz</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground max-w-sm">
          Materi di HASBIFX dibuat untuk tujuan edukasi. Trading memiliki risiko kerugian dan tidak ada strategi yang menjamin keuntungan.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              HASB<span className="text-primary">IFX</span>
            </span>
          </Link>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 mb-4">
              <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground mt-1.5 text-sm">{subtitle}</p>}
          </div>
          <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 shadow-xl">
            {children}
          </div>
          {footer && (
            <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
          )}
        </div>
      </div>
    </div>
  );
}