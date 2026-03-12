import React, { useState, useEffect } from "react";
import SessionList from "./components/SessionList";
import ExerciseList from "./components/ExerciseList";
import Timer from "./components/Timer";
import History from "./components/History";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isDesktop;
};

const migrateSessions = (sessions) =>
  sessions.map((s) => ({ history: [], ...s }));

export default function App() {
  const isDesktop = useIsDesktop();

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("sessions");
      return saved ? migrateSessions(JSON.parse(saved)) : [];
    } catch {
      return [];
    }
  });
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mode, setMode] = useState("edit"); // edit | action | history

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  const handleAddSet = (exerciseIndex, weight, reps) => {
    const updated = [...sessions];
    if (selectedSessionIndex !== null) {
      updated[selectedSessionIndex].exercises[exerciseIndex].sets.push({
        weight, reps, timestamp: new Date().toISOString(),
      });
      setSessions(updated);
      setSelectedSession(updated[selectedSessionIndex]);
      setResetTrigger((prev) => !prev);
    }
  };

  const addSession = (name) => {
    if (!name.trim()) return;
    const newSession = { name, exercises: [], history: [] };
    const updated = [...sessions, newSession];
    setSessions(updated);
    setSelectedSession(newSession);
    setSelectedSessionIndex(updated.length - 1);
    setMode("action");
  };

  const addExercise = (sessionIndex, exerciseName) => {
    if (!exerciseName.trim()) return;
    const updated = [...sessions];
    updated[sessionIndex].exercises.push({ name: exerciseName, sets: [] });
    setSessions(updated);
  };

  const deleteSession = (index) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    const updated = sessions.filter((_, i) => i !== index);
    setSessions(updated);
    if (selectedSessionIndex === index) {
      setSelectedSession(null);
      setSelectedSessionIndex(null);
      setMode("edit");
    }
  };

  const selectSession = (index) => {
    setSelectedSession(sessions[index]);
    setSelectedSessionIndex(index);
    setMode("action");
    setIsMenuOpen(false);
  };

  const finishSession = () => {
    if (selectedSessionIndex === null) return;
    const updated = [...sessions];
    const session = updated[selectedSessionIndex];
    const hasSets = session.exercises.some((ex) => ex.sets.length > 0);
    if (!hasSets) {
      alert("Aucune série enregistrée dans cette séance.");
      return;
    }
    const snapshot = {
      date: new Date().toISOString(),
      exercises: session.exercises.map((ex) => ({
        name: ex.name,
        sets: [...ex.sets],
      })),
    };
    session.history = [snapshot, ...(session.history || [])];
    session.exercises = session.exercises.map((ex) => ({ ...ex, sets: [] }));
    setSessions(updated);
    setSelectedSession(updated[selectedSessionIndex]);
    setMode("history");
  };

  return (
    <>
      <header className="app-header">
        {!isDesktop && (
          <button
            className={`hamburger-menu ${isMenuOpen ? "open" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✖" : "☰"}
          </button>
        )}
        <span className="app-title">
          {mode === "history" && selectedSession
            ? `📊 ${selectedSession.name}`
            : mode === "action" && selectedSession
            ? selectedSession.name
            : "🌴 Workout"}
        </span>
        <div className="header-actions">
          {mode === "action" && selectedSession && (
            <>
              <button className="header-icon-btn" title="Historique" onClick={() => setMode("history")}>📊</button>
              <button className="header-icon-btn finish-btn" title="Terminer la séance" onClick={finishSession}>✅</button>
              <button className="header-icon-btn" title="Gérer les séances" onClick={() => setMode("edit")}>✏️</button>
            </>
          )}
          {mode === "history" && (
            <button className="header-icon-btn" onClick={() => setMode("action")}>← Retour</button>
          )}
          {mode === "edit" && <div style={{ width: 40 }} />}
        </div>
      </header>

      <div className={`app-wrapper ${isDesktop ? "desktop" : ""}`}>
        {!isDesktop && isMenuOpen && (
          <div className="overlay" onClick={() => setIsMenuOpen(false)} />
        )}
        <div className={`side-menu ${isDesktop ? "desktop-visible" : isMenuOpen ? "open" : ""}`}>
          <h2>Séances</h2>
          <div className="session-list">
            {sessions.map((session, index) => (
              <button
                key={index}
                onClick={() => selectSession(index)}
                className={selectedSessionIndex === index ? "active" : ""}
              >
                <span>{session.name}</span>
                {session.history && session.history.length > 0 && (
                  <span className="session-badge">{session.history.length}</span>
                )}
              </button>
            ))}
          </div>
          <button className="create-session-button" onClick={() => { setMode("edit"); setIsMenuOpen(false); }}>
            + Gérer les séances
          </button>
          <div className="menu-footer">Avec amour © Teivano 2025</div>
        </div>

        <div className="app-container">
          {mode === "edit" ? (
            <SessionList sessions={sessions} addSession={addSession} deleteSession={deleteSession} addExercise={addExercise} />
          ) : mode === "history" && selectedSession ? (
            <History session={selectedSession} />
          ) : selectedSession ? (
            <>
              <Timer resetTrigger={resetTrigger} />
              <ExerciseList exercises={selectedSession.exercises} addSet={handleAddSet} />
            </>
          ) : (
            <div className="empty-state">
              <span>💪</span>
              <p>Sélectionne une séance pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
