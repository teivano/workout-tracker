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
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function SessionPicker({ sessions, onSelect }) {
  if (sessions.length === 0) {
    return (
      <div className="empty-state" style={{ height: "60vh" }}>
        <span>🌴</span>
        <p>Aucune séance créée</p>
        {/* FIX #1 : nom d'onglet correct (📋 Séances, pas ⚙️ Gérer) */}
        <small>Va dans 📋 Séances pour créer ta première séance</small>
      </div>
    );
  }

  return (
    <div className="session-picker">
      <p className="session-page-title">Quelle séance aujourd'hui ?</p>
      {sessions.map((session, index) => {
        const lastDate = formatLastDate(session.history);
        const muscles = session.muscles || [];
        const totalSets = session.history?.[0]
          ? session.history[0].exercises.reduce((t, ex) => t + ex.sets.length, 0)
          : null;

        return (
          <button
            key={index}
            className="picker-card"
            onClick={() => onSelect(index)}
          >
            <div className="picker-card-left">
              <span className="picker-card-name">{session.name}</span>
              {muscles.length > 0 && (
                <div className="picker-card-muscles">
                  {muscles.map((id) => (
                    <span key={id} className="picker-muscle-chip">
                      {getMuscleLabel(id)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="picker-card-right">
              {lastDate && (
                <span className="picker-last-date">{lastDate}</span>
              )}
              {totalSets !== null && (
                <span className="picker-last-sets">{totalSets} séries</span>
              )}
              <span className="picker-arrow">›</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
