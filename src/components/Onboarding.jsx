// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
import React, { useState, useEffect } from "react";

const SLIDES = [
  {
    id: "welcome",
    title: "Ton coach de salle,\ndans ta poche",
    sub: "Organise tes séances, suis tes séries en temps réel et regarde ta progression semaine après semaine.",
    visual: "welcome",
  },
  {
    id: "sessions",
    title: "Crée tes séances",
    sub: "Choisis tes muscles, les exercices suggérés apparaissent automatiquement.",
    visual: "sessions",
  },
  {
    id: "train",
    title: "Entraîne-toi",
    sub: "Timer de repos automatique, log des séries en un tap, meilleure perf de la dernière séance visible en temps réel.",
    visual: "train",
  },
  {
    id: "history",
    title: "Regarde ta progression",
    sub: "Historique complet, streak hebdo et graphiques. Chaque séance compte.",
    visual: "history",
  },
];

function VisualWelcome() {
  return (
    <div className="ob-visual-welcome">
      <div className="ob-dumbbell-ring">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="3" y="18" width="8" height="12" rx="3" fill="var(--accent)" />
          <rect x="37" y="18" width="8" height="12" rx="3" fill="var(--accent)" />
          <rect x="9" y="14" width="6" height="20" rx="2" fill="var(--accent)" />
          <rect x="33" y="14" width="6" height="20" rx="2" fill="var(--accent)" />
          <rect x="15" y="21" width="18" height="6" rx="2" fill="var(--accent)" />
        </svg>
      </div>
      <div className="ob-welcome-chips">
        <span className="ob-chip ob-chip-green">Séances</span>
        <span className="ob-chip ob-chip-dim">Timer</span>
        <span className="ob-chip ob-chip-dim">Stats</span>
        <span className="ob-chip ob-chip-dim">Progression</span>
      </div>
    </div>
  );
}

function VisualSessions() {
  return (
    <div className="ob-visual-card">
      <div className="ob-card-row">
        <div className="ob-card-dot ob-dot-accent" />
        <span className="ob-card-name">Push day</span>
      </div>
      <div className="ob-muscle-chips">
        <span className="ob-chip ob-chip-green">Pectoraux</span>
        <span className="ob-chip ob-chip-green">Épaules</span>
        <span className="ob-chip ob-chip-green">Triceps</span>
      </div>
      <div className="ob-ex-list">
        <div className="ob-ex-row"><div className="ob-card-dot ob-dot-dim" /><span className="ob-ex-name">Développé couché</span></div>
        <div className="ob-ex-row"><div className="ob-card-dot ob-dot-dim" /><span className="ob-ex-name">Élévations latérales</span></div>
        <div className="ob-ex-row"><div className="ob-card-dot ob-dot-dim" /><span className="ob-ex-name">Dips triceps</span></div>
      </div>
    </div>
  );
}

function VisualTrain() {
  const [tick, setTick] = useState(62);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t <= 1 ? 62 : t - 1), 1000);
    return () => clearInterval(id);
  }, []);
  const pct = tick / 75;
  const r = 14; const circ = 2 * Math.PI * r;
  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  return (
    <div className="ob-visual-train">
      <div className="ob-timer-row">
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3"/>
          <circle cx="18" cy="18" r={r} fill="none" stroke="var(--accent)" strokeWidth="3"
            strokeDasharray={`${circ*pct} ${circ}`} strokeLinecap="round"
            transform="rotate(-90 18 18)"
            style={{transition:"stroke-dasharray 0.9s linear"}}
          />
        </svg>
        <div>
          <div className="ob-timer-num">{fmt(tick)}</div>
          <div className="ob-timer-label">Repos en cours</div>
        </div>
      </div>
      <div className="ob-visual-card" style={{marginTop:0}}>
        <div className="ob-card-row" style={{justifyContent:"space-between"}}>
          <span className="ob-card-name">Développé couché</span>
          <span className="ob-chip ob-chip-green">3 séries</span>
        </div>
        <div className="ob-set-chips">
          <span className="ob-set-chip">80kg·10</span>
          <span className="ob-set-chip">80kg·9</span>
          <span className="ob-set-chip">82.5kg·8</span>
        </div>
      </div>
    </div>
  );
}

function VisualHistory() {
  const bars = [38, 52, 47, 68, 61, 90];
  return (
    <div className="ob-visual-history">
      <div className="ob-stat-row">
        <div className="ob-stat-card"><div className="ob-stat-val">24</div><div className="ob-stat-lbl">Séances</div></div>
        <div className="ob-stat-card"><div className="ob-stat-val">48’</div><div className="ob-stat-lbl">Durée moy.</div></div>
      </div>
      <div className="ob-visual-card" style={{padding:"10px 12px"}}>
        <div className="ob-bar-wrap">
          {bars.map((h, i) => (
            <div key={i} className={`ob-bar${i === bars.length - 1 ? " ob-bar-accent" : ""}`}
              style={{height: `${h}%`}} />
          ))}
        </div>
        <div className="ob-bar-caption">↑ Ta meilleure séance</div>
      </div>
    </div>
  );
}

const VISUALS = { welcome: VisualWelcome, sessions: VisualSessions, train: VisualTrain, history: VisualHistory };

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

        {/* Barre de progression */}
        <div className="ob-progress">
          <div className="ob-progress-fill" style={{width: `${(cur + 1) / total * 100}%`}} />
        </div>

        {/* Skip */}
        {!isLast && (
          <button className="ob-skip" onClick={onDone}>Passer</button>
        )}

        {/* Visuel */}
        <div className="ob-visual-area" key={animKey}>
          <Visual />
        </div>

        {/* Texte */}
        <div className="ob-text-area" key={animKey + 100}>
          <h2 className="ob-title">
            {slide.title.split("\n").map((line, i) => (
              <span key={i}>{line}{i < slide.title.split("\n").length - 1 && <br />}</span>
            ))}
          </h2>
          <p className="ob-sub">{slide.sub}</p>
        </div>

        {/* Dots */}
        <div className="ob-dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={`ob-dot${i === cur ? " ob-dot-active" : ""}`}
              onClick={() => go(i)} />
          ))}
        </div>

        {/* CTA */}
        <button className="ob-cta" onClick={next}>
          {isLast ? "C’est parti \uD83D\uDCAA" : "Suivant"}
        </button>

      </div>
    </div>
  );
}
