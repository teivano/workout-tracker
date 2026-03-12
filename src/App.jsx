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
  sessions.map((s) => ({ history: [], category: "", ...s }));

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

  useEffect(() => { localStorage.setItem("sessions", JSON.stringify(sessions)); }, [sessions]);

  const selectedSession = selectedSessionIndex !== null ? sessions[selectedSessionIndex] : null;

  const update = (fn) => setSessions((prev) => fn([...prev]));

  const handleAddSet = (exerciseIndex, weight, reps) => {
    if (selectedSessionIndex === null) return;
    update((s) => {
      s[selectedSessionIndex].exercises[exerciseIndex].sets.push({ weight, reps, timestamp: new Date().toISOString() });
      return s;
    });
    setResetTrigger((p) => !p);
  };

  const deleteSet = (exerciseIndex, setIndex) => {
    if (selectedSessionIndex === null) return;
    update((s) => {
      s[selectedSessionIndex].exercises[exerciseIndex].sets.splice(setIndex, 1);
      return s;
    });
  };

  const addSession = (name) => {
    if (!name.trim()) return;
    setSessions((prev) => {
      const next = [...prev, { name, exercises: [], history: [], category: "" }];
      setSelectedSessionIndex(next.length - 1);
      setMode("action");
      return next;
    });
  };

  const addExercise = (sessionIndex, exerciseName) => {
    if (!exerciseName.trim()) return;
    update((s) => { s[sessionIndex].exercises.push({ name: exerciseName, sets: [] }); return s; });
  };

  const deleteExercise = (sessionIndex, exerciseIndex) => {
    if (!window.confirm("Supprimer cet exercice ?")) return;
    update((s) => { s[sessionIndex].exercises.splice(exerciseIndex, 1); return s; });
  };

  const moveExercise = (sessionIndex, exerciseIndex, direction) => {
    update((s) => {
      const exs = s[sessionIndex].exercises;
      const target = exerciseIndex + direction;
      if (target < 0 || target >= exs.length) return s;
      [exs[exerciseIndex], exs[target]] = [exs[target], exs[exerciseIndex]];
      return s;
    });
  };

  const renameSession = (index, newName) => {
    update((s) => { s[index].name = newName; return s; });
  };

  const setCategorySession = (index, category) => {
    update((s) => { s[index].category = category; return s; });
  };

  const duplicateSession = (index) => {
    update((s) => {
      const orig = s[index];
      const copy = {
        ...orig,
        name: orig.name + " (copie)",
        exercises: orig.exercises.map((ex) => ({ ...ex, sets: [] })),
        history: [],
      };
      s.splice(index + 1, 0, copy);
      return s;
    });
  };

  const deleteSession = (index) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    setSessions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (selectedSessionIndex === index) { setSelectedSessionIndex(null); setMode("edit"); }
      else if (selectedSessionIndex > index) setSelectedSessionIndex((i) => i - 1);
      return next;
    });
  };

  const selectSession = (index) => {
    setSelectedSessionIndex(index);
    setMode("action");
    setIsMenuOpen(false);
  };

  const finishSession = () => {
    if (selectedSessionIndex === null) return;
    update((s) => {
      const session = s[selectedSessionIndex];
      const hasSets = session.exercises.some((ex) => ex.sets.length > 0);
      if (!hasSets) { alert("Aucune série enregistrée."); return s; }
      session.history = [{ date: new Date().toISOString(), exercises: session.exercises.map((ex) => ({ name: ex.name, sets: [...ex.sets] })) }, ...(session.history || [])];
      session.exercises = session.exercises.map((ex) => ({ ...ex, sets: [] }));
      return s;
    });
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
          <div className="menu-bottom">
            <button className="create-session-button" onClick={() => { setMode("edit"); setIsMenuOpen(false); }}>+ Gérer les séances</button>
            <div className="menu-footer">Avec amour © Teivano 2025</div>
          </div>
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
              duplicateSession={duplicateSession}
              setCategorySession={setCategorySession}
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
