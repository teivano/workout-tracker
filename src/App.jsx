import React, { useState, useEffect } from "react";
import SessionList from "./components/SessionList";
import ExerciseList from "./components/ExerciseList";
import Timer from "./components/Timer";
import History from "./components/History";
import Onboarding from "./components/Onboarding";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isDesktop;
};

const migrateSessions = (s) => s.map((x) => ({ history: [], category: "", ...x }));

export default function App() {
  const isDesktop = useIsDesktop();

  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem("onboarding_done");
  });

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
  const [flashIndex, setFlashIndex] = useState(null);

  useEffect(() => { localStorage.setItem("sessions", JSON.stringify(sessions)); }, [sessions]);

  const selectedSession = selectedSessionIndex !== null ? sessions[selectedSessionIndex] : null;

  const update = (fn) => setSessions((prev) => { const next = [...prev]; fn(next); return next; });

  const handleAddSet = (exerciseIndex, weight, reps) => {
    if (selectedSessionIndex === null) return;
    update((s) => {
      s[selectedSessionIndex].exercises[exerciseIndex].sets.push({
        weight, reps, timestamp: new Date().toISOString(),
      });
    });
    setResetTrigger((p) => !p);
    setFlashIndex(exerciseIndex);
    setTimeout(() => setFlashIndex(null), 500);
  };

  const deleteSet = (exerciseIndex, setIndex) => {
    if (selectedSessionIndex === null) return;
    update((s) => { s[selectedSessionIndex].exercises[exerciseIndex].sets.splice(setIndex, 1); });
  };

  const addSession = (name) => {
    if (!name.trim()) return;
    setSessions((prev) => [
      ...prev,
      { name, exercises: [], history: [], category: "" },
    ]);
  };

  const addExercise = (sessionIndex, exerciseName) => {
    if (!exerciseName.trim()) return;
    update((s) => { s[sessionIndex].exercises.push({ name: exerciseName, sets: [] }); });
  };

  const deleteExercise = (sessionIndex, exerciseIndex) => {
    if (!window.confirm("Supprimer cet exercice ?")) return;
    update((s) => { s[sessionIndex].exercises.splice(exerciseIndex, 1); });
  };

  const moveExercise = (sessionIndex, exerciseIndex, direction) => {
    update((s) => {
      const exs = s[sessionIndex].exercises;
      const target = exerciseIndex + direction;
      if (target >= 0 && target < exs.length)
        [exs[exerciseIndex], exs[target]] = [exs[target], exs[exerciseIndex]];
    });
  };

  const renameSession = (index, newName) => {
    update((s) => { s[index].name = newName; });
  };

  const setCategorySession = (index, category) => {
    update((s) => { s[index].category = category; });
  };

  const duplicateSession = (index) => {
    update((s) => {
      const orig = s[index];
      s.splice(index + 1, 0, {
        ...orig, name: orig.name + " (copie)",
        exercises: orig.exercises.map((ex) => ({ ...ex, sets: [] })),
        history: [],
      });
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
    let hasSet = false;
    update((s) => {
      const session = s[selectedSessionIndex];
      hasSet = session.exercises.some((ex) => ex.sets.length > 0);
      if (!hasSet) return;
      session.history = [
        { date: new Date().toISOString(), exercises: session.exercises.map((ex) => ({ name: ex.name, sets: [...ex.sets] })) },
        ...(session.history || []),
      ];
      session.exercises = session.exercises.map((ex) => ({ ...ex, sets: [] }));
    });
    if (!hasSet) { alert("Aucune série enregistrée."); return; }
    setMode("history");
  };

  const handleOnboardingDone = () => {
    localStorage.setItem("onboarding_done", "1");
    setShowOnboarding(false);
  };

  const totalSetsToday = selectedSession
    ? selectedSession.exercises.reduce((t, ex) => t + ex.sets.length, 0)
    : 0;

  return (
    <>
      {showOnboarding && <Onboarding onDone={handleOnboardingDone} />}

      <header className="app-header">
        {!isDesktop && (
          <button className={`hamburger-menu ${isMenuOpen ? "open" : ""}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? "✖" : "☰"}
          </button>
        )}
        <div className="app-title-block">
          <span className="app-title">
            {mode === "history" && selectedSession ? selectedSession.name
              : mode === "action" && selectedSession ? selectedSession.name
              : "🌴 Workout"}
          </span>
          {mode === "action" && selectedSession && totalSetsToday > 0 && (
            <span className="header-sets-count">{totalSetsToday} série{totalSetsToday > 1 ? "s" : ""}</span>
          )}
        </div>
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
            {sessions.length === 0 && (
              <p className="menu-empty">Aucune séance —<br />crée-en une !</p>
            )}
            {sessions.map((session, index) => (
              <button key={index} onClick={() => selectSession(index)}
                className={selectedSessionIndex === index ? "active" : ""}>
                <span>{session.name}</span>
                {session.history?.length > 0 && (
                  <span className="session-badge">{session.history.length}</span>
                )}
              </button>
            ))}
          </div>
          <div className="menu-bottom">
            <button className="create-session-button"
              onClick={() => { setMode("edit"); setIsMenuOpen(false); }}>
              + Gérer les séances
            </button>
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
              <ExerciseList
                exercises={selectedSession.exercises}
                history={selectedSession.history}
                addSet={handleAddSet}
                deleteSet={deleteSet}
                flashIndex={flashIndex}
              />
            </>
          ) : (
            <div className="empty-state">
              <span>💪</span>
              <p>Sélectionne une séance<br />pour commencer</p>
              <small>Ouvre le menu ☰ ou crée une séance</small>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
