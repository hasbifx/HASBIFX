import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import { Plus, Search, Trash2, Edit3, X, TrendingUp, TrendingDown, Minus, BookOpen } from "lucide-react";

const EMPTY = {
  date: new Date().toISOString().slice(0, 10),
  market: "Forex", pair: "", timeframe: "H1", direction: "Buy",
  entry_price: "", stop_loss: "", take_profit: "", exit_price: "",
  position_size: "", result: "Breakeven", profit_loss: 0, risk_reward: "",
  setup: "", reason: "", emotion: "", lesson_learned: "", screenshot_url: "",
};

const inputCls = "w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-[11px] text-muted-foreground block mb-1">{label}</span>
      {children}
    </label>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium mt-0.5 break-words">{value ?? "-"}</p>
    </div>
  );
}

export default function TradingJournal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [openId, setOpenId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.TradingJournal.list("-date", 200);
      setEntries(list);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchFilter = filter === "All" || e.result === filter;
      const q = query.toLowerCase();
      const matchQuery = !q || [e.pair, e.market, e.setup, e.reason].some((v) => (v || "").toLowerCase().includes(q));
      return matchFilter && matchQuery;
    });
  }, [entries, query, filter]);

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (e) => { setEditing(e); setForm({ ...EMPTY, ...e }); setShowForm(true); };

  const handleSave = async (ev) => {
    ev.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      ["entry_price", "stop_loss", "take_profit", "exit_price", "position_size", "profit_loss"].forEach((k) => {
        payload[k] = payload[k] === "" ? null : Number(payload[k]);
      });
      if (editing) {
        await base44.entities.TradingJournal.update(editing.id, payload);
      } else {
        await base44.entities.TradingJournal.create(payload);
      }
      toast({ title: editing ? "Journal diperbarui" : "Journal ditambahkan" });
      setShowForm(false); setEditing(null); setForm(EMPTY);
      load();
    } catch (err) {
      toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (e) => {
    if (!confirm("Hapus journal entry ini?")) return;
    try {
      await base44.entities.TradingJournal.delete(e.id);
      toast({ title: "Journal dihapus" });
      load();
    } catch (err) {
      toast({ title: "Gagal menghapus", variant: "destructive" });
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const resultStyle = (r) => (r === "Win" ? "text-primary" : r === "Loss" ? "text-destructive" : "text-muted-foreground");
  const resultIcon = (r) => (r === "Win" ? <TrendingUp className="w-3.5 h-3.5" /> : r === "Loss" ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />);

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Trading Journal</h1>
          <p className="text-muted-foreground mt-1">Catat & evaluasi trading kamu.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          <Plus className="w-4 h-4" /> Tambah Entry
        </button>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 mb-4 text-xs text-amber-200/80">
        ⚠️ Fitur ini dibuat untuk tujuan edukasi dan pencatatan pribadi. Trading memiliki risiko kerugian. Hasil simulasi/pencatatan tidak menjamin hasil trading nyata.
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="rounded-2xl border border-border bg-card p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{editing ? "Edit Entry" : "Entry Baru"}</h2>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Field label="Date"><input type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} className={inputCls} /></Field>
            <Field label="Market"><select value={form.market} onChange={(e) => set("market", e.target.value)} className={inputCls}><option>Forex</option><option>Crypto</option><option>Stocks</option><option>Indices</option><option>Commodities</option></select></Field>
            <Field label="Pair / Symbol"><input required value={form.pair} onChange={(e) => set("pair", e.target.value)} placeholder="EUR/USD" className={inputCls} /></Field>
            <Field label="Timeframe"><select value={form.timeframe} onChange={(e) => set("timeframe", e.target.value)} className={inputCls}><option>M5</option><option>M15</option><option>H1</option><option>H4</option><option>D1</option></select></Field>
            <Field label="Direction"><select value={form.direction} onChange={(e) => set("direction", e.target.value)} className={inputCls}><option>Buy</option><option>Sell</option></select></Field>
            <Field label="Result"><select value={form.result} onChange={(e) => set("result", e.target.value)} className={inputCls}><option>Win</option><option>Loss</option><option>Breakeven</option></select></Field>
            <Field label="Entry Price"><input type="number" step="any" value={form.entry_price} onChange={(e) => set("entry_price", e.target.value)} className={inputCls} /></Field>
            <Field label="Stop Loss"><input type="number" step="any" value={form.stop_loss} onChange={(e) => set("stop_loss", e.target.value)} className={inputCls} /></Field>
            <Field label="Take Profit"><input type="number" step="any" value={form.take_profit} onChange={(e) => set("take_profit", e.target.value)} className={inputCls} /></Field>
            <Field label="Exit Price"><input type="number" step="any" value={form.exit_price} onChange={(e) => set("exit_price", e.target.value)} className={inputCls} /></Field>
            <Field label="Position Size"><input type="number" step="any" value={form.position_size} onChange={(e) => set("position_size", e.target.value)} className={inputCls} /></Field>
            <Field label="Profit/Loss"><input type="number" step="any" value={form.profit_loss} onChange={(e) => set("profit_loss", e.target.value)} className={inputCls} /></Field>
            <Field label="Risk/Reward"><input value={form.risk_reward} onChange={(e) => set("risk_reward", e.target.value)} placeholder="1:2" className={inputCls} /></Field>
            <Field label="Setup"><input value={form.setup} onChange={(e) => set("setup", e.target.value)} placeholder="Support bounce" className={inputCls} /></Field>
            <Field label="Emotion"><select value={form.emotion} onChange={(e) => set("emotion", e.target.value)} className={inputCls}><option value="">-</option><option>Confident</option><option>Calm</option><option>Anxious</option><option>FOMO</option><option>Revenge</option><option>Disciplined</option></select></Field>
            <div className="col-span-2 sm:col-span-3"><Field label="Reason for Entry"><input value={form.reason} onChange={(e) => set("reason", e.target.value)} placeholder="Alasan masuk..." className={inputCls} /></Field></div>
            <div className="col-span-2 sm:col-span-3"><Field label="Lesson Learned"><textarea value={form.lesson_learned} onChange={(e) => set("lesson_learned", e.target.value)} rows={2} className={inputCls} /></Field></div>
            <div className="col-span-2 sm:col-span-3"><Field label="Screenshot URL"><input value={form.screenshot_url} onChange={(e) => set("screenshot_url", e.target.value)} placeholder="https://..." className={inputCls} /></Field></div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null} Simpan
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2.5 rounded-xl border border-border text-sm hover:bg-secondary">Batal</button>
          </div>
        </form>
      )}

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari pair, setup, alasan..." className="w-full bg-secondary/50 border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary/50" />
        </div>
        <div className="flex gap-1 bg-secondary/40 rounded-xl p-1">
          {["All", "Win", "Loss", "Breakeven"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada trading journal.</p>
          <p className="text-xs text-muted-foreground mt-1">Mulai catat aktivitas trading kamu untuk memahami performa dan kebiasaan trading.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <div key={e.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${e.direction === "Buy" ? "bg-primary/15 text-primary" : "bg-destructive/15 text-destructive"}`}>
                    {e.direction === "Buy" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{e.pair || "-"}</p>
                    <p className="text-xs text-muted-foreground">{e.date} • {e.timeframe} • {e.market}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-1 text-sm font-semibold ${resultStyle(e.result)}`}>{resultIcon(e.result)} {e.result}</span>
                    <p className="text-xs text-muted-foreground">{Number(e.profit_loss || 0) >= 0 ? "+" : ""}{e.profit_loss || 0}</p>
                  </div>
                  <button onClick={() => setOpenId(openId === e.id ? null : e.id)} className="text-xs text-primary px-2 py-1 rounded-lg hover:bg-primary/10">{openId === e.id ? "Tutup" : "Detail"}</button>
                  <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><Edit3 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(e)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {openId === e.id && (
                <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <Detail label="Entry" value={e.entry_price} />
                  <Detail label="Stop Loss" value={e.stop_loss} />
                  <Detail label="Take Profit" value={e.take_profit} />
                  <Detail label="Exit" value={e.exit_price} />
                  <Detail label="Size" value={e.position_size} />
                  <Detail label="R/R" value={e.risk_reward} />
                  <Detail label="Setup" value={e.setup} />
                  <Detail label="Emotion" value={e.emotion} />
                  <div className="col-span-2 sm:col-span-3"><Detail label="Reason" value={e.reason} /></div>
                  <div className="col-span-2 sm:col-span-3"><Detail label="Lesson Learned" value={e.lesson_learned} /></div>
                  {e.screenshot_url && <div className="col-span-2 sm:col-span-3"><a href={e.screenshot_url} target="_blank" rel="noreferrer" className="text-primary underline">Lihat screenshot</a></div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}