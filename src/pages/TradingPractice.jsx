import React, { useState } from "react";
import { TrendingUp, TrendingDown, RotateCcw, Lightbulb } from "lucide-react";

const inputCls = "w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50";

function generateSeries() {
  const points = 80;
  let price = 100;
  const data = [{ i: 0, price }];
  for (let i = 1; i < points; i++) {
    const drift = (Math.random() - 0.5) * 2.2;
    price = Math.max(20, price + drift);
    data.push({ i, price: Number(price.toFixed(2)) });
  }
  return data;
}

export default function TradingPractice() {
  const [series, setSeries] = useState(() => generateSeries());
  const [direction, setDirection] = useState("Buy");
  const [entry, setEntry] = useState(series[0].price);
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [result, setResult] = useState(null);

  const regen = () => {
    const s = generateSeries();
    setSeries(s);
    setEntry(s[0].price);
    setSl("");
    setTp("");
    setResult(null);
  };

  const handleSimulate = () => {
    const e = Number(entry);
    const s = Number(sl);
    const t = Number(tp);
    if (!e || !s || !t) return;
    let outcome = null;
    for (let i = 1; i < series.length; i++) {
      const p = series[i].price;
      if (direction === "Buy") {
        if (p <= s) { outcome = { hit: "SL", idx: i, price: p }; break; }
        if (p >= t) { outcome = { hit: "TP", idx: i, price: p }; break; }
      } else {
        if (p >= s) { outcome = { hit: "SL", idx: i, price: p }; break; }
        if (p <= t) { outcome = { hit: "TP", idx: i, price: p }; break; }
      }
    }
    if (!outcome) outcome = { hit: "NONE", idx: series.length - 1, price: series[series.length - 1].price };
    const win = outcome.hit === "TP";
    const rr = direction === "Buy"
      ? Math.abs(t - e) / Math.abs(e - s)
      : Math.abs(e - t) / Math.abs(s - e);
    setResult({ ...outcome, win, rr: isFinite(rr) ? rr.toFixed(2) : "-" });
  };

  const minP = Math.min(...series.map((d) => d.price));
  const maxP = Math.max(...series.map((d) => d.price));
  const range = maxP - minP || 1;
  const w = 320;
  const h = 160;
  const pts = series.map((d) => `${(d.i / (series.length - 1)) * w},${h - ((d.price - minP) / range) * h}`).join(" ");

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-3xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold">Trading Practice</h1>
      <p className="text-muted-foreground mt-1">Latih menentukan entry, SL, dan TP dengan data simulasi.</p>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 mt-4 mb-5 text-xs text-amber-200/80">
        ⚠️ Fitur ini dibuat untuk tujuan edukasi. Data simulasi, bukan pasar nyata. Hasil simulasi tidak menjamin hasil trading nyata.
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Simulasi Chart (Edukasi)</p>
          <button onClick={regen} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"><RotateCcw className="w-3.5 h-3.5" /> Chart Baru</button>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40 bg-secondary/30 rounded-xl">
          <polyline points={pts} fill="none" stroke="hsl(152 69% 50%)" strokeWidth={2} />
        </svg>
        <p className="text-[11px] text-muted-foreground mt-2">Harga terakhir: {series[series.length - 1].price}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 mt-4">
        <p className="text-sm font-semibold mb-4">Tentukan Posisi</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="block"><span className="text-[11px] text-muted-foreground block mb-1">Direction</span>
            <select value={direction} onChange={(e) => setDirection(e.target.value)} className={inputCls}><option>Buy</option><option>Sell</option></select>
          </label>
          <label className="block"><span className="text-[11px] text-muted-foreground block mb-1">Entry</span>
            <input type="number" step="any" value={entry} onChange={(e) => setEntry(e.target.value)} className={inputCls} />
          </label>
          <label className="block"><span className="text-[11px] text-muted-foreground block mb-1">Stop Loss</span>
            <input type="number" step="any" value={sl} onChange={(e) => setSl(e.target.value)} className={inputCls} />
          </label>
          <label className="block"><span className="text-[11px] text-muted-foreground block mb-1">Take Profit</span>
            <input type="number" step="any" value={tp} onChange={(e) => setTp(e.target.value)} className={inputCls} />
          </label>
        </div>
        <button onClick={handleSimulate} className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
          Simulasikan
        </button>
      </div>

      {result && (
        <div className={`rounded-2xl border p-5 mt-4 ${result.win ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
          <div className="flex items-center gap-2">
            {result.win ? <TrendingUp className="w-5 h-5 text-primary" /> : <TrendingDown className="w-5 h-5 text-destructive" />}
            <p className={`font-semibold ${result.win ? "text-primary" : "text-destructive"}`}>
              {result.hit === "TP" ? "Take Profit tersentuh — Win" : result.hit === "SL" ? "Stop Loss tersentuh — Loss" : "Tidak ada level tersentuh — Tidak ada konklusi"}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Harga simulasi: {result.price} • Risk/Reward: 1:{result.rr}</p>
          <div className="mt-3 rounded-xl bg-secondary/40 p-3 text-xs text-foreground/80 flex gap-2">
            <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p>{result.win
              ? "Disiplin pada Take Profit membantu mengunci keuntungan. Selalu rencanakan rasio risk/reward sebelum entry."
              : result.hit === "SL"
              ? "Stop Loss melindungi modal dari kerugian lebih besar. Penting untuk selalu menempatkan SL dan tidak menggesernya karena emosi."
              : "Dalam latihan ini tidak ada level tersentuh. Pada trading nyata, posisi tanpa konklusi jelas sebaiknya dievaluasi atau ditutup."}</p>
          </div>
        </div>
      )}
    </div>
  );
}