// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
import React, { useState, useEffect } from "react";

const SLIDES = [
  {
    id: "welcome",
    title: ["Ton coach de salle,", "dans ta poche"],
    sub: "Organise tes s\u00e9ances, suis tes s\u00e9ries en temps r\u00e9el et regarde ta progression semaine apr\u00e8s semaine.",
    visual: "welcome",
  },
  {
    id: "sessions",
    title: ["Cr\u00e9e tes s\u00e9ances"],
    sub: "Choisis tes muscles cibles \u2014 les exercices sugg\u00e9r\u00e9s apparaissent automatiquement.",
    visual: "sessions",
  },
  {
    id: "train",
    title: ["Entra\u00eene-toi"],
    sub: "Timer de repos automatique. Tes meilleures perfs de la derni\u00e8re s\u00e9ance s'affichent en temps r\u00e9el.",
    visual: "train",
  },
  {
    id: "history",
    title: ["Regarde ta progression"],
    sub: "Historique complet, streak hebdo, graphiques. Chaque s\u00e9ance compte.",
    visual: "history",
  },
];

function VisualWelcome() {
  return (
    <div className="ob-visual ob-visual-welcome">
      <div className="ob-dumbbell-ring">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
          <rect x="2" y="19" width="9" height="14" rx="3.5" fill="var(--accent)" opacity="0.9"/>
          <rect x="41" y="19" width="9" height="14" rx="3.5" fill="var(--accent)" opacity="0.9"/>
          <rect x="10" y="15" width="7" height="22" rx="2.5" fill="var(--accent)"/>
          <rect x="35" y="15" width="7" height="22" rx="2.5" fill="var(--accent)"/>
          <rect x="17" y="22" width="18" height="8" rx="2" fill="var(--accent)"/>
        </svg>
      </div>
      <div className="ob-welcome-pills">
        {["S\u00e9ances", "Timer", "Stats", "Progression"].map((label, i) => (
          <span key={i} className={`ob-pill ${i === 0 ? "ob-pill-accent" : "ob-pill-dim"}`}
            style={{ animationDelay: `${i * 0.08}s` }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function VisualSessions() {
  return (
    <div className="ob-visual ob-visual-card-wrap">
      <div className="ob-mock-card">
        <div className="ob-mock-row">
          <div className="ob-mock-dot ob-dot-accent" />
          <span className="ob-mock-title">Push day</span>
        </div>
        <div className="ob-mock-chips">
          {["Pectoraux", "\u00c9paules", "Triceps"].map((m, i) => (
            <span key={i} className="ob-pill ob-pill-accent" style={{ fontSize: "10px", padding: "3px 9px" }}>{m}</span>
          ))}
        </div>
        <div className="ob-mock-exos">
          {["D\u00e9velopp\u00e9 couch\u00e9", "\u00c9l\u00e9vations lat\u00e9rales", "Dips triceps"].map((ex, i) => (
            <div key={i} className="ob-mock-ex-row">
              <div className="ob-mock-dot ob-dot-dim" />
              <span className="ob-mock-ex">{ex}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualTrain() {
  const [tick, setTick] = useState(58);
  useEffect(() => {
    const id = setInterval(() => setTick(t => (t <= 1 ? 62 : t - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const pct = tick / 75;
  const r = 15;
  const circ = 2 * Math.PI * r;
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <div className="ob-visual ob-visual-train">
      <div className="ob-timer-row">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5"/>
          <circle cx="20" cy="20" r={r} fill="none" stroke="var(--accent)" strokeWidth="3.5"
            strokeDasharray={`${circ * pct} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
            style={{ transition: "stroke-dasharray 0.9s linear" }}
          />
        </svg>
        <div className="ob-timer-text">
          <span className="ob-timer-num">{fmt(tick)}</span>
          <span className="ob-timer-label">Repos en cours</span>
        </div>
      </div>
      <div className="ob-mock-card" style={{ marginTop: "0" }}>
        <div className="ob-mock-row" style={{ justifyContent: "space-between" }}>
          <span className="ob-mock-title">D\u00e9velopp\u00e9 couch\u00e9</span>
          <span className="ob-pill ob-pill-accent" style={{ fontSize: "10px", padding: "2px 8px" }}>3 s\u00e9ries</span>
        </div>
        <div className="ob-set-chips">
          {["80kg\u00b710", "80kg\u00b79", "82.5kg\u00b78"].map((s, i) => (
            <span key={i} className="ob-set-chip">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function VisualHistory() {
  const bars = [38, 52, 47, 68, 61, 90];
  return (
    <div className="ob-visual ob-visual-history">
      <div className="ob-stats-row">
        <div className="ob-stat-card">
          <span className="ob-stat-val">24</span>
          <span className="ob-stat-lbl">S\u00e9ances</span>
        </div>
        <div className="ob-stat-card">
          <span className="ob-stat-val">48'</span>
          <span className="ob-stat-lbl">Dur\u00e9e moy.</span>
        </div>
      </div>
      <div className="ob-mock-card" style={{ padding: "10px 12px" }}>
        <div className="ob-bar-chart">
          {bars.map((h, i) => (
            <div key={i} className="ob-bar-col">
              <div
                className={`ob-bar ${i === bars.length - 1 ? "ob-bar-accent" : ""}`}
                style={{ height: `${h}%` }}
              />
            </div>
          ))}
        </div>
        <div className="ob-bar-caption">\u2191 Ta meilleure s\u00e9ance</div>
      </div>
    </div>
  );
}

const VISUALS = {
  welcome: VisualWelcome,
  sessions: VisualSessions,
  train: VisualTrain,
  history: VisualHistory,
};

export default function Onboarding({ onDone }) {
  const [cur, setCur] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const total = SLIDES.length;

  const go = (n) => {
    setAnimKey(k => k + 1);
    setCur(n);
  };

  const next = () => {
    if (cur < total - 1) go(cur + 1);
    else onDone();
  };

  const slide = SLIDES[cur];
  const Visual = VISUALS[slide.visual];
  const isLast = cur === total - 1;

  return (
    <div className="ob-overlay">
      <div className="ob-sheet">
        <div className="ob-progress-bar">
          <div className="ob-progress-fill" style={{ width: `${((cur + 1) / total) * 100}%` }} />
        </div>
        {!isLast && (
          <button className="ob-skip" onClick={onDone}>Passer</button>
        )}
        <div className="ob-visual-area" key={`v-${animKey}`}>
          <Visual />
        </div>
        <div className="ob-text" key={`t-${animKey}`}>
          <h2 className="ob-title">
            {slide.title.map((line, i) => (
              <span key={i}>{line}{i < slide.title.length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="ob-sub">{slide.sub}</p>
        </div>
        <div className="ob-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`ob-dot ${i === cur ? "ob-dot-active" : ""}`}
              onClick={() => go(i)} aria-label={`Slide ${i + 1}`} />
          ))}
        </div>
        <button className="ob-cta" onClick={next}>
          {isLast ? "C'est parti \ud83d\udcaa" : "Suivant"}
        </button>
      </div>
    </div>
  );
}
