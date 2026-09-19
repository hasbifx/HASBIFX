import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { loadCurriculum, loadUserProgress } from "@/lib/learning";
import { isCertificateEligible, getCertificateId, getCompletionDate } from "@/lib/achievements";
import { TrendingUp as Logo, Download, Award, Lock } from "lucide-react";

export default function Certificate() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

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

  const eligible = isCertificateEligible(data.curriculum, data.up);
  const certId = getCertificateId(user?.id);
  const completionDate = getCompletionDate(data.curriculum, data.up);
  const dateStr = completionDate ? completionDate.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "-";
  const userName = user?.full_name || user?.email || "Member";

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(certRef.current, { backgroundColor: "#0a0f1c", scale: 2 });
      const img = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(img, "JPEG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`HASBIFX-Certificate-${certId}.pdf`);
    } catch (e) {
      // ignore
    } finally {
      setDownloading(false);
    }
  };

  if (!eligible) {
    return (
      <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary/60 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold">Sertifikat Belum Tersedia</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Selesaikan seluruh Class 1–8 dan quiz di setiap kelas untuk membuka sertifikat HASBIFX Certified Learner.</p>
          <Link to="/roadmap" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Lihat Roadmap</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Certificate</h1>
          <p className="text-muted-foreground mt-1">Selamat! Kamu telah menyelesaikan seluruh program.</p>
        </div>
        <button onClick={handleDownload} disabled={downloading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60">
          {downloading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Download className="w-4 h-4" />} Download Certificate
        </button>
      </div>

      <div ref={certRef} className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Logo className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">HASB<span className="text-primary">IFX</span></span>
          </div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Trading Education Completion Certificate</p>
          <p className="text-sm text-muted-foreground mt-6">Sertifikat ini diberikan kepada</p>
          <p className="text-3xl font-bold mt-2 text-primary">{userName}</p>
          <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">atas penyelesaian seluruh program edukasi trading HASBIFX yang terdiri dari 8 kelas dan quiz dengan hasil memuaskan.</p>
          <div className="inline-flex items-center gap-1.5 mt-6 text-primary font-semibold">
            <Award className="w-5 h-5" /> HASBIFX CERTIFIED LEARNER
          </div>
          <div className="flex items-center justify-between max-w-md mx-auto mt-10 pt-6 border-t border-border">
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Tanggal Selesai</p>
              <p className="text-sm font-medium mt-1">{dateStr}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Certificate ID</p>
              <p className="text-sm font-mono mt-1">{certId}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center max-w-md mx-auto">
        Sertifikat ini adalah pengakuan penyelesaian program edukasi, bukan lisensi atau sertifikasi profesional trading.
      </p>
    </div>
  );
}