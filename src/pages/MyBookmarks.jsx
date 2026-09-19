import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function MyBookmarks() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await base44.entities.Bookmark.list("-created_date", 200));
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (b) => {
    try {
      await base44.entities.Bookmark.delete(b.id);
      setItems((p) => p.filter((x) => x.id !== b.id));
    } catch (e) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold">My Bookmarks</h1>
      <p className="text-muted-foreground mt-1 mb-6">Materi yang kamu simpan untuk dipelajari kembali.</p>

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <Bookmark className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada materi yang disimpan.</p>
          <p className="text-xs text-muted-foreground mt-1">Buka lesson dan tekan tombol 🔖 Bookmark untuk menyimpan di sini.</p>
          <Link to="/classes" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Jelajahi Kelas</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0"><Bookmark className="w-4 h-4" /></div>
              <Link to={`/class/${b.class_id}/lesson/${b.lesson_id}`} className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate hover:text-primary transition-colors">{b.title}</p>
                <p className="text-xs text-muted-foreground">Disimpan {new Date(b.created_date).toLocaleDateString("id-ID")}</p>
              </Link>
              <button onClick={() => handleDelete(b)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}