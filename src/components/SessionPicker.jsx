// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
import React from "react";

const MUSCLES = [
  { id: "pectoraux",    label: "Pectoraux" },
  { id: "epaules",      label: "Épaules" },
  { id: "grand_dorsal", label: "Grand dorsal" },
  { id: "trapezes",     label: "Trapèzes" },
  { id: "biceps",       label: "Biceps" },
  { id: "triceps",      label: "Triceps" },
  { id: "avant_bras",   label: "Avant-bras" },
  { id: "abdominaux",   label: "Abdominaux" },
  { id: "obliques",     label: "Obliques" },
  { id: "quadriceps",   label: "Quadriceps" },
  { id: "ischio",       label: "Ischio-jambiers" },
  { id: "fessiers",     label: "Fessiers" },
  { id: "mollets",      label: "Mollets" },
  { id: "adducteurs",   label: "Adducteurs" },
];

function getMuscleLabel(id) {
  return MUSCLES.find((m) => m.id === id)?.label || id;
}

function formatLastDate(history) {
  if (!history || history.length === 0) return null;
  const d = new Date(history[0].date);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

// Dupliqué depuis History.jsx — évite une dépendance inter-composants
function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}`;
  return `${m} min`;
}

// SVG haltère minimaliste
function DumbbellPickerSVG() {
  return (
    <svg width="48" height="48" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity:0.3}}>
      <rect x="4" y="22" width="8" height="12" rx="3" fill="currentColor"/>
      <rect x="44" y="22" width="8" height="12" rx="3" fill="currentColor"/>
      <rect x="10" y="19" width="6" height="18" rx="2" fill="currentColor"/>
      <rect x="40" y="19" width="6" height="18" rx="2" fill="currentColor"/>
      <rect x="16" y="26" width="24" height="4" rx="2" fill="currentColor"/>
    </svg>
  );
}

export default function SessionPicker({ sessions, onSelect }) {
  if (sessions.length === 0) {
    return (
      <div className="empty-state" style={{ height: "60vh" }}>
        <DumbbellPickerSVG />
        <p>Aucune séance créée</p>
        <small>Va dans 📋 Séances pour créer ta première séance</small>
      </div>
    );
  }

  return (
    <div className="session-picker">
      <p className="session-page-title">Quelle séance aujourd'hui ?</p>
      {sessions.map((session, index) => {
        const lastDate = formatLastDate(session.history);
        const muscles = session.muscles || [];
        const lastHistory = session.history?.[0];
        const lastSets = lastHistory
          ? lastHistory.exercises.reduce((t, ex) => t + ex.sets.length, 0)
          : null;
        const lastDuration = lastHistory ? formatDuration(lastHistory.durationSeconds) : null;

        return (
          <button key={index} className="picker-card" onClick={() => onSelect(index)}>
            <div className="picker-card-left">
              <span className="picker-card-name">{session.name}</span>
              {muscles.length > 0 && (
                <div className="picker-card-muscles">
                  {muscles.map((id) => (
                    <span key={id} className="picker-muscle-chip">{getMuscleLabel(id)}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="picker-card-right">
              {lastDate && <span className="picker-last-date">{lastDate}</span>}
              <div className="picker-last-meta">
                {lastSets !== null && <span className="picker-last-sets">{lastSets} séries</span>}
                {lastDuration && <span className="picker-last-dur">⏱ {lastDuration}</span>}
              </div>
              <span className="picker-arrow">›</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
