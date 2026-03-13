import React, { useState } from "react";
import { APP_VERSION } from "../version.js";

const PALETTE = [
  { id: "green",  label: "Vert",   accent: "#28a745", dim: "rgba(40,167,69,0.18)",   border: "rgba(40,167,69,0.3)",   text: "#4cdb78" },
  { id: "blue",   label: "Bleu",   accent: "#2196f3", dim: "rgba(33,150,243,0.18)",  border: "rgba(33,150,243,0.3)",  text: "#64b8ff" },
  { id: "violet", label: "Violet", accent: "#9c27b0", dim: "rgba(156,39,176,0.18)",  border: "rgba(156,39,176,0.3)",  text: "#ce7de8" },
  { id: "orange", label: "Orange", accent: "#ff7043", dim: "rgba(255,112,67,0.18)",  border: "rgba(255,112,67,0.3)",  text: "#ff9a78" },
  { id: "red",    label: "Rouge",  accent: "#e53935", dim: "rgba(229,57,53,0.18)",   border: "rgba(229,57,53,0.3)",   text: "#ff6b6b" },
  { id: "cyan",   label: "Cyan",   accent: "#00bcd4", dim: "rgba(0,188,212,0.18)",   border: "rgba(0,188,212,0.3)",   text: "#4dd9ed" },
  { id: "pink",   label: "Rose",   accent: "#e91e63", dim: "rgba(233,30,99,0.18)",   border: "rgba(233,30,99,0.3)",   text: "#f06292" },
];

const REST_OPTIONS = [
  { value: 30,  label: "30 s" },
  { value: 45,  label: "45 s" },
  { value: 60,  label: "1 min" },
  { value: 75,  label: "1 min 15" },
  { value: 90,  label: "1 min 30" },
  { value: 120, label: "2 min" },
  { value: 150, label: "2 min 30" },
  { value: 180, label: "3 min" },
  { value: 240, label: "4 min" },
  { value: 300, label: "5 min" },
];

export function applyAccentColor(colorId) {
  const c = PALETTE.find(p => p.id === colorId) || PALETTE[0];
  const r = document.documentElement.style;
  r.setProperty("--accent",        c.accent);
  r.setProperty("--accent-dim",    c.dim);
  r.setProperty("--accent-border", c.border);
  r.setProperty("--accent-text",   c.text);
}

export default function Settings() {
  const [accentId, setAccentId] = useState(
    () => localStorage.getItem("accent_color") || "green"
  );
  const [restDuration, setRestDuration] = useState(() => {
    const saved = parseInt(localStorage.getItem("rest_duration"), 10);
    return !isNaN(saved) && saved >= 10 ? saved : 75;
  });
  const [confirmReset, setConfirmReset] = useState(false);

  const handleColorChange = (id) => {
    setAccentId(id);
    localStorage.setItem("accent_color", id);
    applyAccentColor(id);
  };

  const handleRestChange = (val) => {
    const v = parseInt(val, 10);
    setRestDuration(v);
    localStorage.setItem("rest_duration", String(v));
  };

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="settings-page">

      <section className="settings-section">
        <p className="settings-section-title">Compte</p>
        <div className="settings-card settings-account-card">
          <div className="settings-account-status">
            <span className="settings-status-dot offline" />
            <span className="settings-status-label">Mode hors-ligne · données locales</span>
          </div>
          <button className="settings-google-btn" disabled>
            <svg className="settings-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continuer avec Google</span>
            <span className="settings-soon-badge">Bientôt</span>
          </button>
          <p className="settings-account-hint">
            La synchronisation en ligne (multi-appareils, sauvegarde cloud) arrivera prochainement.
            Tes données locales seront migrées automatiquement.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <p className="settings-section-title">Entraînement</p>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-label">
              <span className="settings-row-title">Durée de repos</span>
              <span className="settings-row-sub">Temps entre chaque série</span>
            </div>
            <select
              className="settings-select"
              value={restDuration}
              onChange={(e) => handleRestChange(e.target.value)}
            >
              {REST_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="settings-section">
        <p className="settings-section-title">Couleur d'accentuation</p>
        <div className="settings-card">
          <div className="settings-palette">
            {PALETTE.map(c => (
              <button
                key={c.id}
                className={`palette-swatch ${accentId === c.id ? "selected" : ""}`}
                style={{ "--swatch": c.accent }}
                onClick={() => handleColorChange(c.id)}
                title={c.label}
                type="button"
              >
                {accentId === c.id && <span className="palette-check">✓</span>}
              </button>
            ))}
          </div>
          <p className="settings-palette-label">
            {PALETTE.find(p => p.id === accentId)?.label}
          </p>
        </div>
      </section>

      <section className="settings-section">
        <p className="settings-section-title">Données</p>
        <div className="settings-card">
          <p className="settings-hint">
            Supprime toutes tes séances, ton historique et tes préférences.
            Cette action est irréversible.
          </p>
          {confirmReset ? (
            <div className="settings-confirm-row">
              <span className="settings-confirm-label">Tu es sûr ?</span>
              <button className="settings-btn settings-btn-danger" onClick={handleReset}>
                Oui, tout effacer
              </button>
              <button className="settings-btn settings-btn-ghost" onClick={() => setConfirmReset(false)}>
                Annuler
              </button>
            </div>
          ) : (
            <button className="settings-btn settings-btn-danger-outline" onClick={handleReset}>
              🗑 Réinitialiser l'application
            </button>
          )}
        </div>
      </section>

      <p className="settings-version">Workout Tracker · v{APP_VERSION}</p>
    </div>
  );
}
