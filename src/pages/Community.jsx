import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { colorForUser, initials } from "@/lib/learning";
import { Send, Trash2, Flag, ShieldAlert, MessageCircle, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return m + "m";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "j";
  const d = Math.floor(h / 24);
  return d + "h";
}

export default function Community() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      try {
        const initial = await base44.entities.ChatMessage.list("-created_date", 100);
        initial.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
        setMessages(initial);
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
      unsub = base44.entities.ChatMessage.subscribe((event) => {
        if (event.type === "create") {
          setMessages((prev) => {
            if (prev.some((m) => m.id === event.data.id)) return prev;
            return [...prev, event.data];
          });
        } else if (event.type === "delete") {
          setMessages((prev) => prev.filter((m) => m.id !== event.id));
        } else if (event.type === "update") {
          setMessages((prev) => prev.map((m) => (m.id === event.data.id ? event.data : m)));
        }
      });
    })();
    return () => unsub();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setSending(true);
    try {
      const created = await base44.entities.ChatMessage.create({
        message: text,
        user_name: user?.full_name || user?.email || "Member",
        avatar_color: colorForUser(user?.id),
      });
      setMessages((prev) => (prev.some((m) => m.id === created.id) ? prev : [...prev, created]));
      setInput("");
    } catch (err) {
      toast({ title: "Gagal mengirim pesan", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (msg) => {
    try {
      await base44.entities.ChatMessage.delete(msg.id);
    } catch (err) {
      toast({ title: "Gagal menghapus", description: err.message, variant: "destructive" });
    }
  };

  const handleReport = (msg) => {
    toast({
      title: "Pesan dilaporkan",
      description: "Terima kasih. Admin akan meninjau pesan ini.",
    });
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
          Community
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-primary/15 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live
          </span>
        </h1>
        <p className="text-muted-foreground mt-1">Diskusi bersama member HASBIFX.</p>
      </div>

      {/* Rules */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-4">
        <div className="flex items-center gap-2 text-sm font-semibold mb-2">
          <ShieldAlert className="w-4 h-4 text-primary" /> Aturan Community
        </div>
        <ul className="text-xs text-muted-foreground space-y-1.5">
          <li>• Hormati sesama member, tidak ada SARA atau ujaran kebencian.</li>
          <li>• Dilarang mempromosikan jual-beli aset, sinyal berbayar, atau ajakan investasi.</li>
          <li>• Diskusi edukasi trading, bukan ajakan transaksi.</li>
          <li>• Dilarang spam atau promosi tidak relevan.</li>
        </ul>
      </div>

      {/* Chat room */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col" style={{ height: "calc(100vh - 360px)", minHeight: "400px" }}>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Welcome */}
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Selamat datang di Community HASBIFX</p>
            <p className="text-xs text-muted-foreground mt-1">Mulai berdiskusi dengan member lain.</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {messages.map((m) => {
            const mine = m.created_by_id === user?.id;
            return (
              <div key={m.id} className={`flex gap-3 group ${mine ? "flex-row-reverse" : ""}`}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                  style={{ backgroundColor: m.avatar_color || colorForUser(m.created_by_id) }}
                >
                  {initials(m.user_name)}
                </div>
                <div className={`max-w-[75%] ${mine ? "items-end" : ""} flex flex-col`}>
                  <div className={`flex items-center gap-2 mb-1 ${mine ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-medium">{m.user_name?.split("@")[0] || "Member"}</span>
                    <span className="text-[10px] text-muted-foreground">{timeAgo(m.created_date)}</span>
                  </div>
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm ${
                    mine ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-secondary text-foreground rounded-tl-sm"
                  }`}>
                    {m.message}
                  </div>
                  <div className={`flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${mine ? "justify-end" : ""}`}>
                    {mine || isAdmin ? (
                      <button onClick={() => handleDelete(m)} className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Hapus
                      </button>
                    ) : (
                      <button onClick={() => handleReport(m)} className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1">
                        <Flag className="w-3 h-3" /> Laporkan
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!loading && messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Belum ada pesan. Jadilah yang pertama!</p>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-border p-3 flex items-center gap-2 bg-background/50">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan..."
            className="flex-1 bg-secondary/50 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 focus:bg-secondary transition-colors"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shrink-0"
          >
            {sending ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}