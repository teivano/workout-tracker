// GARDE-FOU : utiliser UNIQUEMENT push_files pour modifier ce fichier
import React, { useState } from "react";

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}`;
  return `${m} min`;
};

const totalSets = (exercises) =>
  exercises.reduce((t, ex) => t + ex.sets.length, 0);

// Jours de la semaine courante (lundi = index 0)
function getWeekDays() {
  const now = new Date();
  const day = now.getDay(); // 0=dim, 1=lun, ...
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function WeekStreak({ history }) {
  const days = getWeekDays();
  const labels = ["L", "M", "M", "J", "V", "S", "D"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const hasSessions = days.map((d) => {
    const next = new Date(d);
    next.setDate(d.getDate() + 1);
    return history.some((e) => {
      const ed = new Date(e.date);
      return ed >= d && ed < next;
    });
  });

  return (
    <div className="week-streak">
      {days.map((d, i) => {
        const isToday = d.getTime() === today.getTime();
        const done = hasSessions[i];
        const isFuture = d > today;
        return (
          <div key={i} className="streak-day">
            <div className={`streak-dot ${done ? "streak-dot-done" : ""} ${isToday ? "streak-dot-today" : ""} ${isFuture ? "streak-dot-future" : ""}`} />
            <span className={`streak-label ${isToday ? "streak-label-today" : ""}`}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// SVG calendrier minimaliste
function CalendarSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity:0.35}}>
      <rect x="4" y="10" width="44" height="36" rx="5" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      <rect x="14" y="4" width="4" height="12" rx="2" fill="currentColor"/>
      <rect x="34" y="4" width="4" height="12" rx="2" fill="currentColor"/>
      <line x1="4" y1="22" x2="48" y2="22" stroke="currentColor" strokeWidth="2"/>
      <rect x="13" y="28" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.6"/>
      <rect x="23" y="28" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.6"/>
      <rect x="33" y="28" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
    </svg>
  );
}

export default function History({ session, sessions }) {
  const [expandedIndex, setExpandedIndex] = useState(0);

  if (!session) {
    const hasAnyHistory = sessions?.some((s) => s.history?.length > 0);
    return (
      <div className="empty-state">
        <CalendarSVG />
        <p>Pas encore de séance enregistrée</p>
        <small>{hasAnyHistory ? "Sélectionne une séance depuis l'onglet Entraînement" : "Commence par t'entraîner et termine une séance !"}</small>
      </div>
    );
  }

  if (!session.history || session.history.length === 0) {
    return (
      <div className="empty-state">
        <CalendarSVG />
        <p>Aucune séance terminée pour l'instant</p>
        <small>Appuie sur ✅ pour archiver une séance</small>
      </div>
    );
  }

  // Metrics
  const totalSeances = session.history.length;
  const durationsWithData = session.history.filter(e => e.durationSeconds).map(e => e.durationSeconds);
  const avgDuration = durationsWithData.length > 0
    ? Math.round(durationsWithData.reduce((a, b) => a + b, 0) / durationsWithData.length)
    : null;

  // Graphique barres — 6 dernières séances, proportionnel au nb de séries
  const chartData = session.history.slice(0, 6).reverse();
  const maxSets = Math.max(...chartData.map(e => totalSets(e.exercises)), 1);

  return (
    <div className="history-container">

      {/* Metrics cards */}
      <div className="history-metrics">
        <div className="history-metric-card">
          <span className="history-metric-val">{totalSeances}</span>
          <span className="history-metric-label">séance{totalSeances > 1 ? "s" : ""}</span>
        </div>
        {avgDuration && (
          <div className="history-metric-card">
            <span className="history-metric-val">{formatDuration(avgDuration)}</span>
            <span className="history-metric-label">durée moy.</span>
          </div>
        )}
        <div className="history-metric-card history-metric-streak">
          <WeekStreak history={session.history} />
          <span className="history-metric-label">cette semaine</span>
        </div>
      </div>

      {/* Mini graphique barres */}
      {chartData.length > 1 && (
        <div className="history-chart">
          {chartData.map((entry, i) => {
            const s = totalSets(entry.exercises);
            const pct = Math.round((s / maxSets) * 100);
            const isLast = i === chartData.length - 1;
            return (
              <div key={i} className="history-chart-col">
                <div className="history-chart-bar-wrap">
                  <div
                    className={`history-chart-bar ${isLast ? "history-chart-bar-accent" : ""}`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="history-chart-label">
                  {new Date(entry.date).toLocaleDateString("fr-FR", { day: "numeric", month: "numeric" })}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="history-title">{totalSeances} séance{totalSeances > 1 ? "s" : ""} archivée{totalSeances > 1 ? "s" : ""}</p>

      {session.history.map((entry, index) => {
        const sets = totalSets(entry.exercises);
        const duration = formatDuration(entry.durationSeconds);
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
                {duration && <span className="history-chip history-chip-duration">⏱ {duration}</span>}
                <span className="history-chip">{sets} série{sets > 1 ? "s" : ""}</span>
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
