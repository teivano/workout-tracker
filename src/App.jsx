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
    } catch { return []; }
  });
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mode, setMode] = useState("edit");

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  const selectedSession = selectedSessionIndex !== null ? sessions[selectedSessionIndex] : null;

  const updateSessions = (updated) => setSessions(updated);

  const handleAddSet = (exerciseIndex, weight, reps) => {
    if (selectedSessionIndex === null) return;
    const updated = sessions.map((s, i) => {
      if (i !== selectedSessionIndex) return s;
      const exercises = s.exercises.map((ex, ei) =>
        ei === exerciseIndex ? { ...ex, sets: [...ex.sets, { weight, reps, timestamp: new Date().toISOString() }] } : ex
      );
      return { ...s, exercises };
    });
    updateSessions(updated);
    setResetTrigger((p) => !p);
  };

  const deleteSet = (exerciseIndex, setIndex) => {
    if (selectedSessionIndex === null) return;
    const updated = sessions.map((s, i) => {
      if (i !== selectedSessionIndex) return s;
      const exercises = s.exercises.map((ex, ei) =>
        ei === exerciseIndex ? { ...ex, sets: ex.sets.filter((_, si) => si !== setIndex) } : ex
      );
      return { ...s, exercises };
    });
    updateSessions(updated);
  };

  const addSession = (name) => {
    if (!name.trim()) return;
    const newSession = { name, exercises: [], history: [] };
    const updated = [...sessions, newSession];
    setSessions(updated);
    setSelectedSessionIndex(updated.length - 1);
    setMode("action");
  };

  const addExercise = (sessionIndex, exerciseName) => {
    if (!exerciseName.trim()) return;
    const updated = sessions.map((s, i) =>
      i === sessionIndex ? { ...s, exercises: [...s.exercises, { name: exerciseName, sets: [] }] } : s
    );
    updateSessions(updated);
  };

  const deleteExercise = (sessionIndex, exerciseIndex) => {
    if (!window.confirm("Supprimer cet exercice ?")) return;
    const updated = sessions.map((s, i) =>
      i === sessionIndex ? { ...s, exercises: s.exercises.filter((_, ei) => ei !== exerciseIndex) } : s
    );
    updateSessions(updated);
  };

  const moveExercise = (sessionIndex, exerciseIndex, direction) => {
    const updated = sessions.map((s, i) => {
      if (i !== sessionIndex) return s;
      const exercises = [...s.exercises];
      const target = exerciseIndex + direction;
      if (target < 0 || target >= exercises.length) return s;
      [exercises[exerciseIndex], exercises[target]] = [exercises[target], exercises[exerciseIndex]];
      return { ...s, exercises };
    });
    updateSessions(updated);
  };

  const renameSession = (index, newName) => {
    const updated = sessions.map((s, i) => i === index ? { ...s, name: newName } : s);
    updateSessions(updated);
  };

  const deleteSession = (index) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    const updated = sessions.filter((_, i) => i !== index);
    setSessions(updated);
    if (selectedSessionIndex === index) {
      setSelectedSessionIndex(null);
      setMode("edit");
    } else if (selectedSessionIndex > index) {
      setSelectedSessionIndex(selectedSessionIndex - 1);
    }
  };

  const selectSession = (index) => {
    setSelectedSessionIndex(index);
    setMode("action");
    setIsMenuOpen(false);
  };

  const finishSession = () => {
    if (selectedSessionIndex === null) return;
    const session = sessions[selectedSessionIndex];
    const hasSets = session.exercises.some((ex) => ex.sets.length > 0);
    if (!hasSets) { alert("Aucune série enregistrée."); return; }
    const snapshot = {
      date: new Date().toISOString(),
      exercises: session.exercises.map((ex) => ({ name: ex.name, sets: [...ex.sets] })),
    };
    const updated = sessions.map((s, i) =>
      i === selectedSessionIndex
        ? { ...s, history: [snapshot, ...(s.history || [])], exercises: s.exercises.map((ex) => ({ ...ex, sets: [] })) }
        : s
    );
    updateSessions(updated);
    setMode("history");
  };

  return (
    <>
      <header className="app-header">
        {!isDesktop && (
          <button className={`hamburger-menu ${isMenuOpen ? "open" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? "✖" : "☰"}
          </button>
        )}
        <span className="app-title">
          {mode === "history" && selectedSession ? `📊 ${selectedSession.name}`
            : mode === "action" && selectedSession ? selectedSession.name
            : "🌴 Workout"}
        </span>
        <div className="header-actions">
          {mode === "action" && selectedSession && (
            <>
              <button className="header-icon-btn" onClick={() => setMode("history")} title="Historique">📊</button>
              <button className="header-icon-btn finish-btn" onClick={finishSession} title="Terminer">✅</button>
              <button className="header-icon-btn" onClick={() => setMode("edit")} title="Gérer">✏️</button>
            </>
          )}
          {mode === "history" && (
            <button className="header-icon-btn" onClick={() => setMode("action")}>← Retour</button>
          )}
          {mode === "edit" && <div style={{ width: 40 }} />}
        </div>
      </header>

      <div className={`app-wrapper ${isDesktop ? "desktop" : ""}`}>
        {!isDesktop && isMenuOpen && <div className="overlay" onClick={() => setIsMenuOpen(false)} />}
        <div className={`side-menu ${isDesktop ? "desktop-visible" : isMenuOpen ? "open" : ""}`}>
          <h2>Séances</h2>
          <div className="session-list">
            {sessions.map((session, index) => (
              <button key={index} onClick={() => selectSession(index)} className={selectedSessionIndex === index ? "active" : ""}>
                <span>{session.name}</span>
                {session.history?.length > 0 && <span className="session-badge">{session.history.length}</span>}
              </button>
            ))}
          </div>
          <button className="create-session-button" onClick={() => { setMode("edit"); setIsMenuOpen(false); }}>+ Gérer les séances</button>
          <div className="menu-footer">Avec amour © Teivano 2025</div>
        </div>

        <div className="app-container">
          {mode === "edit" ? (
            <SessionList
              sessions={sessions}
              addSession={addSession}
              deleteSession={deleteSession}
              addExercise={addExercise}
              renameSession={renameSession}
              deleteExercise={deleteExercise}
              moveExercise={moveExercise}
            />
          ) : mode === "history" && selectedSession ? (
            <History session={selectedSession} />
          ) : selectedSession ? (
            <>
              <Timer resetTrigger={resetTrigger} />
              <ExerciseList exercises={selectedSession.exercises} addSet={handleAddSet} deleteSet={deleteSet} />
            </>
          ) : (
            <div className="empty-state"><span>💪</span><p>Sélectionne une séance pour commencer</p></div>
          )}
        </div>
      </div>
    </>
  );
}
