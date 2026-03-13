// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
import React, { useState } from "react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const totalVolume = (exercises) =>
  exercises.reduce((t, ex) => t + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0);

const totalSets = (exercises) =>
  exercises.reduce((t, ex) => t + ex.sets.length, 0);

export default function History({ session, sessions }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  // Aucune session sélectionnée ET aucun historique dans aucune séance
  if (!session) {
    const hasAnyHistory = sessions?.some((s) => s.history?.length > 0);
    return (
      <div className="empty-state">
        <span>📅</span>
        <p>Pas encore de séance enregistrée</p>
        <small>{hasAnyHistory ? "Sélectionne une séance depuis l'onglet Entraînement" : "Commence par t'entraîner et termine une séance !"}</small>
      </div>
    );
  }

  if (!session.history || session.history.length === 0) {
    return (
      <div className="empty-state">
        <span>📅</span>
        <p>Aucune séance terminée pour l'instant</p>
        <small>Appuie sur ✅ pour archiver une séance</small>
      </div>
    );
  }

  return (
    <div className="history-container">
      <p className="history-title">{session.history.length} séance{session.history.length > 1 ? "s" : ""} archivée{session.history.length > 1 ? "s" : ""}</p>
      {session.history.map((entry, index) => {
        const vol = totalVolume(entry.exercises);
        const sets = totalSets(entry.exercises);
        const isExpanded = expandedIndex === index;
        return (
          <div key={index} className={`history-card ${isExpanded ? "expanded" : ""}`}
            onClick={() => setExpandedIndex(isExpanded ? null : index)}>
            <div className="history-card-header">
              <div className="history-date-block">
                <span className="history-day">{formatDate(entry.date)}</span>
                <span className="history-time">{formatTime(entry.date)}</span>
              </div>
              <div className="history-meta">
                <span className="history-chip">{sets} série{sets > 1 ? "s" : ""}</span>
                {vol > 0 && <span className="history-chip">{vol.toLocaleString()} kg</span>}
                <span className="history-chevron">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </div>
            {isExpanded && (
              <div className="history-detail">
                {entry.exercises.filter((ex) => ex.sets.length > 0).map((ex, i) => (
                  <div key={i} className="history-exercise">
                    <p className="history-exercise-name">{ex.name}</p>
                    <div className="history-sets-row">
                      {ex.sets.map((set, j) => (
                        <span key={j} className="history-set-chip">{set.weight}kg × {set.reps}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
