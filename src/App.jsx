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

  const [showOnboarding, setShowOnboarding] = useState(() =>
    !localStorage.getItem("onboarding_done")
  );

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("sessions");
      return saved ? migrateSessions(JSON.parse(saved)) : [];
    } catch { return []; }
  });

  const [selectedSessionIndex, setSelectedSessionIndex] = useState(null);
  const [resetTrigger, setResetTrigger] = useState(false);
  // mode: "train" | "history" | "manage"
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
        weight,
        reps,
        timestamp: new Date().toISOString(),
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

  const addSession = (name) => {
    if (!name.trim()) return;
    setSessions((prev) => [
      ...prev,
      { name, exercises: [], history: [], category: "" },
    ]);
  };

  const addExercise = (sessionIndex, exerciseName) => {
    if (!exerciseName.trim()) return;
    update((s) => {
      s[sessionIndex].exercises.push({ name: exerciseName, sets: [] });
    });
  };

  const deleteExercise = (sessionIndex, exerciseIndex) => {
    if (!window.confirm("Supprimer cet exercice ?")) return;
    update((s) => {
      s[sessionIndex].exercises.splice(exerciseIndex, 1);
    });
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
        ...orig,
        name: orig.name + " (copie)",
        exercises: orig.exercises.map((ex) => ({ ...ex, sets: [] })),
        history: [],
      });
    });
  };

  const deleteSession = (index) => {
    if (!window.confirm("Supprimer cette s\u00e9ance ?")) return;
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
          exercises: session.exercises.map((ex) => ({
            name: ex.name,
            sets: [...ex.sets],
          })),
        },
        ...(session.history || []),
      ];
      session.exercises = session.exercises.map((ex) => ({ ...ex, sets: [] }));
    });
    if (!hasSet) { alert("Aucune s\u00e9rie enregistr\u00e9e."); return; }
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

  // ── titre header ──
  const headerTitle =
    mode === "train" && selectedSession
      ? selectedSession.name
      : mode === "history" && selectedSession
      ? selectedSession.name
      : "\ud83c\udf34 Workout";

  return (
    <>
      {showOnboarding && <Onboarding onDone={handleOnboardingDone} />}

      {/* ════ HEADER ════ */}
      <header className="app-header">
        {/* hamburger uniquement sur desktop pour ouvrir la sidebar — sur mobile on n'en a plus besoin */}
        <div className="app-title-block">
          <span className="app-title">{headerTitle}</span>
          {mode === "train" && selectedSession && totalSetsToday > 0 && (
            <span className="header-sets-count">
              {totalSetsToday} s\u00e9rie{totalSetsToday > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Actions header — desktop seulement (mobile utilise la bottom nav) */}
        {isDesktop && (
          <div className="header-actions">
            {mode === "train" && selectedSession && (
              <button
                className="header-icon-btn finish-btn"
                onClick={finishSession}
                title="Terminer la s\u00e9ance"
              >
                \u2705 Terminer
              </button>
            )}
          </div>
        )}
      </header>

      {/* ════ TIMER STICKY ════ */}
      {showTimer && <Timer resetTrigger={resetTrigger} />}

      {/* ════ LAYOUT ════ */}
      <div className={`app-wrapper ${isDesktop ? "desktop" : ""}`}>

        {/* Sidebar desktop */}
        {isDesktop && (
          <div className="side-menu desktop-visible">
            <h2>S\u00e9ances</h2>
            <div className="session-list">
              {sessions.length === 0 && (
                <p className="menu-empty">Aucune s\u00e9ance —<br />cr\u00e9e-en une !</p>
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
              <button
                className="create-session-button"
                onClick={() => setMode("manage")}
              >
                + G\u00e9rer les s\u00e9ances
              </button>
              <div className="menu-footer">Avec amour \u00a9 Teivano 2025</div>
            </div>
          </div>
        )}

        {/* Contenu principal */}
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
              setCategorySession={setCategorySession}
              onSelectSession={selectSession}
            />
          ) : mode === "history" && selectedSession ? (
            <History session={selectedSession} />
          ) : selectedSession ? (
            <>
              <ExerciseList
                exercises={selectedSession.exercises}
                history={selectedSession.history}
                addSet={handleAddSet}
                deleteSet={deleteSet}
                flashIndex={flashIndex}
              />
              {/* Bouton Terminer prominent — mobile uniquement (desktop = header) */}
              {!isDesktop && (
                <button className="finish-session-btn" onClick={finishSession}>
                  \u2705 Terminer la s\u00e9ance
                </button>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span>\ud83d\udcaa</span>
              <p>
                S\u00e9lectionne une s\u00e9ance<br />pour commencer
              </p>
              <small>Va dans \u2699\ufe0f G\u00e9rer pour cr\u00e9er une s\u00e9ance</small>
            </div>
          )}
        </div>
      </div>

      {/* ════ BOTTOM NAV — mobile uniquement ════ */}
      {!isDesktop && (
        <nav className="bottom-nav">
          <button
            className={`bnav-btn ${mode === "train" ? "active" : ""}`}
            onClick={() => {
              if (selectedSession) setMode("train");
            }}
            disabled={!selectedSession}
          >
            <span className="bnav-icon">\ud83c\udfcb\ufe0f</span>
            <span className="bnav-label">Entra\u00eenement</span>
          </button>

          <button
            className={`bnav-btn ${mode === "history" ? "active" : ""}`}
            onClick={() => {
              if (selectedSession) setMode("history");
            }}
            disabled={!selectedSession}
          >
            <span className="bnav-icon">\ud83d\udcca</span>
            <span className="bnav-label">Historique</span>
          </button>

          <button
            className={`bnav-btn ${mode === "manage" ? "active" : ""}`}
            onClick={() => setMode("manage")}
          >
            <span className="bnav-icon">\u2699\ufe0f</span>
            <span className="bnav-label">G\u00e9rer</span>
          </button>
        </nav>
      )}
    </>
  );
}
