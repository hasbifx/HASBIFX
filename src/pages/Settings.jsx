import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { Mail, Calendar, Shield, Bell, Palette, Info, Edit3, Check, X, ShieldCheck } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notif, setNotif] = useState(true);

  useEffect(() => { setName(user?.full_name || ""); }, [user]);

  const joinDate = user?.created_date ? new Date(user.created_date).toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" }) : "-";

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
    <div className="p-4 sm:p-6 lg:p-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Kelola akun dan preferensi Anda.</p>
      </div>

      {/* Account */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Akun</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground">Nama</label>
            {editing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                  autoFocus
                />
                <button onClick={saveName} disabled={saving} className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
                  {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditing(false); setName(user?.full_name || ""); }} className="p-2 rounded-lg border border-border hover:bg-secondary">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm font-medium">{user?.full_name || "Belum diatur"}</p>
                <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary"><Edit3 className="w-4 h-4" /></button>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
            <p className="text-sm font-medium mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> Bergabung</label>
            <p className="text-sm font-medium mt-1">{joinDate}</p>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Role</label>
            <p className="text-sm font-medium mt-1 capitalize">{user?.role || "user"}</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-4">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Preferensi</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Notifikasi</p>
            <p className="text-xs text-muted-foreground">Notifikasi progress & community</p>
          </div>
          <button
            onClick={() => setNotif(!notif)}
            className={`w-11 h-6 rounded-full transition-colors relative ${notif ? "bg-primary" : "bg-secondary"}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${notif ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-sm font-medium flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Tema</p>
            <p className="text-xs text-muted-foreground">Dark mode (default)</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary">Aktif</span>
        </div>
      </div>

      {/* About */}
      <div className="rounded-2xl border border-border bg-card p-6 mb-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Tentang</h2>
        <p className="text-sm text-muted-foreground">HASBIFX v1.0 — Platform edukasi trading dari pemula hingga advanced.</p>
      </div>

      {/* Disclaimer */}
      <div className="flex gap-3 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground mb-4">
        <ShieldCheck className="w-4 h-4 shrink-0 text-primary mt-0.5" />
        <p>Materi di HASBIFX untuk tujuan edukasi. Trading memiliki risiko kerugian dan tidak ada strategi yang menjamin keuntungan.</p>
      </div>

      <button
        onClick={() => logout(false)}
        className="w-full py-3 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}