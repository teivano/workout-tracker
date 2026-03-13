import React, { useState, useEffect } from "react";
import SessionList from "./components/SessionList";
import ExerciseList from "./components/ExerciseList";
import Timer from "./components/Timer";
import History from "./components/History";
import Onboarding from "./components/Onboarding";
import SessionPicker from "./components/SessionPicker";
import Settings, { applyAccentColor } from "./components/Settings";

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

  useEffect(() => {
    const saved = localStorage.getItem("accent_color") || "green";
    applyAccentColor(saved);
  }, []);

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
  const [mode, setMode] = useState("sessions");
  const [flashIndex, setFlashIndex] = useState(null);
  const [activeExerciseName, setActiveExerciseName] = useState(null);
  const [timerPct, setTimerPct] = useState(1);
  const [timerRunning, setTimerRunning] = useState(false);

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
    if (!window.confirm("Supprimer cette s\u00e9ance ?")) return;
    setSessions((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (selectedSessionIndex === index) {
        setSelectedSessionIndex(null);
        setMode("sessions");
      } else if (selectedSessionIndex > index) {
        setSelectedSessionIndex((i) => i - 1);
      }
      return next;
    });
  };

  const selectSession = (index) => {
    setSelectedSessionIndex(index);
    setActiveExerciseName(null);
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
    if (!hasSet) { alert("Aucune s\u00e9rie enregistr\u00e9e."); return; }
    // Montre l'historique de la s\u00e9ance termin\u00e9e, puis r\u00e9initialise la s\u00e9lection
    // pour que le retour sur "train" affiche le picker
    const justFinishedIndex = selectedSessionIndex;
    setSelectedSessionIndex(justFinishedIndex); // garde pour afficher l'historique
    setMode("history");
    setActiveExerciseName(null);
    setTimerRunning(false);
    setTimerPct(1);
    // Apr\u00e8s avoir bas\u00e9 le mode sur history, on d\u00e9lie la s\u00e9lection
    // pour que tap sur Entra\u00eenement => picker
    setTimeout(() => setSelectedSessionIndex(null), 0);
  };

  const handleOnboardingDone = () => {
    localStorage.setItem("onboarding_done", "1");
    setShowOnboarding(false);
  };

  const totalSetsToday = selectedSession
    ? selectedSession.exercises.reduce((t, ex) => t + ex.sets.length, 0)
    : 0;

  // Timer et session bar visibles d\u00e8s qu'une session est active
  // ET persistants m\u00eame si on change d'onglet
  const hasActiveSession = selectedSession !== null || (mode === "history" && sessions.length > 0);
  // Plus pr\u00e9cis : on garde le timer mont\u00e9 tant que selectedSession exist(ait)
  // On utilise un ref pour savoir si une session \u00e9tait en cours
  const sessionInProgress = selectedSession !== null;
  const sessionBarVisible = sessionInProgress;

  const headerTitle =
    mode === "train" && selectedSession ? selectedSession.name
    : mode === "history" && selectedSession ? selectedSession.name
    : "\ud83c\udf34 Workout";

  // L'onglet historique doit afficher la derni\u00e8re s\u00e9ance termin\u00e9e
  // m\u00eame apr\u00e8s le setSelectedSessionIndex(null)
  // On garde donc un ref de la derni\u00e8re session vue en historique
  const [historySession, setHistorySession] = useState(null);

  const finishSessionFinal = () => {
    if (selectedSessionIndex === null) return;
    let hasSet = false;
    const idx = selectedSessionIndex;
    update((s) => {
      const session = s[idx];
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
    if (!hasSet) { alert("Aucune s\u00e9rie enregistr\u00e9e."); return; }
    // Sauvegarde la session pour l'afficher en historique
    setHistorySession(sessions[idx]);
    // D\u00e9s\u00e9lectionne pour que retour sur train => picker
    setSelectedSessionIndex(null);
    setMode("history");
    setActiveExerciseName(null);
    setTimerRunning(false);
    setTimerPct(1);
  };

  return (
    <>
      {showOnboarding && <Onboarding onDone={handleOnboardingDone} />}

      <header className="app-header">
        <div className="app-title-block">
          <span className="app-title">{headerTitle}</span>
          {mode === "train" && selectedSession && totalSetsToday > 0 && (
            <span className="header-sets-count">
              {totalSetsToday} s\u00e9rie{totalSetsToday > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {isDesktop && (
          <div className="header-actions">
            {mode === "train" && selectedSession && (
              <button className="header-icon-btn finish-btn" onClick={finishSessionFinal}>
                \u2705 Terminer
              </button>
            )}
          </div>
        )}
      </header>

      {/* Timer mont\u00e9 tant que session en cours, persiste sur tous les onglets */}
      {sessionInProgress && (
        <Timer
          resetTrigger={resetTrigger}
          onTimerUpdate={(pct, running) => {
            setTimerPct(pct);
            setTimerRunning(running);
          }}
        />
      )}

      <div className={`app-wrapper ${isDesktop ? "desktop" : ""}`}>
        {isDesktop && (
          <div className="side-menu desktop-visible">
            <h2>S\u00e9ances</h2>
            <div className="session-list">
              {sessions.length === 0 && (
                <p className="menu-empty">Aucune s\u00e9ance \u2014<br />cr\u00e9e-en une !</p>
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
              <button className="create-session-button" onClick={() => setMode("sessions")}>
                + G\u00e9rer les s\u00e9ances
              </button>
              <div className="menu-footer">Avec amour \u00a9 Teivano 2025</div>
            </div>
          </div>
        )}

        <div className="app-container">
          {mode === "settings" ? (
            <Settings />
          ) : mode === "sessions" ? (
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
          ) : mode === "history" ? (
            <History session={historySession || selectedSession} />
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
                onExpandedChange={setActiveExerciseName}
              />
              {!isDesktop && (
                <button className="finish-session-btn" onClick={finishSessionFinal}>
                  \u2705 Terminer la s\u00e9ance
                </button>
              )}
            </>
          ) : (
            <div className="empty-state">
              <span>\ud83d\udcaa</span>
              <p>S\u00e9lectionne une s\u00e9ance<br />pour commencer</p>
              <small>Va dans S\u00e9ances pour cr\u00e9er une s\u00e9ance</small>
            </div>
          )}
        </div>
      </div>

      {!isDesktop && (
        <>
          {/* Session bar : visible tant que session en cours */}
          {sessionInProgress && (
            <div className="session-bar">
              <div className="session-bar-ticker">
                <span className={activeExerciseName ? "ticker-text" : "ticker-text ticker-muted"}>
                  {activeExerciseName || selectedSession?.name || "S\u00e9ance en cours"}
                </span>
              </div>
              <div className="session-bar-progress">
                {/* Barre : pleine au d\u00e9but, se vide de droite vers gauche */}
                {/* Direction : vert (plein) \u2192 rouge (vide) */}
                <div
                  className={`session-bar-fill${timerRunning ? " session-bar-fill-running" : ""}`}
                  style={{ width: `${timerPct * 100}%` }}
                />
              </div>
            </div>
          )}

          <nav className="bottom-nav">
            <button
              className={`bnav-btn ${mode === "history" ? "active" : ""}`}
              onClick={() => {
                if (selectedSession) setMode("history");
                else if (historySession) setMode("history");
              }}
              disabled={!selectedSession && !historySession}
            >
              <div className="bnav-icon-wrap"><span className="bnav-icon">\ud83d\udcca</span></div>
              <span className="bnav-label">Historique</span>
            </button>

            <button
              className={`bnav-btn bnav-center ${mode === "train" ? "active" : ""}`}
              onClick={() => setMode("train")}
            >
              <div className="bnav-icon-wrap"><span className="bnav-icon">\ud83c\udfcb\ufe0f</span></div>
              <span className="bnav-label">Entra\u00eenement</span>
            </button>

            <button
              className={`bnav-btn ${mode === "sessions" ? "active" : ""}`}
              onClick={() => setMode("sessions")}
            >
              <div className="bnav-icon-wrap"><span className="bnav-icon">\ud83d\udccb</span></div>
              <span className="bnav-label">S\u00e9ances</span>
            </button>

            <button
              className={`bnav-btn ${mode === "settings" ? "active" : ""}`}
              onClick={() => setMode("settings")}
            >
              <div className="bnav-icon-wrap"><span className="bnav-icon">\u2699\ufe0f</span></div>
              <span className="bnav-label">R\u00e9glages</span>
            </button>
          </nav>
        </>
      )}
    </>
  );
}
