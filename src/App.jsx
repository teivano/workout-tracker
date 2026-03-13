// GARDE-FOU : ne jamais modifier ce fichier via create_or_update_file
// Utiliser UNIQUEMENT push_files
import React, { useState, useEffect, useCallback, useRef } from "react";
import SessionList from "./components/SessionList";
import ExerciseList from "./components/ExerciseList";
import Timer from "./components/Timer";
import History from "./components/History";
import Onboarding from "./components/Onboarding";
import SessionPicker from "./components/SessionPicker";
import Settings, { applyAccentColor } from "./components/Settings";
import { IconHistory, IconTrain, IconSessions, IconSettings } from "./components/NavIcons";

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

  // Etat timer — remonte depuis Timer headless
  const [timerPct, setTimerPct] = useState(1);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [historySession, setHistorySession] = useState(null);

  // Confirmation "Terminer la seance"
  const [confirmFinish, setConfirmFinish] = useState(false);

  const sessionStartRef = useRef(null);

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
        muscles: [...(orig.muscles || [])],
      });
    });
  };

  const deleteSession = (index) => {
    if (!window.confirm("Supprimer cette séance ?")) return;
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
    sessionStartRef.current = Date.now();
    setConfirmFinish(false);
  };

  const doFinishSession = () => {
    if (selectedSessionIndex === null) return;
    const idx = selectedSessionIndex;
    const currentSession = sessions[idx];
    const hasSet = currentSession.exercises.some((ex) => ex.sets.length > 0);
    if (!hasSet) {
      alert("Aucune série enregistrée.");
      setConfirmFinish(false);
      return;
    }
    const durationSeconds = sessionStartRef.current
      ? Math.round((Date.now() - sessionStartRef.current) / 1000)
      : null;
    sessionStartRef.current = null;
    const newEntry = {
      date: new Date().toISOString(),
      durationSeconds,
      exercises: currentSession.exercises.map((ex) => ({ name: ex.name, sets: [...ex.sets] })),
    };
    const updatedSession = {
      ...currentSession,
      history: [newEntry, ...(currentSession.history || [])],
      exercises: currentSession.exercises.map((ex) => ({ ...ex, sets: [] })),
    };
    update((s) => { s[idx] = updatedSession; });
    setHistorySession(updatedSession);
    setSelectedSessionIndex(null);
    setMode("history");
    setActiveExerciseName(null);
    setTimerRunning(false);
    setTimerPct(1);
    setConfirmFinish(false);
  };

  const handleFinishClick = () => {
    if (!confirmFinish) {
      // Premier clic : demande de confirmation
      setConfirmFinish(true);
      // Auto-annulation apres 4s si pas de second clic
      setTimeout(() => setConfirmFinish(false), 4000);
    } else {
      // Second clic : on valide
      doFinishSession();
    }
  };

  const handleOnboardingDone = () => {
    localStorage.setItem("onboarding_done", "1");
    setShowOnboarding(false);
  };

  const totalSetsToday = selectedSession
    ? selectedSession.exercises.reduce((t, ex) => t + ex.sets.length, 0)
    : 0;

  const sessionInProgress = selectedSession !== null;

  const handleTimerUpdate = useCallback((pct, running, seconds) => {
    setTimerPct(pct);
    setTimerRunning(running);
    setTimerSeconds(seconds ?? 0);
  }, []);

  // Formatage chrono pour le header
  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const isTimerLow = timerRunning && timerPct < 0.10;
  const isTimerDone = !timerRunning && timerSeconds === 0 && sessionInProgress;

  // Couleur du chrono dans le header
  const timerColor = isTimerDone
    ? "var(--danger)"
    : isTimerLow
    ? "#ff8c42"
    : "var(--accent-text)";

  // Largeur progress bar header (se vide de droite a gauche)
  const progressWidth = timerRunning || isTimerDone ? `${timerPct * 100}%` : "0%";
  const progressColor = isTimerLow || isTimerDone ? "#ff2a2a" : "var(--accent)";

  return (
    <>
      {showOnboarding && <Onboarding onDone={handleOnboardingDone} />}

      {/* Timer headless — logique uniquement, zero rendu */}
      {sessionInProgress && (
        <Timer resetTrigger={resetTrigger} onTimerUpdate={handleTimerUpdate} />
      )}

      {/* ===== HEADER DYNAMIQUE ===== */}
      <header className={`app-header${sessionInProgress ? " app-header-active" : ""}`}>
        <div className="app-header-inner">
          {sessionInProgress ? (
            // Etat actif : nom seance + exercice + chrono + bouton Terminer
            <>
              <div className="header-session-info">
                <span className="header-session-name">{selectedSession.name}</span>
                {activeExerciseName && (
                  <span className="header-exercise-name">{activeExerciseName}</span>
                )}
              </div>
              <div className="header-timer-block">
                {(timerRunning || isTimerDone) && (
                  <span
                    className={`header-timer${isTimerDone ? " header-timer-done" : ""}${isTimerLow ? " header-timer-low" : ""}`}
                    style={{ color: timerColor }}
                  >
                    {formatTime(timerSeconds)}
                  </span>
                )}
                <button
                  className={`header-finish-btn${confirmFinish ? " header-finish-btn-confirm" : ""}`}
                  onClick={handleFinishClick}
                >
                  {confirmFinish ? "Confirmée ?" : "Terminer"}
                </button>
              </div>
            </>
          ) : (
            // Etat repos : logo centre
            <div className="app-title-block">
              <span className="app-title">Workout</span>
            </div>
          )}
        </div>

        {/* Progress bar = bordure basse du header, visible uniquement en seance */}
        {sessionInProgress && (
          <div className="header-progress">
            <div
              className="header-progress-fill"
              style={{ width: progressWidth, background: progressColor }}
            />
          </div>
        )}
      </header>

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
              <button className="create-session-button" onClick={() => setMode("sessions")}>
                + Gérer les séances
              </button>
              <div className="menu-footer">Avec amour © Teivano 2025</div>
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
            <History session={historySession || selectedSession} sessions={sessions} />
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
                <button className="finish-session-btn" onClick={handleFinishClick}>
                  {confirmFinish ? "⚠️ Appuyer à nouveau pour terminer" : "Terminer la séance"}
                </button>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>Sélectionne une séance pour commencer</p>
            </div>
          )}
        </div>
      </div>

      {!isDesktop && (
        <nav className="bottom-nav">
          <button
            className={`bnav-btn ${mode === "history" ? "active" : ""}`}
            onClick={() => setMode("history")}
          >
            <div className="bnav-icon-wrap"><IconHistory size={20} /></div>
            <span className="bnav-label">Historique</span>
          </button>

          <button
            className={`bnav-btn bnav-center ${mode === "train" ? "active" : ""}`}
            onClick={() => setMode("train")}
          >
            <div className="bnav-icon-wrap"><IconTrain size={22} /></div>
            <span className="bnav-label">Entraînement</span>
          </button>

          <button
            className={`bnav-btn ${mode === "sessions" ? "active" : ""}`}
            onClick={() => setMode("sessions")}
          >
            <div className="bnav-icon-wrap"><IconSessions size={20} /></div>
            <span className="bnav-label">Séances</span>
          </button>

          <button
            className={`bnav-btn ${mode === "settings" ? "active" : ""}`}
            onClick={() => setMode("settings")}
          >
            <div className="bnav-icon-wrap"><IconSettings size={20} /></div>
            <span className="bnav-label">Réglages</span>
          </button>
        </nav>
      )}
    </>
  );
}
