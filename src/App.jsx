import React, { useState, useEffect } from "react";
import SessionList from "./components/SessionList";
import ExerciseList from "./components/ExerciseList";
import Timer from "./components/Timer";
import History from "./components/History";
import Onboarding from "./components/Onboarding";
import SessionPicker from "./components/SessionPicker";

const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isDesktop;
};

const migrateSessions = (s) =>
  s.map((x) => ({ history: [], muscles: [], ...x }));

export default function App() {
  const isDesktop = useIsDesktop();

  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("onboarding_done")
  );

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("sessions");
      return saved ? migrateSessions(JSON.parse(saved)) : [];
    } catch { return []; }
  });

  const [selectedSessionIndex, setSelectedSessionIndex] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [mode, setMode] = useState("manage");
  const [flashIndex, setFlashIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [sessions]);

  const selectedSession =
    selectedSessionIndex !== null ? sessions[selectedSessionIndex] : null;

  const update = (fn) =>
    setSessions((prev) => {
      const next = [...prev];
      fn(next);
      return next;
    });

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
    update((s) => {
      s[selectedSessionIndex].exercises[exerciseIndex].sets.splice(setIndex, 1);
    });
  };

  // Nouvelle séance ajoutée EN HAUT (unshift)
  const addSession = (name) => {
    if (!name.trim()) return;
    setSessions((prev) => [
      { name, exercises: [], history: [], muscles: [] },
      ...prev,
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

  const setMusclesSession = (index, muscles) => {
    update((s) => { s[index].muscles = muscles; });
  };

  const duplicateSession = (index) => {
    update((s) => {
      const orig = s[index];
      s.splice(index + 1, 0, {
        ...orig,
        name: orig.name + " (copie)",
        exercises: orig.exercises.map((ex) => ({ ...ex, sets: [] })),
        history: [],
      });
    });
  };

  const deleteSession = (index) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
    setSessions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (selectedSessionIndex === index) {
        setSelectedSessionIndex(null);
        setMode("manage");
      } else if (selectedSessionIndex > index) {
        setSelectedSessionIndex((i) => i - 1);
      }
      return next;
    });
  };

  const selectSession = (index) => {
    setSelectedSessionIndex(index);
    setMode("train");
  };

  const finishSession = () => {
    if (selectedSessionIndex === null) return;
    let hasSet = false;
    update((s) => {
      const session = s[selectedSessionIndex];
      hasSet = session.exercises.some((ex) => ex.sets.length > 0);
      if (!hasSet) return;
      session.history = [
        {
          date: new Date().toISOString(),
          exercises: session.exercises.map((ex) => ({ name: ex.name, sets: [...ex.sets] })),
        },
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

  const showTimer = mode === "train" && !!selectedSession;

  const headerTitle =
    mode === "train" && selectedSession ? selectedSession.name
    : mode === "history" && selectedSession ? selectedSession.name
    : "🌴 Workout";

  return (
    <>
      {showOnboarding && <Onboarding onDone={handleOnboardingDone} />}

      <header className="app-header">
        <div className="app-title-block">
          <span className="app-title">{headerTitle}</span>
          {mode === "train" && selectedSession && totalSetsToday > 0 && (
            <span className="header-sets-count">
              {totalSetsToday} série{totalSetsToday > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {isDesktop && (
          <div className="header-actions">
            {mode === "train" && selectedSession && (
              <button className="header-icon-btn finish-btn" onClick={finishSession}>
                ✅ Terminer
              </button>
            )}
          </div>
        )}
      </header>

      {showTimer && <Timer resetTrigger={resetTrigger} />}

      <div className={`app-wrapper ${isDesktop ? "desktop" : ""}`}>
        {isDesktop && (
          <div className="side-menu desktop-visible">
            <h2>Séances</h2>
            <div className="session-list">
              {sessions.length === 0 && (
                <p className="menu-empty">Aucune séance —<br />crée-en une !</p>
              )}
              {sessions.map((session, index) => (
                <button
                  key={index}
                  onClick={() => selectSession(index)}
                  className={selectedSessionIndex === index ? "active" : ""}
                >
                  <span>{session.name}</span>
                  {session.history?.length > 0 && (
                    <span className="session-badge">{session.history.length}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="menu-bottom">
              <button className="create-session-button" onClick={() => setMode("manage")}>
                + Gérer les séances
              </button>
              <div className="menu-footer">Avec amour © Teivano 2025</div>
            </div>
          </div>
        )}

        <div className="app-container">
          {mode === "manage" ? (
            <SessionList
              sessions={sessions}
              addSession={addSession}
              deleteSession={deleteSession}
              addExercise={addExercise}
              renameSession={renameSession}
              deleteExercise={deleteExercise}
              moveExercise={moveExercise}
              duplicateSession={duplicateSession}
              setMusclesSession={setMusclesSession}
              onSelectSession={selectSession}
            />
          ) : mode === "history" && selectedSession ? (
            <History session={selectedSession} />
          ) : mode === "train" && !selectedSession ? (
            <SessionPicker sessions={sessions} onSelect={selectSession} />
          ) : selectedSession ? (
            <>
              <ExerciseList
                exercises={selectedSession.exercises}
                history={selectedSession.history}
                addSet={handleAddSet}
                deleteSet={deleteSet}
                flashIndex={flashIndex}
              />
              {!isDesktop && (
                <button className="finish-session-btn" onClick={finishSession}>
                  ✅ Terminer la séance
                </button>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span>💪</span>
              <p>Sélectionne une séance<br />pour commencer</p>
              <small>Va dans ⚙️ Gérer pour créer une séance</small>
            </div>
          )}
        </div>
      </div>

      {!isDesktop && (
        <nav className="bottom-nav">
          <button
            className={`bnav-btn ${mode === "history" ? "active" : ""}`}
            onClick={() => { if (selectedSession) setMode("history"); }}
            disabled={!selectedSession}
          >
            <span className="bnav-icon">📊</span>
            <span className="bnav-label">Historique</span>
          </button>
          <button
            className={`bnav-btn bnav-center ${mode === "train" ? "active" : ""}`}
            onClick={() => setMode("train")}
          >
            <span className="bnav-icon">🏋️</span>
            <span className="bnav-label">Entraînement</span>
          </button>
          <button
            className={`bnav-btn ${mode === "manage" ? "active" : ""}`}
            onClick={() => setMode("manage")}
          >
            <span className="bnav-icon">⚙️</span>
            <span className="bnav-label">Gérer</span>
          </button>
        </nav>
      )}
    </>
  );
}
