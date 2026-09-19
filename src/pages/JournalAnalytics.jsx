import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BookOpen } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

function Stat({ label, value, accent }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`text-xl font-bold ${accent ? "text-primary" : ""}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function JournalAnalytics() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setEntries(await base44.entities.TradingJournal.list("-date", 500));
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = entries.length;
    const wins = entries.filter((e) => e.result === "Win").length;
    const losses = entries.filter((e) => e.result === "Loss").length;
    const be = entries.filter((e) => e.result === "Breakeven").length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const pl = entries.reduce((s, e) => s + Number(e.profit_loss || 0), 0);
    const winPLs = entries.filter((e) => Number(e.profit_loss) > 0).map((e) => Number(e.profit_loss));
    const lossPLs = entries.filter((e) => Number(e.profit_loss) < 0).map((e) => Number(e.profit_loss));
    const avgWin = winPLs.length ? winPLs.reduce((a, b) => a + b, 0) / winPLs.length : 0;
    const avgLoss = lossPLs.length ? lossPLs.reduce((a, b) => a + b, 0) / lossPLs.length : 0;
    const best = entries.reduce((m, e) => Math.max(m, Number(e.profit_loss || 0)), 0);
    const worst = entries.reduce((m, e) => Math.min(m, Number(e.profit_loss || 0)), 0);
    let cur = 0;
    let streakType = "-";
    const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    sorted.forEach((e) => {
      if (e.result === "Win") { if (streakType === "Win") cur++; else { streakType = "Win"; cur = 1; } }
      else if (e.result === "Loss") { if (streakType === "Loss") cur++; else { streakType = "Loss"; cur = 1; } }
    });
    return { total, wins, losses, be, winRate, pl, avgWin, avgLoss, best, worst, cur, streakType };
  }, [entries]);

  const plOverTime = useMemo(() => {
    let cum = 0;
    return [...entries].sort((a, b) => new Date(a.date) - new Date(b.date)).map((e, i) => {
      cum += Number(e.profit_loss || 0);
      return { name: `#${i + 1}`, PnL: Number(cum.toFixed(2)) };
    });
  }, [entries]);

  const winLossData = [
    { name: "Win", value: stats.wins, color: "hsl(152 69% 50%)" },
    { name: "Loss", value: stats.losses, color: "hsl(0 72% 51%)" },
    { name: "Breakeven", value: stats.be, color: "hsl(215 20% 55%)" },
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <div className="p-6 lg:p-10 flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold">Journal Analytics</h1>
      <p className="text-muted-foreground mt-1 mb-6">Statistik performa trading pribadi kamu.</p>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
          <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Belum ada data journal untuk dianalisis.</p>
          <Link to="/journal" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Tambah Journal</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            <Stat label="Total Trades" value={stats.total} />
            <Stat label="Win Rate" value={`${stats.winRate}%`} accent />
            <Stat label="Win / Loss" value={`${stats.wins} / ${stats.losses}`} />
            <Stat label="Total P/L" value={stats.pl >= 0 ? `+${stats.pl.toFixed(2)}` : stats.pl.toFixed(2)} accent={stats.pl >= 0} />
            <Stat label="Avg Win" value={stats.avgWin.toFixed(2)} />
            <Stat label="Avg Loss" value={stats.avgLoss.toFixed(2)} />
            <Stat label="Best Trade" value={`+${stats.best.toFixed(2)}`} />
            <Stat label="Worst Trade" value={stats.worst.toFixed(2)} />
            <Stat label="Streak" value={`${stats.cur} ${stats.streakType}`} />
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">Cumulative P/L</p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={plOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 16%)" />
                  <XAxis dataKey="name" stroke="hsl(215 20% 65%)" fontSize={11} />
                  <YAxis stroke="hsl(215 20% 65%)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(222 44% 8%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="PnL" stroke="hsl(152 69% 50%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-semibold mb-4">Win vs Loss</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={winLossData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {winLossData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(222 44% 8%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}